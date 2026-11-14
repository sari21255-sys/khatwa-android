# 14 — قائمة جاهزية الإنتاج

الحالات: READY · NOT READY · BLOCKED · NOT APPLICABLE. لا READY مع فجوة حرجة أو اختبار أساسي غير منفّذ.

| البند | الحالة | السبب |
|---|---|---|
| المسارات الأساسية (تسجيل، تمرين، وجبة، وزن، تقدّم) | READY | T01–T06 |
| حفظ محلي واستيراد/تصدير | READY | T02، T11 |
| أخطاء JS أثناء السيناريوهات | READY | T13 |
| أداء مع بيانات كبيرة | READY | T23b |
| المزامنة بين الأجهزة | NOT READY | T09b FAIL |
| العمل دون اتصال الكامل | NOT READY | T10c FAIL |
| ترويسات الأمان | NOT READY | T22b FAIL |
| تخطيط 320px | NOT READY | T20-320 FAIL (P3) |
| RLS وحدود قاعدة المجتمع | READY (محليًا) | SQL مجتاز؛ على Supabase حقيقي غير مختبر |
| نشر Supabase وتعبئة config.js | BLOCKED | بيانات المستخدم مطلوبة |
| نشر الوسيط على Cloudflare | BLOCKED | بيانات المستخدم مطلوبة |
| مصادقة وحسابات حقيقية | BLOCKED | تعتمد على Supabase |
| حذف الحساب (واجهة + ويب) | NOT READY | لا رابط ويب؛ الواجهة غير مختبرة |
| مسح البيانات المحلية داخل التطبيق | NOT READY | غير موجود |
| سياسة الخصوصية مطابقة للكود | NOT READY | تناقض Health Connect، بريد فارغ |
| أذونات manifest | NOT READY | أذونات زائدة |
| Build Release موقّع | BLOCKED | أسرار التوقيع غير موجودة |
| targetSdk مطابق لمتطلبات Play | NOT READY | 35؛ المطلوب غير مؤكد رسميًا (على الأرجح 36) |
| debuggable=false / allowBackup=false | NOT READY | |
| معرّف الحزمة موحّد | BLOCKED | قرار المستخدم |
| اختبار جهاز أندرويد حقيقي | BLOCKED | لا جهاز |
| إعلان Health apps وData safety | NOT READY | لم يُعدَّا |
| اختبار مغلق 12×14 يومًا | BLOCKED | يتبع نوع الحساب |
| فحص تبعيات (`npm audit`) | NOT READY | لم يُنفَّذ |
| اختبار اختراق | NOT APPLICABLE للإطلاق الأول؛ موصى به قبل التوسع | |
| Lighthouse | NOT READY | لم يُنفَّذ |
| مراقبة أعطال | NOT READY | لا Sentry |
| نسخ احتياطي واستعادة | NOT READY | لم تُختبر استعادة |
| iOS | NOT APPLICABLE | خارج النطاق |
| بوابة الذكاء: موافقة وقواعد سلامة | NOT READY | غير منفّذة |
| مفتاح Anthropic سرّي بالوسيط | READY | الكود |
