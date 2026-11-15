/* اختبار خط Cairo المحلي: node tests/font.e2e.js  (يتطلب playwright). يخدم pwa/ عبر http محلي ليعمل service worker.
   يتحقق: الخط من ملفات الحزمة، يعمل دون اتصال، خيار تغيير الخط، 320/390 فاتح وداكن بلا تجاوز أفقي. اللقطات في docs/ux/evidence/font/ */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),PWA=ROOT+'/pwa',OUT=ROOT+'/docs/ux/evidence/font';fs.mkdirSync(OUT,{recursive:true});
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.woff':'font/woff','.ttf':'font/ttf'};
let pass=0,fail=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
const srv=http.createServer((q,res)=>{let f=q.url.split('?')[0];if(f==='/')f='/index.html';const p=path.join(PWA,decodeURIComponent(f));if(!p.startsWith(PWA)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){res.writeHead(404);return res.end()}res.writeHead(200,{'content-type':MIME[path.extname(p)]||'application/octet-stream'});res.end(fs.readFileSync(p))});
const PLAN=`(()=>{const rest={t:'راحة',ex:[]};return[rest,rest,rest,rest,{t:'صدر وظهر',ex:[E('بنش برس',3,8,35),E('سحب علوي',3,10,30),E('سكوات',3,8,40)]},{t:'أكتاف',ex:[E('ضغط أكتاف دمبل',3,10,10)]},{t:'أرجل',ex:[E('ضغط أرجل',3,12,60)]}]})()`;
(async()=>{await new Promise(r=>srv.listen(8795,r));const b=await chromium.launch();const U='http://127.0.0.1:8795/';
 const blockG=async c=>{await c.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort())};
 console.log('1) الخط من الحزمة ويعمل دون اتصال');
 {const c=await b.newContext({viewport:{width:390,height:844}});await blockG(c);const p=await c.newPage();const reqs=[];p.on('response',r=>reqs.push({u:r.url(),sw:r.fromServiceWorker()}));
  await p.goto(U);await p.waitForTimeout(800);
  await p.evaluate(async()=>{await navigator.serviceWorker.ready;await document.fonts.load('400 16px Cairo','بنش');await document.fonts.load('700 16px Cairo','بنش');await document.fonts.load('800 16px Cairo','بنش');await document.fonts.load('400 16px Cairo','RPE 9')});
  const fam=await p.evaluate(()=>getComputedStyle(document.body).fontFamily);ok(/QamraUser.*Cairo/.test(fam),'الخط الافتراضي في body يبدأ بـ Cairo بعد خط المستخدم المرفوع',fam);
  const loaded=await p.evaluate(()=>[...document.fonts].filter(f=>f.family.replace(/"/g,'')==='Cairo'&&f.status==='loaded').map(f=>f.weight+(/6{1}00|0600/i.test(f.unicodeRange)?'ar':'lat')));
  ok(loaded.includes('400lat')&&loaded.includes('400ar')&&loaded.filter(x=>x.startsWith('700')).length&&loaded.filter(x=>x.startsWith('800')).length,'أوجه Cairo المحمّلة: '+loaded.join(','));
  ok(reqs.some(r=>/fonts\/Cairo-Regular\.ttf/.test(r.u))&&reqs.some(r=>/fonts\/Cairo-700-arabic\.woff/.test(r.u)),'الطلبات تذهب إلى fonts/ المحلية');
  ok(!reqs.some(r=>/gstatic/.test(r.u)),'لا طلب إلى fonts.gstatic.com');
  const cached=await p.evaluate(async()=>{const k=await caches.keys();const out=[];for(const n of k){const c=await caches.open(n);for(const r of await c.keys())if(/\/fonts\//.test(r.url))out.push(r.url.split('/').pop())}return out});
  ok(cached.length>=5,'التخزين المسبق يضم ملفات الخط: '+cached.join(','));
  await c.setOffline(true);const p2=await c.newPage();await p2.goto(U);await p2.waitForTimeout(800);
  const off=await p2.evaluate(async()=>{await document.fonts.load('700 16px Cairo','بنش');await document.fonts.load('400 16px Cairo','RPE');return[...document.fonts].filter(f=>f.family.replace(/"/g,'')==='Cairo'&&f.status==='loaded').length});
  ok(off>=3,'دون اتصال: أوجه Cairo تُحمَّل من الذاكرة ('+off+')');
  const cdp=await c.newCDPSession(p2);await cdp.send('DOM.enable');await cdp.send('CSS.enable');
  await p2.evaluate(()=>{const s=document.createElement('p');s.id='fx';s.textContent='ضغط الصدر 35 كغ × 12 RPE 9';s.style.cssText='font:700 20px var(--fa);position:fixed;top:0';document.body.appendChild(s)});await p2.waitForTimeout(500);
  const doc=await cdp.send('DOM.getDocument');const n=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#fx'});const pf=await cdp.send('CSS.getPlatformFontsForNode',{nodeId:n.nodeId});
  ok(pf.fonts.some(f=>f.familyName==='Cairo'&&f.isCustomFont&&f.glyphCount>=8)&&pf.fonts.every(f=>f.isCustomFont),'الحروف العربية تُعرض بـ Cairo من الملف المحلي، واللاتينية بخط الواجهة المضمّن (Inter)، بلا رجوع إلى خط النظام (CDP): '+pf.fonts.map(f=>f.familyName+':'+f.glyphCount).join(','));
  await c.close()}
 console.log('2) خيار تغيير الخط');
 {const c=await b.newContext({viewport:{width:390,height:844}});await blockG(c);const p=await c.newPage();await p.goto(U);await p.waitForTimeout(500);
  const cls=async v=>{await p.evaluate(v=>{ACT.fontset({dataset:{v}})},v);return p.evaluate(()=>[document.body.className,localStorage.getItem('fit_font'),getComputedStyle(document.body).fontFamily])};
  let r=await cls('q');ok(/f-q/.test(r[0])&&/Qomra/.test(r[2]),'قمرة يعمل',r.join('|'));r=await cls('s');ok(/f-s/.test(r[0]),'النظام يعمل');r=await cls('c');ok(!/f-[qs]/.test(r[0])&&/Cairo/.test(r[2]),'Cairo هو الافتراضي',r.join('|'));await c.close()}
 console.log('3) الشاشات 320/390 (الوضع الفاتح فقط: effTheme ثابت على light في التطبيق الحالي)');
 for(const w of [320,390])for(const th of ['light']){
  const c=await b.newContext({viewport:{width:w,height:760},deviceScaleFactor:1});await blockG(c);const p=await c.newPage();await c.addInitScript(t=>{try{localStorage.setItem('fit_theme',t)}catch(e){}},th);
  await p.clock.install({time:new Date('2026-11-18T10:00:00+03:00')});await p.goto(U);await p.waitForTimeout(500);await p.clock.resume();
  await p.evaluate(plan=>{S.prof.ob=1;S.prof.name='سارة';S.prof.sex='f';S.prof.age=28;S.prof.ht=165;S.prof.startW=70;S.prof.dpw=3;S.prof.goalType='lose';S.bw[TD()]=70;S.plan=eval(plan);S.tab='dash';save();render()},PLAN);
  const shot=async n=>{await p.waitForTimeout(250);const o=await p.evaluate(()=>[document.documentElement.scrollWidth>innerWidth+1,[...document.querySelectorAll('#nav button')].some(e=>e.scrollWidth>e.clientWidth+1)]);ok(!o[0],`${w}/${th} ${n}: بلا تجاوز أفقي`);ok(!o[1],`${w}/${th} ${n}: أزرار الشريط لا تُقصّ`);const cl=await p.evaluate(()=>[...document.querySelectorAll('main *, #app *, .card *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left<-1)&&getComputedStyle(e).position!=='fixed'&&!e.closest('svg')&&!(()=>{for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){const o=getComputedStyle(a).overflowX;if(o==='auto'||o==='scroll')return true}return false})()}).slice(0,3).map(e=>e.tagName+'.'+e.className));ok(cl.length===0,`${w}/${th} ${n}: لا عنصر يخرج عن عرض الشاشة`,cl.join(','));await p.screenshot({path:`${OUT}/${n}-${w}-${th}.png`})};
  await shot('today');
  await p.click('#sx-go');await p.click('[data-a=wkty][data-v=d]');await p.click('[data-a=wkrp][data-v="9"]');await shot('player');await p.click('[data-a=wkset]');await shot('player-set');await p.click('[data-a=wkend]');
  await p.click('[data-a=sub][data-v=arch]');await shot('archive');
  await p.evaluate(()=>{S.sub=null;S.tab='food';render()});await shot('food');
  await p.evaluate(()=>{S.tab='me';S.sub='rpt';render()});await shot('reports');
  await p.evaluate(()=>{S.sub=null;S.tab='pg';render()});await shot('progress');
  await p.evaluate(()=>{S.tab='ex';S.sub='wgt';render()});await shot('weight');
  await p.evaluate(()=>{S.sub=null;S.tab='dash';render()});await p.click('#wform summary');await shot('today-weight-open');
  await c.close()}
 await b.close();srv.close();console.log(`\n${pass} ناجح، ${fail} فاشل`);process.exit(fail?1:0)})();
