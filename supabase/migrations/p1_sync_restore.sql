-- استعادة بيانات المزامنة من p1_archive بعد إعادة تطبيق p1_sync.sql (لا تعتمد على أي جهاز مستخدم).
-- القواعد:
--  * حساب أغلق مزامنته (حذف النسخة) بعد إعادة التفعيل يُتخطى: قرار الحذف الأحدث يبقى.
--  * تُستعاد فقط حسابات ما زالت موجودة في auth.users (من حُذف حسابه بعد التراجع لا تعود بياناته؛ والأرشيف نفسه يُحذف بالـcascade).
--  * حساب بلا نشاط في الجداول الحية (لا سجلات وseq=0): تُنسخ بياناته كما هي (epoch وclosed والسجلات وأرقام seq) فتبقى مؤشرات الأجهزة صالحة.
--  * حساب له نشاط بعد إعادة التفعيل: تُدمج السجلات بقاعدة الفوز نفسها (ts ثم التعديل يغلب الحذف ثم dev) بأرقام seq جديدة،
--    ويؤخذ epoch الأكبر، وتبقى حالة closed الحية كما هي (قرار المستخدم الأحدث).
--  * حدود الحصص المحفوظة تُستعاد.
-- آمنة للتكرار. لا تحذف الأرشيف.
do $$
declare
  m record; r record; live public.sync_meta; n int; restored int:=0; merged int:=0; skipped int:=0; nxt bigint;
begin
  if to_regclass('p1_archive.sync_meta') is null then raise exception 'no archive to restore (p1_archive.sync_meta missing)'; end if;
  if to_regclass('public.sync_meta') is null or to_regclass('public.sync_records') is null then
    raise exception 'apply p1_sync.sql before restoring'; end if;
  for m in select * from p1_archive.sync_meta order by user_id loop
    if not exists(select 1 from auth.users where id=m.user_id) then skipped:=skipped+1; continue; end if;
    insert into public.sync_meta(user_id) values(m.user_id) on conflict do nothing;
    select * into live from public.sync_meta where user_id=m.user_id for update;
    if live.closed then skipped:=skipped+1; continue; end if;   -- حذف المستخدم نسخته بعد إعادة التفعيل: لا تُعاد بياناته
    select count(*) into n from public.sync_records where user_id=m.user_id;
    if n=0 and live.seq=0 then
      update public.sync_meta set seq=m.seq,epoch=greatest(live.epoch,m.epoch),closed=m.closed,updated_at=now() where user_id=m.user_id;
      insert into public.sync_records(user_id,kind,rid,data,ts,dev,del,seq)
        select user_id,kind,rid,data,ts,dev,del,seq from p1_archive.sync_records where user_id=m.user_id
        on conflict do nothing;
      restored:=restored+1;
    else
      nxt:=live.seq;
      for r in select * from p1_archive.sync_records where user_id=m.user_id order by seq loop
        if not exists(select 1 from public.sync_records l where l.user_id=r.user_id and l.kind=r.kind and l.rid=r.rid
                      and (l.ts,not l.del,l.dev) >= (r.ts,not r.del,r.dev)) then
          nxt:=nxt+1;
          insert into public.sync_records(user_id,kind,rid,data,ts,dev,del,seq) values(r.user_id,r.kind,r.rid,r.data,r.ts,r.dev,r.del,nxt)
            on conflict(user_id,kind,rid) do update set data=excluded.data,ts=excluded.ts,dev=excluded.dev,del=excluded.del,seq=excluded.seq;
        end if;
      end loop;
      update public.sync_meta set seq=nxt,epoch=greatest(live.epoch,m.epoch),updated_at=now() where user_id=m.user_id;
      merged:=merged+1;
    end if;
  end loop;
  if to_regclass('p1_archive.quota_settings') is not null then
    insert into public.quota_settings(bucket,period,user_max,global_max)
      select bucket,period,user_max,global_max from p1_archive.quota_settings
      on conflict(bucket) do update set period=excluded.period,user_max=excluded.user_max,global_max=excluded.global_max,updated_at=now();
  end if;
  raise notice 'p1 restore: % accounts copied, % merged, % skipped (account no longer exists)',restored,merged,skipped;
end $$;
