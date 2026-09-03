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
