#!/usr/bin/env python3
"""يحقن app/tracks.src.js و app/tracks.css في app/fitness-tracker.html (idempotent، بين علامتين)."""
import os,re
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P=os.path.join(R,'app/fitness-tracker.html')
s=open(P,encoding='utf8').read()
OV=['tracks','ready','fixes','accounts','iron','simplify','quicklog','bodypick','album','food','scene']
def rd(ext,name):
    f=os.path.join(R,'app/%s.%s'%(name,ext))
    return open(f,encoding='utf8').read().rstrip('\n') if os.path.exists(f) else None
js='\n'.join(x for x in (rd('src.js',n) for n in OV) if x)
css='\n'.join(x for x in (rd('css',n) for n in OV) if x)
J0,J1='/*TRK-JS-BEGIN*/','/*TRK-JS-END*/'
C0,C1='/*TRK-CSS-BEGIN*/','/*TRK-CSS-END*/'
def put(s,a,b,body,anchor,before=True):
    blk=a+'\n'+body+'\n'+b+'\n'
    if a in s:
        return re.sub(re.escape(a)+r'.*?'+re.escape(b)+r'\n',lambda m:blk,s,flags=re.S)
    i=s.index(anchor) if before else s.index(anchor)+len(anchor)
    if a==J0: i+=1
    return s[:i]+blk+s[i:]
s=put(s,C0,C1,css,'</style>')
s=put(s,J0,J1,js,'\nrender();\nif(document.fonts){document.fonts.ready')
open(P,'w',encoding='utf8').write(s)
print('ok')
