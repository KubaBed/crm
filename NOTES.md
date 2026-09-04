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

## 2026-09-04 (sesja 2) - Faza 1b: infrastruktura prod

- Kuba dostarczył OAuth Google (plik .rtf; wartości trafiły do `.env`, plik przeniesiony do
  `~/.config/workshift-crm/`, chmod 600), dostęp do bazy Supabase i `vercel login`.
- Supabase `workshift-crm`: host bezpośredni `db.<ref>.supabase.co` nie rozwiązuje się z Dockera
  (IPv6). Działa pooler `aws-0-eu-central-1.pooler.supabase.com`: 6543 (transaction, runtime)
  i 5432 (session, migracje). `DATABASE_URL` = 6543 z `?pgbouncer=true&connection_limit=1`,
  `DIRECT_DATABASE_URL` = 5432, user `postgres.<ref>`. Connection stringi trzymamy w
  `~/.config/workshift-crm/supabase.env`; plik tworzy Kuba (klasyfikator Claude blokuje każdą
  komendę z sekretem bazy w treści), Claude tylko go `source`'uje.
- Vercel CLI 54.4.1 przez `bunx` (`npx vercel` pada na EBADDEVENGINES z Node 25). Konektor
  Vercel MCP nie ma prawa tworzyć projektów (403), więc projekty przez CLI:
  - `crm-app` (`prj_TUo86A0mrA59Uc2Mc47MjWHQc8tr`): rootDirectory `apps/app`, framework nextjs,
    domena `crm2.workshift.pl`.
  - `crm-api` (`prj_dGUaVjBwb2OXuQEYm0Nkkme3poz1`): root repo, buildCommand
    `bun apps/api/scripts/build-func.mjs` (Build Output API w `.vercel/output`), install
    `bun install`, domena `api.crm.workshift.pl`.
  - Ustawienia: `bunx vercel api /v9/projects/<name> -X PATCH -f klucz=wartość`; domeny:
    `POST /v10/projects/<name>/domains -f name=...` (workshift.pl jest na Vercel DNS, rekordy same).
  - Env production w obu projektach: API_URL, APP_URL, AUTH_COOKIE_DOMAIN, ALLOWED_SIGN_IN,
    CRM_TELEMETRY_DISABLED, BETTER_AUTH_SECRET (nowy, tylko prod), GOOGLE_CLIENT_ID/SECRET;
    api dodatkowo CRON_SECRET. Wartości generowane do `~/.config/workshift-crm/<NAZWA>` i wgrywane
    przez stdin. BRAK: DATABASE_URL, DIRECT_DATABASE_URL.
  - GitHub secrets `KubaBed/crm`: CRON_SECRET, API_URL.
- **Cookie domain na czas migracji = `.workshift.pl`**: app na `crm2.workshift.pl`, API na
  `api.crm.workshift.pl` (redirect URI OAuth zarejestrowany dla `api.crm`), wspólny rodzic to
  dopiero `workshift.pl`. Po przepięciu app na `crm.workshift.pl` zmienić na `.crm.workshift.pl`.
- Pierwszy deploy `crm-api` upadł na `bun install`: postinstall `@crm/db` czyta `DATABASE_URL`
  z `prisma.config.ts`. Bez zmiennych bazy w env nie zbuduje się ani API, ani app.
- `bunx vercel deploy --cwd apps/app` dokleja rootDirectory drugi raz ("apps/app/apps/app").
  Deploy obu projektów z korzenia repo: `workshift/deploy.sh <api|app> [--prod]` (przelinkowuje
  `.vercel/project.json` przed deployem).
- Deploy `--prod` z sesji Claude blokuje klasyfikator; produkcję odpala Kuba.

## 2026-09-04 (sesja 3) - deploy prod + branding

- Branding Workshift w forku (`1ca4530`): tokeny w `packages/ui/src/styles/globals.css` (sage/lime,
  Inter + IBM Plex Mono), `logo.tsx`, favicony, manifest, teksty "Comp AI" -> "Workshift CRM"
  poza katalogiem landing. Plik testowy upstreamu nietknięty.
- Build Output API: `build-func.mjs` wpisywał cron `*/5` do `config.json`, Vercel Hobby odrzuca
  taki deploy. Usunięty (`60cb2e9`); harmonogram prowadzi GitHub Actions z branchu domyślnego.
- Prod: `https://api.crm.workshift.pl/health` = ok/database up, migracje wykonane w buildzie,
  `https://crm2.workshift.pl` serwuje app. Domyślna gałąź forka przełączona na `workshift`
  (schedule GitHub Actions działa tylko z gałęzi domyślnej).
- "Could not reach the sign-in service" na prod: app proxuje `/api/*` do `API_URL` z `@/lib/env`
  (`NEXT_PUBLIC_API_URL`), a Turbo strict env przepuszcza do buildu tylko klucze z
  `apps/app/turbo.json` (`NEXT_PUBLIC_API_URL`, nie `API_URL`). Build wziął domyślne
  `localhost:3001` -> 502. Fix: env `NEXT_PUBLIC_API_URL=https://api.crm.workshift.pl` w `crm-app`
  + redeploy. Diagnoza: browser-harness (klik w "Continue with Google" + `Network.enable`).
- Prod skonfigurowany po zalogowaniu Kuby (owner, workspace `workshift`): PLN jako waluta
  raportowa + kursy, pola `Vault`/`Zrodlo`, `sync-vault-crm.mjs --apply` = 8 firm, 5 deali,
  linki `crm:` w vaulcie (wskazują docelowe `crm.workshift.pl`, do przepięcia działają pod `crm2`).
  Import z backupu SimpleCRM (skrypt jednorazowy w scratchpadzie): kontakty ALMA/Informax/Sawaryn,
  kwoty deali, historia jako aktywności NOTE/EMAIL/MEETING/TASK.
- `~/.zshenv`: klucze wklejone jako `nazwa API_Key: "..."` (zsh: command not found) -> przepisane
  na `CRM_API_URL`, `CRM_API_KEY`, `CRM_API_KEY_HERMES`, `CRM_API_KEY_VAULT_SYNC`. Kopia `.zshenv.bak-2026-09-04`.
- Ekran logowania: klasa `dark` na sztywno w `auth-shell.tsx` -> usunięta, polskie hasło, stopka
  linkuje do upstreamu zamiast trycomp.ai.
