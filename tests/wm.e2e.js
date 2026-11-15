/* الوزن والوجبات: مدخل واحد للحفظ من كل الشاشات. تشغيل: NODE_PATH=$(npm root -g) node tests/wm.e2e.js [index.html]. الوقت مثبّت 2026-11-18. بيانات اصطناعية. */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let fail=0,pass=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
const WED=new Date('2026-11-18T13:00:00+03:00');
async function open(b){const p=await(await b.newContext({viewport:{width:390,height:844}})).newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
 await p.clock.install({time:WED});await p.goto('file://'+file);await p.waitForTimeout(500);await p.clock.resume();
 await p.evaluate(()=>{S.prof.ob=1;S.prof.name='مختبر';S.prof.sex='m';S.prof.age=30;S.prof.ht=175;S.prof.startW=82;S.prof.goal=75;S.bw={};S.bw['2026-11-10']=82;S.meals={};S.tab='dash';S.sub=null;save();render()});await p.waitForTimeout(150);return p}
const click=async(p,s)=>{await p.click(s);await p.waitForTimeout(80)};
const goto=(p,tab,sub)=>p.evaluate(([t,s])=>{S.tab=t;S.sub=s||null;render()},[tab,sub]);
const reload=async p=>{await p.reload();await p.waitForTimeout(500)};
(async()=>{const b=await chromium.launch();
 console.log('1) الوزن: نموذج واحد في اليوم والتقدّم ومراقبة الوزن');
 {const p=await open(b);
  for(const [name,nav] of [['اليوم',['dash']],['التقدّم',['pg']],['مراقبة الوزن',['ex','wgt']]]){await goto(p,...nav);
   const f=await p.evaluate(()=>({w:!!document.querySelector('#we-w'),btn:!!document.querySelector('[data-a=wadd]'),n:document.querySelectorAll('#we-w').length}));
   ok(f.w&&f.btn&&f.n===1,'نموذج الوزن نفسه (#we-w + حفظ) ظاهر في «'+name+'»',JSON.stringify(f))}
  await goto(p,'dash');await p.fill('#we-w','81.2');await click(p,'[data-a=wadd]');
  ok(await p.evaluate(()=>S.bw[TD()]===81.2),'الحفظ من «اليوم» يكتب S.bw لليوم');
  await goto(p,'pg');ok(await p.evaluate(()=>+document.querySelector('#we-w').value)===81.2,'«التقدّم» يعرض 81.2');
  await p.fill('#we-w','80.6');await click(p,'[data-a=wadd]');
  await goto(p,'ex','wgt');ok(await p.evaluate(()=>+document.querySelector('#we-w').value===80.6&&/80[.٫,]6/.test(document.body.innerText)),'تعديل من «التقدّم» ينعكس في «مراقبة الوزن» (النموذج والسجل)');
  await p.fill('#we-w','80.1');await p.fill('#we-b','21.5');await p.fill('#we-n','بعد الصيام');await click(p,'[data-a=wadd]');
  const r=await p.evaluate(()=>({w:S.bw[TD()],bf:S.bf[TD()],n:S.wn[TD()],keys:Object.keys(S.bw).filter(k=>k===TD()).length}));
  ok(r.w===80.1&&r.bf===21.5&&r.n==='بعد الصيام'&&r.keys===1,'من «مراقبة الوزن»: الوزن والدهون والملاحظة محفوظة وسجل واحد لليوم',JSON.stringify(r));
  await goto(p,'dash');ok(await p.evaluate(()=>+document.querySelector('#we-w').value)===80.1,'«اليوم» يقرأ 80.1 بعد التعديل من مراقبة الوزن');
  await p.fill('#we-w','10');await click(p,'[data-a=wadd]');ok(await p.evaluate(()=>S.bw[TD()])===80.1,'قيمة غير معقولة (10 كغ) تُرفض ولا تغيّر السجل');
  await p.evaluate(()=>{S.prof.unit='lb'});await goto(p,'dash');await p.fill('#we-w','180');await click(p,'[data-a=wadd]');
  const lb=await p.evaluate(()=>S.bw[TD()]);ok(Math.abs(lb-81.65)<.02,'الوحدة رطل تُحوَّل: 180 رطل ≈ 81.65 كغ',String(lb));
  await p.evaluate(()=>{S.prof.unit='kg'});
  await reload(p);ok(await p.evaluate(()=>Math.abs(S.bw[TD()]-81.65)<.02&&S.bf[TD()]===21.5),'تبقى القيم بعد إعادة التحميل');
  await goto(p,'ex','wgt');ok(!!await p.$('[data-a=wdel]'),'سجل الحذف في مراقبة الوزن ما زال موجودًا');
  ok(p.errs.length===0,'لا أخطاء صفحة',p.errs.join('|'));await p.context().close()}

 console.log('2) الوجبات: مسار حفظ واحد من كل المداخل');
 {const p=await open(b);
  const sums=()=>p.evaluate(()=>{const d=TD(),a=S.meals[d]||[];return{n:a.length,kcal:foodSum(d).kcal,ids:new Set(a.map(m=>m.id)).size}});
  await goto(p,'food');await click(p,'[data-a=qatog][data-v=meal]');
  const lib=await p.evaluate(()=>S.lib[0]);
  await p.selectOption('#mlib',lib.id);await p.fill('#mq','2');
  await p.evaluate(()=>{const s=document.querySelector('#msl');if(s)s.value='d'});
  await click(p,'[data-a=madd]');
  let m=await p.evaluate(()=>S.meals[TD()][0]);
  ok(m&&m.n.includes('×2')&&m.kcal===Math.round(lib.kcal*2)&&m.slot==='d','من نموذج التغذية: الاسم والكمية ×2 والنوع (عشاء) محفوظة',JSON.stringify(m));
  await goto(p,'food');await p.evaluate(()=>{UI.qa='meal';render()});
  await p.fill('#cn','وجبة اختبار');await p.fill('[data-c="m:kcal"]','350');await p.fill('[data-c="m:p"]','30');await p.fill('[data-c="m:c"]','20.26');await p.fill('[data-c="m:f"]','10');await p.fill('[data-c="m:na"]','410');
  await p.selectOption('#msl','b');await click(p,'[data-a=mcustom]');
  m=await p.evaluate(()=>S.meals[TD()].slice(-1)[0]);
  ok(m.n==='وجبة اختبار'&&m.kcal===350&&m.c===20.3&&m.na===410&&m.slot==='b'&&typeof m.id==='string','وجبة مخصصة: نفس البنية والتقريب (20.26→20.3) والنوع فطور',JSON.stringify(m));
  const before=(await sums());
  await p.evaluate(id=>{const d=TD();ACT.mgo({dataset:{id:id}});save();render()},lib.id);
  m=await p.evaluate(()=>S.meals[TD()].slice(-1)[0]);
  ok(m.lid===(lib.id)&&m.kcal===lib.kcal&&m.slot&&m.n===lib.n,'من المكتبة (mgo): تُحفظ بمعرّف المكتبة ونوع افتراضي حسب الوقت',JSON.stringify(m));
  await p.evaluate(()=>{const d=TD(),l=S.lib[1];ACT.eat({dataset:{d:d,s:'l',id:l.id}});save();render()});
  m=await p.evaluate(()=>S.meals[TD()].slice(-1)[0]);ok(m.slot==='l'&&m.lid,'من الخطة (eat): النوع المختار «غداء» محفوظ');
  await p.evaluate(()=>{UI.off={res:[{n:'تمر',kcal:280,p:2,c:75,f:.4,fi:7,su:63,na:2}]};UI.fd=TD();ACT.offadd({dataset:{i:'0'}});save();render()});
  m=await p.evaluate(()=>S.meals[TD()].slice(-1)[0]);ok(/تمر \(100 غ\)/.test(m.n)&&m.kcal===280&&m.fi===7&&m.na===2,'من البحث (offadd): الكمية 100 غ والمغذيات التفصيلية محفوظة',JSON.stringify(m));
  const tot=await sums();
  ok(tot.n===5&&tot.ids===5,'خمس وجبات من خمسة مداخل، كل واحدة بمعرّف مختلف',JSON.stringify(tot));
  const expect=await p.evaluate(()=>S.meals[TD()].reduce((a,m)=>a+m.kcal,0));ok(tot.kcal===expect,'مجموع السعرات في foodSum = مجموع السجلات (يُحتسب مرة واحدة)',tot.kcal+'/'+expect);
  await goto(p,'dash');const t=await p.evaluate(()=>document.body.innerText);const fmt=n=>String(Math.round(n));
  ok(t.includes('التغذية اليوم')&&new RegExp(String(expect).replace(/(\d)(?=(\d{3})+$)/g,'$1[,٬]?')).test(t.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d))),'ملخص «اليوم» يعرض مجموع السعرات نفسه',String(expect));
  await p.evaluate(()=>{const y='2026-11-17';S.meals[y]=[{id:'y1',n:'أمس',kcal:100,p:1,c:1,f:1,slot:'l'}];ACT.mrep({dataset:{d:TD(),y:y}});save();render()});
  m=await p.evaluate(()=>S.meals[TD()].slice(-1)[0]);ok(m.n==='أمس'&&m.id!=='y1'&&m.slot==='l','نسخ من أمس (mrep): معرّف جديد والنوع محفوظ');
  await reload(p);ok(await p.evaluate(()=>S.meals[TD()].length)===6,'الوجبات الست باقية بعد إعادة التحميل');
  ok(p.errs.length===0,'لا أخطاء صفحة',p.errs.join('|'));await p.context().close()}
 console.log(`\n${pass} نجح، ${fail} فشل`);await b.close();process.exit(fail?1:0)})();
