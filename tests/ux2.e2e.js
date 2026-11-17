/* المرحلة 1: فصل حصة اليوم عن الحصص الفائتة، الاستئناف، التعويض، الأسبوع الجديد، تكافؤ وظائف التسجيل.
   تشغيل: NODE_PATH=$(npm root -g) node tests/ux2.e2e.js [مسار index.html]. الوقت مثبّت على الأربعاء 2026-11-18 (يوم الخطة 4). بيانات اصطناعية. */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let fail=0,pass=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
const WED=new Date('2026-11-18T10:00:00+03:00'),NEXTSAT=new Date('2026-11-21T10:00:00+03:00');
/* خطة: السبت صدر (تمرينان) + الاثنين ظهر (تمرين) + اليوم الأربعاء أرجل (تمرينان). هدف الأسبوع 3 */
const PLAN=`(()=>{const rest={t:'راحة',ex:[]};return[{t:'صدر',ex:[E('بنش برس',2,8,40),E('تفتيح دمبل',2,10,12)]},rest,{t:'ظهر',ex:[E('سحب علوي',2,10,30)]},rest,{t:'أرجل',ex:[E('سكوات',2,8,60),E('ضغط أرجل',2,12,90)]},rest,rest]})()`;
async function open(b,time){const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.errs=errs;
 await p.clock.install({time:time||WED});await p.goto('file://'+file);await p.waitForTimeout(500);await p.clock.resume();
 await p.evaluate(plan=>{S.prof.ob=1;S.prof.name='مختبر';S.prof.sex='m';S.prof.age=30;S.prof.ht=175;S.prof.startW=80;S.prof.dpw=3;S.prof.goalType='lose';S.bw[TD()]=80;S.plan=eval(plan);S.tab='train';UI.trk='hub';S.sub=null;save();render()},PLAN);return{ctx,p}}
const txt=p=>p.evaluate(()=>document.body.innerText);
const click=async(p,sel)=>{await p.evaluate(()=>document.querySelectorAll('details.sjmore').forEach(d=>{d.open=true}));await p.click(sel);await p.waitForTimeout(60)};
const reload=async p=>{await p.reload();await p.waitForTimeout(500)};
const sxs=p=>p.evaluate(()=>Object.values(S.sx));
const goal=async p=>{const t=await txt(p);const m=t.match(/هدف الأسبوع:\s*(\d+) من (\d+)/);return m?m[1]+'/'+m[2]:null};
const finish=async p=>{for(let i=0;i<40&&await p.$('[data-a=wkset]');i++)await click(p,'[data-a=wkset]');if(await p.$('[data-a=wkfin]'))await click(p,'[data-a=wkfin]')};
const endWk=async p=>{await click(p,'[data-a=wkend]');if(await p.$('#fx-sheet [data-fxs]')){await p.click('#fx-sheet [data-fxs]');await p.waitForTimeout(250)}};
const logOne=async p=>{await click(p,'[data-a=wkty][data-v=d]');await click(p,'[data-a=wkrp][data-v="9"]');await p.fill('#wk-w','55');await click(p,'[data-a=wkset]')};
(async()=>{const b=await chromium.launch();

 console.log('1) حصة اليوم وحدها، واستئنافها من «اليوم» بعد إعادة التحميل');
 {const {p}=await open(b);let t=await txt(p);
  ok(/ابدأ تمرين اليوم/.test(t)&&await goal(p)==='0/3','الزر «ابدأ تمرين اليوم» والهدف 0 من 3');
  ok(!!await p.$('#mk-go')&&/عوّض تمرينًا فائتًا\s*2/.test(t),'زر مستقل «عوّض تمرينًا فائتًا» بعدد 2 (السبت والاثنين)');
  await click(p,'#sx-go');
  const ks=await p.evaluate(()=>UI.wk.ks.map(k=>+k.split('|')[1]));
  ok(ks.length===2&&ks.every(d=>d===4),'تبدأ حصة اليوم وحدها: كل تمارينها من يوم الخطة 4',ks.join());
  ok(/حصة اليوم · أرجل/.test(await txt(p)),'عنوان الجلسة داخل المشغّل يبيّن «حصة اليوم · أرجل»');
  await logOne(p);const a=(await sxs(p))[0];const id=a.id;
  ok(a.kd==='t'&&a.dy===4&&a.ex[0].sets.length===1&&a.ex[0].sets[0].ty==='d'&&a.ex[0].sets[0].rp===9&&a.ex[0].sets[0].w===55,'المجموعة محفوظة بنوع دروب وRPE 9 ووزن 55',JSON.stringify(a.ex[0].sets));
  await reload(p);t=await txt(p);
  ok(/أكمل التمرين/.test(t)&&/تمرين جزئي محفوظ/.test(t)&&await goal(p)==='0/3','بعد التحديث: «أكمل التمرين» والهدف ما زال 0 من 3');
  await click(p,'#sx-go');ok(await p.evaluate(i=>UI.wk.sid===i,id),'الاستئناف على الجلسة نفسها (المعرّف ثابت)');
  ok(await p.evaluate(()=>UI.wk.i===0&&UI.wk.s===1),'يستأنف من أول مجموعة غير مكتملة (المجموعة 2 من التمرين 1)');
  await finish(p);
  const all=await sxs(p),s=all[0];
  ok(all.length===1&&s.id===id&&s.st==='c','جلسة واحدة فقط، مكتملة، بالمعرّف نفسه');
  ok(s.ex[0].sets[0].ty==='d'&&s.ex[0].sets[0].rp===9&&s.ex[0].sets[0].w===55,'قيم المجموعة الأولى بقيت بعد الاستكمال');
  ok(await p.evaluate(()=>Object.keys(S.done).every(k=>k.split('|')[1]==='4')&&Object.keys(S.done).length===2),'S.done فيه تمارين اليوم فقط (2) ولم تُمسّ الحصص الفائتة');
  await p.evaluate(()=>{S.tab='train';S.sub=null;UI.trk='hub';render()});await p.waitForTimeout(200);t=await txt(p);ok(await goal(p)==='1/3','الهدف الأسبوعي 1 من 3 بعد إكمال حصة اليوم فقط، مع بقاء حصتين فائتتين');
  ok(/اعرض تمرينك المحفوظ/.test(t)&&/عوّض تمرينًا فائتًا\s*2/.test(t),'اليوم: «اعرض تمرينك المحفوظ» ويبقى زر التعويض');
  ok(p.errs.length===0,'لا أخطاء صفحة',p.errs.join('|'))}

 console.log('2) الاستكمال من الأرشيف (اختبار مستقل)');
 {const {p}=await open(b);await click(p,'#sx-go');await logOne(p);const id=(await sxs(p))[0].id;await endWk(p);
  ok(/dash/.test(await p.evaluate(()=>S.tab))&&!await p.evaluate(()=>UI.wk),'«إنهاء» يحفظ ويعود إلى اليوم');
  await reload(p);await click(p,'#nav [data-a="go"][data-v="ex"]');await click(p,'[data-a="sub"][data-v="arch"]');
  ok(/جزئية/.test(await txt(p)),'الجلسة الجزئية في سجل الأرشيف');
  await click(p,'.sxr');ok(/RPE 9/.test(await txt(p))&&/دروب/.test(await txt(p)),'التفاصيل تعرض RPE 9 والنوع دروب');
  await click(p,'#ar-resume');ok(await p.evaluate(i=>UI.wk&&UI.wk.sid===i&&S.sub==='wk',id),'«أكمل التمرين» من الأرشيف يفتح الجلسة نفسها');
  await finish(p);const all=await sxs(p);
  ok(all.length===1&&all[0].id===id&&all[0].st==='c'&&all[0].ex[0].sets[0].rp===9,'جلسة واحدة مكتملة وقيمها باقية');
  await click(p,'[data-a="go"][data-v="dash"]').catch(()=>{});await p.evaluate(()=>{S.sub=null;S.tab='train';UI.trk='hub';render()});ok(await goal(p)==='1/3','الهدف 1 من 3')}

 console.log('3) التعويض جلسة مستقلة تُحتسب مرة واحدة');
 {const {p}=await open(b);await click(p,'#mk-go');let t=await txt(p);
  ok(/صدر/.test(t)&&/ظهر/.test(t)&&/السبت/.test(t)&&/الإ?ثنين/.test(t),'شاشة التعويض تعرض اسم كل حصة فائتة ويومها قبل البدء');
  await click(p,'.mkc[data-day="0"] [data-a=wkmk]');
  const ks=await p.evaluate(()=>UI.wk.ks.map(k=>+k.split('|')[1]));ok(ks.length===2&&ks.every(d=>d===0),'تعويض السبت يبدأ بتمارين السبت فقط');
  ok(/تعويض · السبت · صدر/.test(await txt(p)),'عنوان المشغّل «تعويض · السبت · صدر»');
  await finish(p);let all=await sxs(p);
  ok(all.length===1&&all[0].kd==='m'&&all[0].dy===0&&all[0].st==='c','جلسة تعويض واحدة مكتملة (kd=m, dy=0)');
  await p.evaluate(()=>{S.sub=null;S.tab='train';UI.trk='hub';render()});t=await txt(p);
  ok(await goal(p)==='1/3','التعويض يحتسب يومه مرة واحدة: 1 من 3');
  ok(/ابدأ تمرين اليوم/.test(t)&&/عوّض تمرينًا فائتًا\s*1/.test(t),'حصة اليوم ما زالت غير مبدوءة، وبقي تعويض واحد');
  await click(p,'#sx-go');await finish(p);all=await sxs(p);
  ok(all.length===2&&all.filter(x=>x.kd==='t').length===1&&all.filter(x=>x.kd==='m').length===1,'جلستان مستقلتان: اليوم والتعويض');
  await p.evaluate(()=>{S.sub=null;S.tab='train';UI.trk='hub';render()});ok(await goal(p)==='2/3','بعد حصة اليوم: 2 من 3');
  ok(await p.evaluate(()=>Object.keys(S.done).length===4),'S.done فيه 4 تمارين بلا تكرار')}

 console.log('4) جلستان جزئيتان معًا: اليوم وتعويض، كل منهما يُستأنف بمعرّفه');
 {const {p}=await open(b);await click(p,'#sx-go');await logOne(p);const A=(await sxs(p))[0].id;await endWk(p);
  await click(p,'#mk-go');await click(p,'.mkc[data-day="2"] [data-a=wkmk]');await logOne(p);const all=await sxs(p),B=all.find(x=>x.id!==A).id;await endWk(p);
  ok(all.length===2&&(await sxs(p)).length===2,'جلستان جزئيتان');
  await reload(p);ok(/أكمل التمرين/.test(await txt(p)),'الزر الرئيسي «أكمل التمرين»');await click(p,'#sx-go');
  ok(await p.evaluate(i=>UI.wk.sid===i&&UI.wk.ks.every(k=>k.split('|')[1]==='4'),A),'الزر الرئيسي يستأنف حصة اليوم (A) لا التعويض');
  await endWk(p);await click(p,'#mk-go');
  ok(/أكمل التعويض/.test(await txt(p)),'شاشة التعويض تعرض «أكمل التعويض» للحصة الجزئية');
  await click(p,'.mkc[data-day="2"] [data-a=wkmk]');ok(await p.evaluate(i=>UI.wk.sid===i,B),'تعويض الاثنين يستأنف جلسته (B)');
  await finish(p);await p.evaluate(()=>{S.sub=null;S.tab='train';UI.trk='hub';render()});ok(await goal(p)==='1/3','إكمال التعويض يحتسب 1 من 3، وحصة اليوم ما زالت جزئية');
  ok((await sxs(p)).find(x=>x.id===A).st==='p','جلسة اليوم A بقيت جزئية')}

 console.log('5) أسبوع جديد: ما يُستكمل وما يبقى في السجل');
 {const {ctx,p}=await open(b);await click(p,'#sx-go');await logOne(p);const A=(await sxs(p))[0].id;await endWk(p);
  await p.evaluate(t=>{},0);
  const p2=await ctx.newPage();await p2.clock.install({time:NEXTSAT});await p2.goto('file://'+file);await p2.waitForTimeout(500);await p2.clock.resume();
  const t=await txt(p2);
  ok(/ابدأ تمرين اليوم/.test(t)&&await goal(p2)==='0/3','سبت الأسبوع الجديد: «ابدأ تمرين اليوم» والهدف 0 من 3');
  ok(!await p2.$('#mk-go'),'لا حصص فائتة في أول يوم من الأسبوع');
  ok(!!await p2.$('#mk-prev')&&/جلسة جزئية من أسبوع سابق/.test(t),'ملاحظة: جلسة جزئية من أسبوع سابق محفوظة للقراءة');
  const r=await p2.evaluate(i=>{const b=document.createElement('button');b.dataset.v=i;const x=ACT.sxres(b);return[x,!!UI.wk]},A);ok(r[0]===false&&!r[1],'استكمال جلسة أسبوع سابق مرفوض');
  await p2.evaluate(()=>{S.sub='mk';render()});ok(/من أسابيع سابقة/.test(await txt(p2)),'شاشة التعويض تفصل «من أسابيع سابقة» (للقراءة)');
  await p2.evaluate(()=>{S.sub='arch';UI.ar='ses';render()});ok(/جزئية/.test(await txt(p2)),'الجلسة السابقة ما زالت في الأرشيف');
  await p2.evaluate(i=>{UI.ad=i;render()},A);ok(/لا يمكن|لا تُستكمل|لا يمكن استكمال/.test(await txt(p2))&&!await p2.$('#ar-resume'),'تفاصيلها بلا زر استكمال مع شرح السبب');
  ok((await p2.evaluate(()=>Object.keys(S.done).length))===0,'لا شيء في S.done من الأسبوع السابق')}

 console.log('6) تكافؤ وظائف التسجيل: RPE، النوع، الوزن، التراجع، التخطي');
 {const {p}=await open(b);await click(p,'#sx-go');
  ok(!await p.$('#wk-undo'),'لا زر تراجع قبل أي مجموعة');
  await click(p,'[data-a=wkrp][data-v="8"]');await click(p,'[data-a=wkty][data-v=f]');await p.fill('#wk-w','62.5');await click(p,'[data-a=wkset]');
  let s=(await sxs(p))[0];ok(s.ex[0].sets[0].rp===8&&s.ex[0].sets[0].ty==='f'&&s.ex[0].sets[0].w===62.5,'RPE والنوع «حتى الفشل» والوزن الاختياري تُحفظ');
  ok(!!await p.$('#wk-undo'),'زر «تراجع عن آخر مجموعة» يظهر بعد أول مجموعة');
  await click(p,'[data-a=wkty][data-v=f]');await click(p,'[data-a=wkset]');
  ok(await p.evaluate(()=>UI.wk.i===1&&UI.wk.s===0&&Object.keys(S.done).length===1),'المجموعة الثانية تُكمل التمرين الأول وتكتب S.done');
  ok(await p.evaluate(()=>{const d=Object.values(S.done)[0];return d.rpe===10}),'مجموعة الفشل تُكتب RPE 10 في S.done (كما في المسار القديم)');
  await click(p,'#wk-undo');
  ok(await p.evaluate(()=>UI.wk.i===0&&UI.wk.s===1&&Object.keys(S.done).length===0),'التراجع يعيد التمرين المكتمل إلى مجموعته الأخيرة ويزيل S.done');
  s=(await sxs(p))[0];ok(s.ex[0].sets.length===1&&s.ex[0].dn===0&&s.st==='p','سجل الجلسة: حُذفت المجموعة وأُلغي dn');
  await click(p,'#wk-undo');ok((await sxs(p)).length===0&&await p.evaluate(()=>!UI.wk.sid),'التراجع عن آخر مجموعة في الجلسة يحذف الجلسة الفارغة');
  await click(p,'[data-a=wkset]');await click(p,'[data-a=wknext]');await click(p,'[data-a=wkset]');await click(p,'[data-a=wkset]');
  s=(await sxs(p))[0];ok(s.ex[0].sk===1&&s.ex[1].dn===1&&s.st==='p','التخطي: التمرين الأول مخطّى والثاني مكتمل والجلسة جزئية');
  await p.evaluate(()=>{UI.fxfin=1;ACT.wkend();UI.fxfin=0;render()});await reload(p);await click(p,'#sx-go');
  ok(await p.evaluate(()=>{const x=S.sx[UI.wk.sid].ex[0];return UI.wk.i===0&&UI.wk.ks[0]===x.k}),'الاستئناف يعيد عرض التمرين المخطّى من مجموعته التالية');
  await finish(p);s=(await sxs(p))[0];ok(s.st==='c'&&s.ex[0].dn===1&&s.ex[1].dn===1,'يمكن إكمال التمرين المخطّى والجلسة تكتمل')}

 console.log('7) المسارات القديمة ما زالت تعمل بجانب المشغّل الجديد');
 {const {p}=await open(b);await p.evaluate(()=>{S.tab='train';S.sub=null;UI.tw='today';render()});
  const k=await p.evaluate(()=>tasks().find(x=>x.d===4).k);
  await p.evaluate(k=>{mark(k,50,8);save();render()},k);
  ok(!!await p.$('[data-a="rpe"][data-k="'+k+'"]'),'قائمة التمرين: رقاقات RPE القديمة ظاهرة للتمرين المكتمل');
  await click(p,'[data-a="rpe"][data-k="'+k+'"][data-v="9"]');
  ok(await p.evaluate(k=>S.done[k].rpe===9&&S.done[k].w===50,k),'RPE من المسار القديم يُحفظ في S.done');
  ok(!!await p.$('[data-a="undo"][data-k="'+k+'"]'),'زر «تراجع» القديم ظاهر');
  await click(p,'[data-a="undo"][data-k="'+k+'"]');ok(await p.evaluate(k=>!S.done[k],k),'التراجع القديم يزيل التسجيل');
  ok(await p.evaluate(()=>typeof vPly==='function'&&typeof ACT.prpe==='function'),'الجلسات الجاهزة (vPly) وRPE فيها باقية');
  await p.evaluate(k=>{mark(k,50,8);save();S.tab='train';UI.trk='hub';render()},k);
  ok(await p.evaluate(()=>Object.keys(S.sx).length===0),'التسجيل القديم لا ينشئ جلسة في S.sx (يظهر في الأرشيف ضمن «سجلات سابقة»)');
  await p.evaluate(()=>{S.sub='arch';UI.ar='ses';render()});ok(/سجلات سابقة|تمارين مسجّلة/.test(await txt(p)),'ويظهر في سجل الأرشيف')}
 await b.close();console.log(`\n${pass} ناجح، ${fail} فاشل`);process.exit(fail?1:0)})();
