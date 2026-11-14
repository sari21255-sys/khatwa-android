-- P1: مزامنة على مستوى السجل + حصص ذرية + حذف بيانات المزامنة.
-- إضافي بالكامل: لا يغيّر جداول المجتمع ولا يحذف بيانات. نفّذه يدويًا في Supabase SQL Editor بعد مراجعته.
-- التراجع: migrations/p1_sync_rollback.sql
-- الجداول لا تُفتح لـanon/authenticated مباشرة: الوصول عبر الدوال أدناه فقط (security definer مع auth.uid()).

create table if not exists public.sync_meta(
  user_id uuid primary key references auth.users(id) on delete cascade,
  seq bigint not null default 0,
  epoch int not null default 1,
  updated_at timestamptz not null default now());
create table if not exists public.sync_records(
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind ~ '^[a-z0-9_]{1,40}$'),
  rid text not null check (length(rid) between 1 and 120),
  data jsonb,
  ts bigint not null,
  dev text not null check (length(dev) between 1 and 40),
  del boolean not null default false,
  seq bigint not null,
  primary key(user_id,kind,rid));
create index if not exists sync_records_user_seq on public.sync_records(user_id,seq);
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
  out_rows jsonb; v_max bigint; v_more boolean;
begin
  perform public.assert_session();
  if p_changes is null then p_changes:='[]'::jsonb; end if;
  if jsonb_typeof(p_changes)<>'array' then raise exception 'bad_changes' using errcode='22023'; end if;
  if jsonb_array_length(p_changes)>2000 or pg_column_size(p_changes)>1500000 then raise exception 'too_big' using errcode='54000'; end if;
  insert into public.sync_meta(user_id) values(uid) on conflict do nothing;
  select * into m from public.sync_meta where user_id=uid for update;   -- يسلسل التبادلات المتزامنة للمستخدم نفسه
  if p_epoch is not null and p_epoch<m.epoch then
    return jsonb_build_object('reset',true,'epoch',m.epoch); end if;
  for c in select * from jsonb_array_elements(p_changes) loop
    v_kind:=c->>'k'; v_rid:=c->>'r'; v_ts:=(c->>'ts')::bigint; v_dev:=c->>'d'; v_del:=coalesce((c->>'x')::boolean,false); v_data:=c->'v';
    if v_kind is null or v_rid is null or v_ts is null or v_dev is null then raise exception 'bad_change' using errcode='22023'; end if;
    if v_kind !~ '^[a-z0-9_]{1,40}$' or length(v_rid) not between 1 and 120 or length(v_dev) not between 1 and 40 then raise exception 'bad_change' using errcode='22023'; end if;
    if v_del then v_data:=null; elsif v_data is null or pg_column_size(v_data)>200000 then raise exception 'bad_change' using errcode='22023'; end if;
    select * into ex from public.sync_records where user_id=uid and kind=v_kind and rid=v_rid;
    if not found or (v_ts, not v_del, v_dev) > (ex.ts, not ex.del, ex.dev) then
      m.seq:=m.seq+1;
      insert into public.sync_records(user_id,kind,rid,data,ts,dev,del,seq) values(uid,v_kind,v_rid,v_data,v_ts,v_dev,v_del,m.seq)
        on conflict(user_id,kind,rid) do update set data=excluded.data,ts=excluded.ts,dev=excluded.dev,del=excluded.del,seq=excluded.seq;
      applied:=applied+1;
    else ignored:=ignored+1; end if;
  end loop;
  update public.sync_meta set seq=m.seq,updated_at=now() where user_id=uid;
  select coalesce(jsonb_agg(jsonb_build_object('k',kind,'r',rid,'v',data,'ts',ts,'d',dev,'x',del,'s',seq) order by seq),'[]'::jsonb), coalesce(max(seq),p_cursor,0), count(*)>=3000
    into out_rows, v_max, v_more
    from (select * from public.sync_records where user_id=uid and seq>coalesce(p_cursor,0) order by seq limit 3000) q;
  return jsonb_build_object('epoch',m.epoch,'cursor',case when v_more then v_max else greatest(m.seq,coalesce(p_cursor,0)) end,'more',v_more,'records',out_rows,'applied',applied,'ignored',ignored);
end $$;

-- حذف نسخة المزامنة السحابية (الحساب يبقى). يرفع epoch فلا تستطيع أجهزة قديمة إعادة رفع النسخة المحذوفة.
create or replace function public.delete_sync_data() returns jsonb
language plpgsql security definer set search_path=public,auth as $$
declare uid uuid := auth.uid(); e int;
begin
  perform public.assert_session();
  insert into public.sync_meta(user_id) values(uid) on conflict do nothing;
  perform 1 from public.sync_meta where user_id=uid for update;
  delete from public.sync_records where user_id=uid;
  update public.sync_meta set epoch=epoch+1,updated_at=now() where user_id=uid returning epoch into e;
  return jsonb_build_object('epoch',e,'deleted',true);
end $$;

-- حصة ذرية: يزيد العدّاد فقط إن بقي رصيد. النافذة تُحسب في الخادم (لا يمكن للعميل اختيار نافذة جديدة).
create or replace function public.consume_quota(p_bucket text, p_period text, p_max int, p_global_max int default null)
returns boolean language plpgsql security definer set search_path=public,auth as $$
declare uid uuid := auth.uid(); w text; v int;
begin
  perform public.assert_session();
  if p_bucket not in ('ai') or p_period not in ('hour','day') or p_max<1 or (p_global_max is not null and p_global_max<1) then
    raise exception 'bad_quota' using errcode='22023'; end if;
  w:=case p_period when 'hour' then to_char(now() at time zone 'utc','YYYY-MM-DD"T"HH24') else to_char(now() at time zone 'utc','YYYY-MM-DD') end;
  begin
    insert into public.quota_counters(scope,bucket,win,n) values('u:'||uid,p_bucket,w,1)
      on conflict(scope,bucket,win) do update set n=public.quota_counters.n+1 where public.quota_counters.n<p_max returning n into v;
    if v is null then raise exception 'q_user'; end if;
    if p_global_max is not null then
      v:=null;
      insert into public.quota_counters(scope,bucket,win,n) values('g',p_bucket,w,1)
        on conflict(scope,bucket,win) do update set n=public.quota_counters.n+1 where public.quota_counters.n<p_global_max returning n into v;
      if v is null then raise exception 'q_global'; end if;
    end if;
    return true;
  exception when others then
    if sqlerrm in ('q_user','q_global') then return false; end if; raise;
  end;
end $$;

-- حذف الحساب: يضيف تنظيف عدّادات الحصص (جداول المزامنة تُحذف تلقائيًا بالـcascade)
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path=public,auth as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from public.quota_counters where scope='u:'||auth.uid();
  delete from auth.users where id=auth.uid();
end $$;

revoke all on function public.assert_session(), public.sync_exchange(int,bigint,jsonb), public.delete_sync_data(), public.consume_quota(text,text,int,int) from public, anon;
grant execute on function public.sync_exchange(int,bigint,jsonb), public.delete_sync_data(), public.consume_quota(text,text,int,int) to authenticated;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
