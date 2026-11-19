#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
echo "== الوسيط =="; node tests/worker.test.mjs
echo "== التطبيق =="; NODE_PATH="$(npm root -g)" node tests/app.e2e.js
echo "== قبول P0 =="; NODE_PATH="$(npm root -g)" node docs/technical-audit/evidence/p0-acceptance.mjs
echo "== هوية الوسيط (P1) =="; node tests/worker.p1.test.mjs
echo "== ترحيل المزامنة القديمة (قبول) =="; node tests/worker.migration.test.mjs
# (مؤرشف: tests/legacy-session) echo "== اليوم/التمرين/الأرشيف (UX) =="; NODE_PATH="$(npm root -g)" node tests/ux.e2e.js
# (مؤرشف: tests/legacy-session) echo "== الخط المحلي =="; NODE_PATH="$(npm root -g)" node tests/font.e2e.js
echo "== دمج الجلسات (تعادل، حجم، تراجع) =="; NODE_PATH="$(npm root -g)" node tests/sxmerge.e2e.js
echo "== التقارير (الفترة والعوامل) =="; NODE_PATH="$(npm root -g)" node tests/rpt.e2e.js
# (مؤرشف: tests/legacy-session) echo "== التفاف الأسماء الطويلة 320/390 =="; NODE_PATH="$(npm root -g)" node tests/wrap.e2e.js
echo "== السمات الست =="; NODE_PATH="$(npm root -g)" node tests/theme.e2e.js
# (مؤرشف: tests/legacy-session) echo "== هوية SIJIL (تسجيل سريع، أرقام، مشغّل، ترقية) =="; NODE_PATH="$(npm root -g)" node tests/sijil.e2e.js
# (مؤرشف: tests/legacy-session) echo "== إصلاحات SIJIL بعد اختبار Android =="; NODE_PATH="$(npm root -g)" node tests/fixes.e2e.js
# (مؤرشف: tests/legacy-session) echo "== الوزن والوجبات (مسار واحد) =="; NODE_PATH="$(npm root -g)" node tests/wm.e2e.js
# (مؤرشف: tests/legacy-session) echo "== حصة اليوم والتعويض (UX2) =="; NODE_PATH="$(npm root -g)" node tests/ux2.e2e.js
echo "== موافقة الذكاء الاصطناعي =="; NODE_PATH="$(npm root -g)" node tests/consent.e2e.js
echo "== السجل السريع: خطتان، تسجيل مباشر، ألبوم، تغذية، مشهد، ترقية =="; NODE_PATH="$(npm root -g)" node tests/quicklog.e2e.js
# أُزيلت لوحة الاختصارات الجانبية عمدًا في إصلاحات Android (روابط مكررة؛ كل خدمة لها مكان واحد). اختبارها القديم: tests/drawer.e2e.js
# echo "== لوحة الاختصارات الجانبية =="; NODE_PATH="$(npm root -g)" node tests/drawer.e2e.js
# (مؤرشف: tests/legacy-session) echo "== المسارات الخمسة =="; NODE_PATH="$(npm root -g)" node tests/tracks.e2e.js
# (مؤرشف: tests/legacy-session) echo "== الإعدادات والطقس والصلاة والإشعارات =="; NODE_PATH="$(npm root -g)" node tests/ready.e2e.js
# (مؤرشف: tests/legacy-session) echo "== قبول إغلاق ملاحظات «جهّز تمرينك» =="; NODE_PATH="$(npm root -g)" node tests/ready-accept.e2e.js
# (مؤرشف: tests/legacy-session) echo "== التنقل الخماسي ==";  NODE_PATH="$(npm root -g)" node tests/nav.e2e.js
echo "== تمارين الحديد: المقارنة قبل/بعد =="; NODE_PATH="$(npm root -g)" node tests/iron.compare.mjs
# (مؤرشف: tests/legacy-session) echo "== تمارين الحديد: الأقسام الأربعة =="; NODE_PATH="$(npm root -g)" node tests/iron.e2e.mjs
# (مؤرشف: tests/legacy-session) echo "== تبسيط الواجهة: زيارات، تنقّل، موقع، خطوات، بلا مؤقت =="; NODE_PATH="$(npm root -g)" node tests/simplify.e2e.js
if [ -n "${PSQL:-}" ]; then echo "== مزامنة السجلات (جهازان + Postgres) =="; NODE_PATH="$(npm root -g)" node tests/sync.e2e.mjs; echo "== مزامنة الجلسات =="; NODE_PATH="$(npm root -g)" node tests/sync-sx.e2e.mjs; else echo "(تخطي sync.e2e: عيّن PSQL)"; fi
if [ -n "${PSQL:-}" ]; then echo "== الحسابات ووضع الزائر (6 رحلات + عزل + حذف) =="; NODE_PATH="$(npm root -g)" node tests/accounts.e2e.mjs; else echo "(تخطي accounts.e2e: عيّن PSQL)"; fi
