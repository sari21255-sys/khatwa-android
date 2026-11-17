/* ===== تبسيط الواجهة بعد تجربة الجوال (فرع ux/sijil-simplify-ui) =====
   كل وظيفة لها مكان واحد. الطبقة تُحمَّل آخر طبقة، وتعيد تعريف الشاشات دون المساس بالبيانات المخزّنة. */
const smPad=n=>String(n).padStart(2,'0');
const smD=ms=>iso(new Date(ms)),smT=ms=>{const d=new Date(ms);return smPad(d.getHours())+':'+smPad(d.getMinutes())};
const smMs=(d,t)=>new Date(d+'T'+(t||'00:00')+':00').getTime();
const smTF=ms=>new Date(ms).toLocaleTimeString('ar-SA-u-nu-latn',{hour:'numeric',minute:'2-digit',hour12:true});
const smDF=ms=>new Date(ms).toLocaleDateString('ar-SA-u-nu-latn-ca-gregory',{weekday:'long',day:'numeric',month:'long'});
const smDF2=ms=>new Date(ms).toLocaleDateString('ar-SA-u-nu-latn-ca-gregory',{day:'numeric',month:'short'});
const smDur=m=>{m=Math.max(0,Math.round(m));return m<60?m+' د':Math.floor(m/60)+' س '+smPad(m%60)+' د'};

/* ---------- 1) زيارات النادي: بصمة واحدة وسجل ---------- */
/* الزيارة: {id,d,t,m,c} للتوافق + ts (دخول بالملّي ثانية) + te (خروج) + o:1 ما دامت مفتوحة */
function smVL(){const g=gy();if(!Array.isArray(g.vis))g.vis=[];return g.vis}
const smVTs=v=>v.ts||smMs(v.d,v.t||'00:00');
const smVTe=v=>v.o?0:(v.te||(v.m>0?smVTs(v)+v.m*6e4:0));
const smOpen=()=>smVL().find(v=>v.o)||null;
const FPSVG='<svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M14 22a20 20 0 0 1 36 0"/><path d="M10 34c0-3 .4-5.6 1.2-8"/><path d="M20 28a12 12 0 0 1 24 0c0 8 .8 14-2 21"/><path d="M26 31a6 6 0 0 1 12 0c0 7 1 12-1.4 19"/><path d="M32 33c0 6 .6 10-1.6 17"/><path d="M20 36c0 6-1 10-2.6 14"/><path d="M52 34c0 6-.6 11-2 16"/></svg>';
function smTimeBody(ms,opt){opt=opt||{};const b=document.createElement('div');
 b.innerHTML='<div class="smsum" id="sm-sum"><div class="smsd num">'+esc(smDF(ms))+'</div><div class="smst num">'+esc(smTF(ms))+'</div><div class="mu">'+(opt.hint||'')+'</div></div>'
  +'<button type="button" class="btn ghost smedit" id="sm-edit">تعديل الوقت</button>'
  +'<div class="smfld" id="sm-fld" hidden><label class="f">اليوم<input type="date" id="sm-d" value="'+smD(ms)+'"></label><label class="f">الساعة والدقيقة<input type="time" id="sm-t" value="'+smT(ms)+'"></label></div>';
 b.querySelector('#sm-edit').addEventListener('click',()=>{b.querySelector('#sm-sum').hidden=true;b.querySelector('#sm-edit').hidden=true;b.querySelector('#sm-fld').hidden=false});
 b.val=()=>{const f=b.querySelector('#sm-fld');if(f.hidden)return ms;const d=b.querySelector('#sm-d').value,t=b.querySelector('#sm-t').value;return d&&t?smMs(d,t):NaN};return b}
function smCommitEntry(vid,ms){const L=smVL();if(L.some(v=>v.id===vid))return true;
 if(smOpen()){toast('لديك زيارة مفتوحة، سجّل خروجها أولًا');return false}
 if(!isFinite(ms)){toast('اختر اليوم والساعة');return false}if(ms>Date.now()+3e5){toast('وقت الدخول في المستقبل');return false}
 L.push({id:vid,d:smD(ms),t:smT(ms),m:0,c:gy().home||'',ts:ms,te:0,o:1});save();render();toast('سُجّل الدخول');return true}
function smCommitExit(id,ms){const v=smVL().find(x=>x.id===id);if(!v||!v.o)return true;const ts=smVTs(v);
 if(!isFinite(ms)){toast('اختر اليوم والساعة');return false}
 if(ms<=ts){toast('وقت الخروج يسبق وقت الدخول');return false}if(ms>Date.now()+3e5){toast('وقت الخروج في المستقبل');return false}
 v.te=ms;v.m=Math.round((ms-ts)/6e4);delete v.o;save();render();toast('سُجّل الخروج');return true}
ACT.smfp=()=>{if(document.getElementById('fx-sheet'))return false;
 const tClick=Date.now(),op=smOpen();
 if(op){const b=smTimeBody(tClick,{hint:'خروجك من النادي'}),id=op.id;fxSheet('تسجيل الخروج',b,()=>smCommitExit(id,b.val()),{ok:'تأكيد وحفظ'})}
 else{const b=smTimeBody(tClick,{hint:'دخولك إلى النادي'}),vid=uid();fxSheet('تسجيل الدخول',b,()=>smCommitEntry(vid,b.val()),{ok:'تأكيد وحفظ'})}
 return false};
ACT.vnow=ACT.gvis=ACT.smfp;
function smVisitSheet(id){const L=smVL(),v=id&&L.find(x=>x.id===id),now=Date.now();
 const ts=v?smVTs(v):now-72e5,te=v?smVTe(v):now-36e5,openV=v&&v.o;
 const b=document.createElement('div');
 b.innerHTML='<div class="smgrp"><b>الدخول</b><div class="g2"><label class="f">اليوم<input type="date" id="sm-d1" value="'+smD(ts)+'"></label><label class="f">الساعة والدقيقة<input type="time" id="sm-t1" value="'+smT(ts)+'"></label></div></div>'
  +'<div class="smgrp"><b>الخروج</b><div class="g2"><label class="f">اليوم<input type="date" id="sm-d2" value="'+(te?smD(te):'')+'"></label><label class="f">الساعة والدقيقة<input type="time" id="sm-t2" value="'+(te?smT(te):'')+'"></label></div>'+(openV?'<div class="mu">اترك الخروج فارغًا لتبقى الزيارة مفتوحة.</div>':'')+'</div>';
 fxSheet(v?'تعديل الزيارة':'إضافة زيارة سابقة',b,()=>{
  const q=s=>b.querySelector(s).value,d1=q('#sm-d1'),t1=q('#sm-t1'),d2=q('#sm-d2'),t2=q('#sm-t2');
  if(!d1||!t1){toast('اختر يوم الدخول وساعته');return false}
  const m1=smMs(d1,t1);if(m1>Date.now()+3e5){toast('وقت الدخول في المستقبل');return false}
  const has2=!!(d2&&t2);if((d2||t2)&&!has2){toast('أكمل يوم الخروج وساعته');return false}
  if(!has2&&!openV){toast('أدخل وقت الخروج');return false}
  let m2=0;if(has2){m2=smMs(d2,t2);if(m2<=m1){toast('وقت الخروج يسبق وقت الدخول');return false}if(m2>Date.now()+3e5){toast('وقت الخروج في المستقبل');return false}}
  if(!has2&&L.some(x=>x.o&&(!v||x.id!==v.id))){toast('لديك زيارة مفتوحة أخرى');return false}
  const rec=v||{id:uid(),c:gy().home||''};rec.d=smD(m1);rec.t=smT(m1);rec.ts=m1;
  if(has2){rec.te=m2;rec.m=Math.round((m2-m1)/6e4);delete rec.o}else{rec.te=0;rec.m=0;rec.o=1}
  if(!v)L.push(rec);save();render();toast(v?'حُفظ التعديل':'أُضيفت الزيارة');return true},{ok:'حفظ'})}
ACT.smvadd=()=>{smVisitSheet(null);return false};
ACT.smvedit=b=>{smVisitSheet(b.dataset.id);return false};
vVis=function(){const L=smVL().slice().sort((a,b)=>smVTs(b)-smVTs(a)),op=smOpen();
 let h=back()+'<h1>زياراتي للنادي</h1>';
 h+='<div class="smfpw"><button class="smfp'+(op?' out':'')+'" data-a="smfp" aria-label="'+(op?'سجّل الخروج':'سجّل الدخول')+'">'+FPSVG+'</button><div class="smfl">'+(op?'سجّل الخروج':'سجّل الدخول')+'</div></div>';
 h+='<div class="row smvh"><h2>سجل الزيارات</h2><span class="sp"></span><button class="chip" data-a="smvadd">'+ic('plus')+'إضافة زيارة سابقة</button></div>';
 h+=L.length?L.map(v=>{const ts=smVTs(v),te=smVTe(v),sameDay=te&&smD(te)===smD(ts);
  return '<div class="smv" data-id="'+v.id+'"><div class="smvd">'+esc(smDF(ts))+'</div><div class="smvt"><span>دخول <b class="num">'+esc(smTF(ts))+'</b></span><span>خروج '+(te?'<b class="num">'+esc(smTF(te))+(sameDay?'':' · '+esc(smDF2(te)))+'</b>':'<b class="smno">لم يُسجّل الخروج</b>')+'</span>'+(te?'<span class="mu num">'+smDur((te-ts)/6e4)+'</span>':'')+'</div><div class="row smva"><button class="chip" data-a="smvedit" data-id="'+v.id+'">تعديل</button><button class="x" data-a="vdel" data-id="'+v.id+'">حذف</button></div></div>'}).join(''):'<div class="card mu" style="text-align:center;padding:22px">لا زيارات مسجّلة بعد. اضغط البصمة عند وصولك إلى النادي.</div>';
 return h};
/* صفحة النادي: تُحذف بطاقات منبّه الغياب (انتقل إلى الإشعارات) وروابط الجدولة */
(()=>{const G=vGyms;vGyms=function(){let h=G.apply(this,arguments);if(typeof h!=='string')return h;
 return h.replace(/<button class="lnk"[^>]*data-v="rem">[\s\S]*?<\/button>/g,'')}})();

/* ---------- 2) منبّه الغياب في الإشعارات، والتنبيه يصل المركز ---------- */
(()=>{const N=gyNotify;gyNotify=function(t,b){try{if(!Array.isArray(S.nf))S.nf=[];S.nf.push({id:'gy'+Date.now().toString(36),ty:'workout',t:t,b:b||'',ts:Date.now(),r:0});if(S.nf.length>200)S.nf=S.nf.slice(-200);save()}catch(e){}return N.apply(this,arguments)}})();
/* منبّه الغياب مستقل عن مفتاح تذكيرات النادي العام */
(()=>{const R0=remTick;remTick=function(){const r=gy().rem;if(r&&!r.on&&r.away&&r.away.on){const it=r.items;r.on=1;r.items=[];try{return R0.apply(this,arguments)}finally{r.on=0;r.items=it}}return R0.apply(this,arguments)}})();
function smAway(){const a=gy().rem.away,ad=awayDays();
 return '<div class="card" id="sm-away"><h2>'+ic('moon')+'منبّه الغياب</h2><div class="row"><span class="mu" style="flex:1">يرسل لك تنبيهًا إذا مرّت أيام بلا تمرين أو زيارة للنادي. يصلك داخل مركز الإشعارات.</span><button class="chip'+(a.on?' on':'')+'" data-a="raway">'+(a.on?'يعمل':'متوقف')+'</button></div>'
  +(a.on?'<div class="row" style="margin-top:10px;flex-wrap:nowrap"><label class="f" style="flex:1">بعد كم يوم غياب<select data-gyr="away:days">'+[2,3,4,5,7].map(n=>'<option value="'+n+'"'+(a.days===n?' selected':'')+'>'+n+' أيام</option>').join('')+'</select></label><label class="f" style="flex:1">وقت التنبيه<input type="time" data-gyr="away:t" value="'+esc(a.t)+'"></label></div><label class="f" style="margin-top:8px">نص التنبيه<input type="text" data-gyr="away:msg" value="'+esc(a.msg||'')+'" placeholder="اشتقنا لك، جلسة قصيرة اليوم تكفي"></label>'+(ad!=null?'<div class="mu" style="margin-top:8px;font-size:13px">آخر نشاط مسجّل قبل '+F(ad)+' يوم.</div>':''):'')+'</div>'}
function smNtMsg(){let denied=false;try{denied=(rdNsLoad().state==='perm')||(typeof Notification!=='undefined'&&Notification.permission==='denied'&&!NAT)}catch(e){}
 return denied?'<div class="sjwarn">إشعارات SIJIL مغلقة في جهازك، فلن تصلك التنبيهات إلا داخل التطبيق. لتصلك خارجه، فعّلها من إعدادات الجهاز ثم التطبيقات ثم SIJIL ثم الإشعارات.</div>':''}
(()=>{const V=vRem;vRem=function(){let h=V.apply(this,arguments);if(typeof h!=='string')return h;
 h=h.replace('<h1>منبه الذهاب والغياب</h1><div class="mu" style="margin-bottom:10px">منبهات قابلة للتعديل: وقت الذهاب إلى النادي، وتذكير عند الغياب.</div>','<h1>مواعيد الذهاب إلى النادي</h1><div class="mu" style="margin-bottom:10px">اختر الأيام والأوقات التي تريد أن نذكّرك فيها بالذهاب.</div>');
 const a=h.indexOf('<div class="card"><h2>'+ic('moon')+'تذكير الغياب'),b=h.indexOf('<div class="card"><h2>'+ic('cal')+'تنبيهات حتى');if(a>=0&&b>a)h=h.slice(0,a)+h.slice(b);
 h=h.replace(/<button class="btn ghost" data-a="sub" data-v="vis">[\s\S]*?<\/button>/,'');
 h=h.replace(/<div class="mu" style="margin-bottom:8px">المتصفح لا يضمن[^<]*<\/div>/,'<div class="mu" style="margin-bottom:8px">صدّر المواعيد إلى تقويم جوالك لتصلك حتى والتطبيق مغلق.</div>');
 h=h.replace(/<div class="row" style="margin-top:10px"><span class="mu" style="flex:1;font-size:13px">إشعارات الجهاز:[\s\S]*?<\/div><\/div>/,'</div>');
 return h}})();
const SM_RDNC=rdNc;
rdNc=function(){UI.nct='in';return SM_RDNC.apply(this,arguments).replace(/<div class="sjtabs">[\s\S]*?<\/div>/,'')};
function smNtCtl(){const keep=UI.nct;let h;
 UI.nct='ct';try{h=SM_RDNC()}finally{UI.nct=keep}
 h=h.replace(/^[\s\S]*?<\/h1>(?:<div class="sjtabs">[\s\S]*?<\/div>)?/,'').replace(/<details class="sjgrp" data-g="nhelp"[\s\S]*?<\/details>/,'');
 return smNtMsg()+smAway()+'<button class="sjrow" data-a="sub" data-v="rem">'+sjI('ar','bell')+'<span class="t">مواعيد الذهاب إلى النادي<small>تذكير بأيام وأوقات تمرينك</small></span>'+ic('next')+'</button>'+h}
/* الإشعارات في الإعدادات تحتوي كل أدوات التحكّم. «الوارد» فقط عبر الجرس */
(()=>{const S0=rdSet;rdSet=function(){let h=S0.apply(this,arguments);if(typeof h!=='string')return h;
 /* الإشعارات: أدوات التحكّم + منبّه الغياب، بلا فحوص تقنية */
 h=h.replace(/<details class="sjgrp" data-g="nt"[\s\S]*?<\/details>/,()=>rdRow('nt','bell','#FF8659','الإشعارات',rdS().nt.on?'مفعّلة':'متوقفة',smNtCtl()));
 /* الوقت والطقس: موقع الهاتف فقط، بلا مدينة يدوية ولا إحداثيات */
 h=h.replace(/<details class="sjgrp" data-g="wx"[\s\S]*?<\/details>/,()=>smWxRow());
 return h}})();
(()=>{const V=vSet;vSet=function(){let h=V.apply(this,arguments);if(typeof h!=='string')return h;
 return h.replace(/الطقس يُخزَّن مؤقتًا على جهازك \(تُرسل خطوط الإحداثيات للمدينة فقط إلى مزوّد الطقس\)\. /,'الطقس يُحفظ مؤقتًا على جهازك، ويُرسَل موقعك التقريبي لمزوّد الطقس دون هويتك. ')}})();

/* ---------- 3) الوقت والطقس من موقع الهاتف ---------- */
const smHasLoc=()=>{const s=rdS();return s.geo===1&&!!s.cus};
function smNear(la,lo){let b=null,d=1e9;RDC.forEach(c=>{const k=(c[3]-la)*(c[3]-la)+(c[4]-lo)*(c[4]-lo);if(k<d){d=k;b=c}});return d<.36&&b?b:null}
function smApplyLoc(la,lo,quiet){const s=rdS(),near=smNear(la,lo),old=s.cus;
 const n=near?near[1]:'موقعك الحالي',tz=near?near[5]:fxNearTz(la,lo);
 const moved=!old||Math.abs(old.lat-la)>.05||Math.abs(old.lon-lo)>.05||old.n!==n||old.tz!==tz;
 s.cus={n:n,lat:+la.toFixed(2),lon:+lo.toFixed(2),tz:tz};s.geo=1;s.geoDeny=0;s.geoAt=Date.now();
 if(moved)UI._rdf=undefined;save();if(moved||!quiet)render();return moved}
async function smPerm(ask){const G=NAT&&NP('Geolocation');
 if(G){let r=await G.checkPermissions();const ok=x=>x&&(x.coarseLocation==='granted'||x.location==='granted');if(ok(r))return true;
  if(!ask)return false;r=await G.requestPermissions({permissions:['coarseLocation']});return !!ok(r)}
 if(!navigator.geolocation)return false;
 if(navigator.permissions&&navigator.permissions.query){try{const p=await navigator.permissions.query({name:'geolocation'});if(p.state==='granted')return true;if(p.state==='denied')return false;return !!ask}catch(e){}}
 return !!ask}
async function smPos(){const G=NAT&&NP('Geolocation');
 if(G){const p=await G.getCurrentPosition({enableHighAccuracy:false,timeout:10000,maximumAge:36e5});return[p.coords.latitude,p.coords.longitude]}
 return new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(p=>res([p.coords.latitude,p.coords.longitude]),rej,{maximumAge:36e5,timeout:9000,enableHighAccuracy:false}))}
let SMGEO=0;
ACT.rdgeo=()=>{const tk=++SMGEO,s=rdS();s.geoBusy=1;
 (async()=>{let ok=false;try{ok=await smPerm(true)}catch(e){}
  if(tk!==SMGEO)return;
  if(!ok){s.geoBusy=0;s.geoDeny=1;save();render();toast('لم يُمنح إذن الموقع، فتظهر ساعة جهازك فقط. اضغط «استخدم موقعي» لتحاول مجددًا، أو فعّل الإذن من إعدادات الجهاز.');return}
  try{const p=await smPos();if(tk!==SMGEO)return;s.geoBusy=0;smApplyLoc(p[0],p[1],false);toast('حُدّث الوقت والطقس من موقعك')}
  catch(e){s.geoBusy=0;if(e&&(e.code===1||/denied/i.test(String(e.message||''))))s.geoDeny=1;else s.geoFail=1;save();render();if(s.geoDeny){toast('لم يُمنح إذن الموقع، فتظهر ساعة جهازك فقط. اضغط «استخدم موقعي» لتحاول مجددًا، أو فعّل الإذن من إعدادات الجهاز.');return}toast('تعذّر تحديد موقعك الآن. تأكد من تشغيل الموقع في جهازك وحاول مجددًا.')}})();return false};
ACT.rdgeoclr=()=>{const s=rdS();s.cus=null;s.geo=0;s.geoDeny=0;UI._rdf=undefined};
/* تحديث صامت عند الفتح والعودة وكل فترة: لا يطلب إذنًا */
let SMLOCT=0;
async function smLocTick(force){const s=rdS();if(s.geo!==1||s.geoBusy)return;const now=Date.now();if(!force&&now-SMLOCT<6e5)return;SMLOCT=now;
 try{if(!(await smPerm(false)))return;const p=await smPos();smApplyLoc(p[0],p[1],true)}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)smLocTick(false)});setTimeout(()=>smLocTick(true),2500);setInterval(()=>smLocTick(false),6e5);
function smWxRow(){const s=rdS(),c=rdCity(),has=smHasLoc();
 return rdRow('wx','cloud','#38bdf8','الوقت والطقس',has?esc(c.n):'ساعة الجهاز','<div class="row" style="gap:6px;flex-wrap:wrap;margin:8px 0">'+rdChip('rdtog','wxOn',s.wxOn,'الطقس '+rdOn(s.wxOn))+rdChip('rdtog','sunOn',s.sunOn,'الشروق والغروب '+rdOn(s.sunOn))+'</div>'
  +'<div class="row" style="margin-top:6px"><div class="t"><b>موقعي</b><div class="mu">'+(has?'الوقت والطقس من موقع هاتفك'+(s.geoAt?' · آخر تحديث '+esc(smTF(s.geoAt)):'')+'.':'بلا إذن الموقع تظهر ساعة جهازك فقط.')+' يُطلب الموقع التقريبي أثناء استخدام التطبيق فقط.</div></div><span class="sp"></span><button class="chip" data-a="rdgeo">استخدم موقعي</button></div>'
  +(has?'<button class="chip" data-a="rdgeoclr" style="margin-top:8px">إيقاف استخدام الموقع</button>':'')
  +'<div class="mu" style="margin-top:8px">الساعة المحلية: '+rdF(rdNow(),c.tz)+'</div>')}
/* بطاقة الوقت والطقس: لا قائمة مدن. بلا موقع تُعرض ساعة الجهاز وزر «استخدم موقعي» */
(()=>{const T=rdTodayCard;rdTodayCard=function(){const s=rdS();if(!smHasLoc()&&!rdWx())return smNoLocCard(s);let h=T.apply(this,arguments);if(typeof h!=='string')return h;
 const dev=Intl.DateTimeFormat().resolvedOptions().timeZone,now=rdNow();
 const c=rdCity();
 h=h.replace(/<button class="fxcity"[\s\S]*?<\/button>/,'<span class="fxcity" style="pointer-events:none">'+ic('pin')+' <b>'+esc(c.n)+'</b></span>');
 h=h.replace(/<div class="fxs2">توقيت [^<]*يختلف عن توقيت الجهاز<\/div>/,'');
 if(!smHasLoc())h=h.replace(/(<div class="fxin">)/,'$1').replace(/<\/div><\/div>(<details|<\/div>)/,'</div><div class="row" style="margin-top:8px"><button class="btn sm" data-a="rdgeo"'+(s.geoBusy?' disabled':'')+'>'+ic('pin')+'استخدم موقعي</button></div></div>$1');
 return h}})();
function smNoLocCard(s){const dev=Intl.DateTimeFormat().resolvedOptions().timeZone,now=rdNow();
 const hr=new Date(now).getHours(),ph=hr>=5&&hr<7?'dawn':hr>=7&&hr<17?'day':hr>=17&&hr<19?'dusk':'night',g=FXPH[ph];
 const msg=s.geoDeny?'لم يُمنح إذن الموقع، فنعرض ساعة جهازك فقط.':s.geoFail?'تعذّر تحديد موقعك الآن.':'اسمح بالموقع ليظهر الطقس في منطقتك.';
 return '<div class="card sjwx fxscene fxph-'+ph+' fxk-none" style="--g1:'+g[0]+';--g2:'+g[1]+'"><div class="fximg" style="background-image:'+fxSceneImg('',ph)+'"></div><div class="fxtint"></div><div class="fxin"><div class="row" style="gap:8px"><span class="fxcity" style="pointer-events:none">'+ic('pin')+' <b>توقيت الجهاز</b></span><span class="sp"></span><span class="num fxclk" data-rdclk>'+rdF(now,dev)+'</span></div>'
  +'<div class="fxs2" style="margin:10px 0 8px">'+msg+'</div><button class="btn sm" data-a="rdgeo"'+(s.geoBusy?' disabled':'')+'>'+ic('pin')+(s.geoBusy?'جارٍ تحديد الموقع…':'استخدم موقعي')+'</button></div></div>'}
/* الساعة الحيّة بلا مدينة: نص data-rdclk يُحدَّث بحسب منطقة البطاقة */
(()=>{const o=window.__smclk;if(o)return;window.__smclk=1;setInterval(()=>{try{const e=document.querySelector('[data-rdclk]');if(!e)return;const tz=(smHasLoc()||rdWx())?rdCity().tz:Intl.DateTimeFormat().resolvedOptions().timeZone;e.textContent=rdF(rdNow(),tz)}catch(x){}},15000)})();

/* ---------- 4) الشريط السفلي والصفحة الرئيسية ---------- */
sjNav=function(){
 if(UI.ses||(S.sub==='wk'&&UI.wk))return '';
 const it=[['train','dumbbell','التدريب'],['food','fork','التغذية'],['dash',0,'الرئيسية'],['me','user','الملف الشخصي'],['ex','grid','المزيد']];
 return '<div class="pill2">'+it.map(n=>{const on=n[0]===S.tab||(n[0]==='dash'&&S.tab==='home');
  return '<button class="'+(n[1]?'':'sjplus sjhome ')+(on?'on cur':'')+'" data-a="go" data-v="'+n[0]+'" aria-label="'+n[2]+'"'+(on?' aria-current="page"':'')+'>'+(n[1]?ic(n[1])+'<span>'+n[2]+'</span>':FXMARK+'<span class="sr">'+n[2]+'</span>')+'</button>'}).join('')+'</div>'};
(()=>{const T=vTrain;vTrain=function(){const h=T.apply(this,arguments);return typeof h==='string'?h.replace('<h1>التمرين</h1>','<h1>التدريب</h1>'):h};
 const H=trkHub;trkHub=function(){let h=H.apply(this,arguments);if(typeof h!=='string')return h;h=h.replace('<h1>التمرين</h1>','<h1>التدريب</h1>');
  const k='اختر المسار</div>',i=h.indexOf(k);return i<0?h:h.slice(0,i+k.length)+smTodayCard()+h.slice(i+k.length)}})();
/* «تمرين اليوم» يبدأ من صفحة التدريب (لا من الرئيسية) */
function smTodayCard(){let h=vToday(),i=h.indexOf('<div class="sjhero'),j=h.indexOf('<div class="card sjwx');if(i<0)return '';return h.slice(i,j>i?j:h.length)}
function smOpenSes(){try{const t=tkOpen();if(t)return{k:'tk',s:t}}catch(e){}try{const c=irCur();if(c)return{k:'ir',s:c}}catch(e){}try{const o=sxOpen();if(o&&o.st==='p')return{k:'sx',s:o}}catch(e){}return null}
ACT.smres=()=>{const o=smOpenSes();S.sub=null;if(!o){S.tab='train';return}
 if(o.k==='tk'){ACT.tkopen({dataset:{id:o.s.id}});return}
 if(o.k==='ir'){S.tab='train';UI.trk='irs';UI.irt='day';return}
 S.tab='train';try{sxGo(o.s)}catch(e){}};
vDash=function(){const o=smOpenSes();
 let h='<div class="smhm"><div class="smhero"><div class="smlg">'+SJLOGO+'</div><div class="smart">'+SJART+'</div><p class="smtx">سجلّك الرياضي في مكان واحد: تمارينك وأكلك ونموّك مع الأيام.</p></div>';
 if(o)h+='<button class="btn big smres" data-a="smres" id="sm-resume">'+ic('play','f')+'استأنف التدريب</button>';
 h+=rdTodayCard()+'</div>';return h};
vPg=function(){S.tab='ex';return vPgs()};

/* ---------- 5) المزيد والتقدّم والملف الشخصي ---------- */
vEx=function(){
 const R=(k,n,t,a,d)=>'<button class="sjrow" '+a+'>'+sjI(k,n)+'<span class="t">'+t+(d?'<small>'+d+'</small>':'')+'</span>'+ic('next')+'</button>',S2=v=>'data-a="sub" data-v="'+v+'"';
 let h='<div class="sjttl"><div><h1>المزيد</h1><div class="mu">الخدمات والأدوات</div></div></div>';
 h+=R('rp','chart','التقدّم',S2('pgs'),'ملخص تقدّمك عبر الوقت');
 h+='<div class="sjsec">المعرفة والأدوات</div>'+R('rp','book','الثقافة الرياضية',S2('cul'))+R('wt','calc','الأدوات والحاسبات',S2('tools'))+R('md','spark','المدرب الذكي',S2('coach'))+R('nt','users','المجتمع',S2('comm'));
 h+='<div class="sjsec">الصحة</div>'+R('hr','heart','الخطوات والساعات',S2('link'),'قراءة الخطوات وجلسة خطوات');
 h+='<div class="sjsec">النادي</div>'+R('ar','pin','الأندية القريبة',S2('gyms'))+R('ar','cal','زياراتي للنادي',S2('vis'));
 h+='<div class="sjsec">سجلاتي</div>'+R('ar','box','الأرشيف',S2('arch'));
 h+='<div class="sjsec">الدعم</div><a class="sjrow" href="privacy.html">'+sjI('dt','info')+'<span class="t">الخصوصية والدعم<small>سياسة الخصوصية وطرق التواصل</small></span>'+ic('next')+'</a>';
 return h};
function vPgs(){
 const x=stats(),c=cdv(TD()),P=S.prof;
 /* آخر 8 أسابيع: الحصص المكتملة */
 const w0=W(),cnt=[],lb=[];for(let i=7;i>=0;i--){const w=w0-i;let n=0;try{sxList().forEach(s=>{if(s.st==='c'&&s.wk===w)n++})}catch(e){}cnt.push(n);lb.push(i===0?'الآن':'-'+i)}
 const mx=Math.max.apply(null,cnt.concat([1]));
 let h=back()+'<h1>التقدّم</h1><div class="mu" style="margin-bottom:12px">ملخص تقدّمك عبر الوقت</div>';
 h+='<div class="jt"><div class="jtile"><b class="num">'+x.cur+'</b><span>'+ic('flame')+'<small>أيام متتالية</small></span></div><div class="jtile"><b class="num">'+F(Object.keys(S.done).length)+'</b><span>'+ic('dumbbell')+'<small>تمارين</small></span></div><div class="jtile"><b class="num">'+F(totalHours(),1)+'</b><span>'+ic('timer')+'<small>ساعات</small></span></div></div>';
 h+='<div class="card"><h2>'+ic('chart')+'الحصص المكتملة أسبوعيًا</h2><div class="bars">'+cnt.map((v,i)=>'<div class="bc'+(i===7&&v?' on':'')+'"><span class="num bv">'+(v||'')+'</span><div class="bw"><i style="height:'+Math.max(6,Math.round(v/mx*100))+'%"></i></div><small>'+lb[i]+'</small></div>').join('')+'</div></div>';
 h+='<button class="statcard" data-a="sub" data-v="prog"><div class="srings">'+ring([[c.steps,P.steps,'#e08aa0'],[c.kcal,P.kcal,'#9a2444'],[c.min,Math.ceil((+P.cardio||0)/7),'#f0f0f2']])+'</div><div class="t"><b>الإحصاءات</b><div class="mu">النشاط والنوم بالتفصيل</div></div>'+ic('next')+'</button>';
 h+='<button class="statcard" data-a="trk" data-v="iron"><div class="t"><b>تقدّم تمارين الحديد</b><div class="mu">رسوم الأوزان والعضلات من الحصص المكتملة</div></div>'+ic('next')+'</button>';
 try{h+=tkLogCard(null)}catch(e){}
 return h}
/* الملف الشخصي: السجلات المنقولة من التقدّم، بلا شبكة المزيد */
(()=>{const M=vMe;vMe=function(){let h=M.apply(this,arguments);if(typeof h!=='string')return h;
 const i=h.indexOf('<div class="sechead"><h2>المزيد</h2></div>');if(i>=0)h=h.slice(0,i);h=h.replace(/<button class="pbtn" data-a="go" data-v="dash"[^>]*>[\s\S]*?<\/button>/,'');
 const R=(k,n,t,v,d)=>'<button class="sjrow" data-a="sub" data-v="'+v+'">'+sjI(k,n)+'<span class="t">'+t+(d?'<small>'+d+'</small>':'')+'</span>'+ic('next')+'</button>';
 h+='<div class="sjsec">سجلّي</div>'+R('md','trophy','الأوسمة','ach')+R('wm','pulse','مراقبة الوزن','wgt')+R('wl','scale','بيانات الجسم','bdy')+R('ar','image','صور التقدّم','ppg')+R('rp','chart','التقارير','rpt');
 h+='<div class="sjsec">حسابي</div>'+R('nt','user','الملف والحساب','pf','بياناتك وأهدافك والمزامنة');
 return h}})();
const SM_PPC=ppCard;ppCard=function(){return UI._smpp?SM_PPC():''};
function vPpg(){UI._smpp=1;try{return back()+'<h1>صور التقدّم</h1>'+SM_PPC()}finally{UI._smpp=0}}
const SM_BF=wBodyFat,SM_MS=wMeasure;wBodyFat=function(o){return UI._smbd?SM_BF(o):''};wMeasure=function(){return UI._smbd?SM_MS():''};
function vBdy(){UI._smbd=1;try{const o=wStats();return back()+'<h1>بيانات الجسم</h1>'+(o?SM_BF(o):'')+SM_MS()}finally{UI._smbd=0}}
(()=>{const V=view;view=function(){if(S.sub==='pgs')return vPgs();if(S.sub==='ppg')return vPpg();if(S.sub==='bdy')return vBdy();return V.apply(this,arguments)}})();

/* ---------- 6) الخطوات: قراءة تلقائية وجلسة مسافة منفصلة ---------- */
/* جلسة الخطوات: S.stp.ses = {id,t0,st:{boot,last,acc},at,ok,steps} ؛ النتائج المحفوظة في S.stp.sl (لا تُضاف لإجمالي اليوم) */
function smSes(){const o=fxStp();if(!Array.isArray(o.sl))o.sl=[];return o}
async function smStepRead(ask){const P=NAT&&NP('StepCounter');if(!P)return{err:NAT?'unavail':'web'};
 try{const a=await P.isAvailable();if(!a||!a.available)return{err:'nosensor'};
  let pm=await P.checkPermissions();if(pm.activity!=='granted'&&ask)pm=await P.requestPermissions({permissions:['activity']});
  if(pm.activity!=='granted')return{err:'denied'};
  const r=await P.read();return{c:{steps:+r.steps,bootAt:+r.bootAt,at:+r.at}}}
 catch(e){return{err:String(e&&e.message||e)==='permission'?'denied':'fail'}}}
const SMERR={denied:'إذن النشاط البدني غير ممنوح. فعّله من إعدادات الجهاز ثم التطبيقات ثم SIJIL.',nosensor:'هذا الجهاز بلا حساس خطوات.',web:'قراءة الخطوات تعمل في تطبيق Android.',unavail:'قراءة الخطوات غير متاحة على هذا الجهاز.',fail:'تعذّرت القراءة الآن. سنحاول مجددًا.'};
async function smSesUpdate(){const o=smSes(),s=o.ses;if(!s||s.busy)return;s.busy=1;
 try{const r=await smStepRead(false);if(r.err){s.ok=0;s.err=r.err}else{s.st=fxStepAdv(s.st,r.c,'ses');s.steps=s.st.acc;s.at=r.c.at;s.ok=1;s.err='';s.seen=1}}finally{s.busy=0}
 save();const e=document.getElementById('sm-ses-n');if(e&&s.ok)e.textContent=F(s.steps);const m=document.getElementById('sm-ses-m');if(m)m.textContent=smSesMsg(s)}
function smSesMsg(s){if(!s)return '';if(!s.ok&&s.err)return (s.seen?'آخر قراءة مؤكدة '+F(s.steps)+' خطوة. ':'')+(SMERR[s.err]||SMERR.fail);return 'آخر قراءة '+smTF(s.at)+' · المصدر: حساس الهاتف'}
ACT.smsstart=()=>{if(smSes().ses)return false;
 smStepRead(true).then(r=>{const o=smSes();if(o.ses)return;
  if(r.err){o.sesErr=r.err;save();render();return}
  o.sesErr='';o.ses={id:uid(),t0:Date.now(),st:fxStepAdv(null,r.c,'ses'),steps:0,at:r.c.at,ok:1,seen:1};save();render()});return false};
ACT.smsend=()=>{const o=smSes(),s=o.ses;if(!s)return false;
 smStepRead(false).then(r=>{if(!r.err){s.st=fxStepAdv(s.st,r.c,'ses');s.steps=s.st.acc;s.at=r.c.at;s.ok=1}
  const t1=Date.now(),part=!!r.err&&!s.seen?0:1;
  if(r.err&&!s.seen){o.ses=null;o.sesErr=r.err;save();render();toast('لم تُسجَّل الجلسة لأن القراءة لم تتوفر');return}
  o.sl.unshift({id:s.id,t0:s.t0,t1:t1,steps:Math.round(s.steps),src:'sensor',km:null,part:r.err?1:0});o.sl=o.sl.slice(0,60);o.ses=null;save();render();
  toast(r.err?'حُفظت الجلسة بآخر قراءة مؤكدة':'حُفظت نتيجة الجلسة')});return false};
ACT.smsdel=b=>{const o=smSes();o.sl=o.sl.filter(x=>x.id!==b.dataset.id)};
setInterval(()=>{try{if(!document.hidden&&smSes().ses)smSesUpdate()}catch(e){}},4000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){try{if(smSes().ses)smSesUpdate()}catch(e){}}});
const smSrcName=s=>s==='hc'?'من الساعة أو Health Connect':'من حساس الهاتف';
fxStepStatus=function(){const o=smSes(),day=fxToday(),r=o.src[day]||{},c=S.cd[day]||{},has=r.hc>0||r.sn!=null,s=o.ses,sl=o.sl;
 let h='<div class="card" id="fx-stp"><h2>'+ic('step')+'الخطوات</h2>';
 if(has)h+='<div class="row" style="gap:10px"><b class="num" style="font-size:30px">'+F(c.steps||0)+'</b><span class="mu">خطوة اليوم · '+smSrcName(c.stsrc)+'</span></div>';
 else h+='<div class="mu">'+(FXS.st==='denied'||o.deny?SMERR.denied:FXS.st==='nosensor'?SMERR.nosensor:FXS.st==='web'?SMERR.web:'لا توجد قراءة لخطوات اليوم بعد.')+'</div>'+(NAT&&FXS.st!=='nosensor'?'<div class="row" style="margin-top:8px"><button class="btn sm" data-a="fxstp">اسمح بقراءة الخطوات</button></div>':'');
 h+='<div class="smsh"><b>جلسة خطوات</b>';
 if(s){h+='<div class="smsn"><b class="num" id="sm-ses-n">'+(s.seen?F(s.steps):'—')+'</b><span class="mu">خطوة منذ '+smTF(s.t0)+'</span></div><div class="mu" id="sm-ses-m">'+esc(smSesMsg(s))+'</div><div class="mu" style="font-size:12px">تُحسب فقط خطوات المشي أو الجري بين البدء والإنهاء، ولا تُضاف إلى إجمالي اليوم مرة ثانية.</div><div class="row" style="margin-top:8px"><button class="btn" data-a="smsend">إنهاء وحفظ الجلسة</button></div>'}
 else h+='<div class="mu">تبدأ من صفر وتحسب خطوات المشي أو الجري بين «ابدأ» و«أنهِ». نتيجتها منفصلة عن إجمالي اليوم.</div>'+(o.sesErr?'<div class="sjwarn" style="margin-top:6px">'+esc(SMERR[o.sesErr]||SMERR.fail)+'</div>':'')+'<div class="row" style="margin-top:8px"><button class="btn" data-a="smsstart" id="sm-ses-go">بدء جلسة جديدة</button></div>';
 if(sl.length)h+='<div class="smsl">'+sl.slice(0,8).map(x=>'<div class="row" style="padding:6px 0;border-top:1px solid var(--bd)"><span class="mu" style="flex:1">'+esc(smDF2(x.t0))+' · '+esc(smTF(x.t0))+' إلى '+esc(smTF(x.t1))+(x.part?' · قراءة جزئية':'')+'</span><b class="num">'+F(x.steps)+'</b><button class="x" data-a="smsdel" data-id="'+x.id+'" aria-label="حذف">'+ic('x')+'</button></div>').join('')+'</div>';
 h+='</div></div>';return h};
/* بعد منح الإذن تُقرأ الخطوات تلقائيًا؛ يُطلب الإذن مرة واحدة عند أول تشغيل بعد الإعداد */
setTimeout(()=>{try{if(!NAT||!S.prof.ob)return;const o=fxStp();if(o.asked)return;o.asked=1;save();fxStepSensor(true).then(()=>{try{render()}catch(e){}})}catch(e){}},4000);

/* ---------- 7) إزالة الأشياء التقنية والمؤقت ---------- */
(()=>{const V=vLink;vLink=function(){let h=V.apply(this,arguments);if(typeof h!=='string')return h;
 h=h.replace(/<div class="card"><h2>(?:(?!<\/h2>)[^])*?كل جهاز وطريقته<\/h2>[\s\S]*?<\/div><\/div>(?=<button|$)/,'');
 h=h.replace(/<div class="card"><h2>[^<]*كل جهاز وطريقته[\s\S]*?<\/div>(?=<button class="lnk")/,'');
 return h}})();
/* المؤقت: بلا عدّاد راحة ولا ساعة جلسة في «تمرين اليوم». مدة الجلسة تبقى مسجّلة داخليًا فقط */
(()=>{const W0=vWk;vWk=function(){TM.rest=0;let h=W0.apply(this,arguments);if(typeof h!=='string')return h;
 h=h.replace(/<span class="num wkclock" id="tmv">[^<]*<\/span>/,'').replace(/<div class="card hl wkrest"[\s\S]*?<\/button><\/div>/,'');return h}})();
ACT.rest=()=>false;ACT.wkskip=()=>{TM.rest=0};ACT.tmt=()=>false;
(()=>{const S1=rdSet;rdSet=function(){let h=S1.apply(this,arguments);return typeof h==='string'?h.replace(/<label class="f" style="margin-top:10px">مؤقت الراحة \(ث\)<input[^>]*><\/label>/,''):h}})();
Object.assign(ENT,{'التدريب':'Training','الرئيسية':'Home','الملف الشخصي':'Profile','زياراتي للنادي':'My gym visits','سجّل الدخول':'Check in','سجّل الخروج':'Check out','تأكيد وحفظ':'Confirm & save','تعديل الوقت':'Edit time','إضافة زيارة سابقة':'Add a past visit','سجل الزيارات':'Visit log','لم يُسجّل الخروج':'Check-out not recorded','استأنف التدريب':'Resume training','استخدم موقعي':'Use my location','توقيت الجهاز':'Device time','بدء جلسة جديدة':'Start a new session','إنهاء وحفظ الجلسة':'End & save session','جلسة خطوات':'Step session','الخطوات':'Steps','منبّه الغياب':'Absence alarm','سجلّي':'My records','بيانات الجسم':'Body data','صور التقدّم':'Progress photos','التقارير':'Reports','الأوسمة':'Badges','مراقبة الوزن':'Weight monitor','التقدّم':'Progress','تعديل':'Edit','دخول':'In','خروج':'Out'});
