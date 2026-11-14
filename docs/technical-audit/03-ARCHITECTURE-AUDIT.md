# 03 — تدقيق البنية

## البنية الحالية
```mermaid
flowchart LR
  U[المستخدم] --> APP[تطبيق ملف واحد HTML/JS]
  APP <--> LS[(localStorage fit1)]
  APP --> SW[Service Worker]
  APP -->|/api/ai /api/state| W[Cloudflare Worker]
  W --> KV[(KV: STATE)]
  W --> AN[Anthropic API]
  APP -->|Auth + المجتمع| SB[(Supabase Postgres + RLS)]
  APP -->|بحث منتج| OFF[Open Food Facts]
  APP -->|خط| GF[Google Fonts]
  APP -.أندرويد.-> CAP[Capacitor 7] -.-> HC[Health Connect]
```

## تدفق المصادقة
```mermaid
sequenceDiagram
  participant A as التطبيق
  participant S as Supabase Auth
  participant W as Worker
  A->>S: تسجيل/دخول (بريد + كلمة مرور)
  S-->>A: JWT
  A->>S: طلبات REST مع JWT (RLS)
  Note over A,W: مسار المزامنة منفصل
  A->>W: /api/register
  W-->>A: رمز عشوائي (18 بايت)
  A->>W: Authorization: Bearer الرمز
```

## تدفق المزامنة
```mermaid
sequenceDiagram
  participant D1 as جهاز 1
  participant W as Worker/KV
  participant D2 as جهاز 2
  D1->>W: PUT /api/state (الحالة كاملة)
  D2->>W: GET /api/state
  W-->>D2: الحالة + ts
  D2->>D2: استبدال المحلي إن كان ts أحدث
  D2->>W: PUT (الحالة كاملة)
  Note over D1,D2: آخر كتابة تكسب، بلا دمج
```

## المعالجة بالذكاء الاصطناعي
```mermaid
flowchart LR
  UI[طلب المستخدم] --> CTX[aiCtx: ملف + إحصاءات + أوزان]
  CTX --> W[Worker: حد IP/رمز/يومي]
  W --> M[Anthropic]
  M --> W --> P[parseJson]
  P --> N[normAiPlan: تحقق من 7 أيام وتمارين المكتبة]
  N --> S[حفظ في الحالة]
  P -.فشل.-> E[رسالة خطأ بلا انهيار]
```

## البنية الحالية للنشر
```mermaid
flowchart TB
  GH[GitHub repo] -->|Actions| APK[APK debug في Release latest]
  GH -->|رفع يدوي zip| NL[Netlify PWA]
  NL --> USER[متصفح]
  APK --> DEV[جهاز أندرويد]
  WR[Wrangler: يدوي] -.لم يُنشر.-> CF[Cloudflare Worker]
```

## الملاحظات
1. **نقطة قوة:** تخزين محلي أولًا، يعمل دون خادم؛ وسيط يخفي مفتاح الذكاء؛ RLS مختبر.
2. **ضعف:** ملف واحد يخلط بيانات ومنطقًا وواجهة (أسطر بيانات حتى 116 KB).
3. **ضعف:** `render()` يعيد بناء كل الـDOM؛ مقبول الآن (11 ms) لكنه يحد من الحركات وإمكانية الوصول (فقدان التركيز).
4. **ضعف:** حالة عامة `S` بلا طبقة وصول؛ كل وحدة تعدّلها مباشرة.
5. **ضعف:** نظامان للهوية (رمز الوسيط وحساب Supabase) بلا ربط.
6. **ضعف:** مشروع أندرويد مُولَّد في CI، فتعديلات الـmanifest تعتمد على سكربت patch هش.
