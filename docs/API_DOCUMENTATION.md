# واجهات الوسيط (Cloudflare Worker) — `pwa/worker/ai-proxy.js`
كل الطلبات JSON. CORS مقيّد بقائمة `ALLOW_ORIGIN`؛ نطاق غير مدرج = 403.

| المسار | الطريقة | المصادقة | الوصف |
|---|---|---|---|
| `/api/register` | POST | لا | `{email,password}` ← `{token}`. كلمة المرور 8–200. حد: 10/ساعة للبريد و5/ساعة لكل IP |
| `/api/login` | POST | لا | ← `{token}`. 401 عند الخطأ، 429 عند الإكثار |
| `/api/state` | GET | Bearer | حالة التطبيق. 404 إن لم توجد |
| `/api/state` | PUT | Bearer | حفظ الحالة. ≤ 900KB، JSON صالح وفيه `plan` مصفوفة، وإلا 400 |
| `/api/ai` | POST | Bearer | `{prompt,image?,tier?}` ← `{text}`. الصورة ≤ 2MB (base64) |

الرمز: سلسلة `[a-z0-9]{20,64}`؛ هو نفسه مفتاح الحالة، فيُعامَل كسرّ. حدود `/api/ai`: 60/ساعة للرمز، 40/ساعة لكل IP، وسقف يومي كلي `AI_DAILY_CAP` (الافتراضي 500). الحدود على KV تقريبية؛ السقف الكلي هو حماية التكلفة.
الأخطاء: `bad_json` 400، `bad_token` 401، `origin` 403، `too_big` 413، `rate` 429، `upstream` 502.

# Supabase REST
التطبيق يستدعي `/auth/v1/*` و`/rest/v1/*` و`rpc/delete_my_account` بمفتاح anon وجلسة المستخدم. الحماية بـRLS وليست بإخفاء الأزرار.
