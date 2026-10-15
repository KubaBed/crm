-- Harmonogram endpointów /internal/* crm-api z bazy Supabase (pg_cron + pg_net). Od 2026-10-15.
--
-- PO CO: Vercel Hobby degraduje crony */5 do dziennych, GitHub wyłączył workflowy w forku
-- ("Workflows are not currently being run on this fork due to the scale of GitHub Actions usage"),
-- a launchd na Macu stoi, gdy Mac śpi. pg_cron chodzi w bazie workshift-crm (plan Pro, bez auto-pauzy).
--
-- Wdrożone ręcznie (MCP Supabase), poza migracjami Prismy: Prisma zarządza tylko schematem public,
-- a pg_cron/pg_net żyją w schematach cron/net. Ten plik jest zapisem stanu, nie migracją.
--
-- Sekret: CRON_SECRET (ten sam co w env crm-api) leży w Supabase Vault pod nazwą crm_cron_secret.
-- Wgrany z ~/.config/workshift-crm/CRON_SECRET, bez wklejania wartości:
--   cd packages/db && set -a && . ~/.config/workshift-crm/supabase.env && set +a \
--     && export DATABASE_URL="$DIRECT_DATABASE_URL" \
--     && printf "select vault.create_secret('%s', 'crm_cron_secret');" "$(cat ~/.config/workshift-crm/CRON_SECRET)" \
--     | bunx prisma db execute --stdin
-- Rotacja: vault.update_secret(<id z vault.secrets>, '<nowy>') tym samym sposobem + env w Vercelu.
--
-- Kontrola:
--   select jobname, schedule, active from cron.job;
--   select j.jobname, d.status, d.start_time from cron.job_run_details d join cron.job j using (jobid)
--     order by d.start_time desc limit 10;
--   select id, status_code, timed_out, error_msg, created from net._http_response order by created desc limit 10;
--   (net._http_response trzyma odpowiedzi ok. 6 h)
-- Wyłącznik: select cron.unschedule('crm-sync-mailboxes'); select cron.unschedule('crm-offers-first-opens');

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

select cron.schedule('crm-sync-mailboxes', '*/5 * * * *', $job$
  select net.http_post(
    url := 'https://api.crm.workshift.pl/internal/sync/mailboxes',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'crm_cron_secret'),
      'Content-Type', 'application/json'),
    body := '{}'::jsonb,
    timeout_milliseconds := 85000);
$job$);

-- Przesunięte o 2 min względem syncu, żeby dwa zimne starty funkcji nie trafiały w tę samą sekundę.
select cron.schedule('crm-offers-first-opens', '2-59/5 * * * *', $job$
  select net.http_post(
    url := 'https://api.crm.workshift.pl/internal/offers/first-opens',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'crm_cron_secret'),
      'Content-Type', 'application/json'),
    body := '{}'::jsonb,
    timeout_milliseconds := 65000);
$job$);

select cron.schedule('crm-cron-history-cleanup', '17 3 * * *', $job$
  delete from cron.job_run_details where end_time < now() - interval '7 days';
$job$);
