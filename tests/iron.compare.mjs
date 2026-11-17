// مقارنة قبل/بعد لقراءة التقدّم: lifts() القديمة (من S.done) مقابل irLifts() الجديدة (من حصص S.sx المكتملة فقط).
// بيانات اصطناعية تمثّل: حصة مكتملة، حصة جزئية، حصة حرة مكتملة، وسجلات قديمة بملخص فقط. تُنتج docs/iron/COMPARE.md وتتحقق من الفروق المتوقعة.
import path from 'node:path';import fs from 'node:fs';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)(path.join(process.env.NODE_PATH||'','playwright'));
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let fails=0;const rec=(id,name,ok,ev)=>{if(!ok)fails++;console.log((ok?'PASS ':'FAIL ')+id+' '+name+(ok?'':' — '+ev))};
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},timezoneId:'Asia/Riyadh'});await ctx.clock.install({time:new Date('2026-11-16T10:00:00+03:00')});
const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
await p.goto('file://'+ROOT+'/www/index.html');await p.waitForFunction(()=>typeof S!=='undefined'&&typeof irHist==='function');await p.waitForTimeout(300);
const R=await p.evaluate(()=>{
 S.prof.ob=1;const mk=(id,wk,date,st,ex,extra)=>S.sx[id]=Object.assign({id,wk,date,ts:Date.parse(date+'T08:00:00Z'),up:Date.parse(date+'T09:00:00Z'),dy:2,kd:'m',t:'صدر',st,sec:3000,vol:0,ex},extra||{},st==='c'?{fin:Date.parse(date+'T09:00:00Z')}:{});
 const sets=(a,t0)=>a.map((q,i)=>({i:'s'+t0+i,w:q[0],r:q[1],ty:q[2]||'n',rp:0,at:t0+i*1000,up:t0+i*1000}));
 const EX=(k,n,tg,a,dn,t0)=>({k,id:k.split('|')[2],n,d:2,tg,tr:8,o:0,sets:sets(a,t0),rm:[],dn:dn?1:0,sk:0});
 mk('sA','2026-10-31','2026-11-02','c',[EX('2026-10-31|2|e1','بنش برس بار',3,[[20,10,'w'],[50,10],[52.5,8],[52.5,8]],1,1000),EX('2026-10-31|2|e2','سحب علوي',3,[[40,10],[45,10],[45,9]],1,2000)]);
 S.done['2026-10-31|2|e1']={n:'بنش برس بار',w:52.5,r:8,date:'2026-11-02'};S.done['2026-10-31|2|e2']={n:'سحب علوي',w:45,r:9,date:'2026-11-02'};
 mk('sB','2026-11-07','2026-11-09','p',[EX('2026-11-07|2|e1','بنش برس بار',4,[[55,6],[55,6],[55,5],[55,5]],1,5000),EX('2026-11-07|2|e2','سحب علوي',4,[[45,8]],0,6000)]);
 S.done['2026-11-07|2|e1']={n:'بنش برس بار',w:55,r:5,date:'2026-11-09'};
 mk('sC','2026-11-14','2026-11-12','c',[{k:'F|sC|1',id:'f1',n:'تفتيح كابل',d:4,tg:0,tr:12,o:0,sets:sets([[20,12],[20,12],[22.5,10]],9000),rm:[],dn:0,sk:0}],{ar:1,fr:1,dy:undefined});
 S.done['2026-10-10|1|zz']={n:'سكوات',w:80,r:8,date:'2026-10-13'};S.done['2026-10-10|2|yy']={n:'بنش برس بار',w:47.5,r:10,date:'2026-10-13'};
 const old=lifts(),H=irHist(),nw=irLifts(H);
 return{old,nw,keys:Object.keys(H),ids:Object.keys(H).map(k=>[k,H[k].n,H[k].pts.length]),mus:irMuscle('2026-10-31')}});
const rows=[];const names=Array.from(new Set(Object.keys(R.old).concat(Object.keys(R.nw)))).sort();
const fmt=a=>a?a.map(x=>x.w+'×'+x.r+' ('+x.date.slice(5)+(x.leg?' ملخص':'')+')').join(' ← '):'—';
names.forEach(n=>rows.push('| '+n+' | '+fmt(R.old[n])+' | '+fmt(R.nw[n])+' |'));
const bench=R.nw['بنش برس بار']||[],pull=R.nw['سحب علوي']||[];
rec('C1','الحصة الجزئية (55×5 يوم 11-09) لا تدخل الحساب الجديد وكانت تدخل القديم',(R.old['بنش برس بار']||[]).some(x=>x.date==='2026-11-09')&&!bench.some(x=>x.date==='2026-11-09'),JSON.stringify({o:R.old['بنش برس بار'],n:bench}));
rec('C2','الحصة المكتملة: أفضل مجموعة (52.5×8) لا آخر مجموعة، بنفس الوزن هنا',bench.some(x=>x.date==='2026-11-02'&&x.w===52.5&&x.r===8&&!x.leg),JSON.stringify(bench));
rec('C3','فرق متوقع: سحب علوي كان 45×9 (آخر مجموعة) وصار 45×10 (أفضل مجموعة بنفس الوزن)',(R.old['سحب علوي']||[])[0].r===9&&pull[0].w===45&&pull[0].r===10,JSON.stringify({o:R.old['سحب علوي'],n:pull}));
rec('C4','السجل القديم بملخص فقط يظهر كملخص تاريخي (leg) ولا تُولَّد له مجموعات',(R.nw['سكوات']||[]).length===1&&R.nw['سكوات'][0].leg===1&&(R.nw['بنش برس بار']||[]).some(x=>x.leg===1&&x.date==='2026-10-13'),JSON.stringify(R.nw['سكوات']));
rec('C5','الحصة الحرة المكتملة (بلا S.done) تظهر الآن في التقدّم ولم تكن تظهر',!R.old['تفتيح كابل']&&(R.nw['تفتيح كابل']||[]).length===1&&R.nw['تفتيح كابل'][0].w===22.5,JSON.stringify(R.nw['تفتيح كابل']));
rec('C6','هوية النسخة: «بنش برس بار» من المكتبة بمعرّف ثابت (لا رقم سطر)، و«سحب علوي» نسخة مستقلة',R.ids.some(x=>x[1]==='بنش برس بار'&&/^L\.barbell-bench-press\.bb$/.test(x[0]))&&R.ids.every(x=>!/^L\.x\d+/.test(x[0])),JSON.stringify(R.ids));
rec('C7','لا أخطاء سكربت',p.errs.length===0,p.errs.join('|'));
const md=`# مقارنة قراءة التقدّم قبل التغيير وبعده

بيانات اصطناعية: حصة مكتملة (11-02)، حصة جزئية (11-09)، حصة حرة مكتملة (11-12)، وسجلان قديمان بملخص فقط (10-13). ينتجها \`tests/iron.compare.mjs\`.

| التمرين | قبل: \`lifts()\` من S.done | بعد: \`irLifts()\` من الحصص المكتملة |
|---|---|---|
${rows.join('\n')}

## الفروق المتوقعة
1. **الحصص الجزئية لم تعد تدخل الرسوم والتقارير.** كان إنجاز التمرين يُسجَّل في S.done ولو بقيت الحصة جزئية، فدخل 55×5 (11-09). الحصة الجزئية تبقى ظاهرة في «السجل» بمجموعاتها وحالتها.
2. **أفضل مجموعة بدل آخر مجموعة.** كان S.done يحفظ آخر مجموعة فقط، والآن تُقرأ كل مجموعات الحصة وتُعرض أثقل مجموعة (وعند تساوي الوزن الأكثر تكرارًا). مثال: سحب علوي 45×9 صار 45×10.
3. **الحصص الحرة والتمارين المضافة** (بلا خانة في الخطة وبلا S.done) تظهر الآن.
4. **السجلات القديمة بملخص فقط** تبقى كنقطة «ملخص تاريخي» بلا مجموعات مولَّدة، ولا تدخل عدّ المجموعات الأسبوعية للعضلات.
5. لا فرق في الحصة المكتملة التي كان آخر مجموعتها هي الأثقل (بنش برس بار 52.5×8 في 11-02).
`;
fs.writeFileSync(ROOT+'/docs/iron/COMPARE.md',md);
await b.close();console.log(fails?`\n${fails} FAIL`:'\nall PASS');process.exit(fails?1:0)
