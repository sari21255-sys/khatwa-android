-- اختبار خطة التراجع على بيانات اصطناعية: بعد تطبيق p1_sync_rollback.sql تبقى بيانات المجتمع كما هي ويعمل حذف الحساب،
-- وإعادة تطبيق الهجرة بعد التراجع تنجح (لا حالة عالقة). يُشغَّل بعد 01 و02.
\set ON_ERROR_STOP on
create or replace function pg_temp.eq(a anyelement,b anyelement,why text) returns void language plpgsql as $$ begin if a is distinct from b then raise exception 'ASSERT % : % <> %',why,a,b; end if; end $$;
insert into auth.users(id,raw_user_meta_data) values('00000000-0000-0000-0000-0000000000f1','{"display_name":"تراجع"}');
set role authenticated; select set_config('request.uid','00000000-0000-0000-0000-0000000000f1',false);
insert into public.posts(body) values('منشور يجب أن يبقى بعد التراجع');
reset role;
select count(*) as posts_before from public.posts \gset
\i supabase/migrations/p1_sync_rollback.sql
do $$ begin
  if to_regclass('public.sync_records') is not null or to_regclass('public.sync_meta') is not null or to_regclass('public.quota_counters') is not null then raise exception 'rollback left tables'; end if;
  if to_regprocedure('public.sync_exchange(int,bigint,jsonb)') is not null or to_regprocedure('public.consume_quota_trusted(uuid,uuid,text)') is not null or to_regclass('public.quota_settings') is not null then raise exception 'rollback left functions'; end if;
end $$;
select pg_temp.eq((select count(*) from public.posts),:posts_before::bigint,'community data untouched by rollback') ;
set role authenticated; select set_config('request.uid','00000000-0000-0000-0000-0000000000f1',false);
select public.delete_my_account();   -- التعريف السابق لحذف الحساب يعمل بعد التراجع
reset role;
select pg_temp.eq((select count(*) from auth.users where id='00000000-0000-0000-0000-0000000000f1'),0::bigint,'delete_my_account works after rollback');
\i supabase/migrations/p1_sync.sql
select pg_temp.eq((to_regclass('public.sync_records') is not null),true,'migration re-applies cleanly after rollback');
select 'ROLLBACK TEST PASSED' as result;
