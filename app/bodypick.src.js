/* ======================= بيانات الجسم: نموذج اختيار مشترك للعمر والطول والوزن في كل المواضع =======================
   العمر: يوم وشهر وسنة ميلاد بأرقام 0–9 ويُحسب العمر تلقائيًا؛ الطول: بكرة أرقام بوحدة ظاهرة؛ الوزن: بكرة تدعم الكسور وتبدأ من آخر وزن محفوظ.
   القيمة السابقة تظهر للمراجعة ويؤكدها المستخدم؛ عند غيابها لا يُسمح بالحفظ قبل أن يختار. حسابات قديمة بعمر فقط تبقى كما هي حتى يختار صاحبها تاريخ الميلاد. */
const bpTouch=(el,fn)=>{['pointerdown','touchstart','wheel','keydown','click'].forEach(t=>el.addEventListener(t,fn,{passive:true}))};
function bpLast(){let d='',v=0;try{const a=sorted(S.bw);if(a.length){d=a[a.length-1][0];v=+a[a.length-1][1]}}catch(e){lg(e)}return{d:d,v:v}}
const bpUserW=kg=>{try{return +toU(kg)}catch(e){return +kg}};
/* بكرة بوحدة ظاهرة. prev: القيمة السابقة (أو 0). ينتهي بحفظ القيمة إن كانت مؤكدة */
function bpWheelSheet(o){const r=document.createElement('div');r.className='fxr';const ws=o.wheels.map(w=>fxWheel(w.min,w.max,w.step,w.val,w.fmt,w.label));
 const info=document.createElement('div');info.className='mu bpinfo';info.setAttribute('role','status');
 const hasPrev=!!o.prev;let touched=hasPrev;const t0=Date.now();
 info.innerHTML=o.note||'';ws.forEach(w=>{r.appendChild(w);bpTouch(w,()=>{if(Date.now()-t0>350)touched=true})});
 r.insertAdjacentHTML('beforeend','<span class="fxu">'+o.unit+'</span>');
 const box=document.createElement('div');box.appendChild(r);box.appendChild(info);const err=document.createElement('div');err.className='mu';err.setAttribute('role','alert');box.appendChild(err);
 fxSheet(o.title,box,()=>{if(!touched){err.textContent='اختر القيمة أولًا ثم أكّد';return false}return o.save(ws.map(w=>w.get()))},{ok:hasPrev?'تأكيد':'حفظ'})}
const bpFire=inp=>{inp.dispatchEvent(new Event('change',{bubbles:true}));inp.dispatchEvent(new Event('input',{bubbles:true}));fxPaint(inp)};
fxHeight=function(inp){const prev=+inp.value||+S.prof.ht||0;
 bpWheelSheet({title:'الطول',unit:'سم',prev:prev,note:prev?'القيمة السابقة: <b class="num">'+prev+'</b> سم. عدّلها إن لزم ثم أكّد.':'لا قيمة سابقة. اختر طولك.',
  wheels:[{min:100,max:230,step:1,val:prev||170,fmt:v=>String(v),label:'الطول'}],save:a=>{inp.value=a[0];bpFire(inp)}})};
fxWeight=function(inp,title){const u=typeof uL==='function'?uL():'كغ',lb=/lb|رطل/i.test(u),stn=/ستون|st/i.test(u),L=bpLast(),cur=+inp.value||0,seed=cur||(L.v?bpUserW(L.v):0),prev=seed;
 const lo=lb?40:stn?3:20,hi=lb?660:stn?50:300,v0=seed||(lb?154:stn?11:70);
 bpWheelSheet({title:title||'الوزن',unit:u,prev:prev,note:cur?'القيمة السابقة: <b class="num">'+cur+'</b> '+u+'. عدّلها إن لزم ثم أكّد.':(L.v?'آخر وزن محفوظ: <b class="num">'+bpUserW(L.v).toFixed(1)+'</b> '+u+' · <span class="num">'+L.d+'</span>. ابدأنا منه، عدّله ثم أكّد.':'لا وزن سابق. اختر وزنك.'),
  wheels:[{min:lo,max:hi,step:1,val:Math.floor(v0),fmt:v=>String(v),label:'الجزء الصحيح'},{min:0,max:9,step:1,val:Math.round((v0-Math.floor(v0))*10),fmt:v=>'.'+v,label:'الكسر'}],
  save:a=>{inp.value=(a[0]+a[1]/10).toFixed(1);bpFire(inp)}})};
/* تاريخ الميلاد: يوم/شهر/سنة */
const BPMON=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function bpDobAge(y,m,d){const t=TD().split('-').map(Number);return t[0]-y-((t[1]<m||(t[1]===m&&t[2]<d))?1:0)}
fxDob=function(inp){const td=TD(),tp=td.split('-').map(Number),cur=S.prof.dob||'',p=cur?cur.split('-').map(Number):[0,0,0],oldAge=!cur&&(+S.prof.age||+inp.value||0);
 const d=document.createElement('div');d.className='fxd bpdob';
 const opt=(a,b,v,lab)=>'<option value="">'+lab+'</option>'+Array.from({length:b-a+1},(_,i)=>a+i).map(i=>'<option value="'+i+'"'+(i===v?' selected':'')+'>'+i+'</option>').join('');
 const yrs=Array.from({length:101},(_,i)=>tp[0]-i);
 d.innerHTML='<div class="row bpsel" style="gap:6px;flex-wrap:nowrap"><select id="bp-d" class="irsel num" aria-label="اليوم">'+opt(1,31,p[2],'اليوم')+'</select><select id="bp-m" class="irsel" aria-label="الشهر"><option value="">الشهر</option>'+BPMON.map((n,i)=>'<option value="'+(i+1)+'"'+((i+1)===p[1]?' selected':'')+'>'+(i+1)+' · '+n+'</option>').join('')+'</select><select id="bp-y" class="irsel num" aria-label="السنة"><option value="">السنة</option>'+yrs.map(y=>'<option value="'+y+'"'+(y===p[0]?' selected':'')+'>'+y+'</option>').join('')+'</select></div>'+
  '<div class="fxage"><b class="num" id="bp-age">'+(cur?bpDobAge(p[0],p[1],p[2]):'—')+'</b> <span class="mu">سنة</span></div>'+(oldAge?'<div class="mu bpold">العمر المحفوظ حاليًا: <b class="num">'+oldAge+'</b> سنة. اختر تاريخ ميلادك ليُحسب العمر تلقائيًا، ويبقى العمر الحالي كما هو حتى تحفظ.</div>':'<div class="mu">القيمة السابقة ظاهرة أعلاه. عدّلها إن لزم ثم أكّد.</div>')+'<div class="mu" id="bp-e" role="alert"></div>';
 const g=k=>+d.querySelector('#bp-'+k).value||0,fix=()=>{const y=g('y'),m=g('m');if(y&&m){const mx=new Date(y,m,0).getDate(),ds=d.querySelector('#bp-d');if(g('d')>mx)ds.value=String(mx)}};
 const upd=()=>{fix();const y=g('y'),m=g('m'),dd=g('d'),e=d.querySelector('#bp-e'),a=d.querySelector('#bp-age');e.textContent='';if(!(y&&m&&dd)){a.textContent='—';return null}
  const iso2=y+'-'+String(m).padStart(2,'0')+'-'+String(dd).padStart(2,'0');if(iso2>td){e.textContent='لا يمكن اختيار تاريخ مستقبلي';a.textContent='—';return null}a.textContent=bpDobAge(y,m,dd);return iso2};
 d.addEventListener('change',upd);
 fxSheet('تاريخ الميلاد',d,()=>{const v=upd();if(!v){if(!d.querySelector('#bp-e').textContent)d.querySelector('#bp-e').textContent='اختر اليوم والشهر والسنة';return false}
  S.prof.dob=v;const p2=v.split('-').map(Number);inp.value=bpDobAge(p2[0],p2[1],p2[2]);S.prof.age=+inp.value;bpFire(inp);save()},{ok:cur?'تأكيد':'حفظ'})};
/* مواضع إضافية: حاسبة السعرات (عمر، طول، وزن، قدم/بوصة، رطل) */
const BPX=[['[data-c="ac:age"]','age'],['[data-c="ac:cm"]','ht'],['[data-c="ac:kg"]','w'],['[data-c="ac:lb"]','bp-lb'],['[data-c="ac:ft"]','bp-ft'],['[data-c="ac:inch"]','bp-in']];
(()=>{const E=fxEnhance;fxEnhance=function(){E.apply(this,arguments);BPX.forEach(([sel,k])=>document.querySelectorAll(sel).forEach(i=>{if(i.dataset.fxp)return;i.dataset.fxp=k;i.setAttribute('inputmode','none');i.setAttribute('readonly','');i.classList.add('fxpick');i.setAttribute('aria-haspopup','dialog')}))}})();
window.addEventListener('click',e=>{const i=e.target.closest&&e.target.closest('input.fxpick');if(!i||!/^bp-/.test(i.dataset.fxp||''))return;e.preventDefault();e.stopPropagation();i.blur();const k=i.dataset.fxp,v=+i.value||0;
 if(k==='bp-lb')bpWheelSheet({title:'الوزن',unit:'رطل',prev:v,note:v?'القيمة السابقة: <b class="num">'+v+'</b> رطل.':'لا قيمة سابقة. اختر وزنك.',wheels:[{min:40,max:660,step:1,val:Math.floor(v||154),fmt:x=>String(x),label:'الجزء الصحيح'},{min:0,max:9,step:1,val:Math.round(((v||154)-Math.floor(v||154))*10),fmt:x=>'.'+x,label:'الكسر'}],save:a=>{i.value=(a[0]+a[1]/10).toFixed(1);bpFire(i)}});
 else if(k==='bp-ft')bpWheelSheet({title:'الطول (قدم)',unit:'قدم',prev:v,note:v?'القيمة السابقة: <b class="num">'+v+'</b> قدم.':'لا قيمة سابقة. اختر القدم.',wheels:[{min:3,max:8,step:1,val:v||5,fmt:x=>String(x),label:'القدم'}],save:a=>{i.value=a[0];bpFire(i)}});
 else bpWheelSheet({title:'الطول (بوصة)',unit:'بوصة',prev:i.value!==''?1:0,note:i.value!==''?'القيمة السابقة: <b class="num">'+v+'</b> بوصة.':'لا قيمة سابقة. اختر البوصات.',wheels:[{min:0,max:11,step:1,val:v||0,fmt:x=>String(x),label:'البوصة'}],save:a=>{i.value=a[0];bpFire(i)}})},true);
