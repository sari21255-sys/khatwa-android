import json,sys
host=sys.argv[1]; b='https://'+host
I='https://raw.githubusercontent.com/sari21255-sys/khatwa-android/main/www'
ver=int(sys.argv[2]) if len(sys.argv)>2 else 1
m={"packageId":"com.khatwa.twa","host":host,"name":"خطوة","launcherName":"خطوة","display":"standalone","orientation":"portrait",
"themeColor":"#000000","themeColorDark":"#000000","navigationColor":"#fafafa","navigationColorDark":"#000000","navigationDividerColor":"#fafafa","navigationDividerColorDark":"#000000",
"backgroundColor":"#fafafa","enableNotifications":False,"startUrl":"/index.html?source=twa","iconUrl":I+"/icons/icon-512.png","maskableIconUrl":I+"/icons/icon-512-maskable.png",
"splashScreenFadeOutDuration":300,"signingKey":{"path":"./android.keystore","alias":"khatwa"},"appVersionName":"1.0."+str(ver),"appVersionCode":ver,
"shortcuts":[],"generatorApp":"bubblewrap-cli","webManifestUrl":I+"/manifest.webmanifest","fallbackType":"customtabs","features":{},"alphaDependencies":{"enabled":False},
"enableSiteSettingsShortcut":True,"isChromeOSOnly":False,"isMetaQuest":False,"fullScopeUrl":b+"/","minSdkVersion":24,"orientation":"portrait","displayOverride":["standalone"]}
json.dump(m,open('twa-manifest.json','w'),ensure_ascii=False,indent=2)
