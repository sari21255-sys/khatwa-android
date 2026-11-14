# إعادة البناء والاختبار من نسخة نظيفة

```bash
git clone https://github.com/sari21255-sys/khatwa-android && cd khatwa-android
git checkout p1/implementation            # أو p0/implementation

npm ci                                    # يقرأ package-lock.json
python3 tools/build.py                    # يولّد www/index.html و pwa/index.html و pwa/_headers
python3 tools/build.py --check            # يفشل إن اختلفت المخرجات عن المرجعية

# اختبارات بلا قاعدة بيانات
export NODE_PATH="$(npm root -g)"          # Playwright عام: npm i -g playwright && npx playwright install chromium
node tests/worker.test.mjs && node tests/worker.p1.test.mjs
node tests/app.e2e.js
node docs/technical-audit/evidence/p0-acceptance.mjs

# اختبارات SQL والمزامنة الكاملة (تحتاج Postgres 16)
psql -h localhost -U postgres -v ON_ERROR_STOP=1 -q -f supabase/tests/00_mock_supabase.sql
psql -h localhost -U postgres -v ON_ERROR_STOP=1 -q -f supabase/tests/01_rls_and_limits.sql
psql -h localhost -U postgres -v ON_ERROR_STOP=1 -q -f supabase/tests/02_p1_sync.sql
psql -h localhost -U postgres -v ON_ERROR_STOP=1 -q -f supabase/tests/04_rollback.sql
export PSQL="psql -h localhost -U postgres -d postgres -q -At"
bash supabase/tests/03_concurrency.sh
node tests/sync.e2e.mjs

# أندرويد (يعمل في CI؛ محليًا يلزم JDK 21 وAndroid SDK)
npx cap add android && python3 scripts/patch_android.py && npx cap sync android
(cd android && ./gradlew assembleRelease) && python3 scripts/check_manifest.py android/app/build/outputs/apk/release/app-release-unsigned.apk --release
```
CI (`.github/workflows/ci.yml` و`android.yml`) ينفّذ هذه الخطوات على كل دفعة إلى `p0/**` و`p1/**`.
