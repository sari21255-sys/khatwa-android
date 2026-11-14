#!/usr/bin/env python3
"""يحاكي سلوك Windows في الكتابة النصية (newline=None تُترجم \\n إلى \\r\\n) ويشغّل gen-headers.py تحته.
الاستعمال: python3 tests/crlf-sim.py tools/gen-headers.py   → يجب ألا يحتوي _headers الناتج على CR.
(الاختبار الحقيقي على Windows في CI: job build-reproducible. هذا ضابط محلي مع ضابط سلبي للنسخة القديمة.)"""
import builtins,io,os,runpy,shutil,sys,tempfile
script=os.path.abspath(sys.argv[1]);root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tmp=tempfile.mkdtemp();shutil.copytree(os.path.join(root,'pwa'),os.path.join(tmp,'pwa'))
_open=io.open
def win_open(f,mode='r',buffering=-1,encoding=None,errors=None,newline=None,*a,**k):
    if 'w' in mode and 'b' not in mode and newline is None: newline='\r\n'   # سلوك النص على Windows
    return _open(f,mode,buffering,encoding,errors,newline,*a,**k)
builtins.open=win_open
sys.argv=[script,os.path.join(tmp,'pwa')]
try: runpy.run_path(script,run_name='__main__')
finally: builtins.open=_open
b=open(os.path.join(tmp,'pwa','_headers'),'rb').read();shutil.rmtree(tmp)
print(('CR موجود' if b'\r' in b else 'LF فقط'),'—',script)
sys.exit(1 if b'\r' in b else 0)
