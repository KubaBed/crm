# Skrypty Hermesa (WSL) dla crona workshift-lead-research

Kopie źródłowe skryptów z `~/.hermes/scripts/` na hoście Hermesa. Repo jest źródłem prawdy,
na host lecą przez `scp`. Środowisko: venv Hermesa (Python 3.11) z `playwright`, `cloakbrowser`,
`gusregon`, `crawl4ai`.

| Skrypt | Rola |
|---|---|
| `lead-sources.py` | `hermes cron --script`: oferty pracy jako sygnały leadów przez CloakBrowser (headless przechodzi Cloudflare). S7 Rekrutacja AI (Pracuj, JustJoin, NFJ, z tagiem seniority) + S2 Praca ręczna (5 zapytań Pracuj, liczba ofert per firma). Stdout = sekcja ŹRÓDŁA w prompcie. Mapa sygnałów: vault `wiki/playbooks/workshift-sygnaly-leadow.md`. |
| `gus-lookup.py` | GUS BIR 1.1 po NIP/REGON/KRS: forma prawna, PKD, data powstania. Klucz `GUS_BIR_KEY` w `~/.hermes/.env`, bez klucza sandbox. |
| `site-brief.py` | crawl4ai: strona firmy jako markdown + wykryty NIP. |
| `lead-research-prompt.md` | prompt crona v4 (portfel sygnałów, grupy A/B/C, `crm addcompany --sygnal`). |
