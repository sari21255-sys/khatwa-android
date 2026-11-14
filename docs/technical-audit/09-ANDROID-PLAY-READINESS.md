# 09 — جاهزية أندرويد وGoogle Play

التمييز: **[مؤكد]** من مصدر Google الرسمي المفتوح أو من فحص الـAPK · **[غير مؤكد]** من مصادر ثانوية أو يعتمد على الميزات.

## متطلبات Play
| المتطلب | الحالة | المصدر |
|---|---|---|
| مستوى API المستهدف: مصادر ثانوية متعددة تذكر API 36 إلزاميًا للتطبيقات الجديدة والتحديثات بحلول 31‑08‑2026 (وAPI 37 لاحقًا) | **[غير مؤكد]**: صفحة Google الرسمية لم تُفتح من البيئة. تطبيقنا `targetSdk=35` → غالبًا مرفوض. تحقق في Play Console قبل الرفع | [دليل ثانوي](https://www.appsonair.com/blogs/android-16-api-level-36-target-sdk-requirement-what-you-need-to-do-before-august-31) |
| حساب شخصي أُنشئ بعد 13‑11‑2023: اختبار مغلق بـ12 مختبِرًا على الأقل لمدة 14 يومًا متواصلة ثم طلب الوصول للإنتاج | **[مؤكد]** (لو كان الحساب شخصيًا) | [Play Console Help](https://support.google.com/googleplay/android-developer/answer/14151465) |
| إعلان تطبيقات الصحة (Health apps declaration) + سياسة خصوصية مطابقة لما في Health Connect + Data safety، وطلب أنواع البيانات اللازمة فقط | **[مؤكد]** | [Android Developers](https://developer.android.com/health-and-fitness/health-connect/publish) |
| حذف الحساب: مسار داخل التطبيق + رابط ويب لطلب الحذف، وتعبئة نموذج Data safety | **[مؤكد]** لأن التطبيق يتيح إنشاء حساب | [Play Console Help](https://support.google.com/googleplay/android-developer/answer/13327111) |
| `SCHEDULE_EXACT_ALARM` / `RECEIVE_BOOT_COMPLETED` تحتاج تبريرًا | **[يعتمد على الميزة]** الاستعمال هنا تذكيرات؛ يلزم مراجعة سياسة المنبهات الدقيقة الحالية | غير مفتوحة للتحقق هنا |
| الإذن للكاميرا/الميكروفون للباركود والصوت | **[مؤكد من APK]** غير موجود في manifest → الميزتان غالبًا تفشلان في WebView | فحص APK |

## نتائج فحص `AndroidManifest` (APK debug)
- `minSdk 26`، `targetSdk 35`، `debuggable=true`، `allowBackup=true`.
- أذونات Health: READ ×6 (خطوات، نبض، مسافة، سعرات كلية ونشطة، نوم)، **WRITE ×4 + READ_WEIGHT/WRITE_WEIGHT** إضافية غير موثقة.
- `POST_NOTIFICATIONS`، `SCHEDULE_EXACT_ALARM`، `RECEIVE_BOOT_COMPLETED`، `WAKE_LOCK`، `INTERNET`.
- مصدر الأذونات الإضافية: على الأرجح إضافة Capacitor Health Connect؛ ينبغي إزالتها في `patch_android.py` عبر `tools:node="remove"`.

## حواجز قبل الرفع
1. بناء Release موقّع AAB (أسرار التوقيع غير مضبوطة بعد).
2. رفع `targetSdk` إلى المطلوب رسميًا وإعادة اختبار.
3. قرار معرّف الحزمة (`com.khatwa.app` أم `com.khatwa.twa`) — لا يُغيَّر بعد النشر.
4. `allowBackup=false`، حذف الأذونات الزائدة، مواءمة السياسة.
5. صفحة حذف حساب ويب، وبريد دعم، وتعبئة `config.js`.
6. اختبار مغلق 14 يومًا (إن كان الحساب شخصيًا).
7. اختبار على جهاز حقيقي: Health Connect، إشعارات، رجوع، لوحة مفاتيح، كاميرا/ميكروفون.
