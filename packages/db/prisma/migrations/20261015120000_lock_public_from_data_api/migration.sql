-- Workshift: zamknięcie schematu public przed Data API Supabase (PostgREST).
--
-- Supabase domyślnie daje rolom anon i authenticated pełne uprawnienia do tabel w public,
-- a Prisma tworzy tabele bez RLS. Każdy z kluczem anon mógł więc czytać i zmieniać CRM przez
-- /rest/v1. Aplikacja łączy się jako postgres (właściciel tabel) przez pooler, auth to
-- better-auth, więc ani granty dla anon/authenticated, ani polityki RLS nie są jej potrzebne.
--
-- RLS włączone bez polityk: właściciel tabel omija RLS (brak FORCE), role API nie widzą nic.
-- Na lokalnym Postgresie (docker, crm_test) ról anon/authenticated nie ma i blok jest pomijany.
-- Schemat offers (oferty workshift-landing) ma własne granty i nie jest tu ruszany.

DO $$
DECLARE
	t record;
BEGIN
	IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
		AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
		REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
		REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
		REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

		-- Tabele z przyszłych migracji (tworzone przez postgres) też bez grantów dla API.
		ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
			REVOKE ALL ON TABLES FROM anon, authenticated;
		ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
			REVOKE ALL ON SEQUENCES FROM anon, authenticated;
		ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
			REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
	END IF;

	FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
		EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
	END LOOP;
END
$$;
