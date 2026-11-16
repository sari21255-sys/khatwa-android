/* الإعدادات المجمّعة، الملف، الطقس والصلاة، «جهّز تمرينك»، مركز الإشعارات. مزوّدات محاكاة وساعة ثابتة. */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let fail=0,pass=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x!==undefined?'  ['+x+']':''))}};
(async()=>{const b=await chromium.launch();
 for(const w of [390,320]){
 const ctx=await b.newContext({viewport:{width:w,height:844},timezoneId:'Asia/Riyadh'});const p=await ctx.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
 const E=(f,a)=>p.evaluate(f,a);const click=async s=>{await p.click(s);await p.waitForTimeout(80)};
 await p.goto('file://'+file);await p.waitForTimeout(400);
 await E(()=>{window.__now=Date.parse('2026-11-16T09:00:00+03:00');S.prof.ob=1;S.prof.name='';WXP.fn=async c=>({src:'محاكاة',hours:window.__H||[]});save();render()});
 const T=async(m)=>E(m=>{return 0},0);
 /* مواقيت الصلاة */
 const pr=await E(()=>{const t=rdPray('2026-11-16'),c=rdCity(),f=k=>{const p=rdP(t[k],c.tz);return p.h*60+p.m};return{fa:f('fajr'),sr:f('sunrise'),dh:f('dhuhr'),as:f('asr'),mg:f('maghrib'),is:f('isha')}});
 ok(pr.fa<pr.sr&&pr.sr<pr.dh&&pr.dh<pr.as&&pr.as<pr.mg&&pr.mg<pr.is,w+': ترتيب المواقيت صحيح',JSON.stringify(pr));
 ok(pr.dh>=715&&pr.dh<=735&&pr.sr>=360&&pr.sr<=400&&pr.mg>=1030&&pr.mg<=1070,w+': مواقيت المدينة في نطاق معقول (ظهر/شروق/مغرب)',JSON.stringify(pr));
 const uq=await E(()=>{const s=rdS();const a=rdTimes('2026-11-16',rdCity(),'uq','s'),b=rdTimes('2026-11-16',rdCity(),'mwl','s');return[a.isha-a.maghrib,b.isha-b.maghrib]});ok(uq[0]===90&&uq[1]!==90,w+': أم القرى: العشاء بعد المغرب بـ 90 د',uq.join());
 /* الإعدادات */
 await E(()=>{S.tab='dash';S.sub='set';render()});
 ok(await E(()=>/ضيف/.test(document.querySelector('.sjpc').textContent)&&!!document.querySelector('.sjpc [data-a=sub][data-v=pf]')),w+': بطاقة «ضيف» وزر ملفي الشخصي');
 const gs=await E(()=>[...document.querySelectorAll('.sjgrp>summary b')].map(x=>x.textContent));
 ok(['المظهر واللغة','التدريب والوحدات','الوقت والطقس','مواقيت الصلاة','الإشعارات','تذكير التمرين اليومي','الحساب والمزامنة','البيانات والنسخ والخصوصية'].every(x=>gs.includes(x)),w+': ثماني مجموعات نهائية',gs.join());
 ok(await E(()=>/المدينة المنورة/.test(document.querySelector('.sjgrp[data-g=wx] .v').textContent)),w+': القيمة الحالية بجانب الاسم');
 await click('.sjgrp[data-g=wx]>summary');ok(await E(()=>document.querySelector('.sjgrp[data-g=wx]').open&&UI.sgo.wx===true),w+': فتح القسم وحفظ حالته');
 await E(()=>{render()});ok(await E(()=>document.querySelector('.sjgrp[data-g=wx]').open),w+': حالة الفتح تبقى بعد إعادة الرسم');
 ok(await E(()=>!document.querySelector('#set-old')&&!/إعدادات سابقة/.test(document.body.innerText)),w+': قسم «إعدادات سابقة» أُزيل بعد نقل كل إعداد إلى مكانه');
 /* اختيار مدينة دون إذن موقع */
 await E(()=>{const s=document.querySelector('select[data-rd=city]');s.value='riyadh';s.dispatchEvent(new Event('change',{bubbles:true}))});await p.waitForTimeout(150);
 ok(await E(()=>rdS().city==='riyadh'&&rdCity().n==='الرياض'),w+': ضيف يختار مدينة بلا إذن موقع');
 await E(()=>{rdS().city='madinah';rdS().cus=null;SJ().wx=null;save()});
 /* فيض أفقي */
 for(const [nm,fn] of [['set',()=>{S.tab='dash';S.sub='set';render()}],['pf',()=>{S.sub='pf';render()}],['nc',()=>{S.sub='nc';UI.nct='ct';render()}],['nci',()=>{UI.nct='in';render()}],['today',()=>{S.sub=null;S.tab='dash';render()}]]){await E(fn);await p.waitForTimeout(80);ok(await E(()=>document.documentElement.scrollWidth<=innerWidth+1),w+': لا فيض أفقي في '+nm,await E(()=>document.documentElement.scrollWidth))}
 /* الملف */
 await E(()=>{S.sub='pf';render()});ok(await E(()=>/ملفي الشخصي/.test(document.querySelector('h1').textContent)&&/الرياضات والأهداف/.test(document.body.textContent)&&/القياسات/.test(document.body.textContent)),w+': صفحة الملف');
 await click('[data-a=rdfav][data-v=run]');ok(await E(()=>rdS().fav.includes('run')&&!!document.querySelector('[data-rd="goals.run"]')),w+': اختيار مسار وهدفه');
 await E(()=>{UI.tf.plN='نادي الحي';UI.tf.plC='madinah';UI.tf.plI='in'});await click('[data-a=rdpladd]');ok(await E(()=>rdS().places.length===1),w+': حفظ مكان تدريب');
 /* الطقس: توقع حار + غروب + صلاة (جري) */
 const mk=(date,feels,code,uv,pop)=>E(a=>{const c=rdCity(),H=[];for(let h=0;h<48;h++){const day=h<24?'2026-11-16':'2026-11-17',t=rdAt(day,(h%24)*60,c.tz);H.push({t:t,temp:a.f-2,feels:a.f,hum:30,pop:a.pop,code:a.code,wind:10,gust:15,uv:a.uv})}window.__H=H},{f:feels,code:code,uv:uv,pop:pop});
 await mk(0,41,1,8,10);
 await E(async()=>{rdS().pa.asr=1;rdS().pa.maghrib=1;const ds='2026-11-16',t=rdPray(ds);const c=rdCity();const h=rdP(t.asr-10*6e4,c.tz);const hm=String(h.h).padStart(2,'0')+':'+String(h.m).padStart(2,'0');rdPlanState('run').at=hm;rdPlanState('run').dur=60;rdPlanState('run').io='out';await rdFetch(1)});
 const sm=await E(()=>{const s=rdSummary('run');return{ids:s.adv.map(a=>a.id),pr:s.pr.map(p=>p.k)}});
 ok(sm.ids.includes('heat-high')&&sm.ids.includes('uv')&&sm.pr.includes('asr'),w+': جري: حرارة مرتفعة + أشعة + تقاطع مع العصر',JSON.stringify(sm));
 await E(()=>{rdPlanState('run').at=(()=>{const t=rdPray('2026-11-16'),h=rdP(t.maghrib-40*6e4,rdCity().tz);return String(h.h).padStart(2,'0')+':'+String(h.m).padStart(2,'0')})();rdPlanState('run').dur=90});
 ok(await E(()=>rdSummary('run').adv.some(a=>a.id==='dark')&&rdSummary('run').pr.some(p=>p.k==='maghrib')),w+': جري يتقاطع مع الغروب والمغرب');
 /* بطاقة «جهّز تمرينك» في صفحة المسار */
 await E(()=>{S.sub=null;S.tab='train';UI.trk='run';UI.ttab='ov';UI.rdo='run';render()});ok(await E(()=>!!document.querySelector('#rd-run')&&/تتقاطع مع/.test(document.querySelector('#rd-run').textContent)),w+': البطاقة تعرض التقاطع مع الصلاة قبل البدء');
 ok(await E(()=>/CDC/.test(document.querySelector('#rd-run').textContent)),w+': مصدر القاعدة ظاهر');
 /* مقارنة الأوقات */
 await E(()=>{window.__H=window.__H.map(h=>{const p=rdP(h.t,rdCity().tz).h;return Object.assign({},h,{feels:p>=19||p<8?24:41,uv:p>=19||p<8?0:8})});rdS().pa.asr=0;rdS().pa.maghrib=0;rdPlanState('run').dur=40;return rdFetch(1)});
 await click('[data-a=rdcmp][data-v=run]');const wn=await E(()=>document.querySelectorAll('.sjwin').length);ok(wn>=1&&wn<=3,w+': نوافذ مقترحة (1–3)',wn);
 await click('.sjwin [data-a=rdmove]');ok(await E(()=>!!UI.rdmv&&!!document.querySelector('.sjmv')&&/المدينة/.test(document.querySelector('.sjmv').textContent)),w+': «غيّر وقت الحصة» يعرض اليوم والوقت والمدينة قبل الحفظ');await click('[data-a=rdmvok]');await p.waitForTimeout(100);ok(await E(()=>SJ().one.length===1&&!UI.rdmv),w+': تأكيد النقل يحفظ الحصة');
 /* صاعقة في السباحة الخارجية */
 await mk(0,28,95,3,70);await E(async()=>{rdPlanState('swim').io='out';rdPlanState('swim').at='10:00';rdPlanState('swim').dur=45;await rdFetch(1)});
 const sw=await E(()=>rdSummary('swim').adv[0]);ok(sw&&sw.id==='lightning'&&/اخرج من الماء/.test(sw.t)&&/ليس تحذيرًا رسميًا/.test(sw.t),w+': سباحة خارجية: البرق في المقدمة وميّز التوقع من الرسمي');
 ok(await E(()=>rdSummary('swim').adv.some(a=>a.id==='swim-nowarn')),w+': يُذكر غياب مصدر تحذيرات المياه');
 /* تنبيه رسمي يتقدّم */
 await E(async()=>{WXA.fn=async()=>({t:'رياح قوية',src:'جهة اختبار',from:rdAt('2026-11-16',0,rdCity().tz),to:rdAt('2026-11-17',0,rdCity().tz)});await rdFetch(1)});
 ok(await E(()=>rdSummary('swim').adv[0].id==='official'&&/جهة اختبار/.test(rdSummary('swim').adv[0].t)),w+': التحذير الرسمي أولًا مع مصدره');await E(()=>{WXA.fn=null;rdFetch(1)});
 /* حصة حديد داخلية */
 await E(()=>{rdPlanState('iron').io='in';rdPlanState('iron').at='18:00'});
 ok(await E(()=>{const a=rdSummary('iron').adv.map(x=>x.id);return a.includes('water')&&!a.includes('heat-high')&&!a.includes('uv')}),w+': الحديد الداخلي: ماء فقط بلا نصائح طقس');
 /* توقع قديم بلا شبكة */
 await E(async()=>{rdWx().at=window.__now-4*36e5;WXP.fn=async()=>{throw new Error('offline')};await rdFetch(1)});
 ok(await E(()=>rdStale()==='stale'&&!!rdWx()),w+': فشل الشبكة يُبقي التوقع المخزّن ويُعلّمه قديمًا');
 await E(()=>{S.tab='dash';S.sub=null;render()});ok(await E(()=>/التوقع قديم/.test(document.querySelector('.sjwx').textContent)),w+': بطاقة اليوم تُظهر أن التوقع قديم');
 await E(()=>{rdWx().at=window.__now-30*36e5;render()});ok(await E(()=>rdStale()==='expired'&&/انتهت صلاحية/.test(document.querySelector('.sjwx').textContent)),w+': انتهاء الصلاحية واضح');
 /* تغيير المدينة أثناء السفر */
 await E(()=>{WXP.fn=async c=>({src:'محاكاة',hours:[]});const t0=rdF(window.__now,'Asia/Riyadh');window.__t0=t0;rdSetPath('city','london');UI._rdf=undefined});
 ok(await E(()=>rdCity().tz==='Europe/London'&&rdF(window.__now,'Europe/London')!==window.__t0&&rdWx()===null),w+': تغيير المدينة يغيّر المنطقة الزمنية ولا يستخدم توقع مدينة أخرى');
 await E(()=>{rdSetPath('city','madinah')});
 /* الإشعارات: معرّفات ثابتة، لا تكرار، إلغاء عند النقل */
 await E(()=>{window.__M={};window.__P=[];window.__C=[];localStorage.removeItem('sijil_ntst');NTS.impl={async perm(){return'granted'},async cancel(ids){window.__C.push(ids.slice());ids.forEach(i=>delete window.__M[i]);window.__P=Object.values(window.__M)},async schedule(l){l.forEach(x=>window.__M[x.id]=x);window.__P=Object.values(window.__M)}};rdS().nt.on=1;rdS().nt.wo=1;rdS().nt.prep=1;rdS().pref.water=0;
  const wd=(new Date('2026-11-16T12:00:00Z').getUTCDay()+1)%7;SJ().one=[];SJ().tw[wd]=[{id:'wA',k:'run',t:'ez',at:'16:00'}];rdPlanState('run').at='16:00';rdPlanState('run').io='out';rdPlanState('run').dur=40;rdS().pa.dhuhr=0;rdS().pa.asr=0;rdS().pa.maghrib=0;rdS().pa.fajr=0;rdS().pa.isha=0});
 await mk(0,36,1,5,10);await E(async()=>{await rdFetch(1);window.__A=await rdNtSync(1);window.__ids1=window.__P.map(x=>x.id)});
 const n1=await E(()=>window.__P.length);ok(n1===1,w+': تنبيه واحد مدمج للحصة الخارجية (طقس + حصة)',n1);
 ok(await E(()=>window.__P[0].cat==='prep'&&/ماء|الحرارة/.test(window.__P[0].body)),w+': فئة «الطقس والاستعداد»');
 await E(async()=>{await rdNtSync(1)});ok(await E(()=>window.__P.length===1&&window.__P[0].id===window.__ids1[0]),w+': إعادة الجدولة لا تُكرّر والمعرّف ثابت');
 await E(async()=>{ACT.rdmove({dataset:{k:'run',at:rdAt('2026-11-16',17*60,rdCity().tz),id:'wA',ds:'2026-11-16'}});UI.rdmv.scope='all';ACT.rdmvok();await rdNtSync(1)});
 ok(await E(()=>window.__P.length===1&&window.__P[0].id===window.__ids1[0]&&window.__P[0].at!==window.__A[0].at&&window.__C.some(c=>c.includes(window.__ids1[0]))),w+': نقل الحصة: المعرّف ثابت، يُلغى القديم ويُجدول الوقت الجديد');
 await E(async()=>{rdS().nt.quiet={on:1,from:'15:00',to:'18:00'};await rdNtSync(1)});ok(await E(()=>window.__P.length===0),w+': ساعات الهدوء تُسقط التنبيه');
 await E(async()=>{rdS().nt.quiet.on=0;rdS().nt.on=0;await rdNtSync(1)});ok(await E(()=>window.__P.length===0),w+': المفتاح العام يوقف الجدولة');
 await E(()=>{rdS().nt.on=1});
 /* صلاة: تنبيه مستقل */
 await E(async()=>{rdS().pa.asr=1;await rdNtSync(1)});ok(await E(()=>window.__P.some(x=>x.cat==='prayer'&&/العصر/.test(x.title))),w+': تنبيه صلاة مستقل');
 /* تنبيه تجريبي في الوارد */
 await E(()=>{S.sub='nc';UI.nct='ct';UI.sgo={nhelp:true};render()});await click('[data-a=rdtest]');await E(()=>{UI.nct='in';render()});ok(await E(()=>/إشعار تجريبي/.test([...document.querySelectorAll('.ncr')].map(x=>x.textContent).join())),w+': الإشعار التجريبي يظهر في الوارد');
 /* وارد: عنصر حان وقته يُسجَّل مرة واحدة */
 await E(()=>{window.__now=rdAt('2026-11-16',17*60+5,rdCity().tz);S.nf=[];NCT=0;ncGen();ncGen()});const dn=await E(()=>S.nf.filter(x=>/^nt/.test(x.id)&&!/ntest/.test(x.id)).length);ok(dn>=1,w+': التنبيه المستحق يدخل الوارد',dn);
 await E(()=>{NCT=0;ncGen()});ok(await E(()=>new Set(S.nf.map(x=>x.id)).size===S.nf.length),w+': لا تكرار في الوارد');
 /* جلسة: فاصل الصلاة + إيقاف واستئناف + تبديل المظهر لا يفقد المجموعات */
 await E(()=>{window.__now=Date.now();});
 await E(()=>{const c=rdCity(),t=rdPray(rdP(Date.now(),c.tz).d);window.__now=t.asr+5*6e4;rdS().pa.asr=1;S.sub=null;S.tab='train';UI.trk='cali';tkNew('cali',null,{d:{ents:[],eq:'none'}});window.__sid=UI.ses;tkOpen().d.ents.push({sk:'pu',i:0,v:'ضغط',m:'reps',val:12,as:'none',w:0,sd:'both',at:1});render()});
 ok(await E(()=>/أوقف مؤقتًا/.test(document.querySelector('.sjses').textContent)&&/العصر/.test(document.querySelector('.sjses').textContent)),w+': بانر فاصل الصلاة داخل الجلسة');
 await click('.sjses [data-a=rdrem]');ok(await E(()=>tkOpen().rem===1),w+': «ذكّرني بعد هذه المجموعة»');
 await click('.sjses .sjwarn [data-a=tkpause]');ok(await E(()=>tkOpen().st==='pau'),w+': أوقف مؤقتًا');
 await E(()=>{ACT.thset({dataset:{v:'olive'}});render()});const th=await E(()=>THEMES.map(t=>t[0]));
 for(const t of th){await E(t=>{ACT.thset({dataset:{v:t}});render()},t)}
 ok(await E(()=>tkOpen().d.ents.length===1&&tkOpen().st==='pau'),w+': تبديل المظاهر الستة لا يفقد المجموعات ولا حالة الإيقاف');
 await click('.sjses [data-a=tkpause]');ok(await E(()=>tkOpen().st==='act'),w+': الاستئناف');
 ok(er.length===0,w+': لا أخطاء سكربت',er.join('|'));
 await ctx.close()}
 await b.close();console.log(pass+' ناجح، '+fail+' فاشل');process.exit(fail?1:0)})();
