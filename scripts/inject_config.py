#!/usr/bin/env python3
"""يكتب www/config.js وقت البناء من متغيرات البيئة، ويرفض أي مفتاح سرّي.

  SB_URL=https://xxxx.supabase.co SB_ANON_KEY=<publishable/anon> python3 scripts/inject_config.py [--out www/config.js]

- المفتاح الذي يدخل التطبيق هو المفتاح العام (anon / sb_publishable_) فقط. أي مفتاح service_role أو sb_secret_ يُرفض فيفشل البناء.
- لا يُطبع المفتاح في السجل (يُطبع طرفاه فقط).
- متغيرات اختيارية: SB_REDIRECT (للتوثيق فقط؛ رابط العودة ثابت في التطبيق sijil://auth ويُسمح به من لوحة Supabase)، SUPPORT_EMAIL.
- إن لم يُعطَ SB_URL وSB_ANON_KEY يبقى config.js كما هو (الحسابات غير مفعّلة، وضع الزائر يعمل)."""
import os,sys,json,base64,re
def die(m):
    print('::error title=inject_config::'+m);sys.exit(1)
def check_key(k):
    if k.startswith('sb_secret_'):die('المفتاح من نوع sb_secret_ (سرّي). لا يوضع في التطبيق.')
    if not (k.startswith('sb_publishable_') or k.count('.')==2):die('صيغة المفتاح غير معروفة؛ المتوقع anon JWT أو sb_publishable_.')
    if k.count('.')==2:
        try:
            p=k.split('.')[1];p+='='*(-len(p)%4)
            role=json.loads(base64.urlsafe_b64decode(p)).get('role')
        except Exception:die('تعذّرت قراءة المفتاح (JWT).')
        if role!='anon':die('دور المفتاح "%s" وليس anon. مفتاح service_role ممنوع داخل التطبيق.'%role)
def main():
    out='www/config.js'
    if '--out' in sys.argv:out=sys.argv[sys.argv.index('--out')+1]
    url=os.environ.get('SB_URL','').strip();key=os.environ.get('SB_ANON_KEY','').strip()
    if not url and not key:
        print('::notice title=inject_config::SB_URL/SB_ANON_KEY غير مضبوطين: الحسابات غير مفعّلة في هذه النسخة (وضع الزائر يعمل).');return
    if not url or not key:die('يلزم SB_URL وSB_ANON_KEY معًا.')
    if not re.fullmatch(r'https://[a-z0-9-]+\.supabase\.(co|in)',url):die('SB_URL غير صالح: المتوقع https://<مشروع>.supabase.co')
    check_key(key)
    src=open(out,encoding='utf8').read()
    def setv(s,name,val):
        return re.sub(r'(\b%s\s*:\s*)"[^"]*"'%name,lambda m:m.group(1)+json.dumps(val),s,count=1)
    new=setv(setv(src,'sbUrl',url),'sbKey',key)
    se=os.environ.get('SUPPORT_EMAIL','').strip()
    if se:new=setv(new,'supportEmail',se)
    if 'sbUrl:'+json.dumps(url) not in new.replace(' ',''):die('تعذّر ضبط sbUrl في '+out)
    open(out,'w',encoding='utf8').write(new)
    print('config written: sbUrl=%s sbKey=%s…%s (public key, role ok)'%(url,key[:6],key[-4:]))
main()
