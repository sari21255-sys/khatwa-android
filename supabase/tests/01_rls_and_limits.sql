-- اختبارات RLS والحدود. أي فشل يرفع استثناء ويوقف التشغيل (ON_ERROR_STOP).
\set ON_ERROR_STOP on
insert into auth.users(id,raw_user_meta_data) values('00000000-0000-0000-0000-00000000000a','{"display_name":"سارة"}'),('00000000-0000-0000-0000-00000000000b','{"display_name":"بدر"}');
update public.profiles set created_at=now()-interval '3 days';

create or replace function pg_temp.as_user(u text) returns void language plpgsql as $$ begin perform set_config('request.uid',u,false); end $$;
create or replace function pg_temp.must_fail(sql text,why text) returns void language plpgsql as $$
begin
  begin execute sql; exception when others then return; end;
  raise exception 'EXPECTED FAILURE DID NOT HAPPEN: %',why;
end $$;
create or replace function pg_temp.eq(a anyelement,b anyelement,why text) returns void language plpgsql as $$
begin if a is distinct from b then raise exception 'ASSERT % : % <> %',why,a,b; end if; end $$;

set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into public.posts(body) values('مرحبا');
select pg_temp.must_fail($$insert into public.posts(body,likes) values('x',999)$$,'likes inflated');
select pg_temp.must_fail($$insert into public.posts(body,hidden) values('x',true)$$,'hidden set');
select pg_temp.must_fail($$insert into public.posts(body,user_id) values('x','00000000-0000-0000-0000-00000000000b')$$,'post as other user');
select pg_temp.must_fail($$insert into public.posts(body) values('')$$,'empty body');
select pg_temp.must_fail($$insert into public.posts(body) values(repeat('x',501))$$,'long body');

select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
insert into public.likes(post_id) values(1);
insert into public.comments(post_id,body) values(1,'جميل');
select pg_temp.eq((select count(*) from public.notifications)::int,0,'B sees no notifications of A');
select pg_temp.must_fail($$update public.notifications set title='x'$$,'notification title edit');
update public.profiles set display_name='بدر٢' where id=auth.uid();
delete from public.posts where id=1;
reset role;
select pg_temp.eq((select count(*) from public.posts where id=1)::int,1,'B cannot delete A post');
select pg_temp.eq((select author from public.comments limit 1),'بدر٢','author synced');
select pg_temp.eq((select likes||'/'||comments from public.posts where id=1),'1/1','counters');
select pg_temp.eq((select count(*) from public.notifications where user_id='00000000-0000-0000-0000-00000000000a')::int,2,'A got like+comment notifications');

-- حسابات جديدة (أقل من يوم) لا تُحتسب في الإخفاء التلقائي
insert into auth.users(id) select gen_random_uuid() from generate_series(1,3);
insert into public.reports(post_id,user_id) select 1,id from public.profiles where created_at>now()-interval '1 day';
select pg_temp.eq((select hidden from public.posts where id=1),false,'new accounts cannot auto-hide');
update public.profiles set created_at=now()-interval '3 days';
insert into auth.users(id) select gen_random_uuid() from generate_series(1,3);
update public.profiles set created_at=now()-interval '3 days';
insert into public.reports(post_id,user_id) select 1,id from public.profiles where id not in ('00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000b') and id not in (select user_id from public.reports) limit 3;
select pg_temp.eq((select hidden from public.posts where id=1),true,'3 aged reports hide');

-- حد التعليقات
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
do $$ declare n int:=0; begin for i in 1..60 loop begin insert into public.comments(post_id,body) values(1,'c'||i); n:=n+1; exception when others then exit; end; end loop; if n<>39 then raise exception 'comment limit: % inserted',n; end if; end $$;
select public.delete_my_account();
reset role;
select pg_temp.eq((select count(*) from public.profiles where id='00000000-0000-0000-0000-00000000000b')::int,0,'account deleted');
select 'ALL RLS TESTS PASSED' as result;
