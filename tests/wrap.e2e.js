/* التفاف الأسماء الطويلة والأرقام داخل الأزرار والحقول عند 320 و390. تشغيل: NODE_PATH=$(npm root -g) node tests/wrap.e2e.js [index.html]. لقطات في docs/ux/evidence/wrap/. */
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));const OUT=path.join(__dirname,'../docs/ux/evidence/wrap');fs.mkdirSync(OUT,{recursive:true});
let fail=0,pass=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
const LONG='ضغط الكتف بالدمبل على المقعد المائل بزاوية ثلاثين درجة مع التحكم الكامل بالنزول';
const LONGM='سلطة دجاج مشوي بالأعشاب مع صلصة الزبادي والليمون وزيت الزيتون البكر الممتاز';
const PLAN=`(()=>{const r={t:'راحة',ex:[]};return[0,1,2,3,4,5,6].map(i=>i===4?{t:'${LONG}',ex:[E('${LONG}',3,12,35),E('سكوات بالبار الأمامي',3,10,100)]}:r)})()`;
(async()=>{const b=await chromium.launch();
 for(const w of [320,390]){
  const c=await b.newContext({viewport:{width:w,height:780},deviceScaleFactor:1});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.clock.install({time:new Date('2026-11-18T13:00:00+03:00')});await p.goto('file://'+file);await p.waitForTimeout(500);await p.clock.resume();
  await p.evaluate(pl=>{S.prof.ob=1;S.prof.name='عبدالرحمن بن محمد الشمري الحربي';S.prof.dpw=3;S.plan=eval(pl);S.bw={'2026-11-10':82.45};S.tab='train';UI.trk='hub';save();render()},PLAN);
  const check=async n=>{await p.waitForTimeout(250);const o=await p.evaluate(()=>{const bad=[];document.querySelectorAll('button,.btn,.chip,.tag,input,select,label.f,.nm4 *,.tile *').forEach(e=>{const r=e.getBoundingClientRect();if(!r.width)return;const cs=getComputedStyle(e);if(cs.overflow==='hidden'&&cs.textOverflow!=='ellipsis'&&e.scrollWidth>e.clientWidth+1&&e.tagName!=='INPUT')bad.push(e.tagName+'.'+e.className+':'+(e.innerText||'').slice(0,20))});
   return{page:document.documentElement.scrollWidth>innerWidth+1,clip:bad.slice(0,4)}});
   ok(!o.page,`${w} ${n}: لا تمرير أفقي`);ok(o.clip.length===0,`${w} ${n}: لا نص مقصوص داخل الأزرار والحقول`,o.clip.join(' | '));await p.screenshot({path:`${OUT}/${n}-${w}.png`})};
  await check('today');
  await p.click('#sx-go');await p.waitForTimeout(150);await check('player');
  await p.fill('#wk-w','137.5');await p.evaluate(()=>{const d=document.querySelector('#wk-det');if(d)d.open=true});await p.click('[data-a=wkty][data-v=d]');await p.click('[data-a=wkset]');await p.waitForTimeout(150);await check('player-set');
  const t=await p.evaluate(()=>document.body.innerText);ok(/137[.٫]5/.test(t)&&/12/.test(t),`${w} الأرقام (137.5 و12) ظاهرة بجانب العربية`);
  await p.evaluate(()=>{S.sub=null;S.tab='train';UI.trk='hub';UI.wk=null;render()});
  await p.evaluate(m=>{S.meals[TD()]=[{id:'a',n:m,kcal:1234,p:98.5,c:100,f:45,slot:'l'}];S.wn[TD()]='ملاحظة طويلة جدًا عن الوزن بعد التمرين الصباحي وقبل الإفطار بساعة';save();S.tab='food';S.sub=null;render()},LONGM);await check('food');
  await p.evaluate(()=>{UI.qa='meal';render()});await check('food-form');
  await p.evaluate(()=>{S.sub='wgt';S.tab='ex';render()});await check('weight');
  await p.evaluate(()=>{S.sub='arch';render()});await check('archive');
  await p.evaluate(()=>{S.sub='rpt';render()});await check('reports');
  ok(errs.length===0,`${w} لا أخطاء صفحة`,errs.join('|'));await c.close()}
 console.log(`\n${pass} نجح، ${fail} فشل`);await b.close();process.exit(fail?1:0)})();
