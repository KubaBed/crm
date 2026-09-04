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

## Stan 2026-09-04 (sesja 2)

Vercel: projekty `crm-app` i `crm-api`, domeny `crm2.workshift.pl` / `api.crm.workshift.pl`,
env produkcyjne (poza bazą), GitHub secrets cronu. Szczegóły i gotchas w `NOTES.md`.
Deploy: `workshift/deploy.sh <api|app> [--prod]` z korzenia repo.

## Next action

1. GOTOWE: env bazy w Vercelu, deploy prod API i app, migracje, cron GitHub Actions (pierwszy run
   success), domyślna gałąź forka `workshift`, branding Workshift.
2. GOTOWE: logowanie Kuby (owner), klucze API w `~/.zshenv`, PLN, pola własne, sync vault -> prod
   (8 firm, 5 deali, `crm:` w vaulcie), import historii z SimpleCRM.
3. Test E2E Gmaila: mail z zewnętrznej domeny na kontakt@workshift.pl -> cron/ręczny sync ->
   kontakt w CRM. Hermes: klucz `CRM_API_KEY_HERMES` na WSL + skill `crm` + zmiana crona
   `workshift-lead-research` (firmy przez API).
6. Tydzień równolegle, potem Faza 1f (pożegnanie SimpleCRM) z osobnym potwierdzeniem kroków
   destrukcyjnych i zmianą `AUTH_COOKIE_DOMAIN` na `.crm.workshift.pl`.
