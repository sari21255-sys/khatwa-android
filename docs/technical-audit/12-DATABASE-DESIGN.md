# 12 — تصميم قاعدة البيانات

الأساس: `supabase/schema.sql` (profiles، posts، comments، likes، reports، notifications، user_settings، قيود وحدود وRLS و`delete_my_account()`) مختبر محليًا. المقترح هنا **يضيف** جداول للمزامنة بدل لقطة KV الكاملة.

## ERD
```mermaid
erDiagram
  AUTH_USERS ||--|| PROFILES : has
  AUTH_USERS ||--|| USER_SETTINGS : has
  PROFILES ||--o{ POSTS : writes
  POSTS ||--o{ COMMENTS : has
  POSTS ||--o{ LIKES : receives
  PROFILES ||--o{ REPORTS : files
  PROFILES ||--o{ NOTIFICATIONS : receives
  AUTH_USERS ||--o{ SYNC_RECORDS : owns
  AUTH_USERS ||--o{ WORKOUT_LOGS : owns
  AUTH_USERS ||--o{ MEAL_LOGS : owns
  AUTH_USERS ||--o{ BODY_METRICS : owns
  AUTH_USERS ||--o{ PLANS : owns
  AUTH_USERS ||--o{ MACHINE_MAX : owns
  AUTH_USERS ||--o{ AI_USAGE : consumes
  PLANS ||--o{ WORKOUT_LOGS : "يُنفَّذ"
  PROFILES { uuid id PK
    text display_name
    timestamptz created_at }
  WORKOUT_LOGS { uuid id PK
    uuid user_id FK
    date day
    text exercise_id
    numeric weight_kg
    int reps
    timestamptz updated_at
    timestamptz deleted_at }
  MEAL_LOGS { uuid id PK
    uuid user_id FK
    date day
    text slot
    text food_id
    numeric grams
    numeric kcal
    timestamptz updated_at }
  BODY_METRICS { uuid id PK
    uuid user_id FK
    date day
    numeric weight_kg
    numeric body_fat_pct }
  PLANS { uuid id PK
    uuid user_id FK
    jsonb plan
    int version
    timestamptz updated_at }
  MACHINE_MAX { uuid user_id PK
    text machine_id PK
    numeric max_kg
    date max_date }
  AI_USAGE { uuid id PK
    uuid user_id FK
    date day
    text task
    int tokens_in
    int tokens_out }
```

## الجداول الجديدة المقترحة
| الجدول | المفتاح | فهارس | قيود | RLS |
|---|---|---|---|---|
| `workout_logs` | `id uuid` | `(user_id, day)`, `(user_id, updated_at)` | `weight_kg between 0 and 1000`، `reps between 0 and 1000` | `user_id = auth.uid()` لكل العمليات |
| `meal_logs` | `id` | `(user_id, day)` | `grams between 0 and 5000` | نفسه |
| `body_metrics` | `id`, unique `(user_id, day)` | | `weight_kg between 20 and 500`, `body_fat_pct between 2 and 70` | نفسه |
| `plans` | `id` | `(user_id)` | `jsonb_typeof(plan)='object'`، حجم ≤ 256 KB | نفسه |
| `machine_max` | `(user_id, machine_id)` | | `max_kg between 0 and 2000` | نفسه |
| `ai_usage` | `id` | `(user_id, day)` | | قراءة ذاتية، كتابة عبر دالة/Worker فقط |

## الدمج
كل صف يحمل `updated_at` و`deleted_at` (حذف ناعم). العميل يرسل الصفوف المتغيرة منذ آخر مزامنة؛ الخادم يقبل الأحدث لكل صف (LWW على مستوى الصف بدل المستند) فتُحفَظ تعديلات الجهازين المختلفة. تعارض الصف الواحد يُحَل بالأحدث.

## الترحيل
1. إبقاء `fit1` كما هو محليًا.
2. عند أول تسجيل دخول: رفع اللقطة المحلية إلى الجداول (خطوة أحادية الاتجاه مع نسخة JSON تُحفظ محليًا).
3. إيقاف `/api/state` بعد فترة تقاطع، ثم حذف مفاتيح KV.
4. ترحيلات SQL مرقّمة في `supabase/migrations/` تُطبَّق من CI.

## النسخ الاحتياطي والاستعادة
- Supabase: نسخ يومية (حسب الخطة)، وPITR في الخطة المدفوعة.
- `pg_dump` أسبوعي من CI إلى تخزين مشفّر خارجي.
- اختبار استعادة ربع سنوي إلى مشروع staging (لم يُجرَ حاليًا).
- المستخدم: تصدير JSON موجود (T11).
