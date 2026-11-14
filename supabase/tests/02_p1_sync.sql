-- اختبارات P1: مزامنة السجلات، العزل، الجلسات، epoch، الحصص، الحذف. أي فشل يوقف التشغيل.
\set ON_ERROR_STOP on
\i supabase/migrations/p1_sync.sql
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
select pg_temp.eq((pg_temp.ex(1,0,'[{"k":"bw","r":"2026-11-01","v":{"w":85},"ts":1000,"d":"dev1"},{"k":"meals","r":"2026-11-01","v":[{"n":"بيض"}],"ts":1001,"d":"dev1"}]'))->>'applied','2','two applied');
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
select pg_temp.ex(1,0,'[{"k":"bw","r":"2026-11-01","v":{"w":70},"ts":10,"d":"b1"}]');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1','11111111-1111-1111-1111-1111111111a1');
select pg_temp.eq(pg_temp.val(pg_temp.ex(1,0,'[]'),'bw','2026-11-01'),'{"w":83}'::jsonb,'A unaffected by B same key');

-- إبطال الجلسة (تسجيل خروج) يمنع الوصول فورًا
reset role;
delete from auth.sessions where id='11111111-1111-1111-1111-1111111111b1';
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-1111111111b1');
select pg_temp.must_fail($$select public.sync_exchange(1,0,'[]')$$,'revoked session sync');
set role service_role; select pg_temp.must_fail($$select public.consume_quota_trusted('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-1111111111b1')$$,'revoked session quota (trusted path)'); set role authenticated;
-- بلا هوية
select pg_temp.as_user('','');
select pg_temp.must_fail($$select public.sync_exchange(null,0,'[]')$$,'no uid');
set role anon;
select pg_temp.must_fail($$select public.sync_exchange(null,0,'[]')$$,'anon exec');
select pg_temp.must_fail($$select public.consume_quota_trusted('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-2222222222b1')$$,'anon cannot call trusted quota');
set role authenticated;

-- جهاز بلا معلومات مزامنة (epoch فارغ) يقرأ ولا يكتب
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1','11111111-1111-1111-1111-1111111111a1');
select pg_temp.eq((pg_temp.ex(null,0,'[{"k":"bw","r":"nullep","v":{"w":1},"ts":5,"d":"newdev"}]'))->>'applied','0','null-epoch device applies nothing');
select pg_temp.eq((pg_temp.ex(null,0,'[]'))->>'readonly','true','null-epoch call is read-only');
reset role; select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000a1' and rid='nullep'),0::bigint,'null-epoch write not stored'); set role authenticated;
select pg_temp.eq(jsonb_array_length((pg_temp.ex(null,0,'[]'))->'records')>0,true,'null-epoch device can still read the account data');
-- حذف نسخة المزامنة: يغلق المزامنة ويرفع epoch؛ لا كتابة من أي جهاز حتى القرار الصريح
select pg_temp.eq((public.delete_sync_data())->>'epoch','2','epoch bumped');
select pg_temp.eq((public.delete_sync_data())->>'epoch','3','repeated delete is safe');
select pg_temp.eq((pg_temp.ex(1,0,'[{"k":"bw","r":"stale","v":{"w":1},"ts":99999,"d":"old"}]'))->>'reset','true','stale device told to reset');
select pg_temp.eq((pg_temp.ex(null,0,'[{"k":"bw","r":"lost","v":{"w":1},"ts":99999,"d":"lostdev"}]'))->>'closed','true','device without sync info sees closed');
select pg_temp.eq((pg_temp.ex(3,0,'[{"k":"bw","r":"cur","v":{"w":2},"ts":1,"d":"d"}]'))->>'applied','0','even a device holding the current epoch cannot write while closed');
reset role; select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000a1'),0::bigint,'cloud stays empty after stale, lost-info and current-epoch attempts'); set role authenticated;
-- القرار الصريح: بدء مزامنة جديدة يفتح ويرفع epoch، فالجهاز الذي كان على 3 يُطلب منه القرار هو الآخر
select pg_temp.eq((public.start_new_sync())->>'epoch','4','explicit start opens sync at a new epoch');
select pg_temp.eq((public.start_new_sync())->>'epoch','4','start is idempotent when already open');
select pg_temp.eq((pg_temp.ex(3,0,'[{"k":"bw","r":"old3","v":{"w":1},"ts":5,"d":"old3"}]'))->>'reset','true','device that held previous epoch is reset after start');
select pg_temp.eq((pg_temp.ex(4,0,'[{"k":"bw","r":"new","v":{"w":2},"ts":1,"d":"d"}]'))->>'applied','1','device at the new epoch uploads');
reset role; select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000a1'),1::bigint,'only the explicit upload is stored'); set role authenticated;
-- بيانات المستخدم الآخر لم تُمس
select pg_temp.as_user('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-1111111111b1');
reset role; insert into auth.sessions(id,user_id) values('11111111-1111-1111-1111-2222222222b1','00000000-0000-0000-0000-0000000000b1'); select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000b1'),1::bigint,'B data intact'); set role authenticated;

-- الحصص: المسار الموثوق (service_role) وحده يعدّل العدّادات، والحدود من quota_settings
select pg_temp.as_user('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-2222222222b1');
-- حساب عادي لا يستطيع استدعاء التعديل مباشرة، ولا بالتوقيع القديم الذي يختار فيه حدوده
select pg_temp.must_fail($$select public.consume_quota_trusted('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-2222222222b1')$$,'authenticated cannot call trusted quota');
select pg_temp.must_fail($$select public.consume_quota('ai','day',1000000,1000000)$$,'old client-controlled signature is gone');
select pg_temp.must_fail($$update public.quota_counters set n=0$$,'authenticated cannot update counters');
select pg_temp.must_fail($$insert into public.quota_counters(scope,bucket,win,n) values('g','ai','x',999999)$$,'authenticated cannot insert counters');
select pg_temp.must_fail($$delete from public.quota_counters$$,'authenticated cannot delete counters');
select pg_temp.must_fail($$select * from public.quota_settings$$,'authenticated cannot read settings');
select pg_temp.must_fail($$update public.quota_settings set user_max=1000000$$,'authenticated cannot change limits');
reset role;
delete from public.quota_counters; update public.quota_settings set period='day',user_max=2,global_max=3 where bucket='ai';
set role service_role;
select pg_temp.eq(public.consume_quota_trusted('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-2222222222b1'),true,'q1');
select pg_temp.eq(public.consume_quota_trusted('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-2222222222b1'),true,'q2');
select pg_temp.eq(public.consume_quota_trusted('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-2222222222b1'),false,'q3 denied by user limit from settings');
reset role;
select pg_temp.eq((select n from public.quota_counters where scope='u:'||'00000000-0000-0000-0000-0000000000b1' and bucket='ai'),2,'user counter unchanged by denied request');
select pg_temp.eq((select n from public.quota_counters where scope='g' and bucket='ai'),2,'global counter unchanged by denied request');
set role service_role;
select pg_temp.must_fail($$select public.consume_quota_trusted('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-2222222222b1','other')$$,'bucket must exist in settings');
select pg_temp.must_fail($$select public.consume_quota_trusted('00000000-0000-0000-0000-0000000000a1','11111111-1111-1111-1111-2222222222b1')$$,'session of another user rejected');
select pg_temp.must_fail($$select public.consume_quota_trusted('00000000-0000-0000-0000-0000000000b1','99999999-9999-9999-9999-999999999999')$$,'unknown session rejected');
reset role;
select pg_temp.eq((select sum(n) from public.quota_counters),4::bigint,'rejected calls changed nothing');
-- الحد الكلي: A يستهلك ما بقي (1) ثم يُرفض، ولا يُحسب على المستخدم ما رُفض بسبب الكلي
set role service_role;
select pg_temp.eq(public.consume_quota_trusted('00000000-0000-0000-0000-0000000000a1','11111111-1111-1111-1111-1111111111a1'),true,'global 3 of 3 (A)');
select pg_temp.eq(public.consume_quota_trusted('00000000-0000-0000-0000-0000000000a1','11111111-1111-1111-1111-1111111111a1'),false,'global cap denies');
reset role;
select pg_temp.eq((select n from public.quota_counters where scope='u:'||'00000000-0000-0000-0000-0000000000a1' and bucket='ai'),1,'user charge rolled back when global denies');
select pg_temp.eq((select n from public.quota_counters where scope='g' and bucket='ai'),3,'global counter stays at cap');
-- جلسة ملغاة: ترفض والعدّاد كما هو
select pg_temp.eq((select count(*) from auth.sessions where id='11111111-1111-1111-1111-2222222222b1'),1::bigint,'session present');
delete from auth.sessions where id='11111111-1111-1111-1111-2222222222b1';
set role service_role;
select pg_temp.must_fail($$select public.consume_quota_trusted('00000000-0000-0000-0000-0000000000b1','11111111-1111-1111-1111-2222222222b1')$$,'revoked session rejected');
reset role;
select pg_temp.eq((select sum(n) from public.quota_counters),6::bigint,'revoked-session call changed nothing');
insert into auth.sessions(id,user_id) values('11111111-1111-1111-1111-2222222222b1','00000000-0000-0000-0000-0000000000b1');
update public.quota_settings set user_max=100,global_max=500 where bucket='ai';
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1','11111111-1111-1111-1111-1111111111a1');

-- تعادل التوقيت: يفوز dev الأكبر بترتيب البايتات (كما في JavaScript) أيًّا كان ترتيب الوصول وأيًّا كان ترتيب القاعدة اللغوي
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1','11111111-1111-1111-1111-1111111111a1');
select (public.start_new_sync()->>'epoch')::int as ep \gset
select public.sync_exchange(:ep,0,'[{"k":"bw","r":"tie1","v":{"w":1},"ts":777,"d":"Bdev"}]');
select pg_temp.eq((public.sync_exchange(:ep,0,'[{"k":"bw","r":"tie1","v":{"w":2},"ts":777,"d":"aDev"}]')->>'applied')::int,1,'aDev (byte order greater than Bdev) wins the tie');
select public.sync_exchange(:ep,0,'[{"k":"bw","r":"tie2","v":{"w":2},"ts":777,"d":"aDev"}]');
select pg_temp.eq((public.sync_exchange(:ep,0,'[{"k":"bw","r":"tie2","v":{"w":1},"ts":777,"d":"Bdev"}]')->>'applied')::int,0,'Bdev loses the tie in the reverse arrival order');
select pg_temp.eq((select (r->'v'->>'w') from jsonb_array_elements(public.sync_exchange(:ep,0,'[]')->'records') r where r->>'r'='tie1'),'2','tie1 holds aDev value');
select pg_temp.eq((select (r->'v'->>'w') from jsonb_array_elements(public.sync_exchange(:ep,0,'[]')->'records') r where r->>'r'='tie2'),'2','tie2 holds aDev value');
select pg_temp.must_fail($$select public.sync_exchange(:ep,0,'[{"k":"bw","r":"x","v":{"w":1},"ts":5,"d":"bad dev!"}]')$$,'dev must be ASCII id');
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
