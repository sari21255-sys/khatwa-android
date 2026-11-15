/* التقارير: الفترة والعوامل المستخدمة فعلًا. تشغيل: NODE_PATH=$(npm root -g) node tests/rpt.e2e.js [index.html]. الوقت 2026-11-18 (الأربعاء، يوم الخطة 4). بيانات اصطناعية. */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let fail=0,pass=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
const WED=new Date('2026-11-18T13:00:00+03:00');
const PLAN="(()=>{const r={t:'راحة',ex:[]};return[{t:'صدر',ex:[E('بنش',2,8,40),E('تفتيح',2,10,12)]},r,{t:'ظهر',ex:[E('سحب',2,10,30)]},r,{t:'أرجل',ex:[E('سكوات',3,8,60),E('رفرفة',2,12,20)]},r,{t:'كتف',ex:[E('ضغط',3,8,20)]}]})()";
async function open(b){const p=await(await b.newContext({viewport:{width:390,height:844}})).newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
 await p.clock.install({time:WED});await p.goto('file://'+file);await p.waitForTimeout(500);await p.clock.resume();
 await p.evaluate(pl=>{S.prof.ob=1;S.prof.name='مختبر';S.prof.dpw=3;S.prof.sleep=7;S.plan=eval(pl);S.done={};S.meals={};S.sleep={};S.bw={};S.prs=[];S.sx={};S.nt.kcal=2000;S.nt.p=120;save();render()},PLAN);return p}
/* يسجّل إنجاز كل تمارين يوم الخطة d في أسبوع ws بتاريخ date */
const fin=(p,ws,d,date)=>p.evaluate(([ws,d,date])=>{S.plan[d].ex.forEach(e=>{S.done[ws+'|'+d+'|'+e.id]={w:e.w||40,r:e.r||8,date:date}});save()},[ws,d,date]);
const data=(p,n)=>p.evaluate(n=>rptData(n),n);
(async()=>{const b=await chromium.launch();
 console.log('1) لا بيانات');
 {const p=await open(b);const d=await data(p,4);
  ok(!d.hasData&&d.nact===0&&d.score===0&&d.used.length===0,'بلا بيانات: hasData=false والدرجة 0',JSON.stringify({h:d.hasData,s:d.score,u:d.used}));
  await p.evaluate(()=>{UI.rpw='4';S.tab='ex';S.sub='rpt';render()});const t=await p.evaluate(()=>document.body.innerText);
  ok(/لا بيانات كافية/.test(t)&&/الفترة من 2026-10-24 إلى 2026-11-18/.test(t),'الشاشة تذكر الفترة وتقول «لا بيانات كافية»');await p.context().close()}
 console.log('2) الأسبوع الحالي يُحسب حتى اليوم فقط');
 {const p=await open(b);await fin(p,'2026-11-14',0,'2026-11-14');await fin(p,'2026-11-14',2,'2026-11-16');await fin(p,'2026-11-14',4,'2026-11-18');
  const d=await data(p,4);const cur=d.weeks[3];
  ok(cur.cur&&cur.nd===5&&cur.done===5&&cur.tr===100,'5 تمارين منجزة من 5 مجدولة حتى اليوم = 100٪ (لا 83٪ من الأسبوع كاملًا)',JSON.stringify({nd:cur.nd,done:cur.done,tr:cur.tr}));
  ok(d.nact===1&&d.first==='2026-11-14','المتوسطات تبدأ من أول أسبوع فيه بيانات (الأسابيع السابقة لا تُحسب أصفارًا)',d.first+' '+d.nact);
  await p.evaluate(()=>{S.tab='ex';S.sub='rpt';render()});ok(/أقل من أسبوعين/.test(await p.evaluate(()=>document.body.innerText)),'أسبوع واحد فقط: الحكم «أقل من أسبوعين» (درجة أولية)');
  ok(Math.round(d.tr)===100&&d.nu==null&&d.slp==null&&d.pr==null&&d.used.join()==='التمارين,الانتظام','المكوّنات المستخدمة: التمارين والانتظام فقط',d.used.join());
  ok(d.score>0&&d.score<=100,'الدرجة محسوبة من المكوّنات المتاحة فقط ('+d.score+')');await p.context().close()}
 console.log('3) بيانات داخل الفترة وخارجها');
 {const p=await open(b);
  await fin(p,'2026-10-31',0,'2026-10-31');await p.evaluate(()=>{S.prs=[{date:'2026-10-31',n:'بنش',w:50},{date:'2026-10-20',n:'سحب',w:40}];save()});
  let d4=await data(p,4),d8=await data(p,8);
  ok(d4.weeks.length===4&&d4.from==='2026-10-24'&&d4.weeks[1].ws==='2026-10-31'&&d4.weeks[1].done===2,'4 أسابيع: أسبوع 10-31 داخل الفترة بتمرينيه');
  ok(d4.prs===1&&d8.prs===2,'الأرقام الشخصية: 10-20 خارج فترة 4 أسابيع وداخل فترة 8 (النافذة تبدأ من أول أسبوع معروض)',d4.prs+'/'+d8.prs);
  await fin(p,'2026-09-12',0,'2026-09-12');const d4b=await data(p,4),d12=await data(p,12);
  ok(d4b.weeks.every(w=>w.ws>='2026-10-24')&&d4b.nact===d4.nact,'بيانات 09-12 خارج فترة 4 أسابيع لا تغيّر نتيجتها');
  ok(d12.first==='2026-09-12'&&d12.nact>d4.nact,'فترة 12 أسبوعًا تبدأ من 09-12 وتضمّ الأسابيع الفارغة بعدها كأصفار');await p.context().close()}
 console.log('4) غياب النوم والتغذية والوزن، ثم إضافتها');
 {const p=await open(b);await fin(p,'2026-11-07',0,'2026-11-07');await fin(p,'2026-11-14',0,'2026-11-14');
  let d=await data(p,4);await p.evaluate(()=>{S.tab='ex';S.sub='rpt';render()});
  let t=await p.evaluate(()=>document.body.innerText);
  ok(d.slp==null&&!d.used.includes('النوم')&&/لا نوم مسجّل في الفترة/.test(t),'بلا نوم: لا يدخل الدرجة والنص يقول ذلك');
  ok(d.nu==null&&/لا تغذية مسجّلة/.test(t),'بلا تغذية: لا تدخل الدرجة والنص يقول ذلك');
  const base=d.score;
  await p.evaluate(()=>{['2026-11-08','2026-11-09','2026-11-10'].forEach(x=>{S.sleep[x]=7.5});['2026-11-15','2026-11-16'].forEach(x=>{S.meals[x]=[{id:x,n:'غداء',kcal:2000,p:130,c:200,f:60,slot:'l'}]});save()});
  d=await data(p,4);ok(d.used.includes('النوم')&&d.used.includes('التغذية')&&Math.round(d.sl*10)/10===7.5,'بعد تسجيل النوم والتغذية: تدخل في الدرجة، ومتوسط النوم 7.5',d.used.join()+' '+d.sl);
  const w=d.weeks[3];ok(w.logged===2&&w.kok===2&&w.pok===2&&w.nd===5,'التغذية للأسبوع الحالي: يومان من 5 أيام مضت (لا من 7)',JSON.stringify({l:w.logged,nd:w.nd}));
  ok(w.nu===Math.round(2/5*40+30+30),'معادلة التغذية = تسجيل/أيام مضت×40 + سعرات×30 + بروتين×30',String(w.nu));
  await p.evaluate(()=>{S.tab='ex';S.sub='rpt';render()});t=await p.evaluate(()=>document.body.innerText);
  ok(/الدرجة تعتمد على: .*النوم/.test(t)&&/التغذية/.test(t),'سطر «الدرجة تعتمد على» يسرد العوامل الداخلة فعلًا');
  ok(p.errs.length===0,'لا أخطاء صفحة',p.errs.join('|'));await p.context().close()}
 console.log(`\n${pass} نجح، ${fail} فشل`);await b.close();process.exit(fail?1:0)})();
