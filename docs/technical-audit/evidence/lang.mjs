import {chromium,staticServer} from '/home/claude/khatwa-android/docs/technical-audit/evidence/lib.mjs';
const s=await staticServer(8084);const b=await chromium.launch(),c=await b.newContext({viewport:{width:390,height:844}}),p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('http://127.0.0.1:8084/');await p.waitForFunction(()=>typeof S!=='undefined');
await p.evaluate(`S.prof.ob=1;S.prof.name='ا';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';S.prof.lvl='b';S.prof.eq='gym';S.prof.dpw=4;S.bw[TD()]=85;calcTargets();genPlan();render()`);
const out={};
for(const m of ['bi','ar','en']){await p.evaluate(m=>{ACT.biset({dataset:{v:m}});render()},m);await p.waitForTimeout(250);
 out[m]=await p.evaluate(()=>{const t=document.body.innerText;const ar=(t.match(/[؀-ۿ]/g)||[]).length,la=(t.match(/[A-Za-z]/g)||[]).length;return{ar,la,cls:document.body.className}});
 for(const t of ['train','food','pg','me','club','ex']){await p.evaluate(t=>{S.tab=t;S.sub=null;render()},t);await p.waitForTimeout(60)}
 await p.evaluate(()=>{S.tab='dash';render()});}
console.log(JSON.stringify(out),errs);
await b.close();s.close();process.exit(0)
