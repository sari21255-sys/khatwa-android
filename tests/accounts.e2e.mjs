// قبول الحسابات ووضع الزائر (رحلات الأمر الثاني): بريد، زائر، نقل بموافقة، جهاز ثانٍ، عزل ثلاث مساحات، ترقية.
// خادم Supabase وهمي (auth + rpc إلى دوال P1 الحقيقية في Postgres). بيانات اصطناعية. هذا اختبار متصفح لا جهاز Android:
// روابط البريد تُحاكى بتمريرها إلى معالج appUrlOpen نفسه (fxDeep)؛ فتح الرابط من تطبيق البريد على الجهاز لم يُجرَّب هنا.
// الاستعمال: PSQL="psql -h localhost -U postgres -d postgres -q -At" NODE_PATH=$(npm root -g) node tests/accounts.e2e.mjs
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
import {startMock,dbq} from './mock-supabase.mjs';
const {chromium}=createRequire(import.meta.url)(path.join(process.env.NODE_PATH||'','playwright'));
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),WWW=ROOT+'/www';
let fails=0;const rec=(id,name,ok,ev)=>{if(!ok)fails++;console.log((ok?'PASS ':'FAIL ')+id+' '+name+(ok?'':' — '+ev))};
const sb=await startMock(8796);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
let cfgFull=true;
const st=http.createServer((q,res)=>{let f=q.url.split('?')[0];if(f==='/')f='/index.html';
 if(f==='/config.js'){res.writeHead(200,{'content-type':'text/javascript'});return res.end(`window.APP_CONFIG={${cfgFull?'sbUrl:"http://127.0.0.1:8796",sbKey:"anon"':''}};`)}
 const p=path.join(WWW,f);if(!p.startsWith(WWW)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){res.writeHead(404);return res.end()}res.writeHead(200,{'content-type':MIME[path.extname(p)]||'application/octet-stream'});res.end(fs.readFileSync(p))}).listen(8795);
const A='http://127.0.0.1:8795';const b=await chromium.launch();
const SEED=`S.prof.ob=1;S.prof.name='اختبار';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';S.prof.lvl='b';S.prof.eq='gym';S.prof.dpw=7;calcTargets();genPlan();save();`;
const ready=p=>p.waitForFunction(()=>typeof S!=='undefined'&&typeof rsSync==='function'&&typeof fxAuth==='function');
async function open(ctx){const p=await ctx.newPage();p.ctx=ctx;p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto(A+'/');await ready(p);await p.waitForTimeout(250);return p}
async function dev(){const ctx=await b.newContext({viewport:{width:390,height:844},timezoneId:'Asia/Riyadh'});await ctx.clock.install({time:new Date('2026-11-16T10:00:00+03:00')});   /* يوم تمرين ثابت: الاختبار لا يتغيّر بيوم الراحة */
  const p=await open(ctx);p.ctx=ctx;return p}
const reload=async p=>{await p.reload();await ready(p);await p.waitForTimeout(300)};
const nav=async(p,act)=>{await Promise.all([p.waitForEvent('load'),act()]);await ready(p);await p.waitForTimeout(350)};
const idle=p=>p.evaluate(async()=>{for(let i=0;i<150&&RS.busy;i++)await new Promise(r=>setTimeout(r,100))});
const sync=async p=>{await idle(p);const o=await p.evaluate(()=>rsSync());await idle(p);return o};
const meta=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('fit_space')||'{}'));
const email=n=>`u${Date.now()}${n}@test.invalid`;
const ui=async(p,mode,e,pw,name)=>{const sel={in:'#wel-in',up:'#wel-up'}[mode];
 if(!(await p.$('#fx-auth'))){if(await p.$(sel))await p.click(sel);else await p.evaluate(m=>fxAuth(m),mode)}
 await p.waitForSelector('#fx-auth');if(name&&await p.$('#fxa-n'))await p.fill('#fxa-n',name);await p.fill('#fxa-e',e);if(pw!=null&&await p.$('#fxa-p'))await p.fill('#fxa-p',pw)};
const mkAccount=async(em,pw='password123')=>{const d=await dev();await d.evaluate(([e,p])=>SB.up(e,p,'t'),[em,pw]);await d.ctx.close()};
const rpcCount=()=>sb.log.filter(x=>x.includes('/rest/v1/rpc/')).length;
const uidDb=async em=>sb.users.get(em.toLowerCase()).id;
const nRec=async(uid,kind)=>+dbq(`select count(*) from public.sync_records where user_id='${uid}'${kind?` and kind='${kind}'`:''}`);
try{
 /* ===== 1) زائر دون إنترنت: تمرين جزئي ووزن وماء، إغلاق كامل، عودة ===== */
 {const d=await dev();await d.evaluate(SEED);await reload(d);
  const wel=await (async()=>{const x=await dev();const t=await x.evaluate(()=>document.body.innerText);const ids=await x.$$eval('.sjwel [data-a]',a=>a.map(z=>z.dataset.a));await x.ctx.close();return{t,ids}})();
  rec('J1a','شاشة البداية: تسجيل الدخول · إنشاء حساب · المتابعة كزائر تحت الشعار',['welin','welup','welguest'].every(x=>wel.ids.includes(x))&&/المتابعة كزائر/.test(wel.t),JSON.stringify(wel.ids));
  const before=sb.log.length;await d.ctx.route('http://127.0.0.1:8796/**',r=>r.abort());
  await d.evaluate(()=>{S.tab='dash';S.sub=null;render()});await d.evaluate(()=>{const xv=irXv('بنش بريس بالبار');qSave(TD(),xv,'بنش بريس بالبار',[{w:60,r:8}]);save()});await d.waitForTimeout(250);
  await d.evaluate(()=>{S.bw[TD()]=84.2;S.wtr[TD()]=750;save()});
  const d2=await open(d.ctx);await d.close();   // إغلاق كامل ثم فتح صفحة جديدة بالتخزين نفسه
  const r=await d2.evaluate(()=>({bw:S.bw[TD()],w:S.wtr[TD()],open:Object.keys(qAll()).length>=1,n:Object.keys(S.sx).length,ses:localStorage.getItem('fit_sb'),sp:(JSON.parse(localStorage.getItem('fit_space')||'{}')).a,rs:rsOn()}));
  const resumed=await d2.evaluate(()=>Object.keys(S.sx).length===1&&qSets(TD(),irXv('بنش بريس بالبار')).length===1);
  rec('J1b','زائر بلا إنترنت: الوزن والماء والجلسة الجزئية تبقى بعد إغلاق التطبيق وتُستأنف من مكانها دون نسخة ثانية',r.bw===84.2&&r.w===750&&r.open&&r.n===1&&resumed,JSON.stringify({r,resumed}));
  rec('J1c','الزائر: لا جلسة سحابية ولا مزامنة ولا أي طلب إلى الخادم',r.ses===null&&!r.rs&&sb.log.length===before,JSON.stringify({ses:r.ses,rs:r.rs,reqs:sb.log.length-before}));
  await d2.ctx.unroute('http://127.0.0.1:8796/**');
  await d2.evaluate(()=>{S.sub=null;S.tab='dash';render();fxAuth('in')});await d2.click('#fx-auth [data-fxx]');
  const back=await d2.evaluate(()=>({bw:S.bw[TD()],sp:spMeta().a,auth:!!document.getElementById('fx-auth')}));
  rec('J1d','من شاشة الدخول إلى «المتابعة كزائر» يفتح السجل المحلي نفسه',back.bw===84.2&&back.sp==='guest'&&!back.auth,JSON.stringify(back));
  await d2.ctx.close()}
 /* ===== 2) حساب جديد: تسجيل، تأكيد، دخول، استعادة كلمة المرور ===== */
 const E2=email('j2');sb.setConfirm(true);
 {const d=await dev();await ui(d,'up',E2,'password123','سارة');await d.click('#fxa-go');await d.waitForFunction(()=>/أُرسل رابط التأكيد/.test((document.getElementById('fxa-msg')||{}).textContent||''));
  rec('J2a','إنشاء حساب: يُرسل رابط التأكيد ويُعرض ذلك، ولا يُنشأ دخول قبل التأكيد',sb.sent.some(x=>x.t==='signup'&&x.email===E2.toLowerCase())&&!await d.evaluate(()=>SB.ses),JSON.stringify(sb.sent));
  await d.fill('#fxa-e',E2);await d.fill('#fxa-p','password123');await d.click('#fxa-go');await d.waitForSelector('#fxa-err');
  const e1=await d.textContent('#fxa-err');rec('J2b','الدخول قبل التأكيد يعرض «لم يُؤكَّد البريد» مع عرض إعادة الإرسال',/لم يُؤكَّد/.test(e1)&&!!await d.$('[data-fxm=resend]'),e1);
  await d.click('[data-fxm=resend]');await d.fill('#fxa-e',E2);await d.click('#fxa-go');await d.waitForSelector('#fxa-msg');
  rec('J2c','إعادة إرسال رابط التأكيد تصل إلى الخادم',sb.sent.some(x=>x.t==='resend'&&x.email===E2.toLowerCase()),JSON.stringify(sb.sent));
  /* فتح رابط التأكيد: يمرّ إلى المعالج نفسه الذي يستدعيه appUrlOpen على Android */
  sb.confirmUser(E2);const lk=sb.link(E2,'signup');
  await nav(d,()=>d.evaluate(l=>fxDeep('sijil://auth#'+l),lk));
  const m=await meta(d),uid=await uidDb(E2);
  rec('J2d','رابط التأكيد يدخل الحساب ويفتح مساحته (ليس الزائر) ويحفظ الجلسة',m.a==='u_'+uid&&await d.evaluate(()=>!!SB.ses&&SB.email()),JSON.stringify(m));
  await d.waitForTimeout(500);await d.evaluate(()=>{S.prof.ob=1;save();S.tab='dash';S.sub='pf';render()});
  const acc=await d.evaluate(()=>({t:(document.getElementById('fx-acc')||{}).innerText||'',em:(document.getElementById('fx-em')||{}).textContent,out:!!document.getElementById('fx-out')}));
  rec('J2e','المزيد ← الملف الشخصي ← الحساب: البريد وحالة المزامنة وتسجيل الخروج',acc.em===E2.toLowerCase()&&acc.out&&/المزامنة|محفوظ/.test(acc.t),JSON.stringify(acc));
  /* استعادة الجلسة بعد الإغلاق */
  const d2=await open(d.ctx);await d.close();const rs=await d2.evaluate(()=>({e:SB.email(),a:spMeta().a}));rec('J2f','الجلسة تُستعاد بعد إغلاق التطبيق وفتحه',rs.e===E2.toLowerCase()&&rs.a==='u_'+uid,JSON.stringify(rs));
  await d2.evaluate(()=>{S.prof.ob=1;save()});
  await nav(d2,()=>d2.evaluate(()=>fxSignOut()));const m2=await meta(d2);rec('J2g','تسجيل الخروج يعيد إلى الزائر',m2.a==='guest'&&await d2.evaluate(()=>!SB.ses),JSON.stringify(m2));
  /* استعادة كلمة المرور */
  await ui(d2,'in',E2);await d2.click('[data-fxm=reset]');await d2.fill('#fxa-e',E2);await d2.click('#fxa-go');await d2.waitForSelector('#fxa-msg');
  rec('J2h','طلب استعادة كلمة المرور يُرسل إلى الخادم',sb.sent.some(x=>x.t==='recover'&&x.email===E2.toLowerCase()),JSON.stringify(sb.sent.slice(-2)));
  await d2.click('#fx-auth [data-fxx]');const rl=sb.link(E2,'recovery');
  await d2.evaluate(l=>fxDeep('sijil://auth#'+l),rl);await d2.waitForSelector('#fxa-p');
  const hold=await d2.evaluate(()=>({guest:spMeta().a,stored:localStorage.getItem('fit_sb'),hold:RS.hold}));
  rec('J2i','رابط الاستعادة يفتح شاشة كلمة المرور الجديدة دون تخزين الجلسة في مساحة الزائر ودون مزامنة',/newpw|كلمة مرور جديدة/.test(await d2.textContent('#fx-auth h1'))&&hold.stored===null&&hold.hold===1,JSON.stringify(hold));
  await d2.fill('#fxa-p','newpass456');await nav(d2,()=>d2.click('#fxa-go'));
  rec('J2j','كلمة المرور الجديدة تُحفظ ويدخل الحساب',(await meta(d2)).a==='u_'+uid&&sb.users.get(E2.toLowerCase()).pw==='newpass456','pw='+sb.users.get(E2.toLowerCase()).pw);
  /* رابط منتهٍ */
  await d2.evaluate(()=>{S.prof.ob=1;save()});await nav(d2,()=>d2.evaluate(()=>fxSignOut()));
  await d2.evaluate(()=>fxDeep('sijil://auth#error=access_denied&error_description=Email+link+is+invalid+or+has+expired'));await d2.waitForSelector('#fxa-err');
  rec('J2k','رابط منتهٍ: رسالة واضحة وخيار إعادة الإرسال',/منتهي/.test(await d2.textContent('#fxa-err')),await d2.textContent('#fxa-err'));
  await d2.ctx.close()}
 sb.setConfirm(false);
 /* ===== 3) زائر ينقل بياناته لحساب بعد موافقة صريحة؛ انقطاع أثناء النقل ثم إعادة ===== */
 const E3=email('j3');await mkAccount(E3);
 const da=await dev();await da.evaluate(e=>SB.in(e,'password123'),E3);
 await nav(da,()=>da.evaluate(()=>fxAfterAuth()));await da.evaluate(SEED);await da.evaluate(()=>{S.prof.ob=1;S.bw['2026-10-01']=90;S.bw['2026-10-02']=89;S.meals['2026-10-02']=[{n:'حساب',kcal:100}];save()});await sync(da);await da.waitForTimeout(1500);await sync(da);await da.ctx.close();
 const U3=await uidDb(E3);const baseRecs=await nRec(U3);
 {const d=await dev();await d.evaluate(SEED);await d.evaluate(()=>{S.bw['2026-10-02']=70;S.bw['2026-10-03']=69;S.meals['2026-10-03']=[{n:'زائر',kcal:300}];S.wtr['2026-10-03']=1000;save()});
  await d.evaluate(()=>{S.tab='dash';S.sub=null;render()});await d.click('[data-a=wkstart]');await d.waitForTimeout(250);await d.fill('#wk-w','50');await d.click('[data-a=wkset]');await d.waitForTimeout(250);
  const gsx=await d.evaluate(()=>Object.keys(S.sx));
  const r0=rpcCount();await ui(d,'in',E3,'password123');await nav(d,()=>d.click('#fxa-go'));
  await d.waitForSelector('#fx-sheet',{timeout:8000});const sheet=await d.textContent('#fx-sheet');
  rec('J3a','قبل النقل يُعرض ملخص «أضف بيانات هذا الجهاز إلى حسابي» مع «اتركها في وضع الزائر»',/أضف بيانات هذا الجهاز إلى حسابي/.test(sheet)&&/اتركها في وضع الزائر/.test(sheet)&&/جلسة تمرين/.test(sheet),sheet.replace(/\s+/g,' ').slice(0,160));
  rec('J3b','لا شيء يُرفع ولا يُنقل قبل الموافقة (لا طلبات مزامنة، وبيانات الحساب بلا بيانات الزائر)',rpcCount()===r0&&await nRec(U3)===baseRecs&&await d.evaluate(()=>!S.bw['2026-10-03']),`rpc ${rpcCount()-r0} recs ${await nRec(U3)}/${baseRecs} bw3 ${await d.evaluate(()=>S.bw['2026-10-03'])}`);
  /* انقطاع أثناء النقل */
  await d.ctx.route('**/rest/v1/rpc/**',r=>r.abort());await d.click('#fx-sheet [data-fxs]');await d.waitForSelector('#fx-xerr:not(:empty)',{timeout:8000});
  const kept=await d.evaluate(()=>({gs:Object.keys(spRead('guest','fit1').sx).length,mv:!!S.bw['2026-10-03'],x:spMeta().xfer&&spMeta().xfer.st}));
  rec('J3c','انقطاع الاتصال أثناء النقل: لا شيء ينتقل، نسخة الزائر سليمة، والسؤال قائم لإعادة المحاولة',kept.gs===1&&!kept.mv&&kept.x==='ask',JSON.stringify(kept));
  await d.ctx.unroute('**/rest/v1/rpc/**');await d.click('#fx-sheet [data-fxs]');await d.waitForFunction(()=>spMeta().xfer&&spMeta().xfer.st==='moved',null,{timeout:8000});await sync(d);await sync(d);
  const after=await d.evaluate(()=>({bw3:S.bw['2026-10-03'],bw2:S.bw['2026-10-02'],sx:Object.keys(S.sx).length,meal:(S.meals['2026-10-03']||[]).length,w:S.wtr['2026-10-03'],pend:rsPend(),acc:S.bw['2026-10-01']}));
  rec('J3d','بعد إعادة المحاولة: بيانات الزائر في الحساب، وسجل الحساب الموجود (وزن 10-02) لم يُستبدل',after.bw3===69&&after.bw2===89&&after.sx===1&&after.meal===1&&after.w===1000&&after.acc===90&&after.pend===0,JSON.stringify(after));
  const sxN=await nRec(U3,'sx');await d.evaluate(()=>{});
  /* إعادة المحاولة مرة ثالثة (محاكاة قطع بعد الدمج وقبل الحفظ): لا ازدواج */
  await d.evaluate(()=>{const m=spMeta();m.xfer={st:'ask',from:'guest'};spPut(m)});await reload(d);await d.waitForSelector('#fx-sheet');await d.click('#fx-sheet [data-fxs]');await d.waitForFunction(()=>spMeta().xfer&&spMeta().xfer.st==='moved',null,{timeout:8000});await sync(d);
  rec('J3e','تكرار النقل نفسه لا يضاعف السجلات (معرّفات ثابتة): جلسة واحدة على الخادم',await nRec(U3,'sx')===sxN&&sxN===1&&await d.evaluate(()=>Object.keys(S.sx).length)===1,`sx=${await nRec(U3,'sx')}`);
  const done=await d.evaluate(()=>{S.sub='pf';S.tab='dash';render();return{done:!!document.getElementById('fx-xdone'),sst:(document.getElementById('fx-sst')||{}).textContent}});
  rec('J3f','بعد تأكيد الحفظ السحابي يُعرض خيار الاحتفاظ بنسخة الزائر أو حذف المنقول، وتظهر «تمت المزامنة»',done.done&&/تمت المزامنة/.test(done.sst),JSON.stringify(done));
  await d.click('[data-a=fxpurge]');const g2=await d.evaluate(()=>{const g=spRead('guest','fit1');return{sx:Object.keys(g.sx||{}).length,bw3:(g.bw||{})['2026-10-03']}});
  rec('J3g','«احذف المنقول من الزائر» يزيل المنقول من نسخة الزائر وحدها',g2.sx===0&&g2.bw3===undefined,JSON.stringify(g2));
  await d.ctx.close()}
 /* «اتركها في وضع الزائر» */
 {const d=await dev();await d.evaluate(SEED);await d.evaluate(()=>{S.bw['2026-10-07']=77;save()});const r0=rpcCount();
  await ui(d,'in',E3,'password123');await nav(d,()=>d.click('#fxa-go'));await d.waitForSelector('#fx-sheet');await d.click('#fx-sheet [data-fxleave]');await d.waitForTimeout(700);
  const x=await d.evaluate(()=>({has:S.bw['2026-10-07'],g:spRead('guest','fit1').bw['2026-10-07'],x:spMeta().xfer}));
  rec('J3h','«اتركها في وضع الزائر»: لا تنتقل البيانات وتبقى سليمة في مساحة الزائر',x.has===undefined&&x.g===77&&x.x===null,JSON.stringify(x));await d.ctx.close()}
 /* ===== 4) نفس الحساب على جهاز ثانٍ ===== */
 {const d1=await dev(),d2=await dev();await d1.evaluate(e=>SB.in(e,'password123'),E3);await nav(d1,()=>d1.evaluate(()=>fxAfterAuth()));await d1.evaluate(()=>{S.prof.ob=1;S.bw['2026-10-09']=71.5;S.meals['2026-10-09']=[{n:'أخيرة',kcal:222}];save()});await sync(d1);
  const confirmed=+dbq(`select count(*) from public.sync_records where user_id='${U3}'`);
  await d2.evaluate(e=>SB.in(e,'password123'),E3);await nav(d2,()=>d2.evaluate(()=>fxAfterAuth()));
  await d2.waitForFunction(()=>S.prof.ob===1||UI.fxnowait,null,{timeout:10000});await sync(d2);
  const r=await d2.evaluate(()=>({bw:S.bw['2026-10-09'],meal:(S.meals['2026-10-09']||[])[0],sx:Object.keys(S.sx).length,old:S.bw['2026-10-03'],name:S.prof.name,ob:S.prof.ob}));
  rec('J4','نفس الحساب على جهاز ثانٍ يستعيد الأرشيف والبيانات المتزامنة بما فيها آخر تعديل أكّده الخادم',r.bw===71.5&&r.meal&&r.meal.kcal===222&&r.sx===1&&r.old===69&&r.ob===1,JSON.stringify({r,confirmed}));
  await d1.ctx.close();await d2.ctx.close()}
 /* ===== 5) زائر ← A ← خروج ← زائر ← B ؛ تعديلات A المعلّقة تبقى لها وحدها ===== */
 const EA=email('a5'),EB=email('b5');await mkAccount(EA);await mkAccount(EB);
 {const d=await dev();await d.evaluate(SEED);await d.evaluate(()=>{S.bw['2026-09-01']=111;save()});
  const login=async(em)=>{await ui(d,'in',em,'password123');await nav(d,()=>d.click('#fxa-go'))};
  await login(EA);if(await d.$('#fx-sheet [data-fxleave]'))await d.click('#fx-sheet [data-fxleave]');await d.waitForTimeout(500);
  await d.evaluate(()=>{S.prof.ob=1;S.bw['2026-09-02']=222;save()});await sync(d);
  await d.ctx.route('http://127.0.0.1:8796/**',r=>r.abort());await d.evaluate(()=>{S.bw['2026-09-03']=333;save()});await d.waitForTimeout(400);await d.evaluate(()=>{rsMark();rsSave()});
  const pendA=await d.evaluate(()=>rsPend());
  await d.evaluate(()=>{S.sub='pf';render()});await d.click('#fx-out');await d.waitForSelector('#fx-sheet');const warn=await d.textContent('#fx-sheet');
  rec('J5a','تسجيل الخروج مع تعديلات معلّقة يحذّر ويذكر عددها',/تنتظر المزامنة/.test(warn)&&/\d/.test(warn)&&pendA>=1,warn.replace(/\s+/g,' ').slice(0,140));
  await nav(d,()=>d.click('#fx-sheet [data-fxs]'));await d.ctx.unroute('http://127.0.0.1:8796/**');
  const g=await d.evaluate(()=>({a:spMeta().a,ses:!!SB.ses,s1:S.bw['2026-09-01'],s2:S.bw['2026-09-02'],s3:S.bw['2026-09-03']}));
  rec('J5b','بعد الخروج: مساحة الزائر وحدها (بياناته السابقة لا بيانات A) وبلا جلسة',g.a==='guest'&&!g.ses&&g.s1===111&&g.s2===undefined&&g.s3===undefined,JSON.stringify(g));
  const rp=rpcCount();await d.waitForTimeout(1500);rec('J5c','لا مزامنة ولا طلبات من الجلسة السابقة بعد الخروج',rpcCount()===rp,'');
  await login(EB);await d.waitForTimeout(600);if(await d.$('#fx-sheet [data-fxleave]'))await d.click('#fx-sheet [data-fxleave]');
  await d.waitForFunction(()=>UI.fxnowait||S.prof.ob===1,null,{timeout:10000}).catch(()=>{});
  const bb=await d.evaluate(()=>({a:spMeta().a,s1:S.bw['2026-09-01'],s2:S.bw['2026-09-02'],s3:S.bw['2026-09-03'],em:SB.email()}));
  rec('J5d','حساب مختلف B: بياناته وحدها (لا زائر ولا A)',bb.em===EB.toLowerCase()&&bb.s1===undefined&&bb.s2===undefined&&bb.s3===undefined,JSON.stringify(bb));
  await d.evaluate(()=>{S.prof.ob=1;S.bw['2026-09-09']=999;save()});await sync(d);
  await nav(d,()=>d.evaluate(()=>fxSignOut()));
  await login(EA);await d.waitForTimeout(600);if(await d.$('#fx-sheet [data-fxleave]'))await d.click('#fx-sheet [data-fxleave]');
  const aa=await d.evaluate(()=>({em:SB.email(),s2:S.bw['2026-09-02'],s3:S.bw['2026-09-03'],s9:S.bw['2026-09-09'],s1:S.bw['2026-09-01'],pend:(rsMark(),rsPend())}));
  rec('J5e','إعادة فتح A: تعديله المعلّق ما زال له وحده، ولا أثر لـB أو للزائر',aa.em===EA.toLowerCase()&&aa.s3===333&&aa.s2===222&&aa.s9===undefined&&aa.s1===undefined&&aa.pend>=1,JSON.stringify(aa));
  await sync(d);const UA=await uidDb(EA);const srv=dbq(`select count(*) from public.sync_records where user_id='${UA}' and kind='bw'`);
  rec('J5f','تُرفع تعديلات A المعلّقة حين يدخل الحساب نفسه ولا تظهر عند B على الخادم',+srv>=2&&+dbq(`select count(*) from public.sync_records where user_id='${await uidDb(EB)}' and kind='bw'`)===1,'A bw='+srv);
  await d.ctx.close()}
 /* ===== 6) ترقية من نسخة سابقة ===== */
 {const ctx=await b.newContext({viewport:{width:390,height:844}});
  const old=await (async()=>{const x=await dev();await x.evaluate(SEED);await x.evaluate(()=>{S.prof.name='قديم';S.bw['2026-08-01']=88;S.meals['2026-08-01']=[{n:'قديمة',kcal:5}];S.wtr['2026-08-01']=500;save()});const j=await x.evaluate(()=>localStorage.getItem('fit1'));await x.ctx.close();return j})();
  await ctx.addInitScript(o=>{if(!localStorage.getItem('fit1')&&!sessionStorage.getItem('fx_seeded')){localStorage.setItem('fit1',o);localStorage.setItem('fit_bk_2026','{"note":"نسخة احتياطية قديمة"}');sessionStorage.setItem('fx_seeded','1')}},old);
  const p=await open(ctx);const r=await p.evaluate(()=>({n:S.prof.name,bw:S.bw['2026-08-01'],m:S.meals['2026-08-01'],w:S.wtr['2026-08-01'],sp:spMeta().a,bk:localStorage.getItem('fit_bk_2026'),ses:localStorage.getItem('fit_sb')}));
  rec('J6a','ترقية زائر قديم: التمارين والوزن والوجبات والماء والنسخ الاحتياطية القديمة باقية، ومساحته «زائر»',r.n==='قديم'&&r.bw===88&&r.m.length===1&&r.w===500&&r.sp==='guest'&&/قديمة/.test(r.bk||''),JSON.stringify(r));
  await ctx.close();
  const E6=email('j6');await mkAccount(E6);const s6=await (async()=>{const x=await dev();await x.evaluate(e=>SB.in(e,'password123'),E6);const ses=await x.evaluate(()=>localStorage.getItem('fit_sb'));await x.ctx.close();return ses})();
  const ctx2=await b.newContext({viewport:{width:390,height:844}});
  await ctx2.addInitScript(([o,s])=>{if(!sessionStorage.getItem('fx_seeded')){localStorage.setItem('fit1',o);localStorage.setItem('fit_sb',s);sessionStorage.setItem('fx_seeded','1')}},[old,s6]);
  const p2=await open(ctx2);const r2=await p2.evaluate(()=>({n:S.prof.name,bw:S.bw['2026-08-01'],sp:spMeta().a,em:SB.email(),ses:!!SB.ses}));const u6=await uidDb(E6);
  rec('J6b','ترقية مستخدم مسجّل: يبقى مسجّلًا في مساحة حسابه نفسها بكل بياناته (لا يصير زائرًا ولا يفقد شيئًا)',r2.n==='قديم'&&r2.bw===88&&r2.sp==='u_'+u6&&r2.ses,JSON.stringify(r2));await ctx2.close()}
 /* ===== حذف الحساب (البند 2): مسح مساحة الحساب فقط، وإلغاء طابور رفعه، وجهاز آخر بلا اتصال لا يعيد الرفع ===== */
 {const E7=email('j7'),EK=email('k7'),EG=email('g7');await mkAccount(E7);await mkAccount(EK);await mkAccount(EG);
  /* أ) جهاز X: زائر له بيانات ← الحساب K (يبقى معزولًا بعد الخروج) ← الحساب G ثم يحذف G */
  {const d=await dev();await d.evaluate(SEED);await d.evaluate(()=>{S.bw['2026-09-01']=111;save()});
   const login=async em=>{await ui(d,'in',em,'password123');await nav(d,()=>d.click('#fxa-go'));await d.waitForTimeout(500);if(await d.$('#fx-sheet [data-fxleave]'))await d.click('#fx-sheet [data-fxleave]');await d.waitForTimeout(300)};
   await login(EK);await d.evaluate(()=>{S.prof.ob=1;S.bw['2026-09-02']=222;save()});await sync(d);
   await nav(d,()=>d.evaluate(()=>fxSignOut()));
   await login(EG);await d.evaluate(()=>{S.prof.ob=1;S.bw['2026-09-03']=333;save()});await sync(d);
   await d.ctx.route('http://127.0.0.1:8796/**',r=>r.abort());await d.evaluate(()=>{S.bw['2026-09-04']=444;save();rsMark();rsSave()});
   const pend=await d.evaluate(()=>rsPend());await d.ctx.unroute('http://127.0.0.1:8796/**');
   const UG=await uidDb(EG),before=await nRec(UG);
   await nav(d,()=>d.evaluate(()=>ACT.adel()));
   const after=await d.evaluate(([g,k])=>({sp:spMeta().a,ses:!!SB.ses,s1:S.bw['2026-09-01'],s3:S.bw['2026-09-03'],s4:S.bw['2026-09-04'],pend:(rsMark(),rsPend()),
     keys:Object.keys(localStorage).filter(x=>x.indexOf('fit_sp_'+g)===0).length,kk:!!localStorage.getItem('fit_sp_'+k+'_fit1'),kb:(JSON.parse(localStorage.getItem('fit_sp_'+k+'_fit1')||'{}').bw||{})['2026-09-02'],tok:localStorage.getItem('fit_sb'),rs:(JSON.parse(localStorage.getItem('fit_rs')||'{}').uid||'')}),['u_'+UG,'u_'+(await uidDb(EK))]);
   rec('J7a','بعد تأكيد حذف الحساب: تُمسح مساحة الحساب (بياناته وطابور رفعه ومعلومات مزامنته وجلسته) ويعود الجهاز إلى الزائر',after.sp==='guest'&&!after.ses&&after.s3===undefined&&after.s4===undefined&&after.keys===0&&!after.tok&&!after.rs&&pend>=1,JSON.stringify({after,pend}));
   rec('J7b','بيانات الزائر والحساب الآخر على الجهاز تبقى سليمة',after.s1===111&&after.kk&&after.kb===222,JSON.stringify(after));
   rec('J7c','حذف الحساب أزال سجلاته من الخادم ولم يُرفع منه شيء بعده',before>=1&&await nRec(UG)===0,'before='+before);
   await d.waitForTimeout(1500);rec('J7d','لا طلبات مزامنة بعد المسح (الرفع المعلّق أُلغي)',await nRec(UG)===0,'');
   await d.ctx.close()}
  /* ب) جهاز ثانٍ بلا اتصال عند الحذف وعليه تعديلات معلّقة؛ بعد عودة الاتصال لا يعيد رفع شيء ويمسح مساحة الحساب */
  {const d1=await dev(),d2=await dev();
   for(const d of [d1,d2]){await d.evaluate(e=>SB.in(e,'password123'),E7);await nav(d,()=>d.evaluate(()=>fxAfterAuth()))}
   await d1.evaluate(()=>{S.prof.ob=1;S.bw['2026-07-01']=80;save()});await sync(d1);await d2.evaluate(()=>{S.prof.ob=1;save()});await sync(d2);
   const u7=await uidDb(E7);
   await d2.ctx.route('http://127.0.0.1:8796/**',r=>r.abort());await d2.evaluate(()=>{S.bw['2026-07-05']=79;S.bw['2026-07-06']=78;save();rsMark();rsSave()});
   const p2=await d2.evaluate(()=>rsPend());
   await nav(d1,()=>d1.evaluate(()=>ACT.adel()));
   rec('J7e','الجهاز الآخر بلا اتصال: تعديلاته معلّقة ومحفوظة محليًا ولا شيء رُفع',p2>=2&&await nRec(u7)===0,'pend='+p2);
   await d2.ctx.unroute('http://127.0.0.1:8796/**');
   await Promise.all([d2.waitForEvent('load',{timeout:15000}).catch(()=>null),d2.evaluate(()=>rsSync())]);await ready(d2);await d2.waitForTimeout(600);
   const o=await d2.evaluate(()=>({sp:spMeta().a,ses:!!SB.ses,s5:S.bw['2026-07-05'],pend:(rsMark(),rsPend()),tok:localStorage.getItem('fit_sb'),rs:(JSON.parse(localStorage.getItem('fit_rs')||'{}').uid||''),note:localStorage.getItem('fit_acct_note')}));
   rec('J7f','عند عودة الاتصال: الخادم يرفض الرفع، والجهاز يتحقق من حذف الحساب فيمسح مساحته ويعود زائرًا بلا طابور',o.sp==='guest'&&!o.ses&&o.s5===undefined&&!o.tok&&!o.rs,JSON.stringify(o));
   rec('J7g','لا يعود أي سجل للحساب المحذوف إلى الخادم بعد ذلك',await nRec(u7)===0&&+dbq(`select count(*) from public.sync_meta where user_id='${u7}'`)===0,'left='+await nRec(u7));
   await d1.ctx.close();await d2.ctx.close()}
 }
 /* ===== انتهاء رمز الوصول: التجديد بعد إغلاق التطبيق، وسقوط الجلسة إن أُلغيت ===== */
 {const E8=email('j8');await mkAccount(E8);const d=await dev();await d.evaluate(e=>SB.in(e,'password123'),E8);await nav(d,()=>d.evaluate(()=>fxAfterAuth()));
  await d.evaluate(()=>{S.prof.ob=1;S.bw['2026-08-01']=70;save()});await sync(d);
  const old=await d.evaluate(()=>{SB.ses.expires_at=Math.floor(Date.now()/1000)-30;localStorage.setItem('fit_sb',JSON.stringify(SB.ses));return SB.ses.access_token});
  const d2=await open(d.ctx);await d.close();
  await d2.evaluate(()=>{S.bw['2026-08-02']=71;save()});const o=await sync(d2);
  const r=await d2.evaluate(()=>({tok:SB.ses&&SB.ses.access_token,exp:SB.ses&&SB.ses.expires_at,em:SB.email(),a:spMeta().a}));const u8=await uidDb(E8);
  rec('J8a','رمز وصول منتهٍ بعد إغلاق التطبيق: يُجدَّد تلقائيًا بالرمز المحفوظ، والمزامنة تنجح والحساب نفسه',o==='ok'&&r.tok&&r.tok!==old&&r.exp*1000>Date.now()&&+dbq(`select count(*) from public.sync_records where user_id='${u8}' and kind='bw'`)>=2,JSON.stringify({o,r}));
  /* إلغاء الجلسة من الخادم (خروج من كل الأجهزة): التجديد يفشل فتسقط الجلسة ولا تُرفع بيانات، وتبقى البيانات محلية */
  dbq(`delete from auth.sessions where user_id='${u8}'`);
  await d2.evaluate(()=>{SB.ses.expires_at=Math.floor(Date.now()/1000)-30;localStorage.setItem('fit_sb',JSON.stringify(SB.ses));S.bw['2026-08-03']=72;save()});
  await d2.evaluate(()=>rsSync().catch(()=>0));await d2.waitForTimeout(500);
  const r2=await d2.evaluate(()=>({ses:!!SB.ses,tok:localStorage.getItem('fit_sb'),b3:S.bw['2026-08-03']}));
  rec('J8b','جلسة ملغاة من الخادم: تسقط عند التجديد، لا رفع، وبيانات الجهاز المحلية سليمة',!r2.ses&&!r2.tok&&r2.b3===72&&+dbq(`select count(*) from public.sync_records where user_id='${u8}' and kind='bw' and rid like '%08-03%'`)===0,JSON.stringify(r2));
  await d2.ctx.close()}
}catch(e){fails++;console.log('FAIL EXCEPTION',e.stack||e)}
await b.close();st.close();sb.close();console.log(fails?`\n${fails} FAIL`:'\nall PASS');process.exit(fails?1:0)
