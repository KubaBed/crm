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

## Next action

Patrz plan (fazy 0-1f). Ręce Kuby: Google Cloud OAuth (Internal, Workspace), `npx vercel login`.
