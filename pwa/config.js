/* إعدادات التطبيق — تُعبّأ قبل النشر. القيم هنا تصل إلى كل مستخدم (ملف عام)، فلا تضع فيها أسرارًا.
   aiUrl / syncUrl : رابط وسيط Cloudflare بعد نشره، مثال: https://<اسم-العامل>.<حسابك>.workers.dev/api/ai و.../api/state
   sbUrl           : رابط مشروع Supabase، مثال: https://xxxx.supabase.co
   sbKey           : مفتاح anon (publishable) فقط. مفتاح service_role سرّي ولا يوضع هنا إطلاقًا.
   supportEmail    : بريد حقيقي تملكه لطلبات الخصوصية والحذف (يظهر في صفحتي الخصوصية وحذف الحساب).
   بعد تعديل هذا الملف شغّل: python3 tools/gen-headers.py pwa   لتحديث سياسة CSP (connect-src) تلقائيًا. */
window.APP_CONFIG={
  aiUrl:"",
  syncUrl:"",
  sbUrl:"",
  sbKey:"",
  supportEmail:"",
  storeUrl:""
};
