# خطوة — دليل النشر

## 1) تجربة محلية
داخل المجلد: `python3 -m http.server 8000` ثم افتح http://localhost:8000
(يعمل بدون خادم: الحفظ على الجهاز، والذكاء الاصطناعي معطّل حتى تضبط الـWorker).

## 2) الوسيط (Cloudflare Worker) — للذكاء الاصطناعي والمزامنة
1. حساب مجاني على cloudflare.com ثم `npm i -g wrangler` و`wrangler login`.
2. `cd worker` ثم `wrangler kv namespace create STATE` وضع الـid الناتج في `wrangler.toml`.
3. `wrangler secret put ANTHROPIC_API_KEY` والصق مفتاحك من console.anthropic.com (لا يوضع في أي ملف).
4. `wrangler deploy` فيعطيك رابطًا مثل https://sari-api.xxx.workers.dev
5. افتح `config.js` وضع: aiUrl = الرابط + /api/ai ، syncUrl = الرابط + /api/state
6. اضبط `ALLOW_ORIGIN` في `wrangler.toml` على نطاق تطبيقك (إلزامي: بدونه يُرفض أي نطاق)، و`AI_DAILY_CAP` للسقف اليومي. التفاصيل الكاملة في `docs/DEPLOYMENT_GUIDE.md`.
تنبيه: الرمز العشوائي هو المفتاح. الحدود: 60 طلب ذكاء/ساعة للرمز و40 لكل IP، وسقف يومي كلي.

## 3) الاستضافة (HTTPS إلزامي)
ارفع محتوى المجلد (بدون worker) على Cloudflare Pages أو Netlify أو GitHub Pages. جرّب التثبيت من Chrome على الجوال: قائمة ⋮ ← «تثبيت التطبيق».

## 4) إلى Google Play
1. افتح pwabuilder.com وأدخل رابط تطبيقك ← Package for stores ← Android ← حمّل الحزمة (AAB).
2. ضع ملف assetlinks.json الذي يعطيه PWABuilder في `/.well-known/assetlinks.json` على موقعك.
3. حساب Play Console (رسم 25$ لمرة واحدة) ← أنشئ التطبيق ← ارفع AAB ← عبّئ بيانات المتجر.
4. ضع رابط privacy.html (بعد تعبئة التاريخ والبريد) كسياسة خصوصية، وعبّئ «أمان البيانات»: بيانات صحية/لياقة، تُرسل لمعالجة الذكاء الاصطناعي.
5. الحسابات الشخصية الجديدة قد تحتاج اختبارًا مغلقًا بعدد مختبرين لفترة قبل الإنتاج؛ راجع شروط Play الحالية.

## 5) ساعة شاومي
PWA لا يصل إلى Health Connect. للسحب التلقائي لاحقًا يلزم تغليفه بـCapacitor مع إضافة Health Connect؛ حاليًا استعمل الاستيراد من ملف في صفحة الساعة.
