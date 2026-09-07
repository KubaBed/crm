# Skrypty Hermesa (WSL) dla crona workshift-lead-research

Kopie źródłowe skryptów z `~/.hermes/scripts/` na hoście Hermesa. Repo jest źródłem prawdy,
na host lecą przez `scp`. Środowisko: venv Hermesa (Python 3.11) z `playwright`, `cloakbrowser`,
`gusregon`, `crawl4ai`.

| Skrypt | Rola |
|---|---|
| `lead-sources.py` | `hermes cron --script`: świeże oferty AI/automatyzacja z Pracuj, JustJoin, NoFluffJobs przez CloakBrowser (headless przechodzi Cloudflare). Stdout = sekcja ŹRÓDŁA w prompcie. |
| `gus-lookup.py` | GUS BIR 1.1 po NIP/REGON/KRS: forma prawna, PKD, data powstania. Klucz `GUS_BIR_KEY` w `~/.hermes/.env`, bez klucza sandbox. |
| `site-brief.py` | crawl4ai: strona firmy jako markdown + wykryty NIP. |
