/* ===== الحسابات ووضع الزائر: مساحات محلية معزولة داخل تثبيت واحد =====
   المساحة النشطة تعيش في المفاتيح المعتادة (fit1, fit_rs, fit_sb ...)؛ المساحات الأخرى محفوظة تحت fit_sp_<id>_<key>.
   التبديل = حفظ + نقل المفاتيح + إعادة تحميل الصفحة، فلا يبقى طلب أو مؤقّت من الحساب السابق يمسّ الشاشة الحالية.
   قاعدة ثابتة: مساحة الزائر لا تحمل جلسة سحابية أبدًا (RS.hold + تنظيف عند الإقلاع)، فلا يُرفع شيء منها. */
const SPK=['fit1','fit_rs','fit_rs_off','fit_sb','fit_sync','fit_pp','fit_ai_ok'];
const spId=uid=>'u_'+uid;
function spMeta(){try{const m=JSON.parse(localStorage.getItem('fit_space')||'null');return m&&m.a?m:{a:'guest'}}catch(e){return{a:'guest'}}}
function spPut(m){try{localStorage.setItem('fit_space',JSON.stringify(m))}catch(e){lg(e)}}
const spLs=()=>{const o=[];try{for(let i=0;i<localStorage.length;i++)o.push(localStorage.key(i))}catch(e){lg(e)}return o};
/* مفاتيح المساحة النشطة: الثابتة + ملفات المستخدمين المحليين المتعددين (fit1p_*) */
const spKeys=()=>SPK.concat(spLs().filter(k=>k.indexOf('fit1p_')===0));
function spStash(id){const pre='fit_sp_'+id+'_';spLs().filter(k=>k.indexOf(pre)===0).forEach(k=>localStorage.removeItem(k));
 spKeys().forEach(k=>{try{const v=localStorage.getItem(k);if(v!=null)localStorage.setItem(pre+k,v);localStorage.removeItem(k)}catch(e){lg(e)}})}
function spRestore(id){const pre='fit_sp_'+id+'_';let any=false;
 spKeys().forEach(k=>{try{localStorage.removeItem(k)}catch(e){lg(e)}});
 spLs().filter(k=>k.indexOf(pre)===0).forEach(k=>{try{localStorage.setItem(k.slice(pre.length),localStorage.getItem(k));any=true}catch(e){lg(e)}});return any}
function spRead(id,k){try{return JSON.parse(localStorage.getItem('fit_sp_'+id+'_'+k)||'null')}catch(e){return null}}
function spDrop(id){const pre='fit_sp_'+id+'_';spLs().filter(k=>k.indexOf(pre)===0).forEach(k=>{try{localStorage.removeItem(k)}catch(e){lg(e)}})}
/* ترقية من نسخة سابقة: من كان مسجّلًا يصير مساحته حسابًا بعينه، وإلا مساحة الزائر */
(function(){try{if(localStorage.getItem('fit_space')==null){let u=SB.ses&&SB.ses.user&&SB.ses.user.id;
 if(!u&&SB.ses&&SB.ses.access_token){try{u=JSON.parse(atob(SB.ses.access_token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub}catch(e){}}
 spPut(u?{a:spId(u),email:SB.email()}:{a:'guest'})}}catch(e){lg(e)}})();
const FXSPM=spMeta();
const fxIsGuest=()=>FXSPM.a==='guest';
if(fxIsGuest()){RS.hold=1;if(SB.ses){SB.ses=null;try{localStorage.removeItem('fit_sb')}catch(e){lg(e)}}}
function fxHasData(s){if(!s||typeof s!=='object')return false;const n=o=>Object.keys(o||{}).length;
 return !!(n(s.sx)||n(s.meals)||n(s.wtr)||n(s.bw)||n(s.done)||(s.prof&&s.prof.ob))}
function fxSummary(s){s=s||{};const n=o=>Object.keys(o||{}).length;
 return{sessions:n(s.sx),meals:Object.keys(s.meals||{}).reduce((a,d)=>a+((s.meals[d]||[]).length),0),water:n(s.wtr),weights:n(s.bw),profile:!!(s.prof&&s.prof.ob)}}
const fxIdle=async()=>{for(let i=0;i<150&&RS.busy;i++)await new Promise(r=>setTimeout(r,100))};
/* ---- حالة المزامنة كما هي فعليًا ---- */
function fxSyncState(){if(fxIsGuest())return{k:'guest',t:'محفوظ على الجهاز'};
 const m=spMeta();if(m.xfer&&m.xfer.st==='ask')return{k:'wait',t:'محفوظ على الجهاز · بانتظار قرارك بشأن بيانات الزائر'};
 if(!SB.ses||RS.err==='auth')return{k:'auth',t:'انتهت الجلسة · سجّل الدخول من جديد (بياناتك محفوظة على الجهاز)'};
 if(RS.pause)return{k:'pause',t:'محفوظ على الجهاز · المزامنة متوقفة'};
 if(RS.closed||RS.reset||RS.acct)return{k:'pause',t:'محفوظ على الجهاز · المزامنة بانتظار قرارك'};
 const p=rsPend();
 if(RS.busy)return{k:'busy',t:'جارٍ المزامنة…'};
 if(p||RS.err)return{k:'pend',t:'ينتظر المزامنة'+(p?' ('+F(p)+')':'')+(RS.err?' · تعذّر الاتصال، ستُعاد المحاولة':'')};
 return{k:'ok',t:'تمت المزامنة'+(RS.last?' · '+rdF(RS.last,Intl.DateTimeFormat().resolvedOptions().timeZone):'')}}
/* ---- واجهة Supabase Auth ---- */
const FXRD=()=>NAT?'sijil://auth':(location.protocol==='file:'||!location.origin||location.origin==='null'?'':location.origin+location.pathname);
const fxAuthOk=()=>!!(CFG.sbUrl&&CFG.sbKey);
const fxErr=e=>{const m=String(e&&e.message||e);return({'Invalid login credentials':'البريد أو كلمة المرور غير صحيحة','User already registered':'هذا البريد مسجّل مسبقًا، سجّل الدخول','Email not confirmed':'لم يُؤكَّد البريد بعد. افتح الرابط المرسل إليك أو أعد إرساله','Failed to fetch':'تعذّر الاتصال. تحقق من الإنترنت','Load failed':'تعذّر الاتصال. تحقق من الإنترنت'})[m]||(/rate|too many|seconds/i.test(m)?'محاولات كثيرة، انتظر قليلًا ثم أعد المحاولة':/password/i.test(m)&&/short|least|weak/i.test(m)?'كلمة المرور ضعيفة (6 أحرف على الأقل)':m)};
const fxQs=()=>{const r=FXRD();return r?'?redirect_to='+encodeURIComponent(r):''};
const fxPost=(path,body)=>SB.raw(path+fxQs(),{method:'POST',headers:SB.hd(),body:JSON.stringify(body)});
async function fxUserFill(){try{const u=await SB.raw('/auth/v1/user',{headers:{apikey:CFG.sbKey,Authorization:'Bearer '+SB.ses.access_token}});if(u&&u.id){SB.ses.user=Object.assign({},SB.ses.user,u);if(!UI.fxtmp)localStorage.setItem('fit_sb',JSON.stringify(SB.ses))}}catch(e){lg(e)}}
/* بعد نجاح الدخول: انقل إلى مساحة هذا الحساب (ونقل بيانات الزائر لا يتم إلا بعد موافقة صريحة بعد إعادة التحميل) */
function fxAfterAuth(){const uid=SB.uid();if(!uid||!SB.ses)return;const id=spId(uid),cur=spMeta(),ses=JSON.stringify(SB.ses),em=SB.email();RS.hold=1;
 if(cur.a===id){try{localStorage.setItem('fit_sb',ses)}catch(e){lg(e)}spPut(Object.assign({},cur,{email:em}));location.reload();return}
 try{save();rsSave()}catch(e){lg(e)}
 const guestHad=cur.a==='guest'&&fxHasData(S);
 try{localStorage.removeItem('fit_sb')}catch(e){lg(e)}spStash(cur.a);const had=spRestore(id);
 try{localStorage.setItem('fit_sb',ses)}catch(e){lg(e)}
 spPut({a:id,email:em,xfer:guestHad?{st:'ask',from:cur.a}:null,wait:!had,orph:cur.orph});location.reload()}
/* ---- نافذة الدخول/الحساب الجديد/الاستعادة ---- */
function fxAuthClose(){const d=document.getElementById('fx-auth');if(d)d.remove();document.body.classList.remove('fxopen')}
function fxAuth(mode,opt){opt=opt||{};fxAuthClose();
 const d=document.createElement('div');d.id='fx-auth';d.className='sjwel fxauth';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
 const T={in:'تسجيل الدخول',up:'إنشاء حساب',reset:'استعادة كلمة المرور',newpw:'كلمة مرور جديدة',resend:'إعادة إرسال رابط التأكيد'};
 const st={mode:mode,msg:opt.msg||'',err:opt.err||'',busy:0,email:opt.email||'',sent:opt.sent||0};
 const h=()=>{const m=st.mode;
  d.innerHTML='<div class="bg"></div><div class="in fxain"><div class="fxalg">'+SJLOGO+'</div><h1>'+T[m]+'</h1>'+
   (fxAuthOk()?'':'<div class="fxamsg err">الحساب غير مفعّل في هذه النسخة: لم تُضبط خدمة المزامنة. تابع كزائر الآن.</div>')+
   (m==='up'?'<label class="f">الاسم الظاهر<input id="fxa-n" maxlength="24" autocomplete="nickname" placeholder="الاسم"></label>':'')+
   (m!=='newpw'?'<label class="f">البريد الإلكتروني<input id="fxa-e" type="email" dir="ltr" autocomplete="email" inputmode="email" value="'+esc(st.email)+'"></label>':'')+
   (m==='in'||m==='up'||m==='newpw'?'<label class="f">'+(m==='newpw'?'كلمة المرور الجديدة':'كلمة المرور')+'<input id="fxa-p" type="password" dir="ltr" autocomplete="'+(m==='in'?'current-password':'new-password')+'" placeholder="6 أحرف فأكثر"></label>':'')+
   (st.msg?'<div class="fxamsg ok" role="status" id="fxa-msg">'+esc(st.msg)+'</div>':'')+(st.err?'<div class="fxamsg err" role="alert" id="fxa-err">'+esc(st.err)+'</div>':'')+
   '<button class="btn fxago" id="fxa-go"'+(st.busy||!fxAuthOk()?' disabled':'')+'>'+(st.busy?'لحظة…':m==='in'?'دخول':m==='up'?'إنشاء الحساب':m==='reset'?'أرسل رابط الاستعادة':m==='newpw'?'حفظ كلمة المرور':'أعد إرسال الرابط')+'</button>'+
   '<div class="fxalinks">'+(m==='in'?'<button class="sec" data-fxm="reset">نسيت كلمة المرور؟</button><button class="sec" data-fxm="up">إنشاء حساب</button>':m==='up'?'<button class="sec" data-fxm="in">لديّ حساب</button>':m==='reset'||m==='resend'?'<button class="sec" data-fxm="in">رجوع لتسجيل الدخول</button>':'')+
   (st.sent&&m!=='newpw'&&m!=='resend'?'<button class="sec" data-fxm="resend">لم يصلني الرابط؟ أعد الإرسال</button>':'')+
   '<button class="sec" data-fxx="1">'+(m==='newpw'?'إلغاء':fxIsGuest()?'المتابعة كزائر':'إغلاق')+'</button></div></div>'};
 const go=async()=>{if(st.busy)return;const g=id=>((d.querySelector(id)||{}).value||'');
  const e=g('#fxa-e').trim(),p=g('#fxa-p'),n=g('#fxa-n').trim();if(e)st.email=e;st.err='';st.msg='';
  if(st.mode!=='newpw'&&!/^\S+@\S+\.\S+$/.test(e)){st.err='اكتب بريدًا صحيحًا';h();return}
  if((st.mode==='in'||st.mode==='up'||st.mode==='newpw')&&p.length<6){st.err='كلمة المرور 6 أحرف على الأقل';h();return}
  if(st.mode==='up'&&n.length<2){st.err='اكتب اسمًا ظاهرًا';h();return}
  st.busy=1;h();
  try{
   if(st.mode==='in'){await SB.in(e,p);await fxUserFill();fxAfterAuth();return}
   if(st.mode==='up'){const j=await fxPost('/auth/v1/signup',{email:e,password:p,data:{display_name:n}});
     if(j&&j.access_token){SB.set(j);await fxUserFill();fxAfterAuth();return}
     st.msg='أُرسل رابط التأكيد إلى '+e+'. افتحه من بريدك ثم سجّل الدخول.';st.sent=1;st.mode='in'}
   else if(st.mode==='reset'){await fxPost('/auth/v1/recover',{email:e});st.msg='إن كان البريد مسجّلًا فقد أُرسل إليه رابط الاستعادة.';st.sent=1}
   else if(st.mode==='resend'){await fxPost('/auth/v1/resend',{type:'signup',email:e});st.msg='أُعيد إرسال رابط التأكيد إلى '+e+'.'}
   else if(st.mode==='newpw'){await SB.raw('/auth/v1/user',{method:'PUT',headers:SB.hd(1),body:JSON.stringify({password:p})});await fxUserFill();UI.fxtmp=0;fxAfterAuth();return}
  }catch(x){st.err=fxErr(x);if(/not confirmed/i.test(String(x&&x.message)))st.sent=1}
  st.busy=0;h()};
 d.addEventListener('click',ev=>{const m=ev.target.closest('[data-fxm]');if(m){const v=(d.querySelector('#fxa-e')||{}).value;if(v)st.email=v;st.mode=m.dataset.fxm;st.err='';st.msg='';h();return}
  if(ev.target.closest('[data-fxx]')){if(UI.fxtmp){UI.fxtmp=0;SB.ses=null;try{localStorage.removeItem('fit_sb')}catch(e){}if(fxIsGuest())RS.hold=1}fxAuthClose();return}if(ev.target.closest('#fxa-go'))go()});
 d.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target.tagName==='INPUT'){ev.preventDefault();go()}});
 h();document.body.appendChild(d);document.body.classList.add('fxopen');setTimeout(()=>{const f=d.querySelector('input');if(f)try{f.focus({preventScroll:true})}catch(x){}},80)}
/* ---- روابط البريد (تأكيد/استعادة) من Android أو من عنوان الصفحة ---- */
async function fxDeep(url){try{if(!url||typeof url!=='string')return;
  const q=[];const i=url.indexOf('?'),j=url.indexOf('#');if(i>=0)q.push(url.slice(i+1,j>i?j:undefined));if(j>=0)q.push(url.slice(j+1));
  const P=new URLSearchParams(q.join('&'));
  const err=P.get('error_description')||P.get('error');
  if(err){fxAuth('resend',{err:/expired|invalid|otp/i.test(err)?'الرابط منتهي أو غير صالح. أعد إرسال رابط جديد.':String(err).replace(/\+/g,' ')});return}
  const at=P.get('access_token');if(!at)return;const ty=P.get('type')||'signup';
  /* الجلسة تُحفظ في الذاكرة فقط حتى يُحسم الحساب: لا تدخل مساحة الزائر ولا تُرفع بياناته */
  RS.hold=1;UI.fxtmp=1;SB.ses={access_token:at,refresh_token:P.get('refresh_token')||'',expires_at:+P.get('expires_at')||Math.floor(Date.now()/1000)+(+P.get('expires_in')||3600),user:null};
  await fxUserFill();if(!SB.ses.user||!SB.ses.user.id){try{SB.ses.user={id:JSON.parse(atob(at.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub}}catch(e){}}
  try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
  if(ty==='recovery'){UI.fxtmp=1;fxAuth('newpw',{msg:'اختر كلمة مرور جديدة لحسابك.'});return}
  fxAfterAuth()}catch(e){lg(e)}}
try{const A=NAT&&NP('App');if(A){A.addListener('appUrlOpen',ev=>fxDeep(ev&&ev.url));A.getLaunchUrl&&A.getLaunchUrl().then(r=>{if(r&&r.url)fxDeep(r.url)}).catch(()=>{})}}catch(e){lg(e)}
setTimeout(()=>{if(/[#&?](access_token|error_description)=/.test(location.hash||''))fxDeep(location.href)},300);
/* ---- نقل بيانات الزائر بعد موافقة صريحة ---- */
if(FXSPM.xfer&&FXSPM.xfer.st==='ask')RS.pause=1;
function fxResumeSync(){try{RS.pause=+localStorage.getItem('fit_rs_off')||0}catch(e){RS.pause=0}}
/* الدمج يبقي كل ما في الحساب: سجل الحساب الموجود لا يُستبدل أبدًا، والمفاتيح مستقرة فلا ازدواج عند الإعادة */
function fxMerge(gs,useCfg){const cur=rsDecomp(S),g=rsDecomp(gs);
 Object.keys(g).forEach(key=>{const r=g[key];if(r.k==='cfg'){if(!useCfg)return}else if(cur[key])return;
  rsPut({k:r.k,r:r.r,v:{m:r.m,e:r.e,v:r.v}})});
 norm();rsMark(false,Date.now());save();rsSave();
 /* المنقول = كل سجل زائر له الآن في الحساب القيمة نفسها (يشمل ما نُقل في محاولة سابقة)؛ ما تعارض مع سجل الحساب يبقى عند الزائر */
 const now=rsDecomp(S);return Object.keys(g).filter(key=>g[key].k!=='cfg'&&now[key]&&JSON.stringify(now[key].v)===JSON.stringify(g[key].v))}
function fxXferSheet(){const m=spMeta();if(!m.xfer||m.xfer.st!=='ask'||document.getElementById('fx-sheet'))return;UI.fxxs=1;
 const gs=spRead(m.xfer.from,'fit1'),sm=fxSummary(gs),b=document.createElement('div');let busy=0;
 b.innerHTML='<p style="margin:0 0 8px">لديك بيانات في وضع الزائر على هذا الجهاز. لن ينتقل شيء دون موافقتك.</p><ul class="fxul" id="fx-xsum"><li><b class="num">'+F(sm.sessions)+'</b> جلسة تمرين</li><li><b class="num">'+F(sm.meals)+'</b> وجبة</li><li><b class="num">'+F(sm.water)+'</b> يوم ماء</li><li><b class="num">'+F(sm.weights)+'</b> قياس وزن</li>'+(sm.profile?'<li>الملف والأهداف والإعدادات (لا تُستبدل إعدادات حسابك إن كان لديه بيانات)</li>':'')+'</ul><p class="mu" style="margin:8px 0 0">سجلات حسابك الموجودة تبقى كما هي. تبقى نسخة الزائر على الجهاز حتى يتأكد الحفظ السحابي.</p><button type="button" class="btn ghost" data-fxleave="1" style="width:100%;margin-top:10px">اتركها في وضع الزائر</button><div class="mu" id="fx-xerr" style="margin-top:8px;color:var(--t-rd)"></div>';
 fxSheet('أضف بيانات هذا الجهاز إلى حسابي',b,function(){if(busy)return false;busy=1;const er=document.getElementById('fx-xerr');
   (async()=>{try{RS.pause=0;await fxIdle();const o=await rsSync();
     if(o!=='ok'){RS.pause=1;busy=0;if(er)er.textContent='يلزم اتصال بحسابك لقراءة بياناته قبل النقل حتى لا نستبدل شيئًا منها. بياناتك سليمة، أعد المحاولة.';return}
     const useCfg=!fxHasData(S);const moved=fxMerge(gs,useCfg);const mm=spMeta();mm.xfer={st:'moved',from:m.xfer.from,keys:moved,at:Date.now()};spPut(mm);fxResumeSync();fxClose();toast('أُضيفت بيانات الزائر إلى حسابك وجارٍ حفظها');rsSoon(100);render()}
    catch(e){lg(e);RS.pause=1;busy=0;if(er)er.textContent='تعذّر النقل. بياناتك سليمة ويمكنك إعادة المحاولة.'}})();return false},{ok:'أضف بيانات هذا الجهاز إلى حسابي'});
 document.querySelector('#fx-sheet [data-fxleave]').addEventListener('click',()=>{const mm=spMeta();mm.xfer=null;spPut(mm);fxResumeSync();fxClose();rsSoon(200);render()})}
/* بعد التأكيد السحابي: الاحتفاظ بنسخة الزائر أو حذف المنقول منها */
function fxXferDone(){const m=spMeta();return !!(m.xfer&&m.xfer.st==='moved'&&!m.xfer.cleared&&rsPend()===0&&RS.last&&!RS.err)}
function fxPurgeMoved(){const m=spMeta(),gs=spRead(m.xfer.from,'fit1');if(!gs)return;
 (m.xfer.keys||[]).forEach(key=>{const i=key.indexOf('\u0001'),k=key.slice(0,i),rid=key.slice(i+1),c=gs[k];
  if(Array.isArray(c)){const j=c.findIndex(x=>x&&rsRid(String(x.id))===rid);if(j>=0)c.splice(j,1)}else if(c&&typeof c==='object'){const e=Object.keys(c).find(n=>rsRid(n)===rid);if(e!==undefined)delete c[e]}});
 localStorage.setItem('fit_sp_'+m.xfer.from+'_fit1',JSON.stringify(gs));m.xfer.cleared=1;spPut(m)}
/* ---- تسجيل الخروج: التعديلات المعلّقة تبقى في مساحة الحساب معزولة ---- */
function fxSignOut(){const p=rsPend(),go=async()=>{RS.hold=1;
  try{await Promise.race([SB.out(),new Promise(r=>setTimeout(r,3000))])}catch(e){lg(e)}
  try{SB.ses=null;localStorage.removeItem('fit_sb');save();rsSave()}catch(e){lg(e)}
  const m=spMeta();spStash(m.a);spRestore('guest');spPut({a:'guest',orph:m.orph});location.reload()};
 if(!p){go();return}
 const b=document.createElement('div');b.innerHTML='<p style="margin:0 0 6px" id="fx-so-n">لديك <b class="num">'+F(p)+'</b> تعديلًا لم تُزامَن بعد.</p><p class="mu" style="margin:0">إن خرجت الآن حُفظت في مساحة حسابك على هذا الجهاز وعُزلت عن وضع الزائر وعن أي حساب آخر، ولن تُرفع إلا حين تدخل إلى الحساب نفسه.</p>';
 fxSheet('تعديلات تنتظر المزامنة',b,()=>{go();return false},{ok:'خروج رغم ذلك'})}
/* مسح مساحة الحساب الحالي من الجهاز نهائيًا: بيانات الحساب وطابور رفعه ومعلومات مزامنته. مساحة الزائر والحسابات الأخرى لا تُمسّ */
function fxWipeAccount(note){const m=spMeta();RS.hold=1;clearTimeout(RST);
 const rm=k=>{try{localStorage.removeItem(k)}catch(e){lg(e)}};
 spKeys().forEach(rm);spDrop(m.a);
 const orph=(m.orph||[]).filter(i=>i!==m.a);
 spRestore('guest');spPut({a:'guest',orph:orph});
 try{if(note)localStorage.setItem('fit_acct_note',note)}catch(e){lg(e)}
 try{Storage.prototype.setItem=function(){}}catch(e){lg(e)}   /* بعد الكتابات كلها: لا يعيد أي مؤقت كتابة المساحة قبل إعادة التحميل */
 location.reload()}
/* حذف الحساب بعد تأكيده: تُمسح بيانات هذا الحساب من الجهاز ويعود التطبيق إلى مساحة الزائر كما كانت */
(function(){const D=ACT.adel;ACT.adel=async function(){const was=SB.ses;const r=await D.apply(this,arguments);
 if(was&&!SB.ses&&!fxIsGuest())fxWipeAccount('del');return r}})();
/* حساب حُذف من جهاز آخر: الخادم يرفض أي رفع منه (الجلسة تسقط مع المستخدم). هنا نتأكد ثم نمسح مساحته ونلغي طابور رفعه */
async function fxAcctGone(){if(!SB.ses||fxIsGuest())return false;
 try{const r=await fetch(CFG.sbUrl+'/auth/v1/user',{headers:SB.hd(1)});if(r.status===404)return true;
  if(r.status===401||r.status===403){let m='';try{const j=await r.json();m=String(j.msg||j.message||j.error_description||j.error_code||'')}catch(e){lg(e)}
   return /user_not_found|sub claim in JWT does not exist/i.test(m)}}catch(e){lg(e)}return false}
(function(){const R=rsSync;let busy=0;rsSync=async function(){const o=await R.apply(this,arguments);
 if(o==='err'&&RS.err==='auth'&&!busy&&!fxIsGuest()){busy=1;try{if(await fxAcctGone())fxWipeAccount('gone')}catch(e){lg(e)}finally{busy=0}}return o}})();
/* مسح بيانات هذا الجهاز: يخص المساحة الحالية فقط */
ACT.rswipe=async function(){RS.hold=1;try{await Promise.race([SB.out(),new Promise(r=>setTimeout(r,3000))])}catch(e){lg(e)}
 const m=spMeta();if(m.a==='guest'){spKeys().forEach(k=>{try{localStorage.removeItem(k)}catch(e){lg(e)}});location.reload();return false}
 fxWipeAccount();return false};
/* ---- بطاقة «الحساب» داخل الملف الشخصي ---- */
function fxAccCard(){const m=spMeta();let orph='';
 if(fxIsGuest()){(m.orph||[]).forEach((id,i)=>{if(fxHasData(spRead(id,'fit1')))orph+='<div class="note" style="margin:8px 0">بقيت على الجهاز بيانات حساب محذوف معزولة عن الزائر.</div><button class="btn sm ghost" data-a="fxorph" data-v="'+i+'">أضفها إلى وضع الزائر</button> '});
  return '<div class="card fxacc" id="fx-acc"><h2>'+ic('user')+'الحساب</h2><div class="tag" id="fx-sst">محفوظ على الجهاز</div><div class="mu" style="margin:8px 0"><b>وضع الزائر.</b> بياناتك محفوظة على هذا الجهاز وحده ولا تُرفع إلى أي خدمة، ولا يُنشأ لك حساب. مسح بيانات التطبيق أو حذفه قد يفقدك هذا السجل ما لم تحتفظ بنسخة احتياطية (المزيد ← الإعدادات ← البيانات والنسخ).</div>'+orph+
   (fxAuthOk()?'<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm" data-a="fxin" id="fx-in">تسجيل الدخول</button><button class="btn sm ghost" data-a="fxup" id="fx-up">إنشاء حساب</button></div>':'<div class="mu">تسجيل الدخول غير مفعّل في هذه النسخة.</div>')+'</div>'}
 const ss=fxSyncState(),u=(SB.ses&&SB.ses.user)||{};
 let h='<div class="card fxacc" id="fx-acc"><h2>'+ic('user')+'الحساب</h2><div class="mu">البريد: <b dir="ltr" id="fx-em">'+esc(SB.email()||m.email||'—')+'</b></div><div class="tag'+(ss.k==='auth'||ss.k==='pause'?' bad':'')+'" id="fx-sst" data-k="'+ss.k+'" style="margin:8px 0">'+esc(ss.t)+'</div><div class="mu" style="font-size:12px;margin-bottom:8px">تُزامَن التمارين والأرشيف والوزن والوجبات والماء والأهداف والإعدادات. تبقى محليًا فقط: صور الملف الشخصي، ورمز قفل التطبيق، والمواقع المحفوظة، ونسخة الطقس المؤقتة.</div>';
 if(u.id&&u.email_confirmed_at===null)h+='<div class="mu" style="margin-bottom:6px">لم يُؤكَّد بريدك بعد.</div><button class="btn sm ghost" data-a="fxresend">أعد إرسال رابط التأكيد</button> ';
 if(ss.k==='auth')h+='<button class="btn sm" data-a="fxin" id="fx-relogin">سجّل الدخول من جديد</button> ';
 if(m.xfer&&m.xfer.st==='ask')h+='<button class="btn sm" data-a="fxxfer" id="fx-xfer">قرّر بشأن بيانات الزائر</button> ';
 if(fxXferDone())h+='<div class="note" style="margin:8px 0" id="fx-xdone">تأكّد حفظ بيانات الزائر في حسابك. اترك نسخة الزائر كما هي أو احذف المنقول منها.</div><div class="row" style="gap:8px"><button class="btn sm ghost" data-a="fxkeep">احتفظ بنسخة الزائر</button><button class="btn sm ghost" data-a="fxpurge">احذف المنقول من الزائر</button></div>';
 h+='<div class="row" style="margin-top:10px"><button class="btn sm ghost" data-a="fxout" id="fx-out">تسجيل الخروج</button></div>';
 return h+'</div>'+(typeof rsCard==='function'?rsCard():'')}
Object.assign(ACT,{fxin:()=>{fxAuth('in',{email:SB.email()||spMeta().email||''});return false},fxup:()=>{fxAuth('up');return false},
 fxout:()=>{fxSignOut();return false},fxxfer:()=>{fxXferSheet();return false},
 fxresend:async()=>{try{await fxPost('/auth/v1/resend',{type:'signup',email:SB.email()});toast('أُعيد إرسال رابط التأكيد')}catch(e){toast(fxErr(e))}return false},
 fxkeep:()=>{const m=spMeta();m.xfer.cleared=1;spPut(m);toast('بقيت نسخة الزائر على الجهاز')},
 fxpurge:()=>{fxPurgeMoved();toast('حُذفت البيانات المنقولة من مساحة الزائر')},
 fxorph:b=>{const m=spMeta(),id=(m.orph||[])[+b.dataset.v],gs=spRead(id,'fit1');if(!gs)return;fxMerge(gs,!fxHasData(S));m.orph.splice(+b.dataset.v,1);spPut(m);spDrop(id);toast('أُضيفت إلى وضع الزائر')},
 welin:()=>{fxAuth('in');return false},welup:()=>{fxAuth('up');return false},welguest:()=>{UI.wel2=1;window.scrollTo(0,0)}});
/* شاشة البداية: تسجيل الدخول · إنشاء حساب · المتابعة كزائر (متاح دائمًا ودون إنترنت) */
vWelcome=function(){return '<div class="sjwel"><div class="bg"></div><div class="art">'+SJART+'</div><div class="in"><button class="lang" data-a="langm" aria-label="اللغة">English</button><div class="lgw">'+SJLOGO+'</div><div class="sp"></div><h1>أهلًا بك</h1>'+
 '<button class="btn" data-a="welin" id="wel-in">تسجيل الدخول</button><button class="btn fxw2" data-a="welup" id="wel-up">إنشاء حساب</button><hr><button class="sec" data-a="welguest" id="wel-go">المتابعة كزائر</button></div></div>'};
/* تسجيل الدخول عبر النافذة نفسها لا عبر نموذج ثانٍ */
authCard=function(){return '<div class="card"><h2>'+ic('users')+'تسجيل الدخول</h2><div class="mu" style="margin-bottom:10px">الحساب اختياري لمزامنة بياناتك. وضع الزائر يبقى محليًا ولا يُرفع.</div><button class="btn" style="width:100%" data-a="fxin">تسجيل الدخول أو إنشاء حساب</button></div>'};
/* حساب جديد بلا بيانات محلية: انتظر الاستعادة بدل معالج الإعداد إن كان للحساب نسخة سحابية */
(function(){const V=vOnb;vOnb=function(){const m=spMeta();
 if(!S.prof.ob&&SB.ses&&m.wait&&!UI.fxnowait&&!(m.xfer&&m.xfer.st==='ask')){
  if(RS.last&&!RS.busy&&!RS.err){UI.fxnowait=1}
  else{try{rsSoon(50)}catch(e){}if(!UI.fxwt)UI.fxwt=setInterval(()=>{if(S.prof.ob||UI.fxnowait||(RS.last&&!RS.busy)){clearInterval(UI.fxwt);UI.fxwt=0;UI.fxnowait=1;render()}},400);
   const bad=RS.err&&RS.err!=='';
   return '<div class="sjwel"><div class="bg"></div><div class="in"><div class="sp"></div><h1 id="fx-wait">'+(bad?'تعذّرت الاستعادة':'جارٍ استعادة بياناتك…')+'</h1><div class="mu" style="color:#fff;text-align:center">'+(bad?'تحقق من الاتصال ثم أعد المحاولة، أو ابدأ إعدادًا جديدًا.':'نبحث عن بيانات حسابك السحابية.')+'</div>'+(bad?'<button class="btn" data-a="fxretry">أعد المحاولة</button>':'')+'<button class="sec" data-a="fxnowait">ابدأ إعدادًا جديدًا</button></div></div>'}}
 return V.apply(this,arguments)};ACT.fxnowait=()=>{UI.fxnowait=1};ACT.fxretry=()=>{RS.err='';try{rsSoon(50)}catch(e){}}})();
(function(){const Pf=rdProf;rdProf=function(){const x=Pf.apply(this,arguments);return x.replace('<h1>ملفي الشخصي</h1>','<h1>ملفي الشخصي</h1>'+fxAccCard())}})();
/* حساب/إعدادات: مكان واحد للمزامنة هو الملف الشخصي */
(function(){const O=setSyncHtml;setSyncHtml=function(){return '<div class="mu">إدارة الحساب والمزامنة وتسجيل الخروج في «الملف الشخصي ← الحساب».</div><button class="chip" data-a="sub" data-v="pf">افتح الملف الشخصي</button>'+(typeof INST!=='undefined'&&INST?'<div class="card hl"><button class="btn" data-a="install">تثبيت التطبيق على الشاشة الرئيسية</button></div>':'')};})();
/* بعد إعادة التحميل: اسأل عن نقل بيانات الزائر مرة في الجلسة */
(function(){const R=render;render=function(){const r=R.apply(this,arguments);try{const m=spMeta();if(m.xfer&&m.xfer.st==='ask'&&!UI.fxxs&&S.prof&&!document.getElementById('fx-sheet'))setTimeout(fxXferSheet,60)}catch(e){lg(e)}return r}})();
/* ترجمات الإنجليزية لنصوص الحسابات */
Object.assign(ENT,{
'إدارة الحساب والمزامنة وتسجيل الخروج في «الملف الشخصي ← الحساب».':'Manage your account, sync and sign-out in Profile → Account.',
'افتح الملف الشخصي':'Open profile','تسجيل الدخول':'Sign in','إنشاء حساب':'Create account','المتابعة كزائر':'Continue as guest','أهلًا بك':'Welcome',
'الحساب':'Account','وضع الزائر':'Guest mode','محفوظ على الجهاز':'Saved on this device','تسجيل الخروج':'Sign out','دخول':'Sign in',
'استعادة كلمة المرور':'Reset password','كلمة مرور جديدة':'New password','إعادة إرسال رابط التأكيد':'Resend confirmation link','أعد إرسال رابط التأكيد':'Resend confirmation link',
'نسيت كلمة المرور؟':'Forgot password?','لديّ حساب':'I have an account','رجوع لتسجيل الدخول':'Back to sign in','لم يصلني الرابط؟ أعد الإرسال':"Didn't get the link? Resend",
'البريد الإلكتروني':'Email','كلمة المرور':'Password','الاسم الظاهر':'Display name','أرسل رابط الاستعادة':'Send reset link','حفظ كلمة المرور':'Save password','أعد إرسال الرابط':'Resend link',
'أضف بيانات هذا الجهاز إلى حسابي':'Add this device’s data to my account','اتركها في وضع الزائر':'Leave it in guest mode','تعديلات تنتظر المزامنة':'Edits waiting to sync','خروج رغم ذلك':'Sign out anyway',
'احتفظ بنسخة الزائر':'Keep the guest copy','احذف المنقول من الزائر':'Delete transferred data from guest','قرّر بشأن بيانات الزائر':'Decide about guest data','سجّل الدخول من جديد':'Sign in again',
'جارٍ استعادة بياناتك…':'Restoring your data…','ابدأ إعدادًا جديدًا':'Start a fresh setup','أعد المحاولة':'Try again','تعذّرت الاستعادة':'Restore failed',
'ينتظر المزامنة':'Waiting to sync','تمت المزامنة':'Synced','تسجيل الدخول أو إنشاء حساب':'Sign in or create account','أضفها إلى وضع الزائر':'Add it to guest mode',
'العودة إلى اليوم':'Back to Today',
'حُذف حسابك ومُسحت بياناته من هذا الجهاز':'Your account was deleted and its data was removed from this device','حُذف هذا الحساب من جهاز آخر فمُسحت بياناته من هذا الجهاز':'This account was deleted on another device, so its data was removed from this device','سيُحذف حسابك ومنشوراتك وتعليقاتك وبيانات مزامنته نهائيًا، وتُمسح بيانات هذا الحساب من هذا الجهاز أيضًا (وما لم يُرفع منها). وضع الزائر والحسابات الأخرى على الجهاز لا تتأثر.':'Your account, posts, comments and sync data will be deleted permanently, and this account’s data is removed from this device too (including anything not yet uploaded). Guest mode and other accounts on the device are not affected.'});

/* إشعار بعد مسح حساب محذوف من الجهاز */
setTimeout(()=>{try{const n=localStorage.getItem('fit_acct_note');if(n){localStorage.removeItem('fit_acct_note');toast(n==='del'?'حُذف حسابك ومُسحت بياناته من هذا الجهاز':'حُذف هذا الحساب من جهاز آخر فمُسحت بياناته من هذا الجهاز')}}catch(e){lg(e)}},900);
