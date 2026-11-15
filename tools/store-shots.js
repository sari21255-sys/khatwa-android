/* لقطات مواد المتجر من الواجهة الفعلية ببيانات اصطناعية: 1080×1920 (360×640 CSS × 3)، بلا إطار جهاز ولا أصابع. تشغيل: NODE_PATH=$(npm root -g) node tools/store-shots.js [index.html]. المخرجات في docs/release/store-shots/. هذه لقطات متصفح لا جهاز؛ للنشر الأفضل إعادة التقاطها من جهاز أندرويد. */
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));const OUT=path.join(__dirname,'../docs/release/store-shots');fs.mkdirSync(OUT,{recursive:true});
const PLAN="(()=>{const r={t:'راحة',ex:[]};return[{t:'صدر وترايسبس',ex:[E('بنش بريس',3,8,40),E('تفتيح دمبل',3,10,12),E('ضغط ترايسبس',3,12,25)]},r,{t:'ظهر وبايسبس',ex:[E('سحب علوي',3,10,45),E('تجديف',3,10,35)]},r,{t:'أرجل',ex:[E('سكوات',3,8,60),E('رفرفة أرجل',3,12,20)]},r,{t:'كتف',ex:[E('ضغط كتف',3,8,20),E('رفرفة جانبية',3,12,8)]}]})()";
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:3});const p=await c.newPage();
 await p.clock.install({time:new Date('2026-11-18T13:00:00+03:00')});await p.goto('file://'+file);await p.waitForTimeout(600);await p.clock.resume();
 await p.evaluate(pl=>{S.prof.ob=1;S.prof.name='سامي';S.prof.dpw=4;S.prof.sleep=7;S.plan=eval(pl);S.done={};S.meals={};S.sleep={};S.bw={};S.prs=[];S.sx={};S.nt.kcal=2200;S.nt.p=130;
  [['2026-10-24',[0,2,4]],['2026-10-31',[0,2,4,6]],['2026-11-07',[0,2,4,6]],['2026-11-14',[0,2]]].forEach(([ws,ds])=>ds.forEach(d=>S.plan[d].ex.forEach(e=>{S.done[ws+'|'+d+'|'+e.id]={w:e.w||40,r:e.r||8,date:ws}})));
  const bw=[84.2,83.9,83.6,83.8,83.1,82.9,82.7,82.4];bw.forEach((v,i)=>{const d=new Date('2026-11-18T12:00:00+03:00');d.setDate(d.getDate()-(bw.length-1-i)*2);S.bw[d.toISOString().slice(0,10)]=v});
  S.meals[TD()]=[{id:'m1',n:'شوفان بالحليب والموز',kcal:420,p:18,c:68,f:9,slot:'b'},{id:'m2',n:'صدر دجاج مشوي مع أرز',kcal:640,p:48,c:70,f:14,slot:'l'}];
  save();render()},PLAN);
 const shot=async n=>{await p.waitForTimeout(350);await p.screenshot({path:`${OUT}/${n}.png`})};
 await shot('01-today');
 await p.click('#sx-go');await p.waitForTimeout(200);await p.fill('#wk-w','42.5');await p.click('[data-a=wkty][data-v=d]');await p.click('[data-a=wkset]');await shot('02-workout');
 await p.evaluate(()=>{S.sub=null;S.tab='food';render()});await shot('03-food');
 await p.evaluate(()=>{S.tab='ex';S.sub='wgt';render()});await shot('04-weight');
 await p.evaluate(()=>{S.sub='rpt';render()});await shot('05-reports');
 await p.evaluate(()=>{S.sub='arch';render()});await shot('06-archive');
 await b.close()})();
