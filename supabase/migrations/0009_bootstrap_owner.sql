-- 0009_bootstrap_owner.sql
-- Bootstrap the first owner account.
--
-- This migration intentionally contains no credentials or personal data.
-- Create the first owner after applying migrations with:
--
--   npm run bootstrap:owner
--
-- The script reads BOOTSTRAP_OWNER_EMAIL and BOOTSTRAP_OWNER_PASSWORD from
-- .env.local, creates the Supabase Auth user with the Admin API, and inserts
-- the matching public.employees row with role = 'owner'.
--
-- The early migrations are designed to be safe on a fresh database: the
-- employees_insert policy requires get_my_role() = 'owner', which is why the
-- bootstrap script uses the service-role key and runs outside this migration.

do $$
begin
  raise notice 'Attendora: create the first owner with `npm run bootstrap:owner`.';
end;
$$;
