/* التنقل الخماسي (اليوم، التمرين، التغذية، التقدّم، المزيد) وإمكانية الوصول إلى كل خدمة من الواجهة، عند 320 و390.
   تشغيل: NODE_PATH=$(npm root -g) node tests/nav.e2e.js [مسار index.html] */
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let pass=0,fail=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
const src=fs.readFileSync(file,'utf8');
/* الشاشات المسجّلة في جدول العرض؛ ما يُستثنى شاشات داخلية لا تُفتح من قائمة (تُفتح من سياقها) */
const tbl=src.match(/if\(S\.sub\)\{const f=\{([^}]*)\}\[S\.sub\]/)[1].split(',').map(x=>x.split(':')[0].trim());
const INNER=new Set(['wk','mk','srch','ply','exd','ssd','nad','mpg','prg','exl','fin','aip','gye','watch','coach','comm','nc']);
const MUST=tbl.filter(x=>!INNER.has(x));
(async()=>{const b=await chromium.launch();
 for(const w of [320,390]){
  const p=await (await b.newContext({viewport:{width:w,height:760}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file);await p.waitForTimeout(500);
  await p.evaluate(()=>{S.prof.ob=1;S.prof.name='مختبر';S.plan=[0,1,2,3,4,5,6].map(()=>({t:'يوم',ex:[E('بنش',3,8,40)]}));S.prof.startW=80;S.bw[TD()]=80;S.tab='dash';S.sub=null;save();render()});
  const labels=await p.$$eval('#nav button',a=>a.map(x=>x.getAttribute('aria-label')));
  ok(labels.join('|')==='التمرين|التغذية|اليوم|التقدّم|المزيد',w+': خمس وجهات والشعار في الوسط بالترتيب المعتمد',labels.join('|'));
  ok(!await p.$('#nav .nfab'),w+': لا زر ابدأ عائم في الشريط (البدء من «اليوم» ومن زر +)');
  const geo=await p.$$eval('#nav button',a=>a.map(x=>{const r=x.getBoundingClientRect();return[Math.round(r.width),Math.round(r.height),x.scrollWidth>x.clientWidth+1]}));
  ok(geo.every(g=>g[0]>=40&&g[1]>=40&&!g[2]),w+': كل تبويب بعرض/ارتفاع ≥ 40px بلا قصّ',JSON.stringify(geo));
  const reach=new Set();
  for(const t of ['dash','train','food','pg','ex']){
   await p.click('#nav button[data-v="'+t+'"]');await p.waitForTimeout(120);
   ok(await p.evaluate(t=>S.tab===t&&!S.sub,t),w+': التبويب '+t+' يفتح');
   ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),w+': '+t+' بلا تجاوز أفقي');
   (await p.$$eval('[data-a="sub"],[data-a="go"]',a=>a.map(x=>x.dataset.a+':'+x.dataset.v))).forEach(x=>reach.add(x));
   if(t==='dash'||t==='train')(await p.$$eval('[data-a="wkstart"],[data-a="mkpick"]',a=>a.map(x=>x.dataset.a))).forEach(x=>reach.add(x))}
  ok(await p.evaluate(()=>[...document.querySelectorAll('#nav [data-a="go"]')].some(x=>x.dataset.v==='food')),w+': «التغذية» تبويب مستقل في الشريط')
  const miss=MUST.filter(x=>!reach.has('sub:'+x)&&!reach.has('go:'+x));
  ok(MUST.length>=12&&miss.length===0,w+': كل شاشة خدمة ('+MUST.length+') لها زر على أحد التبويبات الخمسة',miss.join(','));
  await p.click('#nav button[data-v="pg"]');await p.waitForTimeout(100);
  const pg=await p.$$eval('.sjrow[data-v]',a=>a.map(x=>x.dataset.v));ok(pg.includes('arch')&&pg.includes('ach')&&pg.includes('wgt')&&pg.includes('prog'),w+': «التقدّم» يصل إلى الأرشيف والأوسمة والوزن/القياسات والنوم',pg.join());
  await p.click('#nav button[data-v="ex"]');await p.waitForTimeout(100);ok(/المزيد/.test(await p.evaluate(()=>document.querySelector('h1').innerText)),w+': عنوان «المزيد»');
  await p.evaluate(()=>{S.tab='dash';S.sub=null;render()});await p.click('[data-a=wkstart]');await p.waitForTimeout(250);
  ok(await p.evaluate(()=>S.sub==='wk'&&!!UI.wk),w+': «ابدأ» من «اليوم» يفتح مشغّل حصة اليوم')
  ok(errs.length===0,w+': لا أخطاء صفحة',errs.join('|'));
  await p.evaluate(()=>{S.sub=null;S.tab='dash';render()});await p.screenshot({path:path.join(__dirname,'../docs/ux/evidence/impl/nav-'+w+'.png')});await p.context().close()}
 await b.close();console.log(`\n${pass} ناجح، ${fail} فاشل`);process.exit(fail?1:0)})();
