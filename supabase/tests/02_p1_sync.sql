-- اختبارات P1: مزامنة السجلات، العزل، الجلسات، epoch، الحصص، الحذف. أي فشل يوقف التشغيل.
\set ON_ERROR_STOP on
\i supabase/migrations/p1_sync.sql
grant execute on function public.sync_exchange(int,bigint,jsonb), public.delete_sync_data(), public.consume_quota(text,text,int,int) to authenticated;
insert into auth.users(id) values('00000000-0000-0000-0000-0000000000a1'),('00000000-0000-0000-0000-0000000000b1');
insert into auth.sessions(id,user_id) values('11111111-1111-1111-1111-1111111111a1','00000000-0000-0000-0000-0000000000a1'),('11111111-1111-1111-1111-1111111111b1','00000000-0000-0000-0000-0000000000b1');
create or replace function pg_temp.as_user(u text,s text) returns void language plpgsql as $$ begin perform set_config('request.uid',u,false); perform set_config('request.jwt.claims',json_build_object('sub',u,'session_id',s)::text,false); end $$;
create or replace function pg_temp.must_fail(sql text,why text) returns void language plpgsql as $$
begin begin execute sql; exception when others then return; end; raise exception 'EXPECTED FAILURE DID NOT HAPPEN: %',why; end $$;
create or replace function pg_temp.eq(a anyelement,b anyelement,why text) returns void language plpgsql as $$
begin if a is distinct from b then raise exception 'ASSERT % : % <> %',why,a,b; end if; end $$;
create or replace function pg_temp.ex(ep int,cur bigint,ch jsonb) returns jsonb language sql as $$ select public.sync_exchange(ep,cur,ch) $$;
create or replace function pg_temp.val(j jsonb,k text,r text) returns jsonb language sql as $$ select (e->'v') from jsonb_array_elements(j->'records') e where e->>'k'=k and e->>'r'=r $$;
create or replace function pg_temp.del(j jsonb,k text,r text) returns boolean language sql as $$ select (e->>'x')::boolean from jsonb_array_elements(j->'records') e where e->>'k'=k and e->>'r'=r $$;

set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1','11111111-1111-1111-1111-1111111111a1');
-- الجداول مغلقة أمام الوصول المباشر
select pg_temp.must_fail($$select * from public.sync_records$$,'direct select sync_records');
select pg_temp.must_fail($$insert into public.sync_records(user_id,kind,rid,ts,dev,seq) values(auth.uid(),'bw','x',1,'d',1)$$,'direct insert');
select pg_temp.must_fail($$select * from public.quota_counters$$,'direct select quota');

-- جهاز 1 يرفع سجلين
select pg_temp.eq((pg_temp.ex(null,0,'[{"k":"bw","r":"2026-11-01","v":{"w":85},"ts":1000,"d":"dev1"},{"k":"meals","r":"2026-11-01","v":[{"n":"بيض"}],"ts":1001,"d":"dev1"}]'))->>'applied','2','two applied');
-- جهاز 2 (جلسة المستخدم نفسه) يعدّل سجلًا مختلفًا بدون أن يعرف عن الأول: كلاهما يظهر لكليهما (T09b)
select pg_temp.eq(jsonb_array_length((pg_temp.ex(1,0,'[{"k":"bw","r":"2026-11-02","v":{"w":84},"ts":2000,"d":"dev2"}]'))->'records'),3,'dev2 sees all 3');
select pg_temp.eq(jsonb_array_length((pg_temp.ex(1,0,'[]'))->'records'),3,'dev1 sees all 3 on next pull');
-- تعديل السجل نفسه: الأحدث يفوز، الأقدم يُتجاهل
select pg_temp.ex(1,0,'[{"k":"bw","r":"2026-11-01","v":{"w":83},"ts":3000,"d":"dev2"}]');
select pg_temp.eq((pg_temp.ex(1,0,'[{"k":"bw","r":"2026-11-01","v":{"w":99},"ts":2500,"d":"dev1"}]'))->>'ignored','1','older edit ignored');
select pg_temp.eq(pg_temp.val(pg_temp.ex(1,0,'[]'),'bw','2026-11-01'),'{"w":83}'::jsonb,'newest edit wins');
-- إعادة إرسال الطلب نفسه: لا أثر (idempotent)
select pg_temp.eq((pg_temp.ex(1,0,'[{"k":"bw","r":"2026-11-01","v":{"w":83},"ts":3000,"d":"dev2"}]'))->>'applied','0','resend idempotent');
-- حذف أحدث من التعديل يفوز، وتعديل أحدث من الحذف يعيد السجل
select pg_temp.ex(1,0,'[{"k":"meals","r":"2026-11-01","x":true,"ts":4000,"d":"dev1"}]');
select pg_temp.eq(pg_temp.del(pg_temp.ex(1,0,'[]'),'meals','2026-11-01'),true,'delete newer than edit wins');
select pg_temp.ex(1,0,'[{"k":"meals","r":"2026-11-01","v":[{"n":"رز"}],"ts":4500,"d":"dev2"}]');
select pg_temp.eq(pg_temp.del(pg_temp.ex(1,0,'[]'),'meals','2026-11-01'),false,'edit newer than delete resurrects');
-- تساوي ts: التعديل يغلب الحذف
select pg_temp.ex(1,0,'[{"k":"x1","r":"a","x":true,"ts":5000,"d":"dev1"}]');
select pg_temp.ex(1,0,'[{"k":"x1","r":"a","v":{"a":1},"ts":5000,"d":"dev1"}]');
select pg_temp.eq(pg_temp.del(pg_temp.ex(1,0,'[]'),'x1','a'),false,'tie: edit beats delete');
-- حذف أثناء الانقطاع ثم وصوله متأخرًا لا يلغي تعديلًا أحدث
select pg_temp.ex(1,0,'[{"k":"bw","r":"2026-11-02","v":{"w":80},"ts":9000,"d":"dev2"}]');
select pg_temp.ex(1,0,'[{"k":"bw","r":"2026-11-02","x":true,"ts":8000,"d":"dev1"}]');
select pg_temp.eq(pg_temp.val(pg_temp.ex(1,0,'[]'),'bw','2026-11-02'),'{"w":80}'::jsonb,'late offline delete does not kill newer edit');
-- المؤشر: بعد المؤشر الأخير لا شيء جديد
select pg_temp.eq(jsonb_array_length((pg_temp.ex(1,(select (pg_temp.ex(1,0,'[]'))->>'cursor')::bigint,'[]'))->'records'),0,'cursor returns nothing new');
-- مدخلات غير صالحة
select pg_temp.must_fail($$select public.sync_exchange(1,0,'[{"k":"Bad Kind","r":"a","v":1,"ts":1,"d":"d"}]')$$,'bad kind');
select pg_temp.must_fail($$select public.sync_exchange(1,0,'{"a":1}')$$,'not array');
select pg_temp.must_fail($$select public.sync_exchange(1,0,'[{"k":"a","r":"a","ts":1,"d":"d"}]')$$,'upsert without data');

select pg_temp.must_fail($$select public.sync_exchange(1,0,'[{"k":"bw","r":"future","v":1,"ts":99999999999999,"d":"d"}]')$$,'future timestamp rejected');
select pg_temp.must_fail($$select public.sync_exchange(1,0,'[{"k":"bw","r":"neg","v":1,"ts":-5,"d":"d"}]')$$,'negative timestamp rejected');

-- عزل المستخدمين
select pg_temp.as_user('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-1111111111b1');
select pg_temp.eq(jsonb_array_length((pg_temp.ex(null,0,'[]'))->'records'),0,'B sees nothing of A');
select pg_temp.ex(null,0,'[{"k":"bw","r":"2026-11-01","v":{"w":70},"ts":10,"d":"b1"}]');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1','11111111-1111-1111-1111-1111111111a1');
select pg_temp.eq(pg_temp.val(pg_temp.ex(1,0,'[]'),'bw','2026-11-01'),'{"w":83}'::jsonb,'A unaffected by B same key');

-- إبطال الجلسة (تسجيل خروج) يمنع الوصول فورًا
reset role;
delete from auth.sessions where id='11111111-1111-1111-1111-1111111111b1';
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-1111111111b1');
select pg_temp.must_fail($$select public.sync_exchange(1,0,'[]')$$,'revoked session sync');
select pg_temp.must_fail($$select public.consume_quota('ai','hour',5)$$,'revoked session quota');
-- بلا هوية
select pg_temp.as_user('','');
select pg_temp.must_fail($$select public.sync_exchange(null,0,'[]')$$,'no uid');
set role anon;
select pg_temp.must_fail($$select public.sync_exchange(null,0,'[]')$$,'anon exec');
select pg_temp.must_fail($$select public.consume_quota('ai','hour',5)$$,'anon quota');
set role authenticated;

-- حذف نسخة المزامنة: epoch يرتفع وجهاز قديم لا يعيد الرفع
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1','11111111-1111-1111-1111-1111111111a1');
select pg_temp.eq((public.delete_sync_data())->>'epoch','2','epoch bumped');
select pg_temp.eq((public.delete_sync_data())->>'epoch','3','repeated delete is safe');
select pg_temp.eq((pg_temp.ex(1,0,'[{"k":"bw","r":"stale","v":{"w":1},"ts":99999,"d":"old"}]'))->>'reset','true','stale device told to reset');
reset role; select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000a1'),0::bigint,'nothing from stale device stored and old data gone'); set role authenticated;
select pg_temp.eq((pg_temp.ex(3,0,'[{"k":"bw","r":"new","v":{"w":2},"ts":1,"d":"d"}]'))->>'applied','1','device at new epoch uploads');
select pg_temp.eq((pg_temp.ex(null,0,'[]'))->>'epoch','3','new device learns current epoch');
-- بيانات المستخدم الآخر لم تُمس
select pg_temp.as_user('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-1111111111b1');
reset role; insert into auth.sessions(id,user_id) values('11111111-1111-1111-1111-2222222222b1','00000000-0000-0000-0000-0000000000b1'); select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000b1'),1::bigint,'B data intact'); set role authenticated;

-- الحصص
select pg_temp.as_user('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-2222222222b1');
select pg_temp.eq(public.consume_quota('ai','hour',2),true,'q1');
select pg_temp.eq(public.consume_quota('ai','hour',2),true,'q2');
select pg_temp.eq(public.consume_quota('ai','hour',2),false,'q3 denied');
select pg_temp.must_fail($$select public.consume_quota('other','hour',2)$$,'bucket whitelist');
select pg_temp.must_fail($$select public.consume_quota('ai','hour',0)$$,'max>=1');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1','11111111-1111-1111-1111-1111111111a1');
select pg_temp.eq(public.consume_quota('ai','day',5,3),true,'global 1 (A) after B used 0 of day bucket');
select pg_temp.eq(public.consume_quota('ai','day',5,3),true,'global 2');
select pg_temp.eq(public.consume_quota('ai','day',5,3),true,'global 3');
select pg_temp.eq(public.consume_quota('ai','day',5,3),false,'global cap denies');
reset role; select pg_temp.eq((select n from public.quota_counters where scope='u:00000000-0000-0000-0000-0000000000a1' and bucket='ai' and win like '____-__-__'),3,'user charge not incremented when global denies'); set role authenticated;

-- حذف الحساب: يحذف السجلات والعدادات ويمنع جهازًا قديمًا (مفتاح الكتابة يفشل بـFK)
select public.delete_my_account();
reset role;
select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000a1'),0::bigint,'records cascade deleted');
select pg_temp.eq((select count(*) from public.sync_meta where user_id='00000000-0000-0000-0000-0000000000a1'),0::bigint,'meta cascade deleted');
select pg_temp.eq((select count(*) from public.quota_counters where scope='u:00000000-0000-0000-0000-0000000000a1'),0::bigint,'quota cleaned');
-- جلسة التوكن القديم بعد حذف المستخدم: auth.sessions تُحذف بالـcascade فيفشل الوصول
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1','11111111-1111-1111-1111-1111111111a1');
select pg_temp.must_fail($$select public.sync_exchange(3,0,'[{"k":"bw","r":"zombie","v":{"w":1},"ts":99999,"d":"old"}]')$$,'deleted account cannot re-upload');
reset role;
select pg_temp.eq((select count(*) from public.sync_records),1::bigint,'only B record remains (no zombie upload)');
select 'ALL P1 SQL TESTS PASSED' as result;
