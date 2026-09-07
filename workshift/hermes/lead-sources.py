#!/usr/bin/env python3
"""lead-sources.py: świeże oferty pracy AI/automatyzacja z Pracuj, JustJoin, NoFluffJobs.

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
    ("Pracuj.pl", "https://www.pracuj.pl/praca/ai%20automatyzacja;kw", "/praca/"),
    ("Pracuj.pl", "https://www.pracuj.pl/praca/sztuczna%20inteligencja;kw", "/praca/"),
    ("Pracuj.pl", "https://www.pracuj.pl/praca/chatbot;kw", "/praca/"),
    ("JustJoin.it", "https://justjoin.it/job-offers/all-locations/ai", "/job-offer/"),
    ("NoFluffJobs", "https://nofluffjobs.com/pl/ai", "/pl/job/"),
    ("NoFluffJobs", "https://nofluffjobs.com/pl/automation", "/pl/job/"),
]

# rekrutacja / body leasing / konkurenci Workshift: sygnał z nich to szum, filtr twardy
NOISE = re.compile(r"(?i)\b(alten|mindbox|scalo|gft|sii|capgemini|accenture|deloitte|pwc|ey\b|kpmg|epam|luxoft|nokia|comarch|asseco|sabre|netguru|stx next|itds|7n\b|devire|hays|antal|michael page|randstad|manpower|adecco|grafton|experis|leasing|outsourc|software house|softwarehouse)")


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


LABEL = re.compile(r"(?i)^(nowa|new|nowość|polecana|super ?oferta|super offer|promowana|zapisz ofertę|hot|top|\d+ ?(d|h|dni|godz)|dziś|wczoraj|today|yesterday|premium|sponsorowana)$")
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


def main():
    started = time.time()
    seen_companies = set()
    browser = launch(headless=True)
    out = []
    try:
        page = browser.new_page()
        for source, url, part in SOURCES:
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=45000)
                page.wait_for_timeout(3500)
                cards = cards_from(page, part)
            except Exception as e:  # noqa: BLE001
                out.append(f"- {source}: błąd pobierania ({type(e).__name__})")
                continue
            kept = 0
            for c in cards:
                title, company, city = parse(source, c["text"], c["href"])
                if DEBUG:
                    print(f"[{source}] {c['href']}\n{c['text']}\n---", file=sys.stderr)
                if not title or not company or "wyszukiwark" in title.lower():
                    continue
                key = re.sub(r"\W+", "", company.lower())
                if key in seen_companies or NOISE.search(company) or NOISE.search(title):
                    continue
                seen_companies.add(key)
                out.append(f"- [{source}] {company} | {title} | {city or '-'} | {c['href']}")
                kept += 1
                if kept >= LIMIT_PER_SOURCE:
                    break
    finally:
        browser.close()
    print("## ŹRÓDŁA (oferty pracy AI/automatyzacja, ostatni odczyt " + time.strftime("%Y-%m-%d %H:%M") + ")")
    print("Format: [portal] firma | stanowisko | miasto | link. Firmy IT/body-leasing i konkurenci odfiltrowani.")
    print("Firma spoza IT rekrutująca do AI = twardy sygnał. Sprawdź stronę firmy, znajdź NIP i uruchom")
    print("`~/.hermes/scripts/gus-lookup.py <NIP>` (forma prawna, PKD, wiek) przed bramką MŚP.")
    print()
    print("\n".join(out) if out else "- brak ofert (sprawdź log)")
    print(f"\n(źródeł: {len(SOURCES)}, firm: {len(seen_companies)}, czas: {time.time()-started:.0f}s)")


if __name__ == "__main__":
    main()
