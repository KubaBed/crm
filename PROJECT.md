# Comp AI CRM (fork trycompai/crm) - CRM Workshift

- **Slug (folder):** `crm`
- **Slug (INDEX):** `crm`
- **Type:** personal (narzędzie firmowe Workshift)
- **Status:** active (migracja z SimpleCRM, plan: `~/.claude/plans/chyba-dojrza-em-do-tego-polished-brooks.md`)
- **Repo:** https://github.com/KubaBed/crm (fork), upstream https://github.com/trycompai/crm (MIT)
- **Branch roboczy:** `workshift` (z tagu `v1.15.3`); `release` = upstream stabilny
- **Wiki:** `wiki/projects/comp-ai-crm.md` (baza-wiedzy)
- **Created:** 2026-09-04

## Co to jest

Single-tenant CRM "agent-first": firmy, kontakty, deale, aktywności, sync Gmail/Outlook,
klucze API + REST bridge (`/rest/*`, `/openapi.json`) dla agentów (Claude Code, Hermes).
Zastępuje SimpleCRM. Vault (baza-wiedzy) zostaje źródłem wiedzy o kliencie, CRM źródłem
prawdy o pipeline'ie.

## Stack

Turborepo + Bun. `apps/app` Next.js (shadcn), `apps/api` NestJS + nestjs-trpc + Prisma,
`apps/agent` Eve (Faza 2, nieużywany na razie), Postgres 17. Deploy: Vercel (app, api) + Supabase.

## Nasze zmiany względem upstream (trzymać minimalne)

| Gdzie | Co |
|---|---|
| `apps/app/lib/deal-stage.ts` | polskie etykiety stage'ów (enum bez zmian) |
| `packages/db/src/currency.ts` | PLN dodany do listy walut (upstream: 11 walut, bez PLN) |
| `biome.jsonc`, `.oxlintrc.json` | `workshift/` wyłączone z lintów upstreamu (tabs, zakaz komentarzy) |
| `workshift/` | własne skrypty: `crm.mjs` (klient API), `sync-vault-crm.mjs` (vault -> CRM), `export/` |
| `.github/workflows/cron-mailboxes.yml` | cron syncu skrzynki co 5 min (Vercel Hobby robi tylko dzienne) |

Upstream merge: `git fetch upstream --tags && git merge <tag>` po przeczytaniu CHANGELOG. Nigdy automatycznie.

## Lokalnie

```bash
cd ~/Projekty/crm
colima start                                  # Docker
docker start crm-postgres                     # kontener postgres:17-alpine (brak pluginu compose na Macu)
bun run db:deploy                             # migracje
bun x turbo run dev --filter=api --filter=app --log-order=stream   # app :3000, api :3001
bun run --filter=api dev:session              # cookie sesji bez OAuth (tylko dev)
```

`.env` w root (gitignored): `DATABASE_URL`, `BETTER_AUTH_SECRET`, `ALLOWED_SIGN_IN`, `GOOGLE_*`,
`CRM_TELEMETRY_DISABLED=1`. Sekrety nigdy w repo ani w czacie.

## Stan 2026-09-04 (sesja 1)

Zrobione lokalnie i zweryfikowane: run app+api, klucz API przez REST (`x-api-key`), `workshift/crm.mjs`,
`workshift/sync-vault-crm.mjs --apply` na lokalnej bazie (8 firm, 5 deali), polskie etykiety
(screenshot), pola własne `vault` + `zrodlo`, skill `~/.claude/skills/crm`, hook SessionEnd.
Supabase: SimpleCRM wyeksportowany do `~/Backups/simplecrm/` i spauzowany; nowy projekt
`workshift-crm` (`oapkxooqnrrymiteenkz`, eu-central-1).

## Next action

1. **Ręce Kuby** (nie da się zautomatyzować):
   - Google Cloud: projekt na koncie Workspace jakub@workshift.pl, Gmail API + Calendar API,
     consent screen **Internal**, OAuth client Web z redirect URI
     `http://localhost:3001/api/auth/callback/google` i `https://api.crm.workshift.pl/api/auth/callback/google`.
     Client ID + Secret do `.env` (lokalnie) i do Vercel env. Nie do czatu.
   - `npx vercel login` na Macu.
   - Supabase `workshift-crm`: Settings -> Database -> Reset database password (MCP nie zwraca hasła).
     Potrzebne do `DATABASE_URL` (pooler 6543) i `DIRECT_DATABASE_URL` (5432).
   - Po deployu: w app Settings -> API keys założyć `claude-code-mac`, `hermes-wsl`, `vault-sync`;
     wartość do `~/.zshenv` jako `CRM_API_KEY` (+ `CRM_API_URL=https://api.crm.workshift.pl`).
2. Claude: Vercel `crm-app` + `crm-api` (env, domeny `crm2.workshift.pl` / `api.crm.workshift.pl`),
   sekrety repo `API_URL` + `CRON_SECRET` dla workflow, `db:deploy` przez build API,
   `sync-vault-crm.mjs --apply` na prod (z write-back `crm:` do vaulta), test E2E Gmaila.
3. Tydzień równolegle, potem Faza 1f (pożegnanie SimpleCRM) z osobnym potwierdzeniem kroków destrukcyjnych.
