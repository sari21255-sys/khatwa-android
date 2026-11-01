#!/usr/bin/env python3
"""يعدّل مشروع أندرويد المُولَّد: أذونات Health Connect والإشعارات، minSdk، الأيقونات."""
import os,re,sys
from pathlib import Path
A=Path('android');M=A/'app/src/main/AndroidManifest.xml'
m=M.read_text(encoding='utf-8')
PERMS=['android.permission.health.READ_STEPS','android.permission.health.READ_HEART_RATE','android.permission.health.READ_DISTANCE',
 'android.permission.health.READ_TOTAL_CALORIES_BURNED','android.permission.health.READ_ACTIVE_CALORIES_BURNED','android.permission.health.READ_SLEEP',
 'android.permission.POST_NOTIFICATIONS','android.permission.SCHEDULE_EXACT_ALARM','android.permission.RECEIVE_BOOT_COMPLETED']
add=''
for p in PERMS:
    if p not in m: add+='    <uses-permission android:name="%s" />\n'%p
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
# اتجاه RTL
if 'android:supportsRtl' not in m: m=m.replace('<application','<application android:supportsRtl="true"',1)
M.write_text(m,encoding='utf-8')
# minSdk 26 لـHealth Connect
V=A/'variables.gradle'
if V.exists():
    v=V.read_text();v=re.sub(r'minSdkVersion\s*=\s*\d+','minSdkVersion = 26',v);V.write_text(v)
# اسم عربي للتطبيق
S=A/'app/src/main/res/values/strings.xml'
if S.exists():
    t=S.read_text(encoding='utf-8');t=re.sub(r'(<string name="app_name">)[^<]*',r'\1خطوة',t);t=re.sub(r'(<string name="title_activity_main">)[^<]*',r'\1خطوة',t);S.write_text(t,encoding='utf-8')
# الأيقونات
try:
    from PIL import Image
    src=Image.open('www/icons/icon-512.png').convert('RGBA')
    res=A/'app/src/main/res'
    for d,sz in {'mdpi':48,'hdpi':72,'xhdpi':96,'xxhdpi':144,'xxxhdpi':192}.items():
        o=res/('mipmap-'+d)
        if o.exists():
            im=src.resize((sz,sz),Image.LANCZOS)
            for n in ('ic_launcher.png','ic_launcher_round.png','ic_launcher_foreground.png'): im.save(o/n)
    for f in (res/'mipmap-anydpi-v26').glob('*.xml'): f.unlink()
    print('icons ok')
except Exception as e:
    print('icons skipped:',e)
print('patched')
