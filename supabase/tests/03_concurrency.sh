#!/usr/bin/env bash
# اختبار التزامن الحقيقي على Postgres: جلسات psql متوازية. يعمل بعد 00_mock و02_p1_sync على قاعدة تحوي الدوال.
# الاستعمال: PSQL="psql -h localhost -U postgres -d t1 -q -At" bash supabase/tests/03_concurrency.sh
set -u
PSQL="${PSQL:?set PSQL}"
fail=0; chk(){ if [ "$2" = "$3" ]; then echo "PASS $1 ($2)"; else echo "FAIL $1: got $2 expected $3"; fail=1; fi; }
U1=00000000-0000-0000-0000-0000000000c1; U2=00000000-0000-0000-0000-0000000000c2; U3=00000000-0000-0000-0000-0000000000c3; U4=00000000-0000-0000-0000-0000000000c4
$PSQL -c "insert into auth.users(id) values('$U1'),('$U2'),('$U3'),('$U4') on conflict do nothing"
$PSQL -c "delete from public.quota_counters where bucket='ai' and scope='g'; delete from public.quota_counters where scope like 'u:%0000c%'; delete from public.sync_records where user_id in ('$U1','$U2','$U3','$U4')"
sess(){ echo "11111111-1111-1111-1111-${1: -12}"; }
for u in $U1 $U2 $U3 $U4; do $PSQL -c "insert into auth.sessions(id,user_id) values('$(sess $u)','$u') on conflict do nothing"; done
as(){ echo "set role authenticated; select set_config('request.uid','$1',false), set_config('request.jwt.claims','{\"sub\":\"$1\",\"session_id\":\"$(sess $1)\"}',false) \\g /dev/null"; }
OUT=$(mktemp -d)
# 1) 40 طلبًا متزامنًا لمستخدم واحد، الحد 5 → بالضبط 5 مسموحة
for i in $(seq 1 40); do ( { as $U1; echo "select public.consume_quota('ai','hour',5);"; } | $PSQL > $OUT/q1.$i ) & done; wait
chk "quota user cap under 40 parallel requests" "$(cat $OUT/q1.* | grep -c '^t$')" 5
# 2) أربعة مستخدمين × 15 طلبًا، حد المستخدم 100 والحد الكلي 7 → بالضبط 7
for u in $U1 $U2 $U3 $U4; do for i in $(seq 1 15); do ( { as $u; echo "select public.consume_quota('ai','day',100,7);"; } | $PSQL > $OUT/q2.$u.$i ) & done; done; wait
chk "global cap under 60 parallel requests" "$(cat $OUT/q2.* | grep -c '^t$')" 7
# 3) 24 جهازًا يرفعون بالتوازي سجلات مختلفة + سجل واحد مشترك بأوقات مختلفة
for i in $(seq 1 24); do ( { as $U2; echo "select (public.sync_exchange(null,0,'[{\"k\":\"bw\",\"r\":\"d$i\",\"v\":{\"w\":$i},\"ts\":$((1000+i)),\"d\":\"dev$i\"},{\"k\":\"cfg\",\"r\":\"shared\",\"v\":{\"by\":$i},\"ts\":$((5000+i)),\"d\":\"dev$i\"}]'))->>'applied';"; } | $PSQL > $OUT/s.$i ) & done; wait
chk "all 25 distinct records stored" "$($PSQL -c "select count(*) from public.sync_records where user_id='$U2'")" 25
chk "shared record: newest ts wins (24)" "$($PSQL -c "select data->>'by' from public.sync_records where user_id='$U2' and rid='shared'")" 24
chk "seq values unique" "$($PSQL -c "select count(distinct seq)=count(*) from public.sync_records where user_id='$U2'")" t
chk "meta seq equals highest seq" "$($PSQL -c "select (select seq from public.sync_meta where user_id='$U2')=(select max(seq) from public.sync_records where user_id='$U2')")" t
rm -rf $OUT
exit $fail
