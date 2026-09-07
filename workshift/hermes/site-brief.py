#!/usr/bin/env python3
"""site-brief.py <url> [--max 2500]

Strona firmy jako zwięzły markdown (crawl4ai): o nas / oferta / kontakt, plus wykryty NIP.
Do researchu leadów w cronie workshift-lead-research zamiast klikania w przeglądarce.
"""
import asyncio
import re
import sys

from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig

NIP_RE = re.compile(r"NIP[:\s]*([0-9]{3}[- ]?[0-9]{3}[- ]?[0-9]{2}[- ]?[0-9]{2}|[0-9]{10})", re.I)


async def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print(__doc__)
        sys.exit(2)
    url = args[0] if args[0].startswith("http") else f"https://{args[0]}"
    limit = int(sys.argv[sys.argv.index("--max") + 1]) if "--max" in sys.argv else 2500
    async with AsyncWebCrawler(config=BrowserConfig(headless=True, verbose=False)) as crawler:
        pages = [url]
        for sub in ("/o-nas", "/o-firmie", "/kontakt", "/oferta"):
            pages.append(url.rstrip("/") + sub)
        texts, nips = [], set()
        for p in pages:
            try:
                r = await crawler.arun(url=p, config=CrawlerRunConfig(page_timeout=25000, verbose=False))
            except Exception:  # noqa: BLE001
                continue
            if not r.success or not r.markdown:
                continue
            md = str(r.markdown)
            md = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", md)
            md = re.sub(r"\[([^\]]*)\]\((https?://[^)]*)\)", r"\1", md)
            md = "\n".join(l for l in md.split("\n") if l.strip())
            for m in NIP_RE.findall(md):
                nips.add(re.sub(r"\D", "", m))
            texts.append(f"### {p}\n" + re.sub(r"\n{3,}", "\n\n", md)[: limit if p == url else limit // 3])
    print(f"## {url}")
    print("NIP: " + (", ".join(sorted(nips)) if nips else "nie znaleziono"))
    print("\n\n".join(texts) if texts else "(brak treści)")


if __name__ == "__main__":
    asyncio.run(main())
