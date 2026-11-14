#!/usr/bin/env python3
"""يولّد pwa/_headers (ترويسات الأمان لـNetlify) من محتوى الصفحات الفعلي:
- يحسب SHA-256 لكل سكربت مضمّن في صفحات HTML فتُسمح هذه السكربتات بالضبط بلا unsafe-inline في script-src.
- يقرأ pwa/config.js ويضيف أصول (origins) aiUrl وsyncUrl وsbUrl إلى connect-src.
يُشغَّل بعد كل تعديل على index.html/install.html/privacy.html/config.js:  python3 tools/gen-headers.py pwa"""
import base64,hashlib,re,sys,glob,os
from urllib.parse import urlparse
d=sys.argv[1] if len(sys.argv)>1 else 'pwa'
hashes=[]
for f in sorted(glob.glob(d+'/*.html')):
    t=open(f,encoding='utf-8').read()
    for m in re.finditer(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>',t,re.S):
        h="'sha256-"+base64.b64encode(hashlib.sha256(m.group(1).encode('utf-8')).digest()).decode()+"'"
        if h not in hashes: hashes.append(h)
cfg=open(d+'/config.js',encoding='utf-8').read() if os.path.exists(d+'/config.js') else ''
configured=False
conn=["'self'","https://world.openfoodfacts.org","https://*.openfoodfacts.org"]
for k in ('aiUrl','syncUrl','sbUrl'):
    m=re.search(k+r'\s*:\s*"([^"]+)"',cfg)
    if m:
        u=urlparse(m.group(1))
        if u.scheme in('https','http') and u.netloc:
            configured=True
            o=u.scheme+'://'+u.netloc
            if o not in conn: conn.append(o)
            if k=='sbUrl': conn.append('wss://'+u.netloc)
# أصول افتراضية عند عدم ضبط config.js بعد: نطاقات Cloudflare Workers وSupabase
if not configured: conn+= ['https://*.workers.dev','https://*.supabase.co','wss://*.supabase.co']
csp="; ".join([
 "default-src 'self'",
 "script-src 'self' "+" ".join(hashes),
 "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
 "font-src 'self' data: https://fonts.gstatic.com",
 "img-src 'self' data: blob: https:",
 "media-src 'self' blob: data:",
 "connect-src "+" ".join(conn),
 "worker-src 'self'","manifest-src 'self'","object-src 'none'","base-uri 'self'","form-action 'self'","frame-ancestors 'none'","upgrade-insecure-requests"])
sec=f"""/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Permissions-Policy: camera=(self), microphone=(self), geolocation=(self), payment=(), usb=(), bluetooth=(), serial=(), interest-cohort=()
  Content-Security-Policy: {csp}

/sw.js
  Cache-Control: no-cache

/manifest.webmanifest
  Content-Type: application/manifest+json; charset=utf-8
  Cache-Control: no-cache

/assetlinks.json
  Content-Type: application/json
  Access-Control-Allow-Origin: *

/.well-known/assetlinks.json
  Content-Type: application/json
  Access-Control-Allow-Origin: *
"""
open(d+'/_headers','w',encoding='utf-8').write(sec)
print('written',d+'/_headers','inline-script hashes:',len(hashes))
