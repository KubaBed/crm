# NOTES - Comp AI CRM (fork)

## 2026-09-04 - start migracji z SimpleCRM

- Kontekst i decyzje: plan `~/.claude/plans/chyba-dojrza-em-do-tego-polished-brooks.md`.
  Decyzje Kuby: trycompai/crm (fork), Vercel + Supabase, agent Eve w Fazie 2, enum stage'ów
  bez zmian + polskie etykiety.
- Fork `KubaBed/crm`, klon `~/Projekty/crm`, branch `workshift` z `v1.15.3` (`3c3e07a`).
- Łatka etykiet: `apps/app/lib/deal-stage.ts` (`ccf0bdc`).
- Lokalnie: Mac nie ma pluginu `docker compose` (colima + docker CLI). Postgres odpalony
  przez `docker run --name crm-postgres ... postgres:17-alpine` z tymi samymi parametrami co
  `docker-compose.yml`. `bun run db:deploy` + `db:seed` OK.
- Supabase: odmrożenie `rldqntidhktjfeiaamkn` (SimpleCRM) do eksportu zajęło drugi slot free
  tier (limit 2 aktywne). Kolejność: eksport -> pauza SimpleCRM -> `create_project workshift-crm`.

### Wnioski z sesji 1 (ciąg dalszy)

- Fork jest PUBLICZNY. Eksport SimpleCRM z danymi klientów poszedł do `~/Backups/simplecrm/`,
  `workshift/export/` w `.gitignore`. Żadnych danych osobowych w repo.
- REST bridge = czysty REST (`/rest/companies`, `/rest/deals/{id}/stage`), spis w `/openapi.json`.
  Kontrolery Nest poza `/rest` (np. `/auth/me`). Brakujące liczby lecą jako `NaN` -> podawać jawnie.
- `/rest/api-keys` nie przyjmuje sesji z klucza API (401) - to Better Auth, nie bug.
- Klucz pola własnego = etykieta bez znaków spoza ASCII ("Źródło" -> `r_d_o`); stąd `Zrodlo`.
- Bramki: onboarding workspace (tylko owner; pierwszy zalogowany = owner) i klucz Context.dev.
  Bez agenta klucz zapisuje się bez weryfikacji (dowolne >= 8 znaków). Lokalnie dev user
  awansowany SQL-em na ownera.
- PLN nie było na liście 11 walut upstreamu -> patch `packages/db/src/currency.ts`.
- Pre-push hook: check-types + lint + lint:slop + test (testy wymagają `TEST_DATABASE_URL`
  i bazy `crm_test`). Push z `CRM_SKIP_HOOKS=1` po ręcznym `biome check` + `oxlint`.
- browser-harness wymagał kliknięcia Allow w `chrome://inspect/#remote-debugging` (Kuba kliknął).
- Sync lokalny: pierwszy `--apply` utworzył firmy, deale poległy na walucie PLN; drugi przebieg
  domknął deale (idempotencja po domenie/nazwie zadziałała).
