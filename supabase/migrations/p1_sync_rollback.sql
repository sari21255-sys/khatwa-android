-- تراجع P1 مع حفظ بيانات المزامنة السحابية.
-- لا يحذف سجلات المزامنة: ينقل sync_meta وsync_records وquota_settings إلى مخطط خاص p1_archive (لا يصل إليه anon ولا authenticated
-- ولا service_role)، ويزيل دوال P1 فلا يبقى مسار للمزامنة أو الحصص. جداول المجتمع وبياناتها لا تُمس.
-- الجداول المؤرشفة تحتفظ بمفاتيحها الأجنبية إلى auth.users مع on delete cascade، فحذف الحساب يحذف نسخته المؤرشفة أيضًا.
-- إعادة التفعيل: نفّذ p1_sync.sql ثم p1_sync_restore.sql (يستعيد من الأرشيف). احذف الأرشيف يدويًا فقط بعد التأكد من الاستعادة:
--   drop schema p1_archive cascade;
-- عدّادات الحصص (quota_counters) مؤقتة بطبيعتها وتُحذف؛ حدود الحصص (quota_settings) تُحفظ.
-- أرشيف سابق لم يُحذف (تراجع ثانٍ): يُنقل بمخططه كاملًا إلى اسم بلاحقة زمنية ولا يُكتب فوقه
do $$ begin
  if exists(select 1 from pg_namespace where nspname='p1_archive') then
    execute format('alter schema p1_archive rename to %I','p1_archive_'||to_char(clock_timestamp(),'YYYYMMDD"T"HH24MISS'));
  end if;
end $$;
create schema p1_archive;
revoke all on schema p1_archive from public, anon, authenticated, service_role;
alter table if exists public.sync_meta set schema p1_archive;
alter table if exists public.sync_records set schema p1_archive;
alter table if exists public.quota_settings set schema p1_archive;
drop function if exists public.sync_exchange(int,bigint,jsonb);
drop function if exists public.delete_sync_data();
drop function if exists public.start_new_sync();
drop function if exists public.consume_quota_trusted(uuid,uuid,text);
drop function if exists public.consume_quota(text,text,int,int);
drop function if exists public.assert_session();
drop table if exists public.quota_counters;
-- استرجاع التعريف السابق لحذف الحساب
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path=public,auth as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from auth.users where id=auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
