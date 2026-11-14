-- استعادة بيانات المزامنة من p1_archive بعد إعادة تطبيق p1_sync.sql (لا تعتمد على أي جهاز مستخدم).
--
-- حدّ الحذف: sync_meta.deleted_at (وقت الخادم لآخر delete_sync_data) يبقى بعد إعادة فتح المزامنة، وsync_records.written_at وقت الخادم
-- لآخر كتابة لكل سجل. الاستعادة تتجاوز كل سجل مؤرشف written_at <= deleted_at الحي للحساب نفسه، فلا تعود بيانات حذفها المستخدم
-- بعد إعادة التفعيل حتى لو فُتحت المزامنة بعدها (closed=false). وقت الخادم قابل للمقارنة عبر التراجع لأن الأرشيف والقاعدة الحية
-- على الخادم نفسه (أرقام epoch لا تصلح لذلك: تبدأ من 1 من جديد في الجداول الحية).
--
-- القواعد:
--  * تُستعاد فقط حسابات ما زالت موجودة في auth.users (من حُذف حسابه بعد التراجع لا تعود بياناته؛ والأرشيف نفسه يُحذف بالـcascade).
--  * حساب أغلق مزامنته الآن (closed) يُتخطى كله.
--  * حساب بلا نشاط حي ولم يُحذف قط (seq=0، بلا سجلات، deleted_at فارغ): تُنسخ سجلاته كما هي بأرقام seq الأصلية وحالة epoch وclosed،
--    فتبقى مؤشرات الأجهزة صالحة.
--  * غير ذلك: دمج بقاعدة الفوز نفسها (ts ثم التعديل يغلب الحذف ثم dev بترتيب البايتات) بأرقام seq جديدة وwritten_at الأصلي،
--    ويؤخذ epoch الأكبر، وتبقى حالة closed الحية كما هي. السجلات الجديدة بعد إعادة الفتح لا تُمس.
--  * أرشيفات أو إصدارات سابقة بلا written_at/deleted_at: إن لم يُسجَّل حذف حي للحساب تُستعاد بـwritten_at=وقت الاستعادة (فيسبقها أي حذف
--    لاحق)، وإن سُجّل حذف حي (deleted_at ليس فارغًا) يُتخطى سجلها لأن زمن كتابته مجهول ولا يمكن إثبات أنه أحدث من الحذف (الحذف يغلب).
--  * deleted_at الأكبر بين الأرشيف والحي هو الذي يبقى. حدود الحصص المحفوظة تُستعاد.
-- آمنة للتكرار. لا تحذف الأرشيف. تطبع إحصاءً بما استُعيد وما تُجوّز ولماذا.
do $$
declare
  m jsonb; r jsonb; live public.sync_meta; uid uuid; verbatim boolean; nxt bigint; maxs bigint;
  a_epoch int; a_del timestamptz; rec_w timestamptz; has_w boolean; ins int;
  c_copy int:=0; c_merge int:=0; c_closed int:=0; c_noacct int:=0; c_rec int:=0; c_deleted int:=0; c_unknown int:=0;
begin
  if to_regclass('p1_archive.sync_meta') is null then raise exception 'no archive to restore (p1_archive.sync_meta missing)'; end if;
  if to_regclass('public.sync_meta') is null or to_regclass('public.sync_records') is null then
    raise exception 'apply p1_sync.sql before restoring'; end if;
  has_w:=exists(select 1 from information_schema.columns where table_schema='p1_archive' and table_name='sync_records' and column_name='written_at');
  for m in select to_jsonb(t) from p1_archive.sync_meta t order by t.user_id loop
    uid:=(m->>'user_id')::uuid;
    if not exists(select 1 from auth.users where id=uid) then c_noacct:=c_noacct+1; continue; end if;
    insert into public.sync_meta(user_id) values(uid) on conflict do nothing;
    select * into live from public.sync_meta where user_id=uid for update;
    if live.closed then c_closed:=c_closed+1; continue; end if;
    a_epoch:=coalesce((m->>'epoch')::int,1); a_del:=nullif(m->>'deleted_at','')::timestamptz;
    verbatim:=(live.seq=0 and live.deleted_at is null and not exists(select 1 from public.sync_records where user_id=uid));
    nxt:=live.seq; maxs:=0; ins:=0;
    for r in select to_jsonb(t) from p1_archive.sync_records t where t.user_id=uid order by t.seq loop
      rec_w:=case when has_w then nullif(r->>'written_at','')::timestamptz else null end;
      -- حدّ الحذف: الحي (بعد إعادة التفعيل) ثم حدّ الأرشيف نفسه
      if live.deleted_at is not null then
        if rec_w is null then c_unknown:=c_unknown+1; continue; end if;
        if rec_w<=live.deleted_at then c_deleted:=c_deleted+1; continue; end if;
      end if;
      if a_del is not null and rec_w is not null and rec_w<=a_del then c_deleted:=c_deleted+1; continue; end if;
      if verbatim then
        insert into public.sync_records(user_id,kind,rid,data,ts,dev,del,seq,written_at)
          values(uid,r->>'kind',r->>'rid',r->'data',(r->>'ts')::bigint,r->>'dev',(r->>'del')::boolean,(r->>'seq')::bigint,coalesce(rec_w,now()))
          on conflict(user_id,kind,rid) do nothing;
        maxs:=greatest(maxs,(r->>'seq')::bigint); ins:=ins+1;
      elsif not exists(select 1 from public.sync_records l where l.user_id=uid and l.kind=r->>'kind' and l.rid=r->>'rid'
                       and (l.ts,not l.del,l.dev collate "C") >= ((r->>'ts')::bigint,not (r->>'del')::boolean,(r->>'dev') collate "C")) then
        nxt:=nxt+1;
        insert into public.sync_records(user_id,kind,rid,data,ts,dev,del,seq,written_at)
          values(uid,r->>'kind',r->>'rid',r->'data',(r->>'ts')::bigint,r->>'dev',(r->>'del')::boolean,nxt,coalesce(rec_w,now()))
          on conflict(user_id,kind,rid) do update set data=excluded.data,ts=excluded.ts,dev=excluded.dev,del=excluded.del,seq=excluded.seq,written_at=excluded.written_at;
        ins:=ins+1;
      end if;
    end loop;
    c_rec:=c_rec+ins;
    if verbatim then
      update public.sync_meta set seq=greatest(maxs,(m->>'seq')::bigint),epoch=greatest(live.epoch,a_epoch),closed=coalesce((m->>'closed')::boolean,false),
        deleted_at=a_del,updated_at=now() where user_id=uid;
      c_copy:=c_copy+1;
    else
      update public.sync_meta set seq=nxt,epoch=greatest(live.epoch,a_epoch),deleted_at=case when a_del is null then live.deleted_at else greatest(live.deleted_at,a_del) end,
        updated_at=now() where user_id=uid;
      c_merge:=c_merge+1;
    end if;
  end loop;
  if to_regclass('p1_archive.quota_settings') is not null then
    insert into public.quota_settings(bucket,period,user_max,global_max)
      select bucket,period,user_max,global_max from p1_archive.quota_settings
      on conflict(bucket) do update set period=excluded.period,user_max=excluded.user_max,global_max=excluded.global_max,updated_at=now();
  end if;
  raise notice 'p1 restore: % accounts copied, % merged | % records restored | skipped: % accounts closed now, % accounts deleted, % records older than a deletion, % records of unknown age under a live deletion',
    c_copy,c_merge,c_rec,c_closed,c_noacct,c_deleted,c_unknown;
end $$;
