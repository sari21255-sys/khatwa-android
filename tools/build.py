#!/usr/bin/env python3
"""يبني ملفات التطبيق من المصدر داخل المستودع (مسارات نسبية، بلا اعتماد على خارج المستودع).

  python3 tools/build.py            يكتب www/index.html و pwa/index.html ثم يعيد توليد pwa/_headers
  python3 tools/build.py --check    يبني في مجلد مؤقت ويقارن بالملفات المرجعية؛ يخرج برمز 1 عند أي اختلاف

app/fitness-tracker.html : المصدر. سطراه الأولان (meta/title خاصان ببيئة التحرير) يُستبدلان بـ app/head.html.
app/head.html            : ترويسة الصفحة (سطران).
الإخراج: LF فقط، UTF-8، بلا BOM.
"""
import os,sys,subprocess,tempfile,shutil,hashlib
try: sys.stdout.reconfigure(encoding='utf-8',errors='replace'); sys.stderr.reconfigure(encoding='utf-8',errors='replace')
except Exception: pass
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(p):
    b=open(p,'rb').read()
    if b'\r' in b: b=b.replace(b'\r\n',b'\n')
    return b.decode('utf8')
SW='<script>if("serviceWorker" in navigator&&location.protocol.indexOf("http")===0)navigator.serviceWorker.register("sw.js").catch(function(){})</script>\n'
TAIL='</body></html>\n'
def compose(cfg,tail):
    head=rd(os.path.join(ROOT,'app/head.html')).rstrip('\n').split('\n')
    assert len(head)==2 and head[0].startswith('<!doctype'),'app/head.html يجب أن يحوي سطرين يبدأ أولهما بـ<!doctype'
    body=rd(os.path.join(ROOT,'app/fitness-tracker.html')).rstrip('\n').split('\n')[2:]
    out=list(head);done=False
    for l in body:
        out.append(l)
        if not done and l=='</style>':
            out.append(cfg);done=True
    assert done,'لم يوجد </style> في المصدر'
    return '\n'.join(out)+'\n'+tail
def outputs():
    return {'www/index.html':compose('<script src="config.js"></script>',TAIL),
            'pwa/index.html':compose('<script src="config.js"></script>',SW+TAIL)}
def write(root,files):
    for rel,txt in files.items():
        p=os.path.join(root,rel);os.makedirs(os.path.dirname(p),exist_ok=True)
        open(p,'w',encoding='utf8',newline='\n').write(txt)
SUMFILES=['www/index.html','pwa/index.html','pwa/_headers']
def sums(root):
    return ''.join(hashlib.sha256(open(os.path.join(root,f),'rb').read()).hexdigest()+'  '+f+'\n' for f in SUMFILES)
def main():
    files=outputs()
    if '--check' in sys.argv:
        bad=0
        tmp=tempfile.mkdtemp()
        try:
            write(tmp,files)
            shutil.copytree(os.path.join(ROOT,'pwa'),os.path.join(tmp,'pwa'),dirs_exist_ok=True)
            write(tmp,files)
            subprocess.check_call([sys.executable,os.path.join(ROOT,'tools/gen-headers.py'),os.path.join(tmp,'pwa')],stdout=subprocess.DEVNULL)
            for rel in list(files)+['pwa/_headers']:
                a=open(os.path.join(tmp,rel),'rb').read()
                b=open(os.path.join(ROOT,rel),'rb').read()
                if b'\r' in b: print('CRLF في',rel);bad=1
                if a!=b:
                    print('اختلاف مولَّد/مرجعي:',rel,hashlib.sha256(a).hexdigest()[:12],hashlib.sha256(b).hexdigest()[:12]);bad=1
            if sums(tmp)!=open(os.path.join(ROOT,'tools/build.sha256'),'rb').read().decode('utf-8'):
                print('tools/build.sha256 لا يطابق المخرجات المولّدة');bad=1
        finally: shutil.rmtree(tmp,ignore_errors=True)
        if bad: print('FAIL: المخرجات المولّدة لا تطابق الملفات المرجعية. شغّل: python3 tools/build.py');sys.exit(1)
        print('OK: المخرجات المولّدة تطابق المرجعية (index و _headers)');return
    write(ROOT,files)
    subprocess.check_call([sys.executable,os.path.join(ROOT,'tools/gen-headers.py'),os.path.join(ROOT,'pwa')])
    open(os.path.join(ROOT,'tools/build.sha256'),'w',encoding='utf8',newline='\n').write(sums(ROOT))
    print('built')
main()
