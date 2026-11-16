#!/usr/bin/env python3
"""يعدّل مشروع أندرويد المُولَّد: أذونات Health Connect والإشعارات، minSdk، الأيقونات."""
import os,re,sys
from pathlib import Path
A=Path('android');M=A/'app/src/main/AndroidManifest.xml'
m=M.read_text(encoding='utf-8')
# الأذونات المطلوبة فعليًا: قراءة Health Connect للأنواع التي يطلبها التطبيق (HC_READ في الكود) والإشعارات المحلية.
# إضافة capgo 7.2.15 تدعم steps وcalories (=ActiveCaloriesBurned) وdistance وheartRate وweight فقط: لا TOTAL_CALORIES ولا SLEEP.
# RECEIVE_BOOT_COMPLETED تضيفه إضافة الإشعارات المحلية لإعادة جدولة التذكيرات بعد إعادة التشغيل.
PERMS=['android.permission.health.READ_STEPS','android.permission.health.READ_HEART_RATE','android.permission.health.READ_DISTANCE',
 'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
 'android.permission.POST_NOTIFICATIONS','android.permission.ACCESS_COARSE_LOCATION','android.permission.ACTIVITY_RECOGNITION']
# أذونات تُزال من الملف المدموج (تأتي من الإضافات أو غير مستعملة). لا كتابة إلى Health Connect، ولا كاميرا/ميكروفون/موقع دقيق (الموقع التقريبي COARSE مسموح لـ«استخدم موقعي» أثناء الاستخدام فقط)
# لأن الميزات المقابلة (مسح الباركود، الإملاء الصوتي، تحديد الموقع) غير مختبرة على جهاز فتُعطَّل في نسخة أندرويد.
REMOVE=['android.permission.health.WRITE_STEPS','android.permission.health.WRITE_DISTANCE','android.permission.health.WRITE_ACTIVE_CALORIES_BURNED',
 'android.permission.health.WRITE_HEART_RATE','android.permission.health.READ_WEIGHT','android.permission.health.WRITE_WEIGHT',
 'android.permission.health.READ_TOTAL_CALORIES_BURNED','android.permission.health.READ_SLEEP','android.permission.SCHEDULE_EXACT_ALARM','android.permission.USE_EXACT_ALARM','android.permission.CAMERA','android.permission.RECORD_AUDIO',
 'android.permission.ACCESS_FINE_LOCATION','android.permission.READ_EXTERNAL_STORAGE','android.permission.WRITE_EXTERNAL_STORAGE']
if 'xmlns:tools' not in m: m=m.replace('<manifest ','<manifest xmlns:tools="http://schemas.android.com/tools" ',1)
add=''
for p in PERMS:
    if 'name="%s"'%p not in m: add+='    <uses-permission android:name="%s" />\n'%p
for p in REMOVE:
    add+='    <uses-permission android:name="%s" tools:node="remove" />\n'%p
if 'com.google.android.apps.healthdata' not in m:
    add+='    <queries><package android:name="com.google.android.apps.healthdata" /></queries>\n'
m=m.replace('</manifest>',add+'</manifest>')
# سبب طلب أذونات الصحة (يطلبه Health Connect) على النشاط الرئيسي
IF='''
            <intent-filter>
                <action android:name="androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" />
            </intent-filter>
'''
if 'ACTION_SHOW_PERMISSIONS_RATIONALE' not in m:
    m=re.sub(r'(<activity[^>]*MainActivity[^>]*>)',r'\1'+IF.replace('\\','\\\\'),m,count=1)
# روابط تأكيد البريد واستعادة كلمة المرور: sijil://auth (تُفتح في التطبيق وتصل إلى appUrlOpen)
IF2='''
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="sijil" android:host="auth" />
            </intent-filter>
'''
if 'android:scheme="sijil"' not in m:
    m=re.sub(r'(<activity[^>]*MainActivity[^>]*>)',r'\1'+IF2.replace('\\','\\\\'),m,count=1)
# اتجاه RTL
if 'android:supportsRtl' not in m: m=m.replace('<application','<application android:supportsRtl="true"',1)
# لا نسخ احتياطي تلقائي إلى Google Drive: بيانات الصحة تُنقل بآليتي التصدير/الاستيراد والمزامنة المعتمدتين في التطبيق فقط
if re.search(r'android:allowBackup="[^"]*"',m): m=re.sub(r'android:allowBackup="[^"]*"','android:allowBackup="false"',m,count=1)
else: m=m.replace('<application','<application android:allowBackup="false"',1)
assert 'android:allowBackup="false"' in m
M.write_text(m,encoding='utf-8')
# minSdk 26 لـHealth Connect
V=A/'variables.gradle'
if V.exists():
    v=V.read_text()
    # minSdk 26 لـHealth Connect. compileSdk/targetSdk 36 إلزامي لتطبيقات وتحديثات Google Play منذ 2026-08-31 (انظر docs/technical-audit/P0-IMPLEMENTATION-REPORT.md)
    for k,val in (('minSdkVersion',26),('compileSdkVersion',36),('targetSdkVersion',36)):
        v,n=re.subn(k+r'\s*=\s*\d+',k+' = %d'%val,v)
        assert n==1,'لم يُعثر على '+k+' في variables.gradle'
    V.write_text(v)
    GP=A/'gradle.properties'
    gp=GP.read_text() if GP.exists() else ''
    if 'suppressUnsupportedCompileSdk' not in gp: GP.write_text(gp.rstrip('\n')+'\nandroid.suppressUnsupportedCompileSdk=36\n')
    # إصدار AGP الذي يدعم compileSdk 36 (يتطلب Gradle 8.11.1+ وهو ما يولّده Capacitor 7)
    BG=A/'build.gradle'
    b=BG.read_text();b,n=re.subn(r"(com\.android\.tools\.build:gradle:)[\d.]+",r"\g<1>8.9.1",b);BG.write_text(b);print('agp',n)
# اسم عربي للتطبيق
S=A/'app/src/main/res/values/strings.xml'
if S.exists():
    t=S.read_text(encoding='utf-8');t=re.sub(r'(<string name="app_name">)[^<]*',r'\1SIJIL',t);t=re.sub(r'(<string name="title_activity_main">)[^<]*',r'\1SIJIL',t);S.write_text(t,encoding='utf-8')
# الأيقونات: أصول SIJIL الجاهزة (تكيفية: خلفية #101010 وطبقة أمامية للشعار) تُنسخ فوق موارد Capacitor
import shutil
RES=A/'app/src/main/res';SRC=Path('app/brand/android-res')
if SRC.exists() and RES.exists():
    for f in RES.glob('mipmap-*/ic_launcher*'):
        if f.is_file(): f.unlink()
    for f in SRC.rglob('*'):
        if f.is_file():
            t=RES/f.relative_to(SRC);t.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,t)
    for sp in RES.glob('drawable*/splash.png'):
        shutil.copy2('app/brand/store/splash-1080x1920.png',sp)
    print('icons ok (SIJIL adaptive) + splash')
else:
    print('icons skipped: missing',SRC,RES)
# إضافة عدّاد خطوات الهاتف الأصلية (من مصدر المستودع) وتسجيلها في MainActivity
PJ=A/'app/src/main/java/com/khatwa/app'
if PJ.exists():
    shutil.copy2('scripts/native/StepCounterPlugin.java',PJ/'StepCounterPlugin.java')
    ma=PJ/'MainActivity.java';t=ma.read_text(encoding='utf-8')
    if 'StepCounterPlugin' not in t:
        t=re.sub(r'public class MainActivity extends BridgeActivity\s*\{\s*\}','''public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(StepCounterPlugin.class);
        super.onCreate(savedInstanceState);
    }
}''',t)
        assert 'registerPlugin(StepCounterPlugin' in t,'MainActivity لم يُعدَّل'
        ma.write_text(t,encoding='utf-8')
    print('StepCounter plugin injected')
else: print('StepCounter skipped: no',PJ)
# رقم الإصدار تلقائيًا من رقم تشغيل الـCI (يزداد في كل بناء، وهو شرط Google Play)
G=A/'app/build.gradle'
if G.exists():
    n=int(os.environ.get('GITHUB_RUN_NUMBER','1'))
    g=G.read_text();g=re.sub(r'versionCode\s+\d+','versionCode %d'%(100+n),g);g=re.sub(r'versionName\s+"[^"]*"','versionName "1.0.%d"'%n,g);G.write_text(g)
    print('versionCode',100+n)
print('patched')
