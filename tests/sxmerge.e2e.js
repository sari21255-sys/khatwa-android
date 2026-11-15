/* دمج جلسات التمرين: حسم التعادل، الحجم المشتق، التراجع، الجلسات القديمة، التبديل العشوائي.
   تشغيل: NODE_PATH=$(npm root -g) node tests/sxmerge.e2e.js [مسار index.html]. بيانات اصطناعية، دون شبكة. */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let fail=0,pass=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
(async()=>{const b=await chromium.launch(),p=await(await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+file);await p.waitForTimeout(500);
 const R=await p.evaluate(()=>{
  const mk=(sets,extra)=>Object.assign({id:'sxT',wk:'2026-11-14',date:'2026-11-18',ts:1000,up:2000,dy:4,kd:'t',t:'أرجل',st:'p',sec:60,vol:0,
   ex:[{k:'2026-11-14|4|a',id:'a',n:'سكوات',d:4,tg:3,tr:10,o:0,sets:sets,rm:[],dn:0,sk:0}]},extra||{});
  const S1=(i,w,r,ty,up,at)=>({i:i,w:w,r:r,ty:ty||'n',rp:0,at:at||1500,up:up});
  const j=x=>JSON.stringify(x),o={};
  // 1) تعادل نفس المجموعة في اللحظة نفسها
  const a=mk([S1('s1',30,10,'n',5000)]),c=mk([S1('s1',40,10,'n',5000)]);
  const ab=sxMerge(a,c),ba=sxMerge(c,a);
  o.tieAB=ab.ex[0].sets[0].w;o.tieBA=ba.ex[0].sets[0].w;o.tieEq=j(ab)===j(ba);
  // 1b) الأحدث يفوز لا الأكبر
  const d=mk([S1('s1',50,10,'n',6000)]);o.newer=sxMerge(d,a).ex[0].sets[0].w+'/'+sxMerge(a,d).ex[0].sets[0].w;const d2=mk([S1('s1',50,10,'n',4000)]);o.newer2=sxMerge(d2,a).ex[0].sets[0].w+'/'+sxMerge(a,d2).ex[0].sets[0].w;
  // 1c) تعادل في الوزن، يحسم التكرار
  const e1=mk([S1('s1',30,8,'n',5000)]),e2=mk([S1('s1',30,9,'n',5000)]);o.tieR=sxMerge(e1,e2).ex[0].sets[0].r+'/'+sxMerge(e2,e1).ex[0].sets[0].r;
  // 2) جلسة قديمة بلا i ولا up
  const old1=mk([{w:30,r:10,ty:'n',rp:0,at:1500}]),old2=mk([{w:30,r:10,ty:'n',rp:0,at:1500}]);delete old1.up;delete old2.up;
  const om=sxMerge(old1,old2);o.oldN=om.ex[0].sets.length;o.oldStable=j(sxMerge(old1,old2))===j(sxMerge(old2,old1));
  const old3=mk([{w:30,r:10,ty:'n',rp:0,at:1500}]),old4=mk([{w:40,r:10,ty:'n',rp:0,at:1500}]);
  o.oldTie=sxMerge(old3,old4).ex[0].sets.map(q=>q.w).join()+'|'+sxMerge(old4,old3).ex[0].sets.map(q=>q.w).join();
  // 3) مجموعتان مختلفتان: 30×10 و40×10 => 700
  const m1=mk([S1('p',30,10,'n',5000,1600)]),m2=mk([S1('q',40,10,'n',5100,1700)]);
  const mm=sxMerge(m1,m2),mm2=sxMerge(m2,m1);o.vol=mm.vol+'/'+mm2.vol;o.n=mm.ex[0].sets.length;o.volEq=j(mm)===j(mm2);
  // إحماء لا يدخل الحجم
  const w1=mk([S1('p',30,10,'n',5000,1600),S1('w',20,10,'w',5001,1550)]);o.volW=sxCanon(w1).vol;
  // حجم مخزّن خاطئ يُصحَّح من المجموعات
  o.volFix=sxCanon(Object.assign(mm,{vol:400})).vol;
  // 4) التراجع عن إحداهما: tombstone من جهاز، والجهاز الآخر ما زال يحمل المجموعة
  const u=sxMerge(m1,m2);const uu=JSON.parse(JSON.stringify(u));const x=uu.ex[0],q=x.sets.find(t=>t.i==='q');x.sets=x.sets.filter(t=>t.i!=='q');x.rm=['q'];uu.up=9000;
  const after=sxMerge(uu,m2),after2=sxMerge(m2,uu);o.undoVol=after.vol+'/'+after2.vol;o.undoSets=after.ex[0].sets.map(t=>t.i).join()+'|'+after2.ex[0].sets.map(t=>t.i).join();o.undoEq=j(after)===j(after2);
  // 5) بقاء القاعدة بعد الحفظ وإعادة التحميل (تُحفظ البيانات نفسها: up وi)
  window.__t=sxMerge(a,c);o.persist=j(JSON.parse(j(window.__t)).ex[0].sets[0]);
  // 6) عشوائي: تبديل وتكرار وتجميع
  let seed=12345;const rnd=()=>(seed=(seed*1103515245+12345)&0x7fffffff)/0x7fffffff;
  const rs=()=>{const n=Math.floor(rnd()*4),sets=[];for(let k=0;k<n;k++){const id='s'+Math.floor(rnd()*4);sets.push(S1(id,[30,40,50][Math.floor(rnd()*3)],[8,10][Math.floor(rnd()*2)],['n','w','d'][Math.floor(rnd()*3)],[5000,5000,5001][Math.floor(rnd()*3)],1500+k))}
   const s=mk(sets);if(rnd()<.3)s.ex[0].rm=['s'+Math.floor(rnd()*4)];s.up=2000+Math.floor(rnd()*3);return s};
  let comm=0,idem=0,assoc=0,volok=0,N=300;
  for(let k=0;k<N;k++){const A=rs(),B=rs(),C=rs();
   if(j(sxMerge(A,B))===j(sxMerge(B,A)))comm++;const M=sxMerge(A,B);if(j(sxMerge(M,M))===j(M)&&j(sxMerge(M,A))===j(M))idem++;
   if(j(sxMerge(sxMerge(A,B),C))===j(sxMerge(A,sxMerge(B,C))))assoc++;
   const V=M.ex[0].sets.filter(t=>t.ty!=='w').reduce((s,t)=>s+t.w*t.r,0);if(M.ex[0].sets.length?M.vol===V:true)volok++}
  o.rand={N:N,comm:comm,idem:idem,assoc:assoc,volok:volok};
  return o});
 ok(R.tieAB===40&&R.tieBA===40&&R.tieEq,'تعادل 30/40 في اللحظة نفسها يعطي 40 بالترتيبين وبنتيجة متطابقة',R.tieAB+'/'+R.tieBA);
 ok(R.newer==='50/50','الأحدث يفوز حتى لو كان الأصغر أو الأكبر (بالترتيبين)',R.newer);
 ok(R.newer2==='30/30','الأحدث يفوز حتى لو كان الأصغر (a أحدث من d2 رغم أن d2 أكبر)',R.newer2);
 ok(R.tieR==='9/9','تعادل الوزن يُحسم بالتكرار',R.tieR);
 ok(R.oldN===1&&R.oldStable,'جلسة قديمة بلا i ولا up: مجموعة واحدة ونتيجة ثابتة');
 ok(R.oldTie==='30,40|30,40'||/^(\d+,?)+\|\1$/.test(R.oldTie),'قديمة بمجموعتين مختلفتين بلا معرّف: النتيجة نفسها بالترتيبين',R.oldTie);
 ok(R.n===2&&R.vol==='700/700'&&R.volEq,'30×10 و40×10: مجموعتان والحجم 700 بالترتيبين',R.vol);
 ok(R.volW===300,'الإحماء لا يدخل الحجم',R.volW);
 ok(R.volFix===700,'حجم مخزّن خاطئ (400) يُصحَّح من المجموعات النهائية',R.volFix);
 ok(R.undoVol==='300/300'&&R.undoSets==='p|p'&&R.undoEq,'بعد التراجع عن 40×10 يبقى 300 والمجموعة المحذوفة لا تعود من الجهاز الآخر',R.undoVol+' '+R.undoSets);
 ok(/"w":40/.test(R.persist)&&/"up":5000/.test(R.persist),'المجموعة الفائزة تحمل up بعد التسلسل (تبقى القاعدة بعد إعادة التحميل)',R.persist);
 ok(R.rand.comm===300&&R.rand.idem===300&&R.rand.assoc===300&&R.rand.volok===300,'300 حالة عشوائية: تبديلي وتجميعي ومتساوي القوة والحجم مشتق',JSON.stringify(R.rand));
 // إعادة التحميل: حجم الملخص يُحسب من المجموعات
 await p.evaluate(()=>{S.prof.ob=1;const T=sxMerge({id:'sxM',wk:W(),date:TD(),ts:1,up:2,dy:TI(),kd:'t',t:'اختبار',st:'p',sec:0,vol:0,ex:[{k:'k1',id:'a',n:'سكوات',d:TI(),tg:2,tr:10,o:0,sets:[{i:'p',w:30,r:10,ty:'n',rp:0,at:5,up:5}],rm:[],dn:0,sk:0}]},{id:'sxM',wk:W(),date:TD(),ts:1,up:3,dy:TI(),kd:'t',t:'اختبار',st:'p',sec:0,vol:400,ex:[{k:'k1',id:'a',n:'سكوات',d:TI(),tg:2,tr:10,o:0,sets:[{i:'q',w:40,r:10,ty:'n',rp:0,at:6,up:6}],rm:[],dn:0,sk:0}]});S.sx={sxM:T};save()});
 await p.reload();await p.waitForTimeout(400);
 const rl=await p.evaluate(()=>({v:S.sx.sxM.vol,v2:sxVol(S.sx.sxM),n:S.sx.sxM.ex[0].sets.length}));
 ok(rl.v===700&&rl.v2===700&&rl.n===2,'بعد إعادة التحميل: مجموعتان والحجم 700',JSON.stringify(rl));
 ok(errs.length===0,'لا أخطاء صفحة',errs.join('|'));
 console.log(`\n${pass} نجح، ${fail} فشل`);await b.close();process.exit(fail?1:0)})();
