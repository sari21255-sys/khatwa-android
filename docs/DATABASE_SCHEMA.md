# مخطط قاعدة البيانات (Supabase / Postgres) — `supabase/schema.sql`
| الجدول | الغرض | ملاحظات |
|---|---|---|
| `profiles` | اسم العرض | يُنشأ بمشغّل عند التسجيل، الاسم 1–40 حرفًا، تغييره يحدّث `author` في المنشورات والتعليقات |
| `posts` | المنشورات | نص 1–500، الإدراج مشروط بـ`likes=0 and comments=0 and hidden=false`، حد 10 منشورات/ساعة |
| `comments` | التعليقات | نص 1–300، حد 40/ساعة |
| `likes` | الإعجابات | مفتاح مركّب (منشور، مستخدم)، حد 5000 إجمالًا |
| `reports` | البلاغات | بلاغ واحد لكل مستخدم لكل منشور. 3 بلاغات من حسابات عمرها أكثر من يوم تخفي المنشور |
| `notifications` | إشعارات داخلية | تُنشأ بمشغّلات فقط. المستخدم يقرأ ويغيّر عمود `read` فقط ويحذف |
| `user_settings` | الاختصارات والتفضيلات | مستخدم واحد = صف واحد |

الفهارس: `posts(created_at desc)`، `posts(user_id,created_at desc)`، `comments(post_id,created_at)`، `likes(user_id)`، `notifications(user_id,created_at desc)`.
الحذف: `delete_my_account()` (security definer) تحذف المستخدم فتتتالى كل بياناته (`on delete cascade`).
RLS مفعّل على كل الجداول؛ القراءة للمسجّلين، والكتابة لصاحب الصف فقط.
الترحيل: المخطط idempotent (`if not exists` و`drop ... if exists`) فيُعاد تنفيذه فوق قاعدة موجودة. لا بيانات حية حتى الآن.
