-- P1: مزامنة على مستوى السجل + حصص ذرية + حذف بيانات المزامنة.
-- إضافي بالكامل: لا يغيّر جداول المجتمع ولا يحذف بيانات. نفّذه يدويًا في Supabase SQL Editor بعد مراجعته.
-- التراجع: migrations/p1_sync_rollback.sql
-- الجداول لا تُفتح لـanon/authenticated مباشرة: الوصول عبر الدوال أدناه فقط (security definer مع auth.uid()).

create table if not exists public.sync_meta(
  user_id uuid primary key references auth.users(id) on delete cascade,
  seq bigint not null default 0,
  epoch int not null default 1,
  closed boolean not null default false,   -- true بعد حذف نسخة السحابة: لا كتابة من أي جهاز حتى يبدأ المستخدم مزامنة جديدة صراحةً
  deleted_at timestamptz,                  -- آخر حذف لنسخة السحابة: حدّ دائم يبقى بعد إعادة فتح المزامنة، وتتجاوز الاستعادة كل سجل كُتب قبله
  updated_at timestamptz not null default now());
create table if not exists public.sync_records(
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind ~ '^[a-z0-9_]{1,40}$'),
  rid text not null check (length(rid) between 1 and 120),
  data jsonb,
  ts bigint not null,
  dev text not null check (dev ~ '^[A-Za-z0-9_.-]{1,40}$'),
  del boolean not null default false,
  written_at timestamptz not null default now(),   -- وقت الخادم لآخر كتابة (لا ساعة الجهاز)
  seq bigint not null,
  primary key(user_id,kind,rid));
create index if not exists sync_records_user_seq on public.sync_records(user_id,seq);
-- قواعد أُنشئت بنسخة سابقة من هذا الملف
alter table public.sync_meta add column if not exists deleted_at timestamptz;
alter table public.sync_records add column if not exists written_at timestamptz not null default now();
create table if not exists public.quota_counters(
  scope text not null, bucket text not null, win text not null, n int not null default 0,
  primary key(scope,bucket,win));

alter table public.sync_meta enable row level security;
alter table public.sync_records enable row level security;
alter table public.quota_counters enable row level security;
revoke all on public.sync_meta, public.sync_records, public.quota_counters from public, anon, authenticated;

-- الجلسة صالحة: مستخدم موقّع ولم تُلغَ جلسته (تسجيل خروج/حذف حساب)
create or replace function public.assert_session() returns void
language plpgsql stable security definer set search_path=public,auth as $$
declare sid text := auth.jwt()->>'session_id';
begin
  if auth.uid() is null then raise exception 'not signed in' using errcode='28000'; end if;
  if sid is not null and not exists(select 1 from auth.sessions where id=sid::uuid) then
    raise exception 'session revoked' using errcode='28000'; end if;
end $$;

-- تبادل ذرّي: يطبّق تغييرات الجهاز سجلًا بسجل (الأحدث يفوز) ثم يعيد ما تغيّر على الخادم بعد المؤشر.
-- قاعدة الفوز: (ts الأعلى) ثم التعديل يغلب الحذف عند التساوي ثم dev الأكبر. إعادة إرسال الطلب نفسه لا تغيّر شيئًا.
create or replace function public.sync_exchange(p_epoch int, p_cursor bigint, p_changes jsonb)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare
  uid uuid := auth.uid(); m public.sync_meta; c jsonb; ex public.sync_records;
  v_kind text; v_rid text; v_ts bigint; v_dev text; v_del boolean; v_data jsonb; applied int:=0; ignored int:=0;
  out_rows jsonb; v_max bigint; v_more boolean; ro boolean:=false;
begin
  perform public.assert_session();
  if p_changes is null then p_changes:='[]'::jsonb; end if;
  if jsonb_typeof(p_changes)<>'array' then raise exception 'bad_changes' using errcode='22023'; end if;
  if jsonb_array_length(p_changes)>2000 or pg_column_size(p_changes)>1500000 then raise exception 'too_big' using errcode='54000'; end if;
  insert into public.sync_meta(user_id) values(uid) on conflict do nothing;
  select * into m from public.sync_meta where user_id=uid for update;   -- يسلسل التبادلات المتزامنة للمستخدم نفسه
  if p_epoch is not null and p_epoch<m.epoch then
    return jsonb_build_object('reset',true,'epoch',m.epoch); end if;
  -- جهاز بلا معلومات مزامنة (p_epoch فارغ) أو حساب أُغلق بعد الحذف: قراءة فقط، لا يُطبَّق أي تغيير
  if p_epoch is null or m.closed then p_changes:='[]'::jsonb; ro:=true; end if;
  for c in select * from jsonb_array_elements(p_changes) loop
    v_kind:=c->>'k'; v_rid:=c->>'r'; v_ts:=(c->>'ts')::bigint; v_dev:=c->>'d'; v_del:=coalesce((c->>'x')::boolean,false); v_data:=c->'v';
    if v_kind is null or v_rid is null or v_ts is null or v_dev is null then raise exception 'bad_change' using errcode='22023'; end if;
    -- ساعة جهاز متقدمة كثيرًا كانت ستفوز بكل التعارضات: نرفض (لا نقصّ حتى لا يتعارض الصدى مع ما يحفظه الجهاز)
    if v_ts<0 or v_ts>(extract(epoch from clock_timestamp())*1000)::bigint+86400000 then raise exception 'bad_ts' using errcode='22023'; end if;
    if v_kind !~ '^[a-z0-9_]{1,40}$' or length(v_rid) not between 1 and 120 or v_dev !~ '^[A-Za-z0-9_.-]{1,40}$' then raise exception 'bad_change' using errcode='22023'; end if;
    if v_del then v_data:=null; elsif v_data is null or pg_column_size(v_data)>200000 then raise exception 'bad_change' using errcode='22023'; end if;
    select * into ex from public.sync_records where user_id=uid and kind=v_kind and rid=v_rid;
    -- dev يُقارَن بترتيب البايتات (collate "C") ليطابق مقارنة JavaScript على أي ترتيب لغوي للقاعدة (Supabase افتراضيًا en_US.UTF-8)
    if not found or (v_ts, not v_del, v_dev collate "C") > (ex.ts, not ex.del, ex.dev collate "C") then
      m.seq:=m.seq+1;
      insert into public.sync_records(user_id,kind,rid,data,ts,dev,del,seq,written_at) values(uid,v_kind,v_rid,v_data,v_ts,v_dev,v_del,m.seq,now())
        on conflict(user_id,kind,rid) do update set data=excluded.data,ts=excluded.ts,dev=excluded.dev,del=excluded.del,seq=excluded.seq,written_at=excluded.written_at;
      applied:=applied+1;
    else ignored:=ignored+1; end if;
  end loop;
  update public.sync_meta set seq=m.seq,updated_at=now() where user_id=uid;
  select coalesce(jsonb_agg(jsonb_build_object('k',kind,'r',rid,'v',data,'ts',ts,'d',dev,'x',del,'s',seq) order by seq),'[]'::jsonb), coalesce(max(seq),p_cursor,0), count(*)>=3000
    into out_rows, v_max, v_more
    from (select * from public.sync_records where user_id=uid and seq>coalesce(p_cursor,0) order by seq limit 3000) q;
  return jsonb_build_object('epoch',m.epoch,'cursor',case when v_more then v_max else greatest(m.seq,coalesce(p_cursor,0)) end,'more',v_more,'records',out_rows,'applied',applied,'ignored',ignored,'closed',m.closed,'readonly',ro);
end $$;

-- حذف نسخة المزامنة السحابية (الحساب يبقى). يرفع epoch ويغلق المزامنة: لا جهاز (قديم أو جديد أو بلا معلومات مزامنة)
-- يستطيع الكتابة حتى يستدعي المستخدم start_new_sync() صراحةً. بيانات الأجهزة المحلية لا تُمس.
create or replace function public.delete_sync_data() returns jsonb
language plpgsql security definer set search_path=public,auth as $$
declare uid uuid := auth.uid(); e int;
begin
  perform public.assert_session();
  insert into public.sync_meta(user_id) values(uid) on conflict do nothing;
  perform 1 from public.sync_meta where user_id=uid for update;
  delete from public.sync_records where user_id=uid;
  update public.sync_meta set epoch=epoch+1,closed=true,deleted_at=now(),updated_at=now() where user_id=uid returning epoch into e;
  return jsonb_build_object('epoch',e,'deleted',true,'closed',true);
end $$;

-- قرار المستخدم الصريح ببدء مزامنة جديدة لبيانات جهازه. إن كانت المزامنة مغلقة تُفتح ويرتفع epoch فلا يكتب بعدها
-- جهاز كان يحمل الإصدار السابق إلا بقراره هو الآخر. إن كانت مفتوحة أصلًا تعيد الإصدار الحالي دون تغيير.
create or replace function public.start_new_sync() returns jsonb
language plpgsql security definer set search_path=public,auth as $$
declare uid uuid := auth.uid(); m public.sync_meta;
begin
  perform public.assert_session();
  insert into public.sync_meta(user_id) values(uid) on conflict do nothing;
  select * into m from public.sync_meta where user_id=uid for update;
  if m.closed then
    update public.sync_meta set epoch=epoch+1,closed=false,updated_at=now() where user_id=uid returning * into m;
  end if;
  return jsonb_build_object('epoch',m.epoch,'closed',false);
end $$;

-- حدود الحصص يملكها الخادم: لا يمررها العميل ولا الـWorker. تُعدَّل من لوحة SQL بحساب المالك فقط.
create table if not exists public.quota_settings(
  bucket text primary key check (bucket in ('ai')),
  period text not null check (period in ('hour','day')),
  user_max int not null check (user_max>=1),
  global_max int check (global_max is null or global_max>=1),
  updated_at timestamptz not null default now());
insert into public.quota_settings(bucket,period,user_max,global_max) values('ai','day',100,500) on conflict do nothing;
alter table public.quota_settings enable row level security;
revoke all on public.quota_settings from public, anon, authenticated;

-- المسار الموثوق الوحيد لتعديل العدّادات: يستدعيه الـWorker بمفتاح الخدمة (service_role) بعد أن تحقق من توقيع JWT.
-- التحقق من الجلسة هنا مستقل: الجلسة موجودة في auth.sessions وتخص p_uid نفسه، فتُرفض الجلسة الملغاة فورًا.
-- ذرّي: insert … on conflict do update … where n<max؛ وإن امتلأ الحد الكلي يُتراجع عن زيادة المستخدم (subtransaction).
create or replace function public.consume_quota_trusted(p_uid uuid, p_sid uuid, p_bucket text default 'ai')
returns boolean language plpgsql security definer set search_path=public,auth as $$
declare cfg public.quota_settings%rowtype; w text; v int;
begin
  if p_uid is null or p_sid is null then raise exception 'not signed in' using errcode='28000'; end if;
  if not exists(select 1 from auth.sessions where id=p_sid and user_id=p_uid) then
    raise exception 'session revoked' using errcode='28000'; end if;
  select * into cfg from public.quota_settings where bucket=p_bucket;
  if not found then raise exception 'bad_quota' using errcode='22023'; end if;
  w:=case cfg.period when 'hour' then to_char(now() at time zone 'utc','YYYY-MM-DD"T"HH24') else to_char(now() at time zone 'utc','YYYY-MM-DD') end;
  begin
    insert into public.quota_counters(scope,bucket,win,n) values('u:'||p_uid,p_bucket,w,1)
      on conflict(scope,bucket,win) do update set n=public.quota_counters.n+1 where public.quota_counters.n<cfg.user_max returning n into v;
    if v is null then raise exception 'q_user'; end if;
    if cfg.global_max is not null then
      v:=null;
      insert into public.quota_counters(scope,bucket,win,n) values('g',p_bucket,w,1)
        on conflict(scope,bucket,win) do update set n=public.quota_counters.n+1 where public.quota_counters.n<cfg.global_max returning n into v;
      if v is null then raise exception 'q_global'; end if;
    end if;
    return true;
  exception when others then
    if sqlerrm in ('q_user','q_global') then return false; end if; raise;
  end;
end $$;
-- الدالة القديمة التي كان يستدعيها أي مستخدم موثّق بحدود يختارها هو: تُحذف
drop function if exists public.consume_quota(text,text,int,int);

-- حذف الحساب: يضيف تنظيف عدّادات الحصص (جداول المزامنة تُحذف تلقائيًا بالـcascade)
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path=public,auth as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from public.quota_counters where scope='u:'||auth.uid();
  delete from auth.users where id=auth.uid();
end $$;

revoke all on function public.assert_session(), public.sync_exchange(int,bigint,jsonb), public.delete_sync_data(), public.start_new_sync(), public.consume_quota_trusted(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.sync_exchange(int,bigint,jsonb), public.delete_sync_data(), public.start_new_sync() to authenticated;
grant execute on function public.consume_quota_trusted(uuid,uuid,text) to service_role;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
