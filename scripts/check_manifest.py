#!/usr/bin/env python3
"""يفحص APK ناتجًا عبر aapt2 ويتحقق من الأذونات وallowBackup وdebuggable وtargetSdk.
الاستعمال: python3 scripts/check_manifest.py app.apk --release   (أو --debug)"""
import re,subprocess,sys,glob,os
apk=sys.argv[1];mode=sys.argv[2].lstrip('-') if len(sys.argv)>2 else 'release'
sdk=os.environ.get('ANDROID_HOME') or os.environ.get('ANDROID_SDK_ROOT') or '/usr/local/lib/android/sdk'
aapt=sorted(glob.glob(sdk+'/build-tools/*/aapt2'),key=lambda p:[int(x) for x in re.findall(r'\d+',p.split('build-tools/')[1].split('/')[0])])[-1]
bad=subprocess.run([aapt,'dump','badging',apk],capture_output=True,text=True,check=True).stdout
xml=subprocess.run([aapt,'dump','xmltree','--file','AndroidManifest.xml',apk],capture_output=True,text=True,check=True).stdout
perms=sorted(set(re.findall(r"uses-permission(?:-sdk-23)?: name='([^']+)'",bad)))
sd=re.findall(r"(\w*[sS]dkVersion\w*):'(\d+)'",bad)
print('سطور SDK:',sd)
tm=re.search(r"targetSdkVersion:'(\d+)'",bad);tsdk=int(tm.group(1)) if tm else 0
mm=re.search(r"(?:^|\n)(?:min)?[sS]dkVersion:'(\d+)'",bad);msdk=int(mm.group(1)) if mm else None
debuggable='application-debuggable' in bad
m=re.search(r'android:allowBackup\([^)]*\)=(\S+)',xml);backup=m.group(1) if m else 'غير مذكور (الافتراضي true)'
ALLOWED={'android.permission.INTERNET','android.permission.POST_NOTIFICATIONS','android.permission.RECEIVE_BOOT_COMPLETED','android.permission.WAKE_LOCK','android.permission.ACCESS_COARSE_LOCATION',
 'android.permission.health.READ_STEPS','android.permission.health.READ_HEART_RATE','android.permission.health.READ_DISTANCE',
 'android.permission.health.READ_ACTIVE_CALORIES_BURNED'}
print('ملف:',apk);print('minSdk',msdk,'targetSdk',tsdk,'debuggable',debuggable,'allowBackup',backup)
print('الأذونات:');[print('  ',p) for p in perms]
errs=[]
extra=[p for p in perms if p not in ALLOWED and not p.endswith('.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION')]
if extra: errs.append('أذونات خارج القائمة المسموحة: '+', '.join(extra))
if tsdk<36: errs.append('targetSdk أقل من 36')
if msdk is not None and msdk<26: errs.append('minSdk أقل من 26 (Health Connect)')
if backup not in ('false','0x0'): errs.append('allowBackup ليس false: '+backup)
if mode=='release' and debuggable: errs.append('نسخة Release قابلة للتصحيح')
if 'android.permission.ACCESS_FINE_LOCATION' in perms: errs.append('الموقع الدقيق موجود (المسموح التقريبي فقط)')
if any('ACCESS_BACKGROUND_LOCATION' in p for p in perms): errs.append('موقع الخلفية موجود')
if any('WRITE' in p and 'health' in p for p in perms): errs.append('إذن كتابة Health Connect موجود')
if errs: print('FAIL:');[print('  -',e) for e in errs];sys.exit(1)
print('PASS: الأذونات متوافقة مع الوظائف وسياسة الخصوصية')
