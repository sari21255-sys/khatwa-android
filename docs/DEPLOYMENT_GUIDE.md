# دليل النشر
المطلوب منك مرة واحدة (لا أستطيع إنشاؤها نيابةً عنك لأنها حساباتك):

## 1) الموقع (PWA)
المجلد `pwa/` ملفات ثابتة. الموقع الحالي على Netlify باسم `khatwa-fitness-app`. ارفع محتوى `pwa/` كاملًا (بما فيه `eq-db.js` و`sw.js` و`.well-known`). `_headers` و`_redirects` يعملان على Netlify.
بعد كل نشر: تحقق أن رقم الكاش في `sw.js` (`khatwa-vNN`) ارتفع.

## 2) Supabase (الحسابات والمجتمع)
1. أنشئ مشروعًا على supabase.com.
2. SQL Editor: الصق `supabase/schema.sql` كاملًا ونفّذه.
3. Authentication ← Providers ← Email مفعّل. يُنصح بتفعيل Confirm email قبل فتح المجتمع.
4. Project Settings ← API: انسخ Project URL ومفتاح anon (العام).
5. في `pwa/config.js` ضع `sbUrl` و`sbKey` و`supportEmail` (بريد الخصوصية) و`storeUrl`. أعد النشر.

## 3) الوسيط (اختياري: الذكاء الاصطناعي والمزامنة)
1. `npm i -g wrangler` ثم `wrangler login`.
2. `cd pwa/worker` ثم `wrangler kv namespace create STATE`، وضع الـid في `wrangler.toml`.
3. في `wrangler.toml` عدّل `ALLOW_ORIGIN` ليضم نطاق موقعك (مثل `https://khatwa-fitness-app.netlify.app`) مع `https://localhost,capacitor://localhost` للأندرويد. لا تضع `*`.
4. `wrangler secret put ANTHROPIC_API_KEY` ثم `wrangler deploy`.
5. ضع في `config.js`: `aiUrl` = الرابط + `/api/ai` و`syncUrl` = الرابط + `/api/state`.
6. اضبط `AI_DAILY_CAP` حسب ميزانيتك.

## 4) الأندرويد
1. مستودع `khatwa-android`: Settings ← Secrets: `KEYSTORE_B64` و`KEYSTORE_PASSWORD` و`KEY_ALIAS` و`KEY_PASSWORD` (مفتاح التوقيع، احتفظ بنسخة منه خارج GitHub؛ فقدانه يمنع تحديث التطبيق على Play).
2. Actions ← Build Android ← Run workflow. يُنتج APK تجريبيًا في Releases، وAAB موقّعًا إن وُجدت الأسرار.
3. `versionCode` يتزايد تلقائيًا (100 + رقم التشغيل).
4. قبل أول رفع على Play قرّر معرّف الحزمة (الحالي في Capacitor `com.khatwa.app`، وفي `assetlinks.json` للـTWA `com.khatwa.twa`)؛ لا يمكن تغييره بعد النشر.

## 5) Google Play
- حساب مطوّر (25$ مرة واحدة)، سياسة الخصوصية: `https://نطاقك/privacy.html` (تقرأ البريد من `config.js`).
- Data Safety: بريد واسم عرض ومحتوى مستخدم (المجتمع)، بيانات لياقة وصحة (Health Connect، بموافقة)، تُعالَج في الجهاز وتُرسل للذكاء الاصطناعي عند استعماله. لا بيع ولا إعلانات.
- حذف الحساب: داخل التطبيق (الإعدادات ← حذف الحساب). مطلوب رابط ويب لحذف الحساب في Play أيضًا؛ أنشئ صفحة بسيطة أو استعمل `privacy.html` مع البريد.
- اختبار مغلق: الحسابات الشخصية الجديدة قد تحتاج عددًا من المختبرين لفترة قبل الإنتاج.

## 6) الصيانة
- تعديل التطبيق: عدّل `fitness-tracker.html` ثم `python3 build.py` ثم انشر.
- النسخ الاحتياطي: المستخدم يصدّر من الإعدادات. Supabase: فعّل النسخ اليومي في خطة مدفوعة أو نفّذ `pg_dump` دوريًا.
- قبل أي نشر: `bash tests/run-all.sh`.

## 7) ما تغيّر في P0 (2026-11-14) وما يلزمك عند النشر
- **ترويسات الأمان:** `pwa/_headers` يُولَّد آليًا. بعد أي تعديل على `index.html` أو `install.html` أو `config.js` شغّل `python3 tools/build.py` (يبني الصفحات ويولّد `_headers`) وإلا تُحظر السكربتات المضمّنة بسياسة CSP. اختبار `p0-acceptance.mjs` يفشل إن كان الملف قديمًا.
- **نطاقات الاتصال في CSP:** تُؤخذ من `config.js` (`aiUrl` و`syncUrl` و`sbUrl`). قبل ضبطها تُسمح نطاقات `*.workers.dev` و`*.supabase.co` افتراضيًا. إن استعملت نطاقًا مخصصًا فضعه في `config.js` ثم أعد التوليد.
- **ALLOW_ORIGIN في الوسيط:** لم يعد `*` مقبولًا. ضع نطاق موقعك بالضبط (مثل `https://اسم-موقعك.netlify.app`) مع `https://localhost,capacitor://localhost` لتطبيق أندرويد.
- **أندرويد:** `targetSdk=36` و`compileSdk=36` (متطلب Google Play منذ 2026-08-31)، `allowBackup=false`، أذونات القراءة فقط. بعد كل بناء يشغّل CI `scripts/check_manifest.py` ويفشل إن ظهر إذن غير مسموح أو debuggable في Release.
- **التوقيع:** أسرار `KEYSTORE_B64` و`KEYSTORE_PASSWORD` و`KEY_ALIAS` و`KEY_PASSWORD` تُضاف من GitHub ← Settings ← Secrets فقط، ولا تُكتب في المستودع أو المحادثة. لتوليد الملف على جهازك: `keytool -genkeypair -v -keystore release.jks -alias khatwa -keyalg RSA -keysize 2048 -validity 10000` ثم `base64 -w0 release.jks` وضع الناتج في `KEYSTORE_B64`. احتفظ بنسخة من `release.jks` في مكان آمن خارج المستودع، وفعّل Play App Signing.


## 8. نشر P1 (لا تنفّذه قبل مراجعة الفرع)

الترتيب مهم، وكل خطوة قابلة للتراجع (انظر `docs/technical-audit/P1-DESIGN.md`).

1. **Supabase:** خذ نسخة احتياطية. نفّذ `supabase/schema.sql` إن كان مشروعًا جديدًا، ثم `supabase/migrations/p1_sync.sql`. تحقق بـ`select count(*) from public.sync_records` (صفر) وأن `anon` لا يستطيع استدعاء `sync_exchange`.
2. **Auth:** فعّل تأكيد البريد إن أردت (مستحسن). لا حاجة لتفعيل مزوّدات أخرى.
3. **الوسيط:** أضف المتغيرات `SUPABASE_URL` و`SUPABASE_ANON_KEY` (المفتاح العام) و`AUTH_MODE=transition` أولًا. أضف `SUPABASE_SERVICE_KEY` (مفتاح `service_role`) **كسرّ فقط** بـ`wrangler secret put SUPABASE_SERVICE_KEY`؛ هو وحده يستطيع تنفيذ `consume_quota_trusted`، ولا يوضع في `config.js` ولا في `wrangler.toml` ولا في المستودع. بدونه يردّ الوسيط 503 على كل طلب ذكاء اصطناعي (إغلاق عند الفشل). لمشاريع HS256 أضف `SUPABASE_JWT_SECRET` كسرّ. حدود الحصص ليست متغيرات في الوسيط: عدّلها في الجدول `quota_settings` من محرر SQL بحساب المالك (`update public.quota_settings set user_max=100, global_max=500 where bucket='ai'`). انشر ثم جرّب `/api/ai` بحساب تجريبي.
4. **التطبيق:** ضع `sbUrl` و`sbKey` في `config.js`، شغّل `python3 tools/build.py`، وانشر `pwa/`.
5. **بعد ترحيل المستخدمين القدامى:** غيّر `AUTH_MODE` إلى `supabase` (أو احذفه) فيُرفض رمز الوسيط القديم للذكاء والكتابة.
6. **التراجع (يحفظ بيانات السحابة):** أعد `AUTH_MODE=transition`، أزل `sbUrl` من `config.js` وأعد النشر، ثم نفّذ `p1_sync_rollback.sql` إن لزم. لا يحذف هذا الملف سجلات المزامنة: ينقل `sync_meta` و`sync_records` و`quota_settings` إلى المخطط `p1_archive` (لا يصل إليه أي دور من أدوار الـAPI) ويزيل دوال P1. بيانات المجتمع لا تُمس، وحذف الحساب يحذف نسخته المؤرشفة أيضًا.
7. **إعادة التفعيل بعد تراجع:** نفّذ `p1_sync.sql` ثم `p1_sync_restore.sql`. يستعيد الحسابات الموجودة فقط، ويدمج بقاعدة الفوز إن كان للحساب نشاط جديد، ويحافظ على حالة «حذف السحابة». الأرشيف لا يُحذف تلقائيًا؛ احذفه بيدك بعد التحقق: `drop schema p1_archive cascade;`.
8. **نسخة احتياطية مستقلة عن الأجهزة:** قبل أي تنفيذ على الإنتاج استخدم نسخ Supabase الاحتياطية (Dashboard ← Database ← Backups، ومتاحة حسب خطة المشروع)، أو نفّذ من جهازك `pg_dump --data-only -t public.sync_meta -t public.sync_records` على سلسلة الاتصال. لم يُختبر هذا الجزء على مشروع Supabase حقيقي هنا (انظر التقرير)، والمختبَر هو مسار الأرشفة والاستعادة داخل قاعدة Postgres.
