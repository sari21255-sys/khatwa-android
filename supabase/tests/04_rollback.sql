-- اختبار التراجع والاستعادة على قاعدة اختبار ببيانات اصطناعية. يُشغَّل بعد 00 و01 (أو 02): يطبّق الهجرة بنفسه.
-- السجلات هنا كتبها «أجهزة» وهمية لم تعد موجودة (dev=lostdev*): لا نسخة منها إلا في الخادم، فلا تُستعاد من أي جهاز.
\set ON_ERROR_STOP on
create or replace function pg_temp.eq(a anyelement,b anyelement,why text) returns void language plpgsql as $$ begin if a is distinct from b then raise exception 'ASSERT % : % <> %',why,a,b; end if; end $$;
create or replace function pg_temp.must_fail(sql text,why text) returns void language plpgsql as $$
begin begin execute sql; exception when others then return; end; raise exception 'EXPECTED FAILURE DID NOT HAPPEN: %',why; end $$;
create or replace function pg_temp.as_user(u text,s text) returns void language plpgsql as $$ begin perform set_config('request.uid',u,false); perform set_config('request.jwt.claims',json_build_object('sub',u,'session_id',s)::text,false); end $$;
create or replace function pg_temp.sum_of(tbl text,u uuid) returns text language plpgsql as $$ declare r text; begin
  execute format('select coalesce(md5(string_agg(kind||''/''||rid||''/''||coalesce(data::text,'''')||''/''||ts||''/''||dev||''/''||del||''/''||seq,''|'' order by kind,rid)),''none'') from %s where user_id=%L',tbl,u) into r; return r; end $$;
create or replace function pg_temp.cnt(tbl text,u uuid) returns bigint language plpgsql as $$ declare r bigint; begin execute format('select count(*) from %s where user_id=%L',tbl,u) into r; return r; end $$;
\i supabase/migrations/p1_sync.sql
-- حسابات: U1 نشط، U2 حُذفت نسخته السحابية (closed)، U3 سيحذف حسابه بعد التراجع، U4 سيحذف حسابه قبل الاستعادة، U5 مستخدم آخر لعزل الحسابات
insert into auth.users(id,raw_user_meta_data) values
 ('00000000-0000-0000-0000-0000000000f1','{"display_name":"u1"}'),('00000000-0000-0000-0000-0000000000f2','{"display_name":"u2"}'),
 ('00000000-0000-0000-0000-0000000000f3','{"display_name":"u3"}'),('00000000-0000-0000-0000-0000000000f4','{"display_name":"u4"}'),
 ('00000000-0000-0000-0000-0000000000f5','{"display_name":"u5"}'),
 ('00000000-0000-0000-0000-0000000000f6','{"display_name":"u6"}'),('00000000-0000-0000-0000-0000000000f7','{"display_name":"u7"}'),
 ('00000000-0000-0000-0000-0000000000fa','{"display_name":"ua"}'),('00000000-0000-0000-0000-0000000000fb','{"display_name":"ub"}') on conflict do nothing;
insert into auth.sessions(id,user_id) select ('11111111-1111-1111-1111-11111111111'||right(u::text,1))::uuid,u::uuid from unnest(array['00000000-0000-0000-0000-0000000000f1','00000000-0000-0000-0000-0000000000f2','00000000-0000-0000-0000-0000000000f3','00000000-0000-0000-0000-0000000000f4','00000000-0000-0000-0000-0000000000f5','00000000-0000-0000-0000-0000000000f6','00000000-0000-0000-0000-0000000000f7','00000000-0000-0000-0000-0000000000fa','00000000-0000-0000-0000-0000000000fb']) u on conflict do nothing;
set role authenticated;
-- بيانات مزامنة كتبتها أجهزة ضائعة، بما فيها حذف (tombstone) وسجل كبير نسبيًا
select pg_temp.as_user('00000000-0000-0000-0000-0000000000f1','11111111-1111-1111-1111-111111111111');
select public.sync_exchange(1,0,'[{"k":"bw","r":"2026-01-01","v":{"w":91},"ts":1000,"d":"lostdev1"},{"k":"bw","r":"2026-01-02","v":{"w":92},"ts":2000,"d":"lostdev1"},{"k":"meals","r":"2026-01-01","v":[{"n":"وجبة لا يحملها أي جهاز"}],"ts":3000,"d":"lostdev2"},{"k":"bw","r":"2026-01-03","x":true,"ts":4000,"d":"lostdev2"}]');
insert into public.posts(body) values('منشور مجتمع يجب أن يبقى');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000f2','11111111-1111-1111-1111-111111111112');
select public.sync_exchange(1,0,'[{"k":"bw","r":"2026-02-01","v":{"w":80},"ts":500,"d":"lostdev3"}]');
select public.delete_sync_data();        -- U2: epoch 2، مغلق، بلا سجلات
select pg_temp.as_user('00000000-0000-0000-0000-0000000000f3','11111111-1111-1111-1111-111111111113');
select public.sync_exchange(1,0,'[{"k":"bw","r":"2026-03-01","v":{"w":70},"ts":700,"d":"lostdev4"}]');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000f4','11111111-1111-1111-1111-111111111114');
select public.sync_exchange(1,0,'[{"k":"bw","r":"2026-04-01","v":{"w":60},"ts":800,"d":"lostdev5"}]');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000f5','11111111-1111-1111-1111-111111111115');
select public.sync_exchange(1,0,'[{"k":"bw","r":"2026-05-01","v":{"w":50},"ts":900,"d":"lostdev6"}]');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000f6','11111111-1111-1111-1111-111111111116');
select public.sync_exchange(1,0,'[{"k":"bw","r":"old-a","v":{"w":61},"ts":5000,"d":"lostdev7"},{"k":"bw","r":"old-b","v":{"w":62},"ts":5001,"d":"lostdev7"}]');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000f7','11111111-1111-1111-1111-111111111117');
select public.sync_exchange(1,0,'[{"k":"bw","r":"keep-a","v":{"w":71},"ts":6000,"d":"lostdev8"},{"k":"bw","r":"keep-b","v":{"w":72},"ts":6001,"d":"lostdev8"}]');
reset role;
update public.quota_settings set user_max=7,global_max=77 where bucket='ai';
select pg_temp.sum_of('public.sync_records','00000000-0000-0000-0000-0000000000f1') as s1,
       pg_temp.sum_of('public.sync_records','00000000-0000-0000-0000-0000000000f3') as s3,
       pg_temp.sum_of('public.sync_records','00000000-0000-0000-0000-0000000000f5') as s5,
       pg_temp.sum_of('public.sync_records','00000000-0000-0000-0000-0000000000f7') as s7,
       (select count(*) from public.posts) as posts_before,
       (select seq from public.sync_meta where user_id='00000000-0000-0000-0000-0000000000f1') as seq1,
       (select epoch from public.sync_meta where user_id='00000000-0000-0000-0000-0000000000f2') as ep2 \gset

-- 1) التراجع: لا يحذف شيئًا من بيانات المزامنة
\i supabase/migrations/p1_sync_rollback.sql
do $$ begin
  if to_regclass('public.sync_records') is not null or to_regclass('public.sync_meta') is not null or to_regclass('public.quota_counters') is not null or to_regclass('public.quota_settings') is not null then raise exception 'rollback left tables in public'; end if;
  if to_regprocedure('public.sync_exchange(int,bigint,jsonb)') is not null or to_regprocedure('public.start_new_sync()') is not null or to_regprocedure('public.consume_quota_trusted(uuid,uuid,text)') is not null then raise exception 'rollback left functions'; end if;
end $$;
select pg_temp.eq(pg_temp.sum_of('p1_archive.sync_records','00000000-0000-0000-0000-0000000000f1'),:'s1','archive keeps user 1 records byte-for-byte (incl. tombstone)');
select pg_temp.eq(pg_temp.sum_of('p1_archive.sync_records','00000000-0000-0000-0000-0000000000f3'),:'s3','archive keeps user 3 records');
select pg_temp.eq(pg_temp.cnt('p1_archive.sync_records','00000000-0000-0000-0000-0000000000f1')+pg_temp.cnt('p1_archive.sync_records','00000000-0000-0000-0000-0000000000f5'),5::bigint,'archive holds the 4+1 device-less records');
select pg_temp.eq((select count(*) from public.posts),:posts_before::bigint,'community data untouched by rollback');
-- الأرشيف لا يصل إليه أي دور API
set role authenticated; select pg_temp.must_fail($$select * from p1_archive.sync_records$$,'authenticated cannot read archive'); reset role;
set role anon; select pg_temp.must_fail($$select * from p1_archive.sync_records$$,'anon cannot read archive'); reset role;
set role service_role; select pg_temp.must_fail($$select * from p1_archive.sync_records$$,'service_role has no access to archive'); reset role;
-- حذف الحساب بعد التراجع: يعمل ويحذف النسخة المؤرشفة أيضًا (قواعد الحذف مستمرة)
set role authenticated; select pg_temp.as_user('00000000-0000-0000-0000-0000000000f3','11111111-1111-1111-1111-111111111113'); select public.delete_my_account(); reset role;
select pg_temp.eq((select count(*) from auth.users where id='00000000-0000-0000-0000-0000000000f3'),0::bigint,'delete_my_account works after rollback');
select pg_temp.eq(pg_temp.cnt('p1_archive.sync_records','00000000-0000-0000-0000-0000000000f3'),0::bigint,'archived records of deleted account are deleted too');
select pg_temp.eq(pg_temp.cnt('p1_archive.sync_meta','00000000-0000-0000-0000-0000000000f3'),0::bigint,'archived meta of deleted account deleted too');
select pg_temp.eq(pg_temp.sum_of('p1_archive.sync_records','00000000-0000-0000-0000-0000000000f5'),:'s5','other accounts archive unaffected by that deletion');
-- U4 يحذف حسابه قبل الاستعادة
set role authenticated; select pg_temp.as_user('00000000-0000-0000-0000-0000000000f4','11111111-1111-1111-1111-111111111114'); select public.delete_my_account(); reset role;

-- 2) إعادة التفعيل ثم الاستعادة. نشاط حي جديد لـU1 قبل الاستعادة (سجل أحدث لنفس المفتاح + سجل جديد)
\i supabase/migrations/p1_sync.sql
set role authenticated; select pg_temp.as_user('00000000-0000-0000-0000-0000000000f1','11111111-1111-1111-1111-111111111111');
select pg_temp.eq((public.sync_exchange(1,0,'[{"k":"bw","r":"2026-01-02","v":{"w":99},"ts":9000,"d":"newdev"},{"k":"bw","r":"2026-06-01","v":{"w":88},"ts":9500,"d":"newdev"}]')->>'applied')::int,2,'live activity before restore');
reset role;
-- U6: بعد إعادة التفعيل يحذف نسخته السحابية ثم يبدأ مزامنة جديدة بسجلات مختلفة. المؤرشف عنده بتوقيت (ts) أعلى من الجديد عمدًا:
-- لولا حدّ الحذف لفاز المؤرشف بقاعدة الفوز.
set role authenticated; select pg_temp.as_user('00000000-0000-0000-0000-0000000000f6','11111111-1111-1111-1111-111111111116');
select public.delete_sync_data();
select (public.start_new_sync()->>'epoch')::int as ep6 \gset
select pg_temp.eq((public.sync_exchange(:ep6,0,'[{"k":"bw","r":"old-a","v":{"w":1},"ts":100,"d":"newdev6"},{"k":"bw","r":"new-c","v":{"w":3},"ts":101,"d":"newdev6"}]')->>'applied')::int,2,'U6 uploads new records after explicit restart');
reset role;
select pg_temp.eq((select deleted_at is not null from public.sync_meta where user_id='00000000-0000-0000-0000-0000000000f6'),true,'deletion boundary persists after sync is reopened');
select pg_temp.eq((select closed from public.sync_meta where user_id='00000000-0000-0000-0000-0000000000f6'),false,'sync is open again');
\i supabase/migrations/p1_sync_restore.sql
-- U5 (بلا نشاط حي): نسخة مطابقة تمامًا بما فيها seq
select pg_temp.eq(pg_temp.sum_of('public.sync_records','00000000-0000-0000-0000-0000000000f5'),:'s5','user 5 restored identically (data, ts, dev, seq)');
-- U2 (مغلق): يبقى مغلقًا بنفس الإصدار ولا سجلات
select pg_temp.eq((select epoch from public.sync_meta where user_id='00000000-0000-0000-0000-0000000000f2'),:ep2,'closed account keeps its epoch');
select pg_temp.eq((select closed from public.sync_meta where user_id='00000000-0000-0000-0000-0000000000f2'),true,'closed account stays closed after restore');
select pg_temp.eq(pg_temp.cnt('public.sync_records','00000000-0000-0000-0000-0000000000f2'),0::bigint,'closed account has no records');
-- U1 (نشاط حي): دمج بقاعدة الفوز: الأحدث الحي يبقى، والمؤرشف الذي لا يوجد حيًا يعود، والـtombstone يعود
select pg_temp.eq((select data from public.sync_records where user_id='00000000-0000-0000-0000-0000000000f1' and kind='bw' and rid='2026-01-02'),'{"w":99}'::jsonb,'newer live edit survives the restore');
select pg_temp.eq((select data from public.sync_records where user_id='00000000-0000-0000-0000-0000000000f1' and kind='bw' and rid='2026-01-01'),'{"w":91}'::jsonb,'archived-only record returns');
select pg_temp.eq((select del from public.sync_records where user_id='00000000-0000-0000-0000-0000000000f1' and kind='bw' and rid='2026-01-03'),true,'archived tombstone returns');
select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000f1' and kind='meals'),1::bigint,'meals record from a lost device returns');
select pg_temp.eq((select count(distinct seq)=count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000f1'),true,'seq unique after merge');
select pg_temp.eq((select seq from public.sync_meta where user_id='00000000-0000-0000-0000-0000000000f1')=(select max(seq) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000f1'),true,'meta seq equals max record seq');
-- U6: السجلات المحذوفة لا تعود (old-b)، وold-a يبقى بقيمة الجديد (1) رغم أن توقيت المؤرشف أعلى، والجديد باقٍ
select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000f6' and rid='old-b'),0::bigint,'deleted archived record does not return after reopen');
select pg_temp.eq((select data from public.sync_records where user_id='00000000-0000-0000-0000-0000000000f6' and rid='old-a'),'{"w":1}'::jsonb,'new record survives over a higher-ts archived one');
select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000f6' and dev like 'lostdev%'),0::bigint,'no archived record of U6 returned');
select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000f6'),2::bigint,'U6 holds exactly its 2 new records');
-- U7: حساب آخر لم يحذف نسخته يستعيد بياناته كاملة (البصمة مطابقة بما فيها seq)
select pg_temp.eq(pg_temp.sum_of('public.sync_records','00000000-0000-0000-0000-0000000000f7'),:'s7','account that never deleted restores identically');
-- U4 حُذف حسابه: لا يعود
select pg_temp.eq((select count(*) from public.sync_meta where user_id='00000000-0000-0000-0000-0000000000f4'),0::bigint,'deleted account not restored');
select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000f3'),0::bigint,'deleted account (before rollback of restore) not restored');
-- بيانات المجتمع باقية، وحدود الحصص مستعادة
select pg_temp.eq((select count(*) from public.posts),:posts_before::bigint,'community data intact after restore');
select pg_temp.eq((select user_max||'/'||global_max from public.quota_settings where bucket='ai'),'7/77','quota limits restored');
-- الاستعادة آمنة للتكرار
select sum(n) as c_before from (select count(*) n from public.sync_records) q \gset
\i supabase/migrations/p1_sync_restore.sql
select pg_temp.eq((select count(*) from public.sync_records),:c_before::bigint,'restore is idempotent');
select pg_temp.eq(pg_temp.sum_of('public.sync_records','00000000-0000-0000-0000-0000000000f5'),:'s5','idempotent restore keeps user 5 identical');
select pg_temp.eq(pg_temp.sum_of('public.sync_records','00000000-0000-0000-0000-0000000000f7'),:'s7','second restore keeps user 7 identical');
select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000f6'),2::bigint,'second restore: U6 still holds only its 2 new records');
select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000f6' and rid='old-b'),0::bigint,'second restore: deleted record still absent');

-- 3) بعد الاستعادة: عزل الحسابات وقواعد الحذف والإغلاق تعمل
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000f5','11111111-1111-1111-1111-111111111115');
select pg_temp.eq(jsonb_array_length(public.sync_exchange(1,0,'[]')->'records'),1,'U5 sees exactly its own record');
select pg_temp.must_fail($$select * from public.sync_records$$,'no direct table access after restore');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000f1','11111111-1111-1111-1111-111111111111');
select pg_temp.eq((select count(*) from jsonb_array_elements(public.sync_exchange(1,0,'[]')->'records') r where r->>'d' like 'lostdev%'),3::bigint,'U1 sees its restored records only') ;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000f2','11111111-1111-1111-1111-111111111112');
select pg_temp.eq((public.sync_exchange(2,0,'[{"k":"bw","r":"x","v":{"w":1},"ts":5,"d":"d"}]')->>'applied')::int,0,'closed account still rejects writes after restore');
select pg_temp.eq((public.start_new_sync()->>'epoch')::int,3,'explicit start still required and works after restore');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000f1','11111111-1111-1111-1111-111111111111');
select public.delete_sync_data();
reset role;
select pg_temp.eq(pg_temp.cnt('public.sync_records','00000000-0000-0000-0000-0000000000f1'),0::bigint,'delete_sync_data works after restore');
set role authenticated; select pg_temp.as_user('00000000-0000-0000-0000-0000000000f5','11111111-1111-1111-1111-111111111115'); select public.delete_my_account(); reset role;
select pg_temp.eq(pg_temp.cnt('public.sync_records','00000000-0000-0000-0000-0000000000f5'),0::bigint,'delete_my_account removes restored records');
select pg_temp.eq(pg_temp.cnt('p1_archive.sync_records','00000000-0000-0000-0000-0000000000f5'),0::bigint,'and the archive copy');
-- تراجع ثانٍ لا يكتب فوق الأرشيف الأول
\i supabase/migrations/p1_sync_rollback.sql
select pg_temp.eq((select count(*) from pg_tables where schemaname like 'p1_archive%' and tablename='sync_records'),2::bigint,'second rollback keeps the first archive under a timestamped name');
\i supabase/migrations/p1_sync.sql
select pg_temp.eq((to_regclass('public.sync_records') is not null),true,'migration re-applies cleanly after rollback');

-- 4) أرشيف بصيغة سابقة بلا written_at وdeleted_at (إصدار قبل هذا الإصلاح)
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000fa','11111111-1111-1111-1111-11111111111a');
select public.sync_exchange(1,0,'[{"k":"bw","r":"legacy-a","v":{"w":1},"ts":3000,"d":"lostdev9"}]');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000fb','11111111-1111-1111-1111-11111111111b');
select public.sync_exchange(1,0,'[{"k":"bw","r":"legacy-b","v":{"w":2},"ts":3001,"d":"lostdev9"}]');
reset role;
\i supabase/migrations/p1_sync_rollback.sql
alter table p1_archive.sync_records drop column written_at; alter table p1_archive.sync_meta drop column deleted_at;   -- صيغة سابقة
\i supabase/migrations/p1_sync.sql
set role authenticated; select pg_temp.as_user('00000000-0000-0000-0000-0000000000fa','11111111-1111-1111-1111-11111111111a');
select public.delete_sync_data(); select public.start_new_sync();
reset role;
\i supabase/migrations/p1_sync_restore.sql
select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000fa'),0::bigint,'old-format archive: account with a live deletion is not restored (age unknown, deletion wins)');
select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000fb' and rid='legacy-b'),1::bigint,'old-format archive: account without a deletion is restored');
select pg_temp.eq((select written_at>now()-interval '1 minute' from public.sync_records where user_id='00000000-0000-0000-0000-0000000000fb' and rid='legacy-b'),true,'old-format records get written_at = restore time');
set role authenticated; select pg_temp.as_user('00000000-0000-0000-0000-0000000000fb','11111111-1111-1111-1111-11111111111b'); select public.delete_sync_data(); select public.start_new_sync(); reset role;
\i supabase/migrations/p1_sync_restore.sql
select pg_temp.eq((select count(*) from public.sync_records where user_id='00000000-0000-0000-0000-0000000000fb'),0::bigint,'a deletion after an old-format restore also holds on the next restore');
select 'ROLLBACK + RESTORE TEST PASSED' as result;
