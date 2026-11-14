#!/usr/bin/env bash
# يشغّل كل اختبارات P0/P1 واختبارات قبول F1–F5 ويحفظ المخرجات في docs/technical-audit/evidence/p1-fixes/ مع اسم الالتزام.
# يحتاج: Postgres محلي (PGHOST/PGPORT/PGUSER) وplaywright عام. الاستعمال: PGCMD="psql -h /tmp -p 5544 -U postgres" bash tests/run-evidence.sh
set -u
cd "$(dirname "$0")/.."
OUT=docs/technical-audit/evidence/p1-fixes; mkdir -p $OUT
PGCMD="${PGCMD:?set PGCMD, e.g. psql -h localhost -U postgres}"
DB=t_evidence
export NODE_PATH="$(npm root -g)"
SHA=$(git rev-parse HEAD); echo "$SHA" > $OUT/COMMIT.txt
$PGCMD -d postgres -q -c "drop database if exists $DB" -c "create database $DB"
P="$PGCMD -d $DB -q"
run(){ n=$1; shift; "$@" > $OUT/$n.log 2>&1; rc=$?; echo "$n rc=$rc" | tee -a $OUT/summary.txt; }
: > $OUT/summary.txt
run build-check python3 tools/build.py --check
run crlf-sim python3 tests/crlf-sim.py tools/gen-headers.py
run worker-legacy node tests/worker.test.mjs
run worker-p1 node tests/worker.p1.test.mjs
run app-e2e node tests/app.e2e.js
run p0-acceptance node docs/technical-audit/evidence/p0-acceptance.mjs
git checkout -q docs/technical-audit/evidence/p0/results-p0.json 2>/dev/null
run sql-00-mock $P -v ON_ERROR_STOP=1 -f supabase/tests/00_mock_supabase.sql
run sql-01-rls $P -f supabase/tests/01_rls_and_limits.sql
run sql-02-p1 $P -v ON_ERROR_STOP=1 -f supabase/tests/02_p1_sync.sql
run sql-04-rollback-restore $P -v ON_ERROR_STOP=1 -f supabase/tests/04_rollback.sql
run concurrency env PSQL="$PGCMD -d $DB -q -At" bash supabase/tests/03_concurrency.sh
# e2e على قاعدة نظيفة بالهجرة الحالية
$PGCMD -d postgres -q -c "drop database if exists ${DB}_e2e" -c "create database ${DB}_e2e"
Q="$PGCMD -d ${DB}_e2e -q -v ON_ERROR_STOP=1"
$Q -f supabase/tests/00_mock_supabase.sql >/dev/null 2>&1; $Q -f supabase/migrations/p1_sync.sql >/dev/null 2>&1
run sync-e2e env OUT=$OUT/sync-e2e-results.json PSQL="$PGCMD -d ${DB}_e2e -q -At" node tests/sync.e2e.mjs
grep -c . $OUT/summary.txt >/dev/null
echo "FAILED: $(grep -vc 'rc=0' $OUT/summary.txt)"
