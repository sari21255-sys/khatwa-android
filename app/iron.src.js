/* ======================= تمارين الحديد: هوية التمرين، السجل الموحّد، سجل الأحداث =======================
   المصدر الوحيد لقراءة التقدّم هو S.sx (الحصص). S.done يبقى للتوافق (الخطة والاقتراحات). لا يُنشأ أي مجموعة لم تُسجَّل:
   السجلات القديمة التي فيها ملخص فقط (S.done بلا حصة) تظهر كنقطة «ملخص تاريخي» بلا مجموعات.
   S.sxl : سجل الأحداث، كل حدث سجل مستقل لا يُعدَّل (فيتزامن مرة واحدة) ومرتبط بالحصة والمجموعة.
   S.xr  : سجل نسخ التمارين {xv:{n,en,g,s,q}}  ·  S.xmap : ربط المعرّفات القديمة بالنسخة  ·  S.xp : تمارين الحصص الحرة غير المسندة. */
const IRM={chest:'الصدر',back:'الظهر',sho:'الأكتاف',bic:'البايسبس',tri:'الترايسبس',fore:'الساعد',core:'البطن',quad:'الفخذ الأمامي',ham:'الفخذ الخلفي',glu:'الأرداف',calf:'السمانة',add:'الفخذ الداخلي',hip:'الورك',trap:'الترابيس',lat:'الظهر العريض',full:'الجسم كاملًا'};
const irLbl=g=>IRM[g]||(g?String(g):'غير مصنّف');
function irEns(){['sxl','xr','xmap','xp'].forEach(k=>{if(!S[k]||typeof S[k]!=='object'||Array.isArray(S[k]))S[k]={}})}
const irSlug=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
function irHash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return(h>>>0).toString(36)}
const irNorm=n=>String(n==null?'':n).replace(/[ً-ٰٟ]/g,'').replace(/\s+/g,' ').trim();
/* مطابقة تامّة فقط (لا بحث جزئي) كي لا تُدمج نسخ مختلفة: «بنش برس» ≠ «بنش مائل بار» */
function irLib(n){n=irNorm(n);return n?(XL.find(x=>irNorm(x.n)===n)||null):null}
/* معرّف ثابت لنسخة التمرين: تمرين المكتبة = اسمه الإنجليزي + المعدّة (لا رقم السطر الذي يتغيّر بتغيّر ترتيب المكتبة)، والمخصّص = بصمة اسمه */
function irXv(name){const n=irNorm(name);if(!n)return '';const l=irLib(n);return l?('L.'+(irSlug(l.e)||irHash(l.n))+'.'+(l.q||'x')):('C.'+irHash(n))}
/* ربط المعرّفات القديمة (معرّف خانة الخطة، رقم المكتبة القديم xN، الاسم) بالنسخة: صريح في S.xmap وإلا يُحسب من الاسم. لا دمج تلقائي بين اسمين مختلفين. */
function irXvOf(x){x=x||{};if(x.xv)return x.xv;const m=S.xmap||{};return (x.id&&m[x.id])||m['n:'+irNorm(x.n)]||irXv(x.n)}
function irLink(oldKey,xv){irEns();if(!oldKey||!xv)return false;if(S.xmap[oldKey]===xv)return false;S.xmap[oldKey]=xv;return true}
function irMeta(xv,name){const r=(S.xr||{})[xv],l=irLib(name||(r&&r.n)||'');
 if(l)return{n:l.n,g:l.g,s:l.s||[],q:l.q||'',en:l.e||''};
 if(r)return{n:r.n,g:r.g||'',s:r.s||[],q:r.q||'',en:r.en||''};
 return{n:irNorm(name),g:exGroup(name)||'',s:[],q:'',en:''}}
function irReg(xv,name){irEns();if(!xv||S.xr[xv])return;const m=irMeta(xv,name);S.xr[xv]={n:m.n,g:m.g,s:m.s,q:m.q,en:m.en,at:Date.now()}}
function irUser(){try{const u=SB&&SB.uid&&SB.uid();if(u)return 'u:'+u}catch(e){lg(e)}try{return 'l:'+spMeta().a}catch(e){return 'l:guest'}}

/* ---------- القراءة الموحّدة ---------- */
const irSets=x=>(x.sets||[]).filter(q=>q.ty!=='w'&&+q.r>0);
function irTop(a){let b=null;a.forEach(q=>{const w=+q.w||0,r=+q.r||0;if(!b||w>b.w||(w===b.w&&r>b.r))b={w:w,r:r}});return b}
/* تاريخ كل نسخة تمرين من الحصص المكتملة فقط. نقطة: {date,sid,k,sets:[{i,w,r,rp,at}],top:{w,r},leg} ؛ leg=1 ملخص تاريخي بلا مجموعات */
function irHist(){const H={},cov=new Set(),put=(xv,n,pt)=>{(H[xv]=H[xv]||{xv:xv,n:n,pts:[]}).pts.push(pt)},L=sxList();
 L.forEach(s=>s.ex.forEach(x=>cov.add(x.k)));
 L.forEach(s=>{if(s.st!=='c')return;s.ex.forEach(x=>{const a=irSets(x);if(!a.length)return;
  put(irXvOf(x),x.n,{date:s.date,sid:s.id,k:x.k,fr:s.fr?1:0,sets:a.map(q=>({i:sxSid(q),w:+q.w||0,r:+q.r,rp:q.rp||0,at:q.at,up:q.up||q.at})),top:irTop(a),leg:0})})});
 for(const k in S.done){if(cov.has(k))continue;const r=S.done[k];if(!r||!r.n||!r.date)continue;
  put(irXvOf({n:r.n}),r.n,{date:r.date,sid:'old|'+k,k:k,fr:0,sets:[],top:{w:+r.w||0,r:+r.r||0},leg:1})}
 Object.keys(H).forEach(k=>H[k].pts.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0));return H}
/* نفس شكل lifts() القديمة: {اسم:[{n,w,r,date,leg}]} لكن من الحصص المكتملة فقط، وأفضل مجموعة في كل حصة (لا آخر مجموعة) */
function irLifts(H){H=H||irHist();const m={};Object.keys(H).forEach(k=>{const h=H[k];m[h.n]=(m[h.n]||[]).concat(h.pts.map(p=>({n:h.n,w:p.top.w,r:p.top.r,date:p.date,leg:p.leg})))});
 Object.keys(m).forEach(n=>m[n].sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0));return m}
/* أفضل وزن عند كل عدد تكرارات (لكل نقطة): {r:[{date,w,leg,sid}]} */
function irAtReps(h){const o={};(h.pts||[]).forEach(p=>{const by={};
 if(p.leg){if(p.top.r>0)by[p.top.r]=p.top.w}else p.sets.forEach(q=>{if(by[q.r]==null||q.w>by[q.r])by[q.r]=q.w});
 Object.keys(by).forEach(r=>{(o[r]=o[r]||[]).push({date:p.date,w:by[r],leg:p.leg,sid:p.sid})})});return o}
/* مجموعات العمل الأسبوعية لكل عضلة من الحصص المكتملة: مباشرة (العضلة الأساسية) وثانوية (قائمة العضلات الثانوية للتمرين).
   السجلات القديمة (ملخص فقط) لا تدخل العدّ لأنها بلا مجموعات مسجّلة. */
function irMuscle(wkIso){const o={};const sl=(g,w)=>(o[g]=o[g]||{dir:0,sec:0,items:[]});
 sxList().forEach(s=>{if(s.st!=='c'||wkey(s.date)!==wkIso)return;s.ex.forEach(x=>{const a=irSets(x);if(!a.length)return;const xv=irXvOf(x),m=irMeta(xv,x.n);
  const it=function(g,kind){const c=sl(g);if(kind==='dir')c.dir+=a.length;else c.sec+=a.length;c.items.push({xv:xv,n:x.n,sid:s.id,date:s.date,n_:a.length,kind:kind})};
  if(m.g)it(m.g,'dir');(m.s||[]).forEach(g=>{if(g&&g!==m.g)it(g,'sec')})})});return o}
/* آخر أداء: آخر حصة (أي حالة) لهذه النسخة. skipSid يستثني حصة بعينها. يعيد {date,top,sets,sid,st,live} */
function irLast(xv,skipSid,onlyDone){let best=null;
 sxList().forEach(s=>{if(s.id===skipSid)return;if(onlyDone&&s.st!=='c')return;s.ex.forEach(x=>{if(irXvOf(x)!==xv)return;const a=irSets(x);if(!a.length)return;
  const at=Math.max.apply(null,a.map(q=>q.up||q.at||0));if(!best||at>best.at)best={at:at,date:s.date,top:irTop(a),sets:a,sid:s.id,st:s.st,live:s.st==='p'}})});
 if(best)return best;
 let lg=null;for(const k in S.done){const r=S.done[k];if(r&&r.n&&irXvOf({n:r.n})===xv&&(!lg||r.date>=lg.date))lg={date:r.date,top:{w:+r.w||0,r:+r.r||0},sets:[],sid:'old|'+k,st:'old',live:false,at:0}}
 return lg}

/* ---------- سجل الأحداث ---------- */
function irLog(t,o){irEns();const id='e'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
 S.sxl[id]=Object.assign({id:id,t:t,at:Date.now(),u:irUser()},o||{});return id}
function irEvents(){irEns();return Object.keys(S.sxl).map(k=>S.sxl[k]).filter(e=>e&&e.id&&e.t).sort((a,b)=>(b.at-a.at)||(a.id<b.id?1:-1))}

/* ---------- الحصص ---------- */
const irTodayKs=()=>tasks().filter(t=>t.d===TI()).map(t=>t.k);
function irCur(){return sxList().find(s=>s.st==='p'&&s.date===TD()&&s.ar)||null}
function irMkEx(k,id,n,d,tg,tr,o){const xv=irXvOf({id:id,n:n});irReg(xv,n);irLink(id,xv);return{k:k,id:id,n:n,d:d,tg:tg,tr:tr,o:o,sets:[],rm:[],dn:0,sk:0,xv:xv}}
function irStart(free){const id='sx'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),now=Date.now(),T=tasks(),ti=TI();
 const s={id:id,wk:W(),date:TD(),ts:now,up:now,kd:'t',t:free?'حصة حرة':((S.plan[ti]||{}).t||'جلسة تمرين'),st:'p',sec:0,vol:0,ex:[],ar:1,u:irUser()};
 if(free)s.fr=1;else{s.dy=ti;T.filter(t=>t.d===ti).forEach((t,o)=>s.ex.push(irMkEx(t.k,t.e.id,t.e.n,t.d,t.e.s,t.e.r,o)))}
 S.sx[id]=s;irLog('ses+',{sid:id,pd:s.date,n:s.t,fr:s.fr?1:0});return s}
function irSessEx(s,k){return s.ex.find(x=>x.k===k)}
function irVol(s){s.vol=sxVol(s);return s.vol}
/* تسجيل مجموعة. تُحفظ فورًا (save) وتُوثَّق في سجل الأحداث. تعيد {s,x,q} */
function irAddSet(k,w,r){const s=irCur()||irStart(false);let x=irSessEx(s,k);if(!x)return null;
 w=Math.max(0,+w||0);r=Math.max(0,Math.round(+r||0));if(!(r>0))return null;
 const now=Date.now(),q={i:sxRid(),w:w,r:r,ty:'n',rp:0,at:now,up:now};x.sets.push(q);s.up=now;x.sk=0;irReg(irXvOf(x),x.n);
 irLog('set+',{sid:s.id,k:k,xv:irXvOf(x),n:x.n,i:q.i,w:w,r:r,pd:s.date});
 irRecon(s,x);save();return{s:s,x:x,q:q}}
function irFindSet(sid,k,i){const s=S.sx[sid];if(!s)return null;const x=irSessEx(s,k);if(!x)return null;const q=x.sets.find(y=>sxSid(y)===i);return q?{s:s,x:x,q:q}:null}
function irEditSet(sid,k,i,w,r){const f=irFindSet(sid,k,i);if(!f)return false;w=Math.max(0,+w||0);r=Math.max(0,Math.round(+r||0));if(!(r>0))return false;
 const q=f.q;if(+q.w===w&&+q.r===r)return false;const ow=q.w,or=q.r,now=Date.now();q.w=w;q.r=r;q.up=now;f.s.up=now;
 irLog('set~',{sid:sid,k:k,xv:irXvOf(f.x),n:f.x.n,i:i,w:w,r:r,ow:ow,or:or,pd:f.s.date});irRecon(f.s,f.x);save();return true}
function irDelSet(sid,k,i){const f=irFindSet(sid,k,i);if(!f)return false;const q=f.q,x=f.x,now=Date.now();
 x.sets.splice(x.sets.indexOf(q),1);x.rm=(x.rm||[]).concat([sxSid(q)]).slice(-60);f.s.up=now;
 irLog('set-',{sid:sid,k:k,xv:irXvOf(x),n:x.n,i:i,w:q.w,r:q.r,pd:f.s.date});irRecon(f.s,x);save();return true}
/* بعد أي تغيير: الحجم، وإنجاز التمرين (S.done للتوافق)، فيُعاد حساب آخر أداء والتقارير من السجل المحدّث لأنها تُقرأ منه مباشرة */
function irRecon(s,x){irVol(s);const T=tasks();
 (x?[x]:s.ex).forEach(e=>{const t=T.find(q=>q.k===e.k),cnt=sxCnt(e),done=!!(e.tg&&cnt>=e.tg);
  if(done){e.dn=1;if(t){const ls=irSets(e).slice(-1)[0]||{};
   if(t.r&&S.done[e.k]){S.done[e.k].w=(+ls.w||0)||S.done[e.k].w;S.done[e.k].r=+ls.r||S.done[e.k].r}
   else if(!t.r){mark(e.k,ls.w||0,ls.r||e.tr);if(S.done[e.k])S.done[e.k].date=s.date}}}
  else if(e.dn){e.dn=0;if(t&&S.done[e.k])delete S.done[e.k]}})}
function irFinish(s,asPartial){if(!s)return;const now=Date.now(),all=s.ex.flatMap(x=>x.sets).map(q=>q.at||0);
 if(asPartial){s.up=now;irLog('ses~',{sid:s.id,pd:s.date,n:s.t,part:1});return}
 s.st='c';s.fin=now;s.up=now;s.sec=Math.max(60,Math.min(14400,Math.round(((all.length?Math.max.apply(null,all):now)-s.ts)/1000)));irVol(s);irLog('ses=',{sid:s.id,pd:s.date,n:s.t})}
function irProg(s){let d=0,t=0;s.ex.forEach(x=>{const c=sxCnt(x);d+=c;t+=Math.max(c,x.tg||0)});return{d:d,t:t}}
