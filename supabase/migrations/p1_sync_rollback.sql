-- تراجع P1: يحذف كائنات المزامنة والحصص فقط (جداول المجتمع وبياناتها لا تُمس).
-- تحذير: يحذف سجلات المزامنة السحابية. بيانات الأجهزة المحلية تبقى. خذ نسخة من الجدول قبل التنفيذ إن لزم.
drop function if exists public.sync_exchange(int,bigint,jsonb);
drop function if exists public.delete_sync_data();
drop function if exists public.consume_quota(text,text,int,int);
drop function if exists public.assert_session();
drop table if exists public.sync_records;
drop table if exists public.sync_meta;
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
