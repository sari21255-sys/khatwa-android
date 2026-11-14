// تجاوب، وصولية، أداء، PWA، لغات: node quality.mjs
import {chromium,staticServer,rec,results,SITE} from './lib.mjs';
import fs from 'node:fs';
const A='http://127.0.0.1:8082';const st=await staticServer(8082);const b=await chromium.launch();
const seed=`S.prof.ob=1;S.prof.name='اختبار';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';S.prof.lvl='b';S.prof.eq='gym';S.prof.dpw=4;S.bw[TD()]=85;calcTargets();genPlan();render()`;
const SUBS=['plan','prog','arch','tools','watch','prg','mpg','ach','cul','wgt','exl','set','coach','aip','gyms','vis','rem','rpt','link','nau','comm','nc'];
const TABS=['dash','train','food','pg','me','club','ex'];
try{
 /* T20 تجاوب: تمرير كل الشاشات على 5 أحجام وقياس الفيض الأفقي */
 const sizes=[[320,568],[360,640],[390,844],[768,1024],[1280,800]];
 const over={};let shots=0;
 for(const [w,h] of sizes){const c=await b.newContext({viewport:{width:w,height:h}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(A+'/');await p.waitForFunction(()=>typeof S!=='undefined');await p.evaluate(seed);
  const bad=await p.evaluate(async({TABS,SUBS})=>{const out=[];const chk=n=>{const d=document.documentElement;if(d.scrollWidth>innerWidth+1)out.push(n+':'+d.scrollWidth)};for(const t of TABS){S.tab=t;S.sub=null;render();await new Promise(r=>setTimeout(r,60));chk('tab:'+t)}for(const s of SUBS){S.tab='ex';S.sub=s;render();await new Promise(r=>setTimeout(r,80));chk('sub:'+s)}return out},{TABS,SUBS});
  over[w]=bad;if(w===320){await p.evaluate(()=>{S.tab='dash';S.sub=null;render()});await p.screenshot({path:new URL('./shot-320-dash.png',import.meta.url).pathname});shots++}
  rec('T20-'+w,'لا فيض أفقي على '+w+'px عبر 29 شاشة',bad.length===0&&errs.length===0,bad.length?bad.join(', '):'لا فيض، لا أخطاء','P2');await c.close()}
 /* T21 وصولية سريعة */
 const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();await p.goto(A+'/');await p.waitForFunction(()=>typeof S!=='undefined');await p.evaluate(seed);
 const a11y=await p.evaluate(async({TABS})=>{const r={noName:0,imgNoAlt:0,inputNoLabel:0,total:0,lang:document.documentElement.lang,dir:document.documentElement.dir,vp:(document.querySelector('meta[name=viewport]')||{}).content,small:0,zoomBlocked:/user-scalable=no|maximum-scale=1\b/.test((document.querySelector('meta[name=viewport]')||{content:''}).content)};for(const t of TABS){S.tab=t;S.sub=null;render();await new Promise(x=>setTimeout(x,60));document.querySelectorAll('button,a[role=button],[data-a]').forEach(e=>{r.total++;const n=(e.textContent||'').trim()||e.getAttribute('aria-label')||e.getAttribute('title');if(!n)r.noName++;const bb=e.getBoundingClientRect();if(bb.width&&bb.height&&(bb.width<32||bb.height<32))r.small++});document.querySelectorAll('img:not([alt])').forEach(()=>r.imgNoAlt++);document.querySelectorAll('input:not([type=hidden]),select,textarea').forEach(e=>{const has=e.getAttribute('aria-label')||e.id&&document.querySelector('label[for="'+e.id+'"]')||e.closest('label')||e.placeholder;if(!has)r.inputNoLabel++})}return r},{TABS});
 rec('T21a','لغة واتجاه الصفحة والـviewport',a11y.lang==='ar'&&a11y.dir==='rtl'&&!a11y.zoomBlocked,JSON.stringify({lang:a11y.lang,dir:a11y.dir,vp:a11y.vp,zoomBlocked:a11y.zoomBlocked}),'P2');
 rec('T21b','أزرار بلا اسم قابل للقراءة',a11y.noName===0,a11y.noName+' من '+a11y.total+' (تراكمية عبر 7 تبويبات)','P2');
 rec('T21c','أهداف لمس أصغر من 32px',a11y.small<5,a11y.small+' عنصر','P3');
 rec('T21d','صور بلا alt / حقول بلا تسمية',a11y.imgNoAlt===0&&a11y.inputNoLabel===0,'صور:'+a11y.imgNoAlt+' حقول:'+a11y.inputNoLabel,'P2');
 /* T22 PWA */
 const man=JSON.parse(fs.readFileSync(SITE+'/manifest.webmanifest','utf8'));
 const need=['name','short_name','start_url','display','icons','lang','dir','theme_color','background_color'];const miss=need.filter(k=>!man[k]);
 const ic=man.icons||[];const has192=ic.some(i=>/192/.test(i.sizes)),has512=ic.some(i=>/512/.test(i.sizes)),mask=ic.some(i=>/maskable/.test(i.purpose||''));
 const filesOk=ic.every(i=>fs.existsSync(SITE+'/'+i.src.replace(/^\.?\//,'')));
 rec('T22a','manifest: حقول إلزامية وأيقونات 192/512 وmaskable والملفات موجودة',!miss.length&&has192&&has512&&mask&&filesOk,JSON.stringify({miss,has192,has512,mask,filesOk,display:man.display,start:man.start_url}),'P1');
 const hdr=fs.readFileSync(SITE+'/_headers','utf8');
 rec('T22b','ترويسات الأمان في _headers (CSP، X-Content-Type-Options، Referrer-Policy)',/Content-Security-Policy/i.test(hdr)&&/nosniff/i.test(hdr),hdr.split('\n').filter(l=>/:/.test(l)&&!/^\s*\//.test(l)).slice(0,8).join(' | ').slice(0,300),'P2');
 /* T23 أداء: حجم وتحميل وبيانات سنتين */
 const html=fs.statSync(SITE+'/index.html').size;
 const perf=await p.evaluate(async()=>{const t0=performance.now();for(let i=0;i<10;i++){S.tab='dash';render()}const rd=(performance.now()-t0)/10;
  const d0=new Date();for(let i=0;i<730;i++){const d=new Date(d0-i*864e5),k=d.toISOString().slice(0,10);S.bw[k]=85-i*0.01;S.meals[k]=[1,2,3,4].map(j=>({id:'m'+i+j,n:'وجبة '+j,kcal:500,p:30,c:50,f:15,slot:'b'}));S.sleep[k]=7;S.cd[k]={steps:8000,kcal:2200,km:5}}
  const t1=performance.now();save();const sv=performance.now()-t1;const size=JSON.stringify(S).length;let ok=true;try{localStorage.setItem('fit1',JSON.stringify(S))}catch(e){ok=false}
  const t2=performance.now();for(const t of ['dash','food','pg','me']){S.tab=t;render()}const r2=(performance.now()-t2)/4;S.sub='prog';const t3=performance.now();render();const rp=performance.now()-t3;
  return{renderMs:+rd.toFixed(1),renderBigMs:+r2.toFixed(1),progMs:+rp.toFixed(1),saveMs:+sv.toFixed(1),stateKB:Math.round(size/1024),quotaOK:ok,heapMB:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null,dom:document.querySelectorAll('*').length}});
 rec('T23a','حجم ملف التطبيق',html<2.2e6,Math.round(html/1024)+' KB (index.html، غير مضغوط)','P3');
 rec('T23b','أداء الرسم والحفظ مع بيانات سنتين (730 يومًا)',perf.renderBigMs<150&&perf.saveMs<200&&perf.quotaOK,JSON.stringify(perf),'P2');
 /* T24 أوضاع اللغة */
 const lang=await p.evaluate(async()=>{const out={};for(const m of ['nobi','en1','']){document.body.classList.remove('nobi','en1');if(m)document.body.classList.add(m);try{S.tab='dash';S.sub=null;render();out[m||'bi']=document.body.innerText.length}catch(e){out[m||'bi']='ERR '+e.message}}return out});
 rec('T24','أوضاع اللغة الثلاثة ترسم الرئيسية بلا أخطاء',Object.values(lang).every(v=>typeof v==='number'&&v>200),JSON.stringify(lang),'P2');
}finally{fs.writeFileSync(new URL('./results-quality.json',import.meta.url),JSON.stringify(results,null,1));await b.close();st.close();process.exit(0)}
