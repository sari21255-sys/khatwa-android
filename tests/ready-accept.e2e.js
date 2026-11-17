/* قبول إغلاق ملاحظات «جهّز تمرينك»: نقل الحصة بمعرّفها، سياق الطقس حسب المدينة، جدولة قابلة للتحقق. نتائج محاكاة. */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let fail=0,pass=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x!==undefined?'  ['+x+']':''))}};
(async()=>{const b=await chromium.launch();
 for(const w of [390,320]){
 const ctx=await b.newContext({viewport:{width:w,height:844},timezoneId:'Asia/Riyadh'});const p=await ctx.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
 const E=(f,a)=>p.evaluate(f,a);
 await p.goto('file://'+file);await p.waitForTimeout(400);
 const setup=()=>E(()=>{window.__now=Date.parse('2026-11-16T09:00:00+03:00');S.prof.ob=1;S.prof.name='';window.__M={};window.__F={sch:0,can:0,perm:'granted'};
  window.mkw=(f,c)=>{c=c||rdCity();const H=[];for(let h=0;h<48;h++){H.push({t:rdAt(h<24?'2026-11-16':'2026-11-17',(h%24)*60,c.tz),temp:f-2,feels:f,hum:30,pop:5,code:1,wind:10,gust:15,uv:3})}return H};
  NTS.impl={async perm(){return window.__F.perm},async cancel(ids){if(window.__F.can)throw new Error('cancel-fail');ids.forEach(i=>delete window.__M[i])},async schedule(l){if(window.__F.sch>0){window.__F.sch--;throw new Error('sched-fail')}l.forEach(x=>window.__M[x.id]=x)}};
  WXP.fn=async c=>({src:'محاكاة',hours:window.mkw(30,c)});
  const n=rdS().nt;n.on=1;n.wo=1;n.prep=1;rdS().pref.water=0;['fajr','dhuhr','asr','maghrib','isha'].forEach(k=>rdS().pa[k]=0);rdS().wxOn=1;save()});
 await setup();
 const seed=(withB)=>E(a=>{const wd=(new Date('2026-11-16T12:00:00Z').getUTCDay()+1)%7,wt=(wd+1)%7;SJ().one=[];SJ().tw={};SJ().tw[wd]=[{id:'wA',k:'run',t:'ez',at:'16:00'}];if(a)SJ().tw[wt]=[{id:'wB',k:'run',t:'iv',at:'07:00'}];rdPlanState('run').at='16:00';rdPlanState('run').io='out';rdPlanState('run').dur=40;save()},withB?1:0);
 const mv=(h,scope)=>E(a=>{ACT.rdmove({dataset:{k:'run',at:rdAt('2026-11-17',a.h*60,rdCity().tz),id:'wA',ds:'2026-11-16'}});UI.rdmv.scope=a.s;ACT.rdmvok()},{h:h,s:scope});
 const occ=ds=>E(d=>tkOcc(d).map(e=>e.id+'@'+e.at+(e.once?'*':'')).sort().join(),ds);
 /* 1) نقل الحصة بمعرّفها */
 await E(()=>{localStorage.removeItem('sijil_ntst')});
 await E(()=>{const wd=(new Date('2026-11-16T12:00:00Z').getUTCDay()+1)%7;SJ().one=[];SJ().tw={};SJ().tw[wd]=[{id:'wA',k:'run',t:'ez',at:'16:00'}]});
 await mv(17,'all');
 ok(await occ('2026-11-16')===''&&await occ('2026-11-17')==='wA@17:00',w+': نقل إلى غدٍ فارغ: اختفت من القديم وظهرت مرة واحدة بالمعرّف نفسه',await occ('2026-11-17'));
 await E(()=>{const wd=(new Date('2026-11-16T12:00:00Z').getUTCDay()+1)%7,wt=(wd+1)%7;SJ().one=[];SJ().tw={};SJ().tw[wd]=[{id:'wA',k:'run',t:'ez',at:'16:00'}];SJ().tw[wt]=[{id:'wB',k:'run',t:'iv',at:'07:00'}]});
 await mv(18,'all');
 ok(await occ('2026-11-16')===''&&await occ('2026-11-17')==='wA@18:00,wB@07:00',w+': مع حصة جري أخرى في الهدف: المقصودة انتقلت والأخرى كما هي',await occ('2026-11-17'));
 ok(await E(()=>tkEntry('wB').e.t==='iv'&&tkEntry('wB').e.at==='07:00'&&tkEntry('wA').e.t==='ez'),w+': بيانات الحصتين سليمة');
 await E(()=>{const wd=(new Date('2026-11-16T12:00:00Z').getUTCDay()+1)%7;SJ().one=[];SJ().tw={};SJ().tw[wd]=[{id:'wA',k:'run',t:'ez',at:'16:00'}]});
 await mv(19,'once');
 ok(await occ('2026-11-16')===''&&/@19:00\*/.test(await occ('2026-11-17'))&&await occ('2026-11-23')==='wA@16:00',w+': هذه المرة فقط: يبقى الجدول الأسبوعي',await occ('2026-11-17')+'|'+await occ('2026-11-23'));
 /* حالة التنبيه تطابق المؤكَّد وتبقى بعد إعادة الفتح */
 await E(()=>{const wd=(new Date('2026-11-16T12:00:00Z').getUTCDay()+1)%7;SJ().one=[];SJ().tw={};SJ().tw[wd]=[{id:'wA',k:'run',t:'ez',at:'16:00'}];save();return rdFetch(1)});
 await E(()=>rdNtSync(1));
 let r=await E(()=>({s:rdNsLoad().state,ids:Object.keys(window.__M).sort().join(),conf:Object.keys(rdNsLoad().conf).sort().join(),t:rdNtStatus()}));
 ok(r.s==='ok'&&r.ids===r.conf&&r.ids!==''&&/مجدول/.test(r.t),w+': «مجدول» ومعرّفات المؤكَّد = ما جدوله النظام',JSON.stringify(r));
 const saved=await E(()=>JSON.stringify(S));await p.reload();await p.waitForTimeout(500);
 ok(await E(()=>rdNsLoad().state==='ok'&&Object.keys(rdNsLoad().conf).length>0&&/مجدول/.test(rdNtStatus())),w+': الحالة بعد إعادة فتح التطبيق');
 await setup();
 /* 2) سياق الطقس */
 const sc=await E(()=>{window.__rel={};
  WXP.fn=async c=>{const f=c.id==='dubai'?44:(c.id==='newyork'?18:30);if(c.id==='dubai')await new Promise(r=>window.__rel.d=r);if(c.id==='cairo')throw new Error('net');return{src:'محاكاة',hours:window.mkw(f,c)}};
  rdS().city='dubai';rdS().cus=null;rdPlanState('run').io='out';rdPlanState('run').at='12:00';rdPlanState('run').dur=60;
  window.__pa=rdFetch(1);rdS().city='newyork';window.__pb=rdFetch(1);return 1});
 await E(()=>window.__pb);
 let m=await E(()=>({c:rdCity().id,f:rdWx().hours[0].feels,ids:rdSummary('run').adv.map(a=>a.id)}));
 ok(m.c==='newyork'&&m.f===18&&!m.ids.includes('heat-high'),w+': طلب المدينة الثانية ينجح أولًا والأول قيد التنفيذ',JSON.stringify(m));
 await E(()=>{window.__rel.d();return window.__pa});await p.waitForTimeout(100);
 m=await E(()=>{S.tab='dash';S.sub=null;render();return{c:rdCity().id,f:rdWx().hours[0].feels,n:Object.keys(rdWxM()).length,ids:rdSummary('run').adv.map(a=>a.id),card:document.querySelector('.sjwx')?document.querySelector('.sjwx').textContent:'',dub:Object.values(rdWxM()).find(x=>/دبي/.test(x.cn))}});
 ok(m.c==='newyork'&&m.f===18&&!m.ids.includes('heat-high')&&!/دبي/.test(m.card),w+': الرد المتأخر للأولى لا يغيّر البطاقة ولا النصائح',JSON.stringify([m.c,m.f,m.ids]));
 ok(m.n>=2&&m.dub&&m.dub.hours[0].feels===44&&m.dub.tz==='Asia/Dubai',w+': ذاكرة كل مدينة معزولة وبمنطقتها الزمنية');
 const ntn=await E(async()=>{rdS().city='newyork';rdPlanState('run').at='16:00';await rdNtSync(1);return Object.values(window.__M).map(x=>x.body).join('|')});
 ok(!/44/.test(ntn),w+': الإشعارات لا تستخدم توقع المدينة الأولى',ntn);
 /* فشل الثانية */
 m=await E(async()=>{rdS().geo=1;rdS().cus={n:'القاهرة',lat:30.04,lon:31.24,tz:'Africa/Cairo'};await rdFetch(1);S.tab='dash';S.sub=null;render();return{wx:rdWx(),err:RDW.err[rdKey(rdCity())],ids:rdSummary('run').adv.map(a=>a.id),card:document.querySelector('.sjwx').textContent}});
 ok(m.wx===null&&!!m.err&&!m.ids.includes('heat-high')&&!m.ids.includes('cold')&&/لا يتوفر توقع|تعذّر/.test(m.card),w+': فشل طلب المدينة الحالية: حالة تعذّر بلا توصية من مدينة أخرى',m.ids.join()+' | '+String(m.card).slice(0,200));
 ok(await E(()=>{rdS().city='cairo';const s=rdSummary('run');return s.adv.every(a=>!/الحرارة المحسوسة/.test(a.t))}),w+': لا نصائح حرارة بلا توقع للمدينة');
 /* توقع قديم أثناء الانقطاع */
 m=await E(async()=>{rdS().city='newyork';rdWx().at=window.__now-5*36e5;WXP.fn=async()=>{throw new Error('offline')};await rdFetch(1);S.tab='dash';S.sub=null;render();return{st:rdStale(),f:rdWx().hours[0].feels,card:document.querySelector('.sjwx').textContent}});
 ok(m.st==='stale'&&m.f===18&&/آخر تحديث/.test(m.card),w+': توقع قديم أثناء الانقطاع: يظهر بوقت التحديث ولا يُعامل كحديث',JSON.stringify([m.st,m.f,String(m.card).slice(0,200)]));
 /* 3) الجدولة */
 await setup();await seed();await E(()=>{localStorage.removeItem('sijil_ntst');window.__M={};window.__F.sch=1;rdS().city='madinah';return rdFetch(1)});
 await E(()=>rdNtSync(1));
 r=await E(()=>({s:rdNsLoad().state,t:rdNtStatus(),n:Object.keys(window.__M).length,c:Object.keys(rdNsLoad().conf).length}));
 ok(r.s==='fail'&&/أعد المحاولة/.test(r.t)&&r.n===0&&r.c===0,w+': فشل الجدولة: «تعذّرت — أعد المحاولة» ولا شيء مؤكَّد',JSON.stringify(r));
 await E(()=>rdNtSync(0));r=await E(()=>({s:rdNsLoad().state,n:Object.keys(window.__M).length,c:Object.keys(rdNsLoad().conf).length}));
 ok(r.s==='ok'&&r.n===1&&r.c===1,w+': إعادة المحاولة بالإعداد نفسه تنجح',JSON.stringify(r));
 await E(()=>rdNtSync(1));ok(await E(()=>Object.keys(window.__M).length===1),w+': لا تكرار عند إعادة المزامنة');
 /* فشل إلغاء القديم */
 const old=await E(()=>Object.values(window.__M)[0].at);
 await E(async()=>{window.__F.can=1;ACT.rdmove({dataset:{k:'run',at:rdAt('2026-11-16',17*60,rdCity().tz),id:'wA',ds:'2026-11-16'}});UI.rdmv.scope='all';ACT.rdmvok();await rdNtSync(1)});
 r=await E(()=>({s:rdNsLoad().state,pend:Object.values(window.__M).map(x=>x.at),t:rdNtStatus()}));
 ok(r.s==='fail'&&r.pend.length===1&&r.pend[0]===old&&/أعد المحاولة/.test(r.t),w+': فشل إلغاء القديم: الحالة «تعذّرت» ويُحتفظ بما أكّده النظام (القديم ما زال معلّقًا)',JSON.stringify(r));
 await E(async()=>{window.__F.can=0;await rdNtSync(1,true)});
 r=await E(()=>({s:rdNsLoad().state,pend:Object.values(window.__M).map(x=>x.at),want:rdNtPlan(rdNow()).map(x=>x.at)}));
 ok(r.s==='ok'&&r.pend.length===1&&r.pend[0]===r.want[0]&&r.pend[0]!==old,w+': بعد نجاح الإلغاء يستقر على الموعد الجديد وحده',JSON.stringify(r));
 /* تغيير سريع مرتين */
 await E(async()=>{const q=h=>{ACT.rdmove({dataset:{k:'run',at:rdAt('2026-11-16',h*60,rdCity().tz),id:'wA',ds:'2026-11-16'}});UI.rdmv.scope='all';ACT.rdmvok()};q(18);const a=rdNtSync(1);q(19);const b=rdNtSync(1);await Promise.all([a,b]);await rdNtSync(1)});
 r=await E(()=>({n:Object.values(window.__M).length,at:Object.values(window.__M)[0].at,want:rdNtPlan(rdNow())[0].at,hm:rdP(Object.values(window.__M)[0].at,rdCity().tz)}));
 ok(r.n===1&&r.at===r.want,w+': تغيير سريع مرتين: تنبيه واحد على الموعد الأخير',JSON.stringify(r));
 /* الإذن */
 await E(async()=>{window.__F.perm='denied';await rdNtSync(1)});
 ok(await E(()=>rdNsLoad().state==='perm'&&/إذن النظام محجوب/.test(rdNtStatus())),w+': رفض الإذن: «إذن النظام محجوب»');
 await E(async()=>{window.__F.perm='granted';await rdNtSync(1,true)});ok(await E(()=>rdNsLoad().state==='ok'&&Object.keys(window.__M).length===1),w+': بعد منح الإذن تعود «مجدول»');
 /* المفتاح العام والفئات وساعات الهدوء */
 await E(async()=>{rdS().nt.prep=0;rdS().nt.wo=0;await rdNtSync(1)});const c0=await E(()=>Object.keys(window.__M).length);
 await E(async()=>{rdS().nt.prep=1;rdS().nt.wo=1;rdS().nt.quiet={on:1,from:'18:00',to:'20:00'};await rdNtSync(1)});const c1=await E(()=>Object.keys(window.__M).length);
 await E(async()=>{rdS().nt.quiet.on=0;await rdNtSync(1)});const c2=await E(()=>Object.keys(window.__M).length);
 await E(async()=>{rdS().nt.on=0;await rdNtSync(1)});const c3=await E(()=>({n:Object.keys(window.__M).length,c:Object.keys(rdNsLoad().conf).length}));
 ok(c0===0&&c1===0&&c2===1&&c3.n===0&&c3.c===0,w+': إيقاف الفئات وساعات الهدوء والمفتاح العام تُزيل المعلّق وتُحدّث المؤكَّد',JSON.stringify([c0,c1,c2,c3]));
 await E(async()=>{rdS().nt.on=1;await rdNtSync(1)});
 /* واجهة «لدي مشكلة» والتجربة */
 const ui=await E(()=>{S.tab='ex';S.sub='set';UI.sgo={nt:true};render();const t=document.body.innerText;return{diag:/فحص الإذن|إعدادات Android|حالة الجدولة|إرسال إشعار تجريبي/.test(t),away:/منبّه الغياب/.test(t),retry:!!document.querySelector('[data-a=rdretry],[data-a=rdperm],[data-a=rdandset],[data-a=rdtest]')}});
 ok(!ui.diag&&!ui.retry&&ui.away,w+': الإشعارات في الإعدادات بلا أدوات تشخيص ومعها منبّه الغياب',JSON.stringify(ui));
 await E(async()=>{window.__F.sch=1;ACT.rdtest()});await p.waitForTimeout(200);ok(await E(()=>/تعذّرت الجدولة/.test(UI.rdtst)),w+': التجربة تُظهر فشل الجدولة');
 await E(async()=>{ACT.rdtest()});await p.waitForTimeout(200);ok(await E(()=>/لا يثبت وصول/.test(UI.rdtst)),w+': التجربة تفرّق بين قبول الجدولة ووصول الإشعار');

 /* 4) الإنجليزية: لا نصوص عربية ظاهرة في الشاشات الجديدة، لا تجاوز أفقي، الأرقام 0–9 */
 await setup();await seed();await E(()=>{rdS().city='madinah';setLang('en');return rdFetch(1)});
 const AL=['عربي + English','عربي فقط'];
 for(const [nm,f] of [['today',()=>{S.tab='dash';S.sub=null;render()}],['settings',()=>{S.tab='me';S.sub='set';UI.sgo={ap:true,wx:true,nt:true,old:false};render()}],['nc',()=>{S.tab='dash';S.sub='nc';UI.nct='ct';UI.sgo={nhelp:true};render()}],['train',()=>{S.sub=null;S.tab='train';UI.trk='run';UI.ttab='ov';UI.rdo='run';render()}]]){
  await E(f);await p.waitForTimeout(900);
  const q=await E(al=>{const o=[],wk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=wk.nextNode()){const t=n.nodeValue.trim();if(t.length<3||!/[؀-ۿ]/.test(t)||al.includes(t))continue;const el=n.parentElement;if(!el||el.closest('script,style,.nobi-x,option'))continue;let h=false,e=el;while(e&&e!==document.body){if(getComputedStyle(e).display==='none'){h=true;break}e=e.parentElement}if(!h)o.push(t.slice(0,300))}
   return{ar:o,ov:document.documentElement.scrollWidth-innerWidth,dg:/[٠-٩]/.test(document.body.innerText)}},AL);
  const KNOWN=/^(الإثنين|الثلاثاء|الأربعاء|الخميس|الجمعة|السبت|الأحد)/;
  const left=q.ar.filter(t=>!KNOWN.test(t));
  ok(q.ov<=1&&!q.dg,w+': '+nm+' بالإنجليزية: بلا تجاوز أفقي وبأرقام 0–9',JSON.stringify([q.ov,q.dg]));
  if(nm!=='today')ok(left.length===0,w+': '+nm+' بالإنجليزية: لا نصوص عربية غير مترجمة',left.slice(0,12).join(' | '));
 }
 await E(()=>setLang('ar'));
 ok(er.length===0,w+': لا أخطاء سكربت',er.join('|'));
 await ctx.close()}
 await b.close();console.log(pass+' ناجح، '+fail+' فاشل');process.exit(fail?1:0)})();
