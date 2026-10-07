#!/usr/bin/env python3
"""lead-sources.py: świeże oferty pracy jako sygnały leadów (Pracuj, JustJoin, NoFluffJobs).

Dwa sygnały (mapa: wiki/playbooks/workshift-sygnaly-leadow.md):
- S7 Rekrutacja AI: oferty AI/automatyzacja, z oznaczeniem seniority (senior = ryzyko budowy u siebie).
- S2 Praca ręczna: oferty do powtarzalnej pracy biurowej (fakturowanie, dane, rozliczenia, zamówienia);
  liczy oferty per firma, bo 2+ takie oferty to mocniejszy sygnał.

Uruchamiany przez `hermes cron --script` przed agentem workshift-lead-research: stdout trafia
do promptu jako sekcja ŹRÓDŁA. Przeglądarka: CloakBrowser (headless przechodzi Cloudflare,
test 2026-09-07). Bez LLM, bez kluczy. Dedup po firmie, limit ofert na źródło.
Diagnostyka: `python lead-sources.py --debug` (pełne teksty kart do stderr).
"""
import os
import re
import sys
import time

os.environ.setdefault("CLOAKBROWSER_SUPPRESS_FONT_WARNING", "1")
from cloakbrowser import launch  # noqa: E402

LIMIT_PER_SOURCE = 15
DEBUG = "--debug" in sys.argv

SOURCES = [
    ("S7", "Pracuj.pl", "https://www.pracuj.pl/praca/ai%20automatyzacja;kw", "/praca/"),
    ("S7", "Pracuj.pl", "https://www.pracuj.pl/praca/sztuczna%20inteligencja;kw", "/praca/"),
    ("S7", "Pracuj.pl", "https://www.pracuj.pl/praca/chatbot;kw", "/praca/"),
    ("S7", "JustJoin.it", "https://justjoin.it/job-offers/all-locations/ai", "/job-offer/"),
    ("S7", "NoFluffJobs", "https://nofluffjobs.com/pl/ai", "/pl/job/"),
    ("S7", "NoFluffJobs", "https://nofluffjobs.com/pl/automation", "/pl/job/"),
    ("S2", "Pracuj.pl", "https://www.pracuj.pl/praca/specjalista%20ds.%20fakturowania;kw", "/praca/"),
    ("S2", "Pracuj.pl", "https://www.pracuj.pl/praca/wprowadzanie%20danych;kw", "/praca/"),
    ("S2", "Pracuj.pl", "https://www.pracuj.pl/praca/specjalista%20ds.%20rozlicze%C5%84;kw", "/praca/"),
    ("S2", "Pracuj.pl", "https://www.pracuj.pl/praca/obs%C5%82uga%20zam%C3%B3wie%C5%84;kw", "/praca/"),
    ("S2", "Pracuj.pl", "https://www.pracuj.pl/praca/specjalista%20ds.%20dokumentacji;kw", "/praca/"),
]
SIGNAL_NAME = {"S7": "Rekrutacja AI", "S2": "Praca ręczna"}
SENIOR = re.compile(r"(?i)\b(senior|lead|head|principal|architect|kierownik|manager|dyrektor|chief|staff)\b")
JUNIOR = re.compile(r"(?i)\b(junior|młodszy|młodsza|stażyst|staż|intern|trainee|asystent)")

# rekrutacja / body leasing / konkurenci Workshift: sygnał z nich to szum, filtr twardy
NOISE = re.compile(r"(?i)\b(work service|gi group|trenkwalder|otto work|agencja pracy|personnel|jobhouse|interim|alten|mindbox|scalo|gft|sii|capgemini|accenture|deloitte|pwc|ey\b|kpmg|epam|luxoft|nokia|comarch|asseco|sabre|netguru|stx next|itds|7n\b|devire|hays|antal|michael page|randstad|manpower|adecco|grafton|experis|leasing|outsourc|software house|softwarehouse)")


def cards_from(page, link_part):
    js = """
    (part) => {
      const seen = new Set(); const out = [];
      for (const a of document.querySelectorAll('a[href]')) {
        const href = a.href;
        if (!href.includes(part) || href.includes('#') || seen.has(href)) continue;
        seen.add(href);
        let el = a; let text = '';
        for (let i = 0; i < 6 && el; i++) { text = (el.innerText || '').trim(); if (text.length > 60) break; el = el.parentElement; }
        out.push({ href, text: text.slice(0, 400) });
      }
      return out;
    }"""
    return page.evaluate(js, link_part)


LABEL = re.compile(r"(?i)^(opublikowana:?.*|published:?.*|nowa|new|nowość|polecana|super ?oferta|super offer|promowana|zapisz ofertę|hot|top|\d+ ?(d|h|dni|godz)|dziś|wczoraj|today|yesterday|premium|sponsorowana)$")
LOCATION = re.compile(r"(?i)^(miejsce pracy:)?\s*(warszaw|krak|wroc|pozna|gda|łód|katowic|szczec|lublin|bydgoszcz|białystok|rzesz|toru|kielc|olszty|opol|zielon|cała polska|zdaln|remote|hybryd|praca zdalna)")
SALARY = re.compile(r"\d{1,3}[ \u00a0]?\d{3}|PLN|zł|net|brutto|b2b|uop|\bh\b")


def parse(source, text, href):
    lines = [l.strip() for l in text.split("\n") if l.strip() and not LABEL.match(l.strip())]
    title = company = city = ""
    if source == "JustJoin.it":
        slug = href.split("/job-offer/")[-1].split("?")[0]
        title = slug.replace("-", " ")
        cand = [l for l in lines if not LOCATION.match(l) and not SALARY.search(l) and 2 < len(l) < 60]
        company = cand[0] if cand else ""
        city = next((l for l in lines if LOCATION.match(l)), "")
    else:
        title = lines[0] if lines else ""
        rest = lines[1:]
        company = next((l for l in rest if not LOCATION.match(l) and not SALARY.search(l) and 2 < len(l) < 70 and l != title), "")
        city = next((l for l in rest if LOCATION.match(l)), "")
    city = re.sub(r"(?i)^miejsce pracy:\s*", "", city)
    return title[:90], company[:60], city[:40]


def seniority(title):
    if SENIOR.search(title):
        return " [SENIOR: ryzyko budowy u siebie]"
    if JUNIOR.search(title):
        return " [JUNIOR/pierwsza rola]"
    return ""


def main():
    started = time.time()
    seen = {"S7": {}, "S2": {}}  # sygnał -> firma -> wiersze
    errors = []
    browser = launch(headless=True)
    try:
        page = browser.new_page()
        for signal, source, url, part in SOURCES:
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=45000)
                page.wait_for_timeout(3500)
                cards = cards_from(page, part)
            except Exception as e:  # noqa: BLE001
                errors.append(f"- {signal} {source}: błąd pobierania ({type(e).__name__})")
                continue
            kept = 0
            for c in cards:
                title, company, city = parse(source, c["text"], c["href"])
                if DEBUG:
                    print(f"[{signal} {source}] {c['href']}\n{c['text']}\n---", file=sys.stderr)
                if not title or not company or "wyszukiwark" in title.lower():
                    continue
                if NOISE.search(company) or NOISE.search(title):
                    continue
                key = re.sub(r"\W+", "", company.lower())
                rows = seen[signal].setdefault(key, [])
                if any(r["href"] == c["href"] for r in rows):
                    continue
                if not rows:
                    kept += 1
                rows.append({"source": source, "company": company, "title": title, "city": city, "href": c["href"]})
                if kept >= LIMIT_PER_SOURCE:
                    break
    finally:
        browser.close()
    print("## ŹRÓDŁA (oferty pracy jako sygnały, ostatni odczyt " + time.strftime("%Y-%m-%d %H:%M") + ")")
    print("Format: [portal] firma | stanowisko | miasto | link. Firmy IT/body-leasing, agencje pracy i konkurenci odfiltrowani.")
    print("Przed bramką MŚP: strona firmy, NIP, `~/.hermes/scripts/gus-lookup.py <NIP>` (forma prawna, PKD, wiek).")
    for signal, header in (("S7", "### S7 Rekrutacja AI (bierz: pierwsza/juniorska rola AI w firmie spoza IT; SENIOR = zwykle odrzuć)"),
                           ("S2", "### S2 Praca ręczna (bierz: firma 20-250 os., 2+ takie oferty albo jedna ponowiona; liczba ofert w nawiasie)")):
        print()
        print(header)
        firms = seen[signal]
        if not firms:
            print("- brak ofert")
        for rows in firms.values():
            r = rows[0]
            tag = seniority(r["title"]) if signal == "S7" else f" [ofert: {len(rows)}]"
            print(f"- [{r['source']}] {r['company']} | {r['title']}{tag} | {r['city'] or '-'} | {r['href']}")
    if errors:
        print()
        print("\n".join(errors))
    total = sum(len(v) for v in seen.values())
    print(f"\n(źródeł: {len(SOURCES)}, firm: {total}, czas: {time.time()-started:.0f}s)")


if __name__ == "__main__":
    main()
