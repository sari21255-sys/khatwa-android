/* المسارات الخمسة: جلسة مشتركة، الجري، السباحة، الكالسثينكس، الوظيفي، الديدلفت، التوافق مع الحديد. بيانات اصطناعية. */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let fail=0,pass=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x!==undefined?'  ['+x+']':''))}};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
 const go=async()=>{await p.goto('file://'+file);await p.waitForTimeout(400)};
 const E=f=>p.evaluate(f);const click=async s=>{await p.click(s);await p.waitForTimeout(60)};
 const hub=async()=>{await E(()=>{S.tab='train';UI.trk='hub';UI.ses=null;UI.sum=null;render()});await p.waitForTimeout(60)};
 await go();await E(()=>{S.prof.ob=1;S.prof.name='م';S.sx={s1:{id:'s1',wk:W(),date:TD(),ts:1,t:'يوم أ',st:'c',sec:100,vol:0,ex:[{k:'a',id:'a',n:'ديدلفت',d:0,sets:[{w:140,r:5,ty:'n'},{w:100,r:10,ty:'n'}]},{k:'b',id:'b',n:'سومو ديدلفت',d:0,sets:[{w:120,r:3,ty:'n'}]},{k:'c',id:'c',n:'رومانيان ديدلفت',d:0,sets:[{w:90,r:8,ty:'n'}]}]}};save();render()});
 const sx0=await E(()=>JSON.stringify(S.sx));
 /* المركز */
 await hub();let n=await E(()=>document.querySelectorAll('.sjtk').length);ok(n===5,'المركز يعرض 5 مسارات',n);
 const names=await E(()=>[...document.querySelectorAll('.sjtk b')].map(x=>x.textContent).join('|'));ok(/الجري/.test(names)&&/السباحة/.test(names)&&/الكالسثينكس/.test(names)&&/التدريب الوظيفي/.test(names)&&/الحديد/.test(names),'أسماء المسارات الخمسة',names);
 /* الجري */
 await click('.sjtk[data-v=run]');await click('[data-a=runst][data-m=free]');
 ok(await E(()=>!!UI.ses&&tkOpen().k==='run'),'بدء جلسة جري');
 ok(await E(()=>document.querySelector('#nav').innerHTML.trim()===''),'الشريط السفلي مخفي أثناء الجلسة');
 await p.waitForTimeout(1200);
 await p.fill('[data-a=rundist]','2.5');await p.dispatchEvent('[data-a=rundist]','change');
 await click('[data-a=tkpause]');const a1=await E(()=>tkAct(tkOpen()));await p.waitForTimeout(700);const a2=await E(()=>tkAct(tkOpen()));ok(a1>=1000&&Math.abs(a2-a1)<50,'الإيقاف المؤقت يجمّد الزمن',a1+'/'+a2);
 await p.reload();await p.waitForTimeout(500);ok(await E(()=>!!tkOpen()&&tkOpen().st==='pau'&&tkOpen().d.dist==='2.5'),'الجلسة المتوقفة تنجو من إعادة التحميل');
 await E(()=>{S.tab='train';UI.trk='hub';render()});await p.waitForTimeout(60);ok(await E(()=>/جلسة جارية/.test(document.querySelector('#app').textContent)),'لافتة الاستئناف تظهر');
 await click('[data-a=tkopen]');await click('[data-a=tkpause]');await p.waitForTimeout(300);ok(await E(()=>tkOpen().st==='act'),'الاستئناف');
 await click('.sjses [data-a=tkend]');ok(await E(()=>!!UI.sum&&tkDone('run').length===1&&tkDone('run')[0].res.km===2.5),'إنهاء الجلسة يحفظ المسافة',await E(()=>JSON.stringify(tkDone('run')[0].res)));
 ok(await E(()=>/\/كم/.test(tkDone('run')[0].res.pace)),'الوتيرة محسوبة');
 await click('[data-a=tksumx]');ok(await E(()=>/جلسة|دقيقة|د/.test(document.querySelector('#tk-log').textContent)),'تظهر في السجل');
 /* السباحة: 4×25 م = 100 م */
 await hub();await click('.sjtk[data-v=swim]');await E(()=>{UI.ttab='pl';render()});
 await E(()=>{swCfg().pool=25;swCfg().u='m';render()});
 await click('[data-a=swst][data-id=tech]');
 ok(await E(()=>tkOpen().k==='swim'&&tkOpen().d.pool===25),'جلسة سباحة بطول مسبح 25');
 await E(()=>{const s=tkOpen();s.d.sets=[{st:'حرة',rep:4,d:25,rest:15,len:null,sec:null,str:null,done:0}];render()});
 await click('[data-a=swdone][data-i="0"]');await click('.sjses [data-a=tkend]');
 const sw=await E(()=>tkDone('swim')[0].res);ok(sw.dist===100,'4 × 25 م = 100 م',sw.dist);
 await E(()=>{swCfg().pool=50;const s=tkDone('swim')[0];ok2=s.d.pool});ok(await E(()=>tkDone('swim')[0].d.pool)===25,'تغيير إعداد المسبح لا يغيّر جلسة محفوظة');
 /* تصحيح الأطوال */
 await hub();await click('.sjtk[data-v=swim]');await E(()=>{swCfg().pool=25;render()});
 /* كالسثينكس */
 await hub();await click('.sjtk[data-v=cali]');await click('[data-a=cast][data-id=""]');
 await E(()=>{const st=caSt('pl');st.i=1;render()});
 await p.fill('[data-tf=cvpl]','6');await E(()=>{UI.tf.capl='band';UI.tf.cwpl=''});await click('[data-a=calog][data-sk=pl]');
 await p.fill('[data-tf=cvhs]','20');await click('[data-a=calog][data-sk=hs]');
 const ce=await E(()=>tkOpen().d.ents);ok(ce.length===2&&ce[0].as==='band'&&ce[0].v==='عقلة بمساعدة'&&ce[1].val===20&&ce[1].m==='hold','عقلة بمساعدة وثبات 20 ث',JSON.stringify(ce));
 await click('.sjses [data-a=tkend]');
 ok(await E(()=>caBest('pl',1,'band')===6&&caBest('pl',1,'none')===null),'الرقم القياسي منفصل حسب نوع المساعدة');
 /* مراحل المهارة: لا ترقية تلقائية */
 ok(await E(()=>caSt('pl').i===1),'لا ترقية تلقائية للمرحلة');
 /* وظيفي */
 await hub();await click('.sjtk[data-v=fn]');await click('[data-a=fnpick][data-id=a12]');await click('[data-a=fnstart]');
 ok(await E(()=>tkOpen().k==='fn'&&tkOpen().plan.fmt==='amrap'),'بدء AMRAP');
 for(let i=0;i<15;i++)await click('[data-a=fnnext]');/* 5 جولات كاملة (3 حركات) */
 for(let i=0;i<2;i++)await click('[data-a=fnnext]');
 const d5=await E(()=>({r:tkOpen().d.r,ex:tkOpen().d.ex}));ok(d5.r===5&&d5.ex===25,'5 جولات + حركتان داخل الجولة',JSON.stringify(d5));
 await click('[data-a=fnundo]');await E(()=>{const d=tkOpen().d;d.r=5;d.m=1;d.ex=15;render()});
 await E(()=>{const d=tkOpen().d;d.ex=7;d.m=1;render()});
 await click('.sjses [data-a=tkend]');const fr=await E(()=>tkDone('fn')[0].res);ok(fr.rounds===5&&fr.extra===7&&fr.total===5*37+7,'AMRAP: 5 جولات + 7 تكرارات',JSON.stringify(fr));
 ok(await E(()=>/جولة/.test(fnLine(tkDone('fn')[0]))),'سطر النتيجة');
 /* For Time مع سقف → جزئي */
 await hub();await E(()=>{fnStart('ft3','rx','')});await E(()=>{const s=tkOpen();s.acc=15*60000;s.ra=null;s.st='pau';s.d.r=2;s.d.ex=10;tkFinish(s,tkPartial(s));render()});
 const ft=await E(()=>tkDone('fn')[0].res);ok(ft.partial===true&&ft.capped===true,'سقف الزمن: جزئي ومسجّل بلا زمن كامل',JSON.stringify(ft));
 /* تعديل الحصة ينشئ إصدارًا ومقارنة منفصلة */
 await hub();await click('.sjtk[data-v=fn]');await E(()=>{UI.ttab='pl';ACT.fnedit({dataset:{id:'a12'}});UI.fb.n='اثنتا عشرة معدّلة';render()});
 await E(()=>{ACT.fbsave()});ok(await E(()=>SJ().ft.length===1&&SJ().ft[0].ver===2),'تعديل قالب ينشئ نسخة بإصدار أعلى');
 /* الديدلفت منفصل */
 await hub();await click('.sjtk[data-v=iron]');await click('[data-a=trk][data-v=dl]');
 const dl=await E(()=>{const o=dlData();return Object.keys(o).map(k=>k+':'+o[k].length).join(',')});ok(/تقليدي:2/.test(dl)&&/سومو:1/.test(dl)&&/روماني:1/.test(dl),'نسخ الديدلفت منفصلة',dl);
 await E(()=>{UI.dlv='تقليدي';render()});ok(await E(()=>/الحد الأقصى المقدّر/.test(document.querySelector('#app').textContent)&&/\(1 \+/.test(document.querySelector('#app').textContent)),'تقدير 1RM مع ذكر الطريقة');
 /* جلستان في يوم */
 ok(await E(()=>new Set(tkDone().filter(s=>s.day===TD()).map(s=>s.k)).size>=3),'عدة رياضات في اليوم نفسه');
 /* تعارض جلستين */
 await hub();await E(()=>{runStart(null,'free')});await E(()=>{S.tab='train';UI.ses=null;UI.trk='hub';render()});
 const bad=await E(()=>{const r=tkNew('swim',null,{d:{}});return r===false&&!!UI.tconf});ok(bad,'بدء رياضة ثانية أثناء جلسة جارية يعرض بطاقة اختيار');
 await E(()=>{render()});ok(await E(()=>/جلسة جارية في/.test(document.querySelector('#app').textContent)),'بطاقة التعارض ظاهرة');
 await E(()=>{const o=tkOpen();tkFinish(o,1);UI.sum=null;UI.tconf=null;render()});
 /* سجل موحّد بفلتر */
 await E(()=>{S.tab='pg';S.sub='';UI.trk='hub';render()});
 ok(await E(()=>!!document.querySelector('#tk-log')),'السجل الموحّد في التقدّم');
 await click('[data-a=tkflt][data-v=iron]');ok(await E(()=>/ديدلفت|يوم أ/.test(document.querySelector('#tk-log').textContent)||tkAllLog('iron').length>0),'فلتر الحديد يعرض جلسات S.sx');
 /* الحديد لم يُمسّ */
 ok(await E(()=>JSON.stringify(S.sx))===sx0,'بيانات الحديد S.sx لم تتغيّر');
 /* ترقية من نسخة قديمة بلا S.sj */
 await E(()=>{delete S.sj;save()});await p.reload();await p.waitForTimeout(500);ok(await E(()=>{const o=SJ();return Array.isArray(o.ss)&&Array.isArray(o.ft)}),'نسخة قديمة بلا S.sj تُرقّى بلا خطأ');
 /* سباحة: مياه مفتوحة وكرونو */
 await E(()=>{S.prof.ob=1;swStart(null,'open');const s=tkOpen();s.d.open.dist='1500';s.acc=30*60000;s.ra=null;tkFinish(s,0);render()});
 ok(await E(()=>/\/100/.test(tkDone('swim')[0].res.pace)),'متوسط 100 م في المياه المفتوحة');
 /* يدوي */
 await E(()=>{UI.tf={mmrun:'30',mlrun:'5',mdrun:TD()};ACT.tkman({dataset:{k:'run'}});});ok(await E(()=>tkDone('run').some(s=>s.man&&s.res.km===5)),'تسجيل جري سابق يدويًا');
 ok(er.length===0,'لا أخطاء سكربت',er.join('|'));
 await b.close();console.log(pass+' ناجح، '+fail+' فاشل');process.exit(fail?1:0)})();
