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
