import {chromium,staticServer} from '/home/claude/khatwa-android/docs/technical-audit/evidence/lib.mjs';
const s=await staticServer(8083);const b=await chromium.launch(),c=await b.newContext({viewport:{width:320,height:568}}),p=await c.newPage();await p.goto('http://127.0.0.1:8083/');await p.waitForFunction(()=>typeof S!=='undefined');
await p.evaluate(`S.prof.ob=1;S.prof.name='ا';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';S.prof.lvl='b';S.prof.eq='gym';S.prof.dpw=4;S.bw[TD()]=85;calcTargets();genPlan();render()`);
console.log(JSON.stringify(await p.evaluate(()=>{const o=[];document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(r.right>innerWidth+1||r.left<-1)o.push((e.className||e.tagName)+':'+Math.round(r.left)+'..'+Math.round(r.right))});return o.slice(0,8)})));
await b.close();s.close();process.exit(0)
