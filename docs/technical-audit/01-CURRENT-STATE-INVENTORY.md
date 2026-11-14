# 01 — جرد الوضع الحالي

| المكوّن | التقنية الحالية | الإصدار | الحالة | الملاحظات |
|---|---|---|---|---|
| الواجهة | HTML/CSS/JS خام في ملف واحد (`fitness-tracker.html`) | — | يعمل | 1.5 MB غير مضغوط، 282 دالة، رسم كامل بـ`innerHTML` |
| البناء | `build.py` ينسخ المصدر إلى `khatwa.html` و`pwa/index.html` و`khatwa-android/www/index.html` | — | يعمل | لا bundler ولا minify |
| PWA | Service Worker + manifest | كاش `khatwa-v63` | يعمل | `eq-db.js` غير مخزّن مسبقًا |
| أندرويد | Capacitor | 7 | يُبنى في CI | يُولَّد المشروع في CI (`cap add android`) ولا يُحفظ في المستودع |
| الوسيط | Cloudflare Worker (`pwa/worker/ai-proxy.js`) + KV | — | مختبر محليًا، غير منشور | تسجيل/دخول/حالة/ذكاء |
| الذكاء الاصطناعي | Anthropic عبر الوسيط | `claude-sonnet-5-5` / `claude-haiku-5-5` | يعمل مع مزوّد وهمي | max_tokens=1500 |
| المجتمع/الحسابات | Supabase (Postgres + Auth + RLS) | — | `schema.sql` مختبر على Postgres محلي | لا مشروع حقيقي بعد؛ `config.js` فارغ |
| التخزين المحلي | localStorage مفتاح `fit1` | — | يعمل | 275 KB لبيانات سنتين |
| قاعدة الأجهزة | `eq-db.js` (869 جهازًا، 7 علامات) | — | يعمل | تُحمَّل عند الطلب |
| قاعدة الأطعمة | مصفوفة داخل الملف | 742 صنفًا | يعمل | قيم لكل 100 غ |
| الاختبارات | Playwright e2e، اختبار الوسيط، SQL RLS | — | تعمل في CI | حديثة؛ تغطية محدودة |
| CI | GitHub Actions (`android.yml`, `ci.yml`, `twa.yml`) | — | آخر تشغيل ناجح (d475f75) | APK debug فقط دون أسرار توقيع |
| الاستضافة | Netlify (`khatwa-fitness-app`) | — | رفع يدوي لـzip | `_headers` بلا ترويسات أمان |
| الحزمة | `com.khatwa.app` (Capacitor) و`com.khatwa.twa` (assetlinks) | — | **تعارض** | قرار مطلوب (§16) |
| تتبع الأخطاء | حلقة `ERRS` محلية | — | محدود | لا Sentry ولا تقارير بعيدة |

## الملفات الرئيسية
`fitness-tracker.html` · `pwa/{index.html,sw.js,config.js,privacy.html,_headers,eq-db.js,worker/ai-proxy.js}` · `supabase/{schema.sql,tests/}` · `tests/` · `scripts/patch_android.py` · `.github/workflows/`.

## حقائق قياسية
- 282 دالة؛ 8 دوال بلا استدعاء ظاهر: `streakCard, vLearn, vMyth, vSafe, vHome, vSupp, restDayCard, quickLog`.
- أكبر الدوال: `cdPage` ≈52 KB، `homeCar` ≈51 KB، `vCardio` ≈44 KB.
- لا `console.log`، لا `onclick` مضمّن، 7 تعليقات TODO.
- مضيفون خارجيون: Anthropic (عبر الوسيط)، Supabase، Open Food Facts، Google Fonts.
