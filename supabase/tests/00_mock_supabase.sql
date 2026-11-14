do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin; exception when duplicate_object then null; end $$;
create schema auth;
create table auth.users(id uuid primary key default gen_random_uuid(), raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.uid',true),'')::uuid $$;
-- يحاكي auth.jwt() وجدول الجلسات الموجودين في Supabase الحقيقية
create table auth.sessions(id uuid primary key default gen_random_uuid(), user_id uuid references auth.users on delete cascade);
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
grant usage on schema auth to authenticated, anon, service_role; grant usage on schema public to authenticated, anon, service_role;
-- يحاكي إعداد Supabase الافتراضي: الدوران anon وauthenticated يحصلان تلقائيًا على كل صلاحيات الجداول الجديدة
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
\i supabase/schema.sql
grant select,insert,update,delete on all tables in schema public to authenticated;
grant usage,select on all sequences in schema public to authenticated;
revoke update on public.notifications from authenticated; grant update(read) on public.notifications to authenticated;
