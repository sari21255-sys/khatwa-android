# تقرير تنفيذ المرحلة P0 — خُطوة KHATWA

**التاريخ:** 2026-11-14 · **الفرع:** `p0/implementation` (لم يُدمج في `main`) · **نقطة الاستعادة:** فرع `restore/pre-p0` والوسم المحلي `pre-p0` عند الالتزام `d45f6e7`.
**النطاق:** إصلاحات P0 فقط. لم يُنفَّذ أي شيء من P1 أو P2 أو P3، ولم يُنشر شيء على Netlify أو Cloudflare أو Supabase أو Google Play، ولم تُلمس بيانات مستخدمين ولا أسرار.

## 1. الملخص التنفيذي

| البند | النتيجة |
|---|---|
| P0-01 أذونات أندرويد والخصوصية | **منفّذ ومُثبت بفحص APK في CI**: 8 أذونات بدل 17، لا كتابة إلى Health Connect، `allowBackup=false`، Release غير قابل للتصحيح |
| P0-02 إصدارات SDK | **منفّذ ومُثبت بالبناء**: `compileSdk` و`targetSdk` = 36 (متطلب Google Play الرسمي منذ 2026-08-31) |
| P0-03 ترويسات الأمان وCSP | **منفّذ ومُختبر محليًا وفي CI**؛ لم يُختبر على Netlify الفعلي (لم يُنشر) |
| P0-04 أوفلاين قاعدة الأجهزة | **منفّذ ومُختبر** (T10c: FAIL ← PASS). اختبار التثبيت على جهاز فعلي لم يُنفَّذ |
| P0-05 شاشة 320px | **منفّذ ومُختبر على 6 أحجام × 29 شاشة** (T20-320: FAIL ← PASS) |
| P0-06 الوسيط وCORS | **منفّذ ومُختبر**؛ النشر على Cloudflare لم يتم (يحتاج حسابك) |
| P0-07 Supabase | **فُحص وحُصِّن**؛ لا مشروع حقيقي بعد (يحتاج بياناتك) |
| P0-08 الخصوصية وحذف الحساب | **منفّذ**: سياسة جديدة وصفحة حذف تصفان السلوك الفعلي. لا زر حذف لنسخة المزامنة (غير مبني) والصفحة تقول ذلك صراحة |

**الاختبارات:** 34 ناجحًا وفاشل واحد (T09b: دمج المزامنة، وهو P1 خارج النطاق) في سكربتات التدقيق، و19 من 19 في اختبار قبول P0 الجديد، و20 في الوسيط، و21 في التطبيق، وكل اختبارات RLS. نجح CI على الفرع (Tests وBuild Android).

**اكتشافان خارج النص الأصلي للتقرير أثناء التنفيذ:**
1. إضافة Health Connect المثبّتة (`@capgo/capacitor-health` 7.2.15) **لا تدعم قراءة النوم**. التطبيق كان يطلب `sleep` ضمن أنواع الإذن، فيُرجَّح أن يفشل طلب الإذن كله. أُزيل النوم من الطلب ومن الإذن (يبقى يدويًا).
2. فحص manifest الأول في CI كان يمرّ حتى لو فشل (غياب `pipefail`)، فاكتُشف الخلل وصُحّح قبل اعتماد أي نتيجة.

**التقييم:** ما زال التطبيق **غير جاهز للنشر على Google Play** (القسم 13).

## 2. الحالة قبل التنفيذ

نتائج `evidence/results-scenarios.json` و`results-quality.json` (النسخة المرجعية في الالتزام `d45f6e7`):

| الاختبار | قبل |
|---|---|
| T10c eq-db دون اتصال | FAIL (P2): الملف غير مخزّن في الكاش |
| T20-320 فيض أفقي | FAIL (P3): 325px على أكثر من 10 شاشات |
| T22b ترويسات الأمان | FAIL (P2): لا CSP ولا nosniff ولا Referrer-Policy |
| manifest (APK debug) | targetSdk 35، debuggable، `allowBackup=true`، 17 إذنًا بينها WRITE_STEPS وWRITE_DISTANCE وWRITE_ACTIVE_CALORIES_BURNED وWRITE_HEART_RATE وREAD/WRITE_WEIGHT وSCHEDULE_EXACT_ALARM، والسياسة تقول «لا يكتب التطبيق» |
| T09b دمج المزامنة | FAIL (P1، خارج P0) |

**التحقق من انطباق التقرير على الكود الحالي:** كل البنود انطبقت. فروق وُثّقت: مستودع GitHub لا يحوي `pwa/` (ملفات النشر) ولا `fitness-tracker.html` (المصدر) وهما في مجلد المخرجات؛ أضفت `pwa/` إلى المستودع ليدخل CI. المصدر `fitness-tracker.html` ما زال خارج المستودع، وتعديلاتي عليه في `evidence/p0/fitness-tracker.p0.diff`.

## 3. الإصلاحات المنفّذة

### P0-01 أذونات أندرويد
- `scripts/patch_android.py`: يُبقي أذونات قراءة Health Connect للأنواع التي يستعملها الكود فعلًا (خطوات، سعرات نشطة، مسافة، نبض) و`POST_NOTIFICATIONS`، ويزيل بـ`tools:node="remove"` ما تضيفه الإضافات أو لا نستعمله: كل أذونات الكتابة، `READ_WEIGHT`، `SCHEDULE_EXACT_ALARM` و`USE_EXACT_ALARM`، `READ_TOTAL_CALORIES_BURNED`، `READ_SLEEP`، الكاميرا، الميكروفون، الموقع، التخزين.
- `allowBackup="false"`: متوافق مع آلية الحفظ المعتمدة (التصدير والاستيراد والمزامنة). الأثر: لا استرجاع تلقائي لبيانات التطبيق من حساب Google عند تغيير الجهاز، وهذا مقصود لأنها بيانات صحية لا تذكرها السياسة السابقة.
- بما أن الأذونات حُذفت، عُطّلت الميزات التي كانت ستفشل بدونها في نسخة أندرويد فقط (`NAT`): مسح الباركود بالكاميرا (يظهر نص «اكتب الرقم»)، الإملاء الصوتي (يُخفى الزر)، تحديد الموقع (رسالة واضحة). تبقى كلها في نسخة المتصفح.
- `HC_READ` في المصدر: أُزيل `sleep`. نص «يقرأ... والنوم» عُدّل.
- `SCHEDULE_EXACT_ALARM` أُزيل: إضافة الإشعارات المحلية تستعمل جدولة غير دقيقة عند غيابه، فتأخير التذكير بدقائق وارد. لم يُختبر على جهاز.

### P0-02 إصدارات SDK
المصدر الرسمي ([Android Developers](https://developer.android.com/google/play/requirements/target-sdk) و[Play Console Help](https://support.google.com/googleplay/android-developer/answer/11926878)): التطبيقات الجديدة والتحديثات يجب أن تستهدف **API 36** منذ 2026-08-31؛ التمديد حتى 2026-11-01 انتهى قبل اليوم.
- `variables.gradle`: `minSdk 26` (Health Connect)، `compileSdk 36`، `targetSdk 36`.
- `build.gradle`: AGP إلى 8.9.1 (يدعم compileSdk 36 ويعمل مع Gradle 8.11.1 الذي يولّده Capacitor 7) و`android.suppressUnsupportedCompileSdk=36`.
- لم أرفع Capacitor إلى 8 ولا أي إضافة. البناء نجح في CI بهذه الإعدادات.

### P0-03 ترويسات الأمان
- `scripts/gen-headers.py` يولّد `pwa/_headers`: `X-Content-Type-Options: nosniff`، `Referrer-Policy: strict-origin-when-cross-origin`، `X-Frame-Options: DENY`، `Strict-Transport-Security`، `Permissions-Policy`، و`Content-Security-Policy` تشمل `frame-ancestors 'none'` و`object-src 'none'` و`base-uri 'self'` و`form-action 'self'` و`upgrade-insecure-requests`.
- `script-src`: `'self'` + تجزئات SHA-256 للسكربتات المضمّنة الثلاثة، **بلا `unsafe-inline` ولا `unsafe-eval`**. المولّد يعيد حساب التجزئات من الصفحات، واختبار يفشل إن كان الملف قديمًا.
- لجعل ذلك ممكنًا: حُذف معالج `onerror` المضمّن لشعار النادي (صار مستمع `error` عامًا)، وسكربت الطباعة داخل صفحة التقرير (تُطبع الآن من النافذة الأم)، وسكربت صفحة الخصوصية (ملف `legal.js`).
- `connect-src` يُبنى من `config.js` (`aiUrl` و`syncUrl` و`sbUrl`)، وقبل ضبطها يسمح بـ`*.workers.dev` و`*.supabase.co`.
- **تنازل موثّق:** `style-src` فيه `'unsafe-inline'` لأن التطبيق يحوي 751 سمة `style=` وأنماطًا تُولَّد ديناميكيًا. السكربتات هي الخطر الأكبر وهي مقفلة. إزالة هذا التنازل مهمة P3.
- `img-src` يسمح بـ`https:` لأن صور Open Food Facts وشعارات الأندية تأتي من نطاقات متعددة.

### P0-04 أوفلاين قاعدة الأجهزة
- `sw.js`: `eq-db.js` ضمن الـprecache، والإصدار `khatwa-v63` ← `khatwa-v64` فيُحذف الكاش القديم عند التفعيل. الاستراتيجية (شبكة أولًا ثم الكاش) كما هي، فلا ملفات قديمة متعارضة.
- المصدر: عند فشل التحميل تظهر رسالة صحيحة («افتح التطبيق مرة بالإنترنت») وزر «إعادة المحاولة»، وصار الفشل قابلًا للتعافي بعد أن كان نهائيًا حتى إغلاق التطبيق.
- في تطبيق أندرويد القاعدة مضمّنة في الحزمة أصلًا (`www/eq-db.js`).

### P0-05 الفيض عند 320px
- السبب الأول: الصف العلوي (5 أزرار × 42px + فراغات 8px). صار `.tbr{gap:3px}` تحت 340px بلا تصغير الأزرار.
- السبب الثاني (عند 320 فقط على شاشة «الربط»): نص `التاريخ,الخطوات,...` بلا مسافات يدفع العرض. أُضيف `min-width:0;overflow-wrap:anywhere` لـ`.lnk span.t`.
- السبب الثالث: كشفه CI بخط Cairo الفعلي (3px على شاشة التقدّم): ست قواعد `grid-template-columns:repeat(N,1fr)` صارت `minmax(0,1fr)`.
- لا `overflow-x:hidden` عام (الاختبار `T20-nohide` يتحقق).

### P0-06 الوسيط
- `worker/ai-proxy.js`: لم يعد يقبل `ALLOW_ORIGIN=*` (الطلبات تحمل رمز Bearer فهي ذات اعتماد)، ولا يقبل طلبًا بأصل فارغ ضمن قائمة المسموح؛ القائمة الفارغة ترفض كل أصول المتصفح. لا مفاتيح في ملفات الواجهة (فُحص المستودع بنمط `sk-ant`، `service_role`، JWT، المفاتيح الخاصة: لا نتائج).
- فشل الوسيط (500، انقطاع الاتصال) يعطي رسالة واضحة بلا انهيار ويضع حالة المزامنة `err` (مُختبر).

### P0-07 Supabase
- فُحص `schema.sql`: RLS مفعّل على الجداول السبعة؛ ثلاث سياسات قراءة `using(true)` لكنها `to authenticated` فقط (مقصودة لمجتمع مغلق على المسجّلين)؛ كل دوال `security definer` تحدّد `search_path`.
- أُضيف سحب كل صلاحيات الدور `anon` من الجداول والتسلسلات وأذونات افتراضية مستقبلية، مع اختبارات SQL تثبت أن `anon` لا يقرأ ولا يكتب ولا يستدعي `delete_my_account`. الاختبار المحاكي صار يمنح `anon` الصلاحيات الافتراضية كما تفعل Supabase.
- `config.js`: تعليقات توضح أن `sbKey` مفتاح `anon` العام فقط وأن `service_role` سرّي. القيم فارغة. لم يُنشأ Auth جديد ولا جداول ولا ترحيل.

### P0-08 الخصوصية وحذف الحساب
- `privacy.html` أُعيدت كتابتها من الكود الفعلي: جدول بما يغادر الجهاز ومتى، وأقسام للذكاء الاصطناعي وHealth Connect (قراءة فقط) والكاميرا/الميكروفون/الموقع والنسخ الاحتياطي. صُحّحت التناقضات: «لا يكتب التطبيق» صارت صحيحة بعد حذف أذونات الكتابة، و«لا نحتفظ بالصور» صارت «الوسيط لا يحفظها وAnthropic تعالجها وفق سياساتها».
- أصبح التطبيق يذكر حساب المزامنة (بريد وتجزئة كلمة المرور في الوسيط)، وهو كان غائبًا عن السياسة القديمة.
- `delete-account.html` (جديدة، وهي رابط الحذف الذي يطلبه Play): تقول الحال الفعلية لكل موضع بيانات. الأقسام تظهر وتختفي حسب `config.js` فلا تَعِد بخدمة غير مفعّلة.
- `legal.js` يملأ البريد من `config.js` ولا يخترع بريدًا. إن كان فارغًا تظهر عبارة «لم يُضبط بعد».
- في الإعدادات بطاقة «الخصوصية والبيانات» بالرابطين.
- **ما لم يُبنَ:** لا زر «حذف نسخة المزامنة» ولا «مسح بياناتي المحلية» داخل التطبيق. الصفحة تشرح الطريقة اليدوية (مسح بيانات التطبيق من إعدادات الجهاز، وطلب حذف النسخة المزامَنة بالبريد). هذا يحتاج نقطة `DELETE` في الوسيط وهو تغيير في نظام المزامنة (P1).

## 4–5. الملفات المعدّلة وسببها

| الملف | السبب |
|---|---|
| `scripts/patch_android.py` | أذونات، backup، SDK، AGP |
| `scripts/check_manifest.py` (جديد) | فحص APK آليًا (أذونات، debuggable، backup، targetSdk) |
| `.github/workflows/android.yml` | بناء Release غير موقّع وفحصه؛ تقارير النتائج؛ النشر إلى Release «latest» لـ`main` فقط؛ تشغيل على فروع `p0/**` |
| `.github/workflows/ci.yml`، `tests/run-all.sh` | تشغيل اختبار قبول P0 |
| `scripts/gen-headers.py` (جديد)، `scripts/sync-pwa.sh` (جديد)، `pwa/_headers` | الترويسات وCSP |
| `pwa/` (مجلد جديد في المستودع) | ملفات النشر: `sw.js`، `index.html`، الصفحات القانونية، `config.js`... |
| `pwa/sw.js` | precache لـ`eq-db.js` وإصدار v64 |
| `pwa/index.html`، `www/index.html` (ناتج بناء من `fitness-tracker.html`) | تعديلات المصدر أدناه |
| `pwa/privacy.html`، `pwa/delete-account.html`، `pwa/legal.js` ونسخها في `www/` (و`www/privacypolicy.html` نسخة من السياسة الجديدة لئلا تبقى القديمة) | P0-08 |
| `pwa/config.js`، `www/config.js` | تعليقات فقط، القيم فارغة |
| `worker/ai-proxy.js` (ونسخة النشر `pwa/worker`) | CORS |
| `tests/worker.test.mjs` | 3 اختبارات CORS جديدة |
| `supabase/schema.sql`، `supabase/tests/*` | سحب صلاحيات anon واختباراتها |
| `docs/DEPLOYMENT_GUIDE.md` | قسم 7: ما تغيّر وما يلزم عند النشر |
| `docs/technical-audit/evidence/*` | `p0-acceptance.mjs`، ترويسات `lib.mjs`، أحجام إضافية في `quality.mjs`، نتائج «بعد» |

**تعديلات `fitness-tracker.html`** (المصدر؛ الفرق الكامل في `evidence/p0/fitness-tracker.p0.diff`): إخفاء الباركود والإملاء والموقع في أندرويد؛ إزالة `sleep` من Health Connect؛ معالج `error` عام بدل `onerror`؛ طباعة التقرير من النافذة الأم؛ إعادة محاولة قاعدة الأجهزة؛ CSS الفيض؛ بطاقة الخصوصية في الإعدادات.

## 6–7. الاختبارات ومقارنة قبل/بعد

| الاختبار | قبل | بعد | الدليل |
|---|---|---|---|
| T10c eq-db دون اتصال | FAIL | **PASS** | `p0/results-p0.json`: ثبّت ← أغلق ← اقطع الاتصال ← افتح ← 869 جهازًا، بحث 120 نتيجة، فلتر صدر 106، فتح تفاصيل |
| T10c-1 كاش بعد التثبيت وحذف v63 القديم | — | **PASS** | مفتاح واحد `khatwa-v64` |
| T10c-2 عودة الاتصال بلا تعارض | — | **PASS** | |
| T10c-3 فشل التحميل وإعادة المحاولة | — | **PASS** | |
| T20-320 | FAIL | **PASS** | 29 شاشة |
| T20-360 / 390 / 412 / 768 / 1024 / 1280 | PASS (412 و1024 لم تُختبر) | **PASS** | `p0/after-results-quality.json` |
| T22b ترويسات الأمان | FAIL | **PASS** | 7 مسارات × 5 ترويسات تصل فعليًا من خادم يطبّق `_headers` |
| T22b-csp / T22b-fresh | — | **PASS** | |
| T22c: 29 شاشة + خطة ذكاء + مزامنة + تقرير مطبوع تحت CSP | — | **PASS** | صفر مخالفات CSP، صفر أخطاء JS |
| Manifest (Release) | يخالف | **PASS** | `p0/ci-manifest-release.txt` |
| Release غير قابل للتصحيح | debug فقط | **PASS** | `debuggable False` |
| PWA: Service Worker والكاش | PASS | **PASS** | T10a/T10b |
| الانحدار T01–T08، T11–T13 | PASS | **PASS** | `p0/after-scenarios.log` |
| T09b دمج المزامنة | FAIL | **FAIL** (P1، لم يُمس عمدًا) | |
| P0-06a/b فشل الوسيط (500، انقطاع) | — | **PASS** | |
| اختبارات وحدة الوسيط | 17 | **20 PASS** | |
| اختبارات التطبيق `app.e2e.js` | 21 | **21 PASS** | |
| RLS على Postgres 16 | PASS | **PASS** + 7 اختبارات anon | |
| اختبار على جهاز أندرويد | NOT TESTED | **BLOCKED** | لا جهاز |
| ترويسات على Netlify الحقيقي | NOT TESTED | **NOT TESTED** | لم يُنشر؛ المختبَر محاكاة لسلوك `_headers` |

**نتائج manifest الفعلية (CI، تشغيل `43571572075`):** minSdk 26، targetSdk 36، `debuggable False`، `allowBackup false`، والأذونات: `INTERNET`، `POST_NOTIFICATIONS`، `RECEIVE_BOOT_COMPLETED`، `WAKE_LOCK`، وأربعة أذونات قراءة Health (`READ_STEPS`, `READ_DISTANCE`, `READ_HEART_RATE`, `READ_ACTIVE_CALORIES_BURNED`).

**ملاحظة منهجية:** خطأ الفيض عند 320px لم يظهر محليًا لأن خط Cairo لا يُحمَّل في بيئتي، وظهر في CI. لذلك اعتبرتُ اختبار CI المرجع. وقد نجح بعد الإصلاح.

## 8. الأدلة لكل إصلاح

| الإصلاح | الدليل |
|---|---|
| P0-01/02 | `evidence/p0/ci-manifest-release.txt` و`ci-manifest-debug.txt`، تشغيل Build Android الناجح، `scripts/check_manifest.py` يفشل البناء عند أي مخالفة (`pipefail`) |
| P0-03 | `p0/results-p0.json` (T22b، T22b-csp، T22b-fresh، T22c، T22c-load) |
| P0-04 | `p0/results-p0.json` (T10c وفروعه)، `after-results-scenarios.json` (T10c) |
| P0-05 | `p0/after-results-quality.json` و`results-p0.json` (T20-*)، `p0/after-shot-320-dash.png` مقابل `shot-320-dash.png` السابقة |
| P0-06 | `tests/worker.test.mjs`، `results-p0.json` (P0-06a/b/c) |
| P0-07 | `supabase/tests/01_rls_and_limits.sql` نتيجة «ALL RLS TESTS PASSED» محليًا وفي CI |
| P0-08 | `pwa/privacy.html`، `pwa/delete-account.html`، اختبار تحميلهما تحت CSP بلا مخالفات |

## 9. ما تعذّر تنفيذه ولماذا

| البند | السبب |
|---|---|
| نشر الوسيط على Cloudflare | يحتاج حسابك |
| إنشاء مشروع Supabase وتجربة حذف الحساب من الواجهة | يحتاج حسابك |
| نشر `pwa/` على Netlify والتحقق من الترويسات هناك | لا صلاحية، ولا وصول للشبكة من بيئتي |
| اختبار الأندرويد على جهاز (Health Connect، الإشعارات، رجوع، targetSdk 36) | لا جهاز |
| زر حذف نسخة المزامنة ومسح البيانات المحلية داخل التطبيق | يحتاج تغيير في الوسيط، وهو P1 |
| فحص توقيع الـAAB | خطوة التوقيع في CI نجحت، لكن لم أفحص الملف ولا الشهادة، ولم ألمس الأسرار |
| تطبيق `_headers` على Capacitor | لا ترويسات في APK؛ CSP للويب فقط (وضع `<meta>` في `www/` قرار P1) |

## 10. ما أحتاجه منك

1. **بريد دعم حقيقي** تملكه ← `supportEmail` في `pwa/config.js` (ثم `python3 scripts/gen-headers.py pwa`).
2. **حساب Cloudflare:** نشر الوسيط (`wrangler kv namespace create STATE`، `wrangler secret put ANTHROPIC_API_KEY`، `wrangler deploy`) ثم `ALLOW_ORIGIN` = نطاق موقعك الفعلي + `https://localhost,capacitor://localhost`، ثم `aiUrl` و`syncUrl`.
3. **مشروع Supabase:** تنفيذ `supabase/schema.sql`، ثم `sbUrl` و`sbKey` (مفتاح anon فقط).
4. **رابط المتجر** `storeUrl` بعد إنشاء الصفحة.
5. **قرار معرّف الحزمة:** `com.khatwa.app` (Capacitor) أم `com.khatwa.twa` (assetlinks). لا يتغيّر بعد النشر.
6. **التوقيع:** أسرار GitHub الأربعة. خطوة AAB تعمل في CI الآن، فيبدو أنها مضبوطة عندك؛ تأكد أنها مفاتيح الإصدار الحقيقية وليست تجريبية. لا ترسلها لي.
7. **نشر `pwa/`** على Netlify: السحب والإفلات لملف `khatwa-pwa.zip` المحدّث في المخرجات (v64 + الترويسات).
8. **جهاز أندرويد** للاختبار المغلق، أو إخباري بجهاز يمكنني الاستعانة بوصفه.

## 11. المخاطر المتبقية

- **Health Connect غير مجرَّب على جهاز.** وإضافة capgo 7.2.15 لا تدعم النوم أو الوزن في التطبيق؛ قرار ترقية الإضافة أو استبدالها لميزة النوم يخص P1.
- `style-src 'unsafe-inline'` ما زال قائمًا.
- ترقية AGP وcompileSdk إلى 36 مع Capacitor 7 تعمل في CI، لكن سلوك targetSdk 36 (الحواف، زر الرجوع التنبؤي) لم يُختبر بصريًا على جهاز.
- `pwa/_headers` يعتمد على تشغيل المولّد بعد كل بناء. نسيانه يكسر التطبيق على Netlify (الاختبار T22b-fresh ينبّه في CI).
- الوسيط: رمز المزامنة هو السر ومفتاح الحالة معًا، حدود المعدل على KV غير ذرية، بريد حساب المزامنة يُحفظ نصًا صريحًا في مفتاح KV (`u:<email>`). كلها P1.
- الذكاء الاصطناعي لم يُقيَّم محتواه ولا أمانه الطبي (مزوّد وهمي في الاختبارات).
- فيض 320px اختُبر على مجموعة الشاشات الـ29 وبخط Cairo في CI فقط، ولم أجرّب خطوط النظام الكبيرة على أندرويد.

## 12. حالة بناء Android وPWA

| | الحالة |
|---|---|
| Debug APK | يُبنى في CI (targetSdk 36، `debuggable=true` كما ينبغي) |
| Release APK غير موقّع | يُبنى ويُفحص: غير قابل للتصحيح، backup معطّل، أذونات مطابقة |
| AAB موقّع | خطوة التوقيع في CI نجحت (الأسرار مضبوطة في المستودع). لم أفحص الملف |
| نشر Release «latest» | يتم من `main` فقط، فلا تغيّر نسختك المنشورة قبل الدمج |
| PWA | `khatwa-pwa.zip` (v64 + `_headers` + الصفحات القانونية) جاهز للرفع اليدوي، **لم يُنشر** |
| `build.py` | يعمل (بُني بعد كل تعديل)، وطابق `khatwa.html` و`pwa/index.html` و`www/index.html` المصدر |

## 13. تقييم الجاهزية بعد P0

**غير جاهز للنشر على Google Play.** عوائق P0 المحلية أُغلقت وما تبقّى يعتمد على خدماتك وأجهزتك:

| البند | الحالة |
|---|---|
| أذونات وbackup وdebuggable وtargetSdk | READY |
| ترويسات الأمان | READY في الاختبار المحاكي، NOT TESTED على Netlify |
| أوفلاين قاعدة الأجهزة | READY (ويب)، NOT TESTED على جهاز |
| 320px | READY |
| الوسيط والمزامنة | BLOCKED: غير منشورين، ودمج المزامنة (T09b) غير محلول |
| Supabase والمجتمع وحذف الحساب | BLOCKED: لا مشروع |
| سياسة الخصوصية وحذف الحساب | READY كنص، ينقصها البريد |
| اختبار جهاز حقيقي | BLOCKED |
| إعلان Health apps وData safety في Play Console | NOT READY (يكتبهما أنت من الصفحات الجديدة) |

## 14. المهام المتبقية قبل P1

1. دمج الفرع `p0/implementation` في `main` بعد مراجعتك (أو طلب تعديل).
2. توفير ما في القسم 10 (البريد، Cloudflare، Supabase، قرار الحزمة).
3. نشر PWA ثم التحقق من الترويسات على الموقع الفعلي (`curl -I`).
4. اختبار على جهاز: Health Connect (أربعة أنواع)، الإشعارات، زر الرجوع، تصفح الأجهزة دون اتصال، targetSdk 36.
5. ثم يبدأ P1: دمج المزامنة صفًّا بصف (T09b)، هوية موحّدة، زر حذف المزامنة والمسح المحلي، تدوير رمز المزامنة، حدود معدل ذرية، قرار Health Connect للنوم، وضع المصدر `fitness-tracker.html` تحت تحكم Git.

## سجل التغييرات المختصر

| الالتزام | المحتوى |
|---|---|
| P0-01/02 | أذونات، backup، SDK 36، فحص manifest في CI |
| P0-03/04/05 | مولّد الترويسات، precache، فيض 320px |
| P0-03..08 | تطبيق متوافق مع CSP، إعادة محاولة eq-db، صفحات الخصوصية والحذف، CORS، anon، اختبار قبول P0 |
| إصلاحات لاحقة | إزالة sleep، minmax في الشبكة، pipefail وregex في فحص manifest |

## أوامر التشغيل والبناء والاختبار

```bash
# بناء التطبيق من المصدر ومزامنة pwa/ وتوليد الترويسات
python3 /tmp/chk/build.py            # يكتب khatwa.html و pwa/index.html (مجلد المخرجات) و www/index.html (المستودع)
bash scripts/sync-pwa.sh             # ينسخ index.html المبني إلى pwa/ ويعيد توليد _headers

# كل الاختبارات المحلية
export NODE_PATH="$(npm root -g)"
bash tests/run-all.sh                # الوسيط + التطبيق + قبول P0

# اختبارات التدقيق السابقة بعد P0 (نسخة اختبار من pwa/ مع الترويسات)
SITE=/tmp/p0site node docs/technical-audit/evidence/scenarios.mjs
SITE=/tmp/p0site node docs/technical-audit/evidence/quality.mjs

# قاعدة البيانات
psql -f supabase/tests/00_mock_supabase.sql && psql -f supabase/tests/01_rls_and_limits.sql

# أندرويد (يعمل في CI؛ محليًا يلزم SDK)
npx cap add android && python3 scripts/patch_android.py && npx cap sync android
cd android && ./gradlew assembleRelease
python3 scripts/check_manifest.py app/build/outputs/apk/release/app-release-unsigned.apk --release
```
