/* لقطات SIJIL: NODE_PATH=$(npm root -g) node tools/sijil-shots.js [outdir] — بيانات اصطناعية، متصفح Chromium (ليس جهاز Android) */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(__dirname,'../www/index.html'),OUT=path.resolve(process.argv[2]||path.join(__dirname,'../docs/sijil/screens'));
const T=['black','white','blue','emerald','olive','purple'];
const seed=()=>{S.prof.ob=1;S.prof.name='مختبر';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';S.prof.lvl='b';S.prof.eq='gym';S.prof.dpw=7;calcTargets();genPlan();S.plan=[0,1,2,3,4,5,6].map(()=>({t:'صدر وترايسبس',ex:[E('بنش برس',4,8,60),E('تفتيح دمبل',3,12,14)]}));[0,6,13,20,27,34].forEach((d,i)=>{const x=new Date();x.setDate(x.getDate()-(35-d));S.bw[iso(x)]=88-i*0.8});S.bw[TD()]=83.5;S.wtr[TD()]=750;S.tab='dash';S.sub=null;save();render()};
(async()=>{const b=await chromium.launch();
 for(const w of [390,320]){for(const th of (w===320?['black','white']:T)){
  const ctx=await b.newContext({viewport:{width:w,height:w===320?640:844},deviceScaleFactor:2});await ctx.addInitScript(t=>{try{if(!sessionStorage.__s){sessionStorage.__s=1;localStorage.setItem('fit_theme',t)}}catch(e){}},th);
  const p=await ctx.newPage();const sh=async n=>{await p.waitForTimeout(350);await p.screenshot({path:`${OUT}/${n}-${th}-${w}.png`})};
  await p.goto('file://'+file);await p.waitForFunction(()=>typeof S!=='undefined');
  if(th==='black'){await sh('welcome')}
  await p.evaluate(seed);await sh('today');
  await p.click('#nav .sjplus');await p.waitForTimeout(300);await sh('quicklog');
  await p.click('.sjq [data-a=qlm][data-v=w]');await sh('quicklog-weight');await p.click('.sjq [data-a=qlx][aria-label="إغلاق"]');
  await p.evaluate(()=>{S.tab='pg';S.sub=null;render()});await sh('progress');
  await p.evaluate(()=>{S.tab='ex';S.sub=null;render()});await sh('more');
  await p.evaluate(()=>{S.tab='ex';S.sub='set';render()});await sh('settings');
  await p.evaluate(()=>{sxGo(sxPart(TI()),TI());render()});await p.waitForTimeout(300);
  if(await p.$('#wk-w')){await p.fill('#wk-w','60');await p.fill('#wk-r','8');await p.click('[data-a=wkset]');await sh('player')}
  await ctx.close()}}
 await b.close()})();
