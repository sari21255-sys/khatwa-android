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

/* ======================= الواجهة: قسم «تمارين الحديد» بأربعة تبويبات ======================= */
const irT2=n=>String(n).padStart(2,'0');
const irClock=ms=>{const d=new Date(ms);return irT2(d.getHours())+':'+irT2(d.getMinutes())};
const irDay=ms=>iso(new Date(ms));
const irW=(w)=>(+w||0)?F(w,2)+' كغ':'وزن الجسم';
const irSetTx=q=>irW(q.w)+' × '+F(q.r);
const irD=k=>(UI.ird&&UI.ird[k]!=null)?UI.ird[k]:'';
const irIn=(id,ph,val,extra)=>'<input id="'+id+'" class="irin num" inputmode="decimal" dir="ltr" autocomplete="off" placeholder="'+ph+'" value="'+esc(irD(id)!==''?irD(id):(val==null?'':val))+'" '+(extra||'')+'>';
function irSt(s){return s.st==='c'?{t:'مكتملة',c:'ok'}:(s.date===TD()&&s.ar?{t:'جارية',c:'live'}:{t:'جزئية',c:'part'})}
function irSyncTx(){try{return fxSyncState().t}catch(e){return 'محفوظ على الجهاز'}}
const irBadge=(st)=>'<span class="irb irb-'+st.c+'">'+(st.c==='live'?'حصة جارية':st.t)+'</span>';
function irTabs(){const t=UI.irt||'day';return '<div class="seg irtabs" role="tablist">'+[['day','خطة اليوم'],['sch','جدولي'],['log','السجل'],['prog','التقدّم']].map(x=>'<button role="tab" aria-selected="'+(x[0]===t)+'" class="'+(x[0]===t?'on':'')+'" data-a="irtab" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'}
function irAddBanner(){const a=UI.irAdd;if(!a)return '';
 return '<div class="card irban" id="ir-added"><div class="row" style="gap:8px;flex-wrap:wrap"><b>'+(a.t==='plan'?'أُضيف إلى جدولي':a.t==='dup'?'التمرين موجود في جدولي لهذا اليوم':'أُضيف إلى «كل التمارين»')+'</b><span class="mu">'+esc(a.n)+(a.t==='plan'?' · '+DAYS[a.d]:'')+'</span><span class="sp"></span>'+
  (a.t==='dup'?'':'<button class="chip" id="ir-undoadd" data-a="irundoadd">تراجع</button>')+(a.t==='free'?'<button class="chip" data-a="irgo" data-v="all">إسناده إلى يوم</button>':'')+'<button class="chip" data-a="irbanx" aria-label="إغلاق">'+ic('x')+'</button></div></div>'}

/* ----- تبويب: خطة اليوم ----- */
function irExCard(s,x,i){const xv=irXvOf(x),last=irLast(xv,s&&s.id),sets=irSets(x).concat((x.sets||[]).filter(q=>q.ty==='w')).sort((a,b)=>(a.at||0)-(b.at||0)),cnt=sxCnt(x);
 const e=(S.plan[x.d]||{ex:[]}).ex.find(q=>q.id===x.id),tw=e&&e.tw?e.tw:null,lastS=sets.filter(q=>q.ty!=='w').slice(-1)[0];
 const wv=lastS?lastS.w:(tw!=null?tw:(last?last.top.w:(e?pfW(e):0))),rv=lastS?lastS.r:(x.tr||(last?last.top.r:8));
 const ed=UI.irEd&&UI.irEd.sid===s.id&&UI.irEd.k===x.k?UI.irEd.i:null;
 let h='<div class="card irx" data-k="'+esc(x.k)+'"><div class="row" style="flex-wrap:nowrap;gap:8px"><b class="nm" style="flex:1;min-width:0">'+esc(x.n)+'</b>'+(x.tg?'<span class="mu num">'+F(cnt)+'/'+F(x.tg)+' × '+F(x.tr||0)+'</span>':'<span class="mu num">'+F(cnt)+' مجموعة</span>')+(x.tg&&cnt>=x.tg?'<span class="irb irb-ok">اكتمل</span>':'')+'</div>';
 h+='<div class="mu irlast">'+(last?'آخر أداء: <b class="num">'+esc(irSetTx(last.top))+'</b> · <span class="num">'+last.date+'</span>'+(last.st==='old'?' · ملخص تاريخي':''):'لا أداء سابقًا لهذا التمرين')+'</div>';
 sets.forEach((q,j)=>{const id=sxSid(q),on=ed===id;
  h+='<div class="irset'+(q.ty==='w'?' wu':'')+'" data-i="'+esc(id)+'"><span class="num mu">'+(j+1)+'</span>'+(on?
   irIn('ir-ew','كغ',q.w,'aria-label="الوزن"')+irIn('ir-er','تكرار',q.r,'aria-label="التكرارات"')+'<button class="chip" data-a="irsave" data-k="'+esc(x.k)+'" data-i="'+esc(id)+'">حفظ</button><button class="chip" data-a="irecancel">إلغاء</button>':
   '<b class="num">'+esc(irSetTx(q))+'</b>'+(q.ty==='w'?'<span class="mu">إحماء</span>':'')+'<span class="irok" title="محفوظ على الجهاز">'+ic('check')+'محفوظ</span><span class="mu num" style="font-size:12px">'+irClock(q.at)+(q.up&&q.up!==q.at?' · عُدّل '+irClock(q.up):'')+'</span><span class="sp"></span><button class="chip" data-a="iredit" data-k="'+esc(x.k)+'" data-i="'+esc(id)+'" aria-label="تعديل">تعديل</button><button class="chip" data-a="irdel" data-k="'+esc(x.k)+'" data-i="'+esc(id)+'" aria-label="حذف">حذف</button>')+'</div>'});
 h+='<div class="irnew"><label class="irf"><span class="mu">الوزن (كغ)</span>'+irIn('ir-w-'+i,'0',wv||'')+'</label><label class="irf"><span class="mu">التكرارات</span>'+irIn('ir-r-'+i,'0',rv||'')+'</label><button class="btn irsv" data-a="irset" data-k="'+esc(x.k)+'" data-n="'+i+'">'+ic('check')+'حفظ المجموعة</button></div>';
 if(cnt)h+='<div class="row" style="margin-top:6px"><button class="chip" id="ir-undo-'+i+'" data-a="irundo" data-k="'+esc(x.k)+'">تراجع عن آخر مجموعة</button></div>';
 return h+'</div>'}
function irAddForm(){return '<div class="card" id="ir-addf"><h2>'+ic('dumbbell')+'إضافة تمرين</h2><label class="f">التمرين<input id="ir-an" list="xlnames" placeholder="اسم التمرين" value="'+esc(irD('ir-an'))+'" autocomplete="off"></label><div class="g3" style="margin:8px 0"><label class="irf"><span class="mu">مجموعات</span>'+irIn('ir-as','3','3')+'</label><label class="irf"><span class="mu">تكرارات</span>'+irIn('ir-ar','10','10')+'</label><label class="irf"><span class="mu">وزن الهدف</span>'+irIn('ir-aw','اختياري','')+'</label></div><button class="btn" data-a="iradd" style="width:100%">إضافة</button><datalist id="xlnames">'+XL.map(x=>'<option value="'+esc(x.n)+'">').join('')+'</datalist></div>'}
function irDayTab(){const s=irCur(),ti=TI(),T=tasks().filter(t=>t.d===ti),td=TD();let h='';
 const done=sxList().filter(x=>x.date===td&&x.st==='c'&&x.ar||x.date===td&&x.st==='c');
 h+=irAddBanner();
 h+='<div class="row" style="margin:8px 0;gap:8px;flex-wrap:wrap"><span class="mu">'+DAYS[ti]+' · '+(S.plan[ti].ex.length?esc(S.plan[ti].t):'يوم راحة')+'</span><span class="sp"></span><span class="tag" id="ir-sync">'+esc(irSyncTx())+'</span>'+(s?irBadge(irSt(s)):'')+'</div>';
 if(!s){
  h+='<div class="card"><h2>'+ic('dumbbell')+'ابدأ حصتك</h2><div class="mu" style="margin-bottom:10px">'+(T.length?'مقرَّر اليوم: '+T.length+' تمارين.':'لا تمارين مقرّرة اليوم.')+(done.length?' أنهيت اليوم '+done.length+' حصة.':'')+'</div><div class="irchoice">'+
   (T.length?'<button class="btn" id="ir-start-plan" data-a="irstart" data-v="plan">ابدأ حصة اليوم</button>':'')+'<button class="btn ghost" id="ir-start-free" data-a="irstart" data-v="free">ابدأ حصة حرة</button><button class="btn ghost" data-a="irtpl">ابدأ بقالب جاهز</button><button class="btn ghost" data-a="irgo" data-v="sch">ابنِ جدولًا أسبوعيًا</button></div></div>';
  return h}
 const ks=s.ex;if(!ks.length)h+='<div class="card mu">حصة حرة: أضف أول تمرين لتبدأ.</div>';
 ks.forEach((x,i)=>{h+=irExCard(s,x,i)});
 h+=irAddForm();
 const pr=irProg(s);
 h+='<div class="card"><div class="row" style="gap:8px"><span class="mu">أنجزت <b class="num">'+F(pr.d)+'</b> مجموعة'+(s.fr?'':' من '+F(pr.t))+'</span><span class="sp"></span>'+(UI.irfin?'<button class="btn sm" id="ir-fin-ok" data-a="irfin" data-v="c">إنهاء كحصة مكتملة</button><button class="btn sm ghost" data-a="irfin" data-v="p">حفظ كجزئية</button><button class="chip" data-a="irfin" data-v="x">إلغاء</button>':'<button class="btn" id="ir-fin" data-a="irfin" data-v="ask">إنهاء الحصة</button>')+'</div></div>';
 return h}

/* ----- تبويب: جدولي ----- */
function irRowLast(xv){const l=irLast(xv,null);if(!l)return '<span class="mu">لا أداء مسجّلًا</span>';
 return '<span class="irl">آخر وزن: <b class="num">'+esc(irSetTx(l.top))+'</b> · <span class="num">'+l.date+'</span>'+(l.live?' '+irBadge({c:'live',t:'جارية'}):'')+'</span>'}
function irRowTarget(d,i,e){const sg=(function(){try{return sugg(e)}catch(x){return null}})(),tw=e.tw!=null&&e.tw!==''?e.tw:'';
 return '<label class="irtw"><span class="mu">هدف الحصة القادمة (كغ)</span><input class="irin num" dir="ltr" inputmode="decimal" data-irtw="'+d+','+i+'" placeholder="'+(sg?F(sg.w,1):'—')+'" value="'+esc(tw)+'" aria-label="وزن الهدف"></label>'}
function irSchRow(d,i,e,showDay){const xv=irXvOf({id:e.id,n:e.n});
 return '<div class="irrow card" data-d="'+d+'" data-i="'+i+'"><div class="row" style="flex-wrap:nowrap;gap:8px"><b class="nm" style="flex:1;min-width:0">'+esc(e.n)+(showDay?' <span class="mu" style="font-weight:400">· '+DAYS[d]+'</span>':'')+'</b><span class="mu num">'+e.s+'×'+e.r+'</span></div><div>'+irRowLast(xv)+'</div>'+irRowTarget(d,i,e)+
  '<div class="row" style="margin-top:6px"><button class="chip" data-a="irrm" data-d="'+d+'" data-i="'+i+'">حذف من الجدول</button></div></div>'}
function irSchTab(){let h=irAddBanner();const v=UI.irv||'wk';
 h+='<div class="seg irsub" role="tablist">'+[['wk','الأسبوع'],['all','كل التمارين']].map(x=>'<button role="tab" aria-selected="'+(x[0]===v)+'" class="'+(x[0]===v?'on':'')+'" data-a="irview" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
 if(UI.irTpl){h+='<div class="row" style="margin:10px 0"><button class="chip" data-a="irtpl0">'+ic('back')+'عودة إلى جدولي</button></div>'+vDisc();return h}
 h+='<div class="row" style="margin:10px 0;gap:8px;flex-wrap:wrap"><button class="chip" data-a="irtpl">ابدأ بقالب جاهز</button><button class="chip" data-a="irstart" data-v="free">ابدأ حصة حرة</button></div>';
 if(v==='wk'){const ti=TI();
  S.plan.forEach((p,d)=>{h+='<div class="irday'+(d===ti?' today':'')+'"><div class="row" style="margin:12px 0 6px"><b>'+DAYS[d]+'</b><span class="mu">'+(p.ex.length?esc(p.t):'')+'</span><span class="sp"></span>'+(d===ti?'<span class="tag">اليوم</span>':'')+(p.ex.length?'':'<span class="tag irrest">راحة</span>')+'</div>'+p.ex.map((e,i)=>irSchRow(d,i,e,0)).join('')+
   '<div class="row" style="margin:4px 0"><button class="chip" data-a="iraddd" data-d="'+d+'">＋ إضافة تمرين لهذا اليوم</button></div>'+(UI.iraddd===d?irAddForm().replace('data-a="iradd"','data-a="iradd" data-d="'+d+'"'):'')+'</div>'});
  return h}
 /* كل التمارين: جميع صفوف الخطة (مجمّعة بالنسخة) + تمارين الحصص الحرة غير المسندة */
 const G={};S.plan.forEach((p,d)=>p.ex.forEach((e,i)=>{const xv=irXvOf({id:e.id,n:e.n});(G[xv]=G[xv]||{xv:xv,n:e.n,rows:[]}).rows.push({d:d,i:i,e:e})}));
 const pool=Object.keys(S.xp||{}).filter(k=>!G[k]).map(k=>S.xp[k]);
 const names=Object.keys(G).map(k=>G[k]);
 if(!names.length&&!pool.length)return h+'<div class="card mu">لا تمارين بعد. ابدأ بقالب جاهز أو أضف تمرينًا من «خطة اليوم».</div>';
 names.forEach(g=>{h+='<div class="card irrow"><div class="row" style="flex-wrap:nowrap;gap:8px"><b class="nm" style="flex:1;min-width:0">'+esc(g.n)+'</b></div><div class="mu" style="margin:4px 0">'+g.rows.map(r=>DAYS[r.d]).join(' · ')+'</div><div>'+irRowLast(g.xv)+'</div>'+irRowTarget(g.rows[0].d,g.rows[0].i,g.rows[0].e)+'</div>'});
 pool.forEach(p=>{h+='<div class="card irrow irpool" data-xv="'+esc(p.xv)+'"><div class="row" style="flex-wrap:nowrap;gap:8px"><b class="nm" style="flex:1;min-width:0">'+esc(p.n)+'</b><span class="tag">غير مسنَد</span></div><div>'+irRowLast(p.xv)+'</div><div class="row" style="margin-top:8px;gap:8px"><select class="irsel" id="ir-asg-'+esc(p.xv)+'" aria-label="اليوم">'+DAYS.map((x,d)=>'<option value="'+d+'">'+x+'</option>').join('')+'</select><button class="chip" data-a="irassign" data-xv="'+esc(p.xv)+'">إسناده إلى هذا اليوم</button></div></div>'});
 return h}

/* ----- تبويب: السجل ----- */
function irEvTx(e){const n=esc(e.n||''),s=e.w!=null?irSetTx({w:e.w,r:e.r}):'';
 if(e.t==='set+')return 'سُجّلت مجموعة · '+n+' · '+s;
 if(e.t==='set~')return 'عُدّلت مجموعة · '+n+' · '+irSetTx({w:e.ow,r:e.or})+' ← '+s;
 if(e.t==='set-')return 'حُذفت مجموعة · '+n+' · '+s;
 if(e.t==='ex+')return 'أُضيف تمرين · '+n+' · '+(e.plan?'إلى '+DAYS[e.d]+' في جدولي':'إلى «كل التمارين»');
 if(e.t==='ex-')return 'تراجع عن إضافة · '+n;
 if(e.t==='asg')return 'أُسنِد إلى '+DAYS[e.d]+' · '+n;
 if(e.t==='ses+')return 'بدأت '+esc(e.n||'حصة');
 if(e.t==='ses=')return 'أُنهيت '+esc(e.n||'حصة')+' كحصة مكتملة';
 if(e.t==='ses~')return 'حُفظت '+esc(e.n||'حصة')+' كجزئية';
 if(e.t==='tw')return 'عُدّل وزن الهدف · '+n+' · '+irW(e.ow)+' ← '+irW(e.w);
 return esc(e.t)}
const irEvIc=t=>({'set+':'check','set~':'edit','set-':'x','ex+':'dumbbell','ex-':'back','asg':'cal','ses+':'timer','ses=':'trophy','ses~':'timer'}[t]||'info');
function irFlt(){const f=UI.irf||{};return f}
function irExOpts(sel){const m={};sxList().forEach(s=>s.ex.forEach(x=>{const xv=irXvOf(x);m[xv]=x.n}));Object.keys(S.xp||{}).forEach(k=>{m[k]=S.xp[k].n});
 return '<option value="">كل التمارين</option>'+Object.keys(m).sort((a,b)=>m[a]<m[b]?-1:1).map(k=>'<option value="'+esc(k)+'"'+(k===sel?' selected':'')+'>'+esc(m[k])+'</option>').join('')}
function irSessDetail(sid,hi){const s=sid.indexOf('old|')===0?sxLegacy().find(x=>x.id===sid):S.sx[sid];
 let h='<div class="row" style="margin:6px 0"><button class="chip" data-a="irclose">'+ic('back')+'عودة إلى السجل</button></div>';
 if(!s)return h+'<div class="card mu">تعذّر العثور على الحصة (ربما حُذفت).</div>';
 if(s.old)return h+'<div class="card" id="ir-detail"><h2>ملخص تاريخي · <span class="num">'+s.date+'</span></h2><div class="mu" style="margin-bottom:8px">سجل قديم بملخص أفضل مجموعة لكل تمرين، لم تُسجَّل له مجموعات منفصلة.</div>'+s.ex.map(x=>'<div class="irset"><b>'+esc(x.n)+'</b><span class="sp"></span><span class="num">'+esc(irSetTx(x.sets[0]))+'</span></div>').join('')+'</div>';
 const st=irSt(s);
 h+='<div class="card" id="ir-detail"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">'+esc(sxTitle(s))+'</h2>'+irBadge(st)+'<span class="sp"></span><span class="mu num">'+s.date+'</span></div><div class="mu" style="margin:6px 0">بدأت '+irClock(s.ts)+(s.fin?' · أُنهيت '+irClock(s.fin):'')+' · '+F(irProg(s).d)+' مجموعة</div></div>';
 s.ex.forEach(x=>{const ed=UI.irEd&&UI.irEd.sid===s.id&&UI.irEd.k===x.k?UI.irEd.i:null;
  h+='<div class="card irx"><div class="row"><b class="nm">'+esc(x.n)+'</b><span class="sp"></span>'+(x.tg?'<span class="mu num">الهدف '+x.tg+'×'+(x.tr||0)+'</span>':'')+'</div>'+
  ((x.sets||[]).length?(x.sets||[]).slice().sort((a,b)=>(a.at||0)-(b.at||0)).map((q,j)=>{const id=sxSid(q),on=ed===id;
   return '<div class="irset'+(hi===id?' hi':'')+(q.ty==='w'?' wu':'')+'" id="irs-'+esc(id)+'"><span class="num mu">'+(j+1)+'</span>'+(on?irIn('ir-ew','كغ',q.w)+irIn('ir-er','تكرار',q.r)+'<button class="chip" data-a="irsave" data-k="'+esc(x.k)+'" data-i="'+esc(id)+'" data-s="'+s.id+'">حفظ</button><button class="chip" data-a="irecancel">إلغاء</button>':
    '<b class="num">'+esc(irSetTx(q))+'</b>'+(q.ty==='w'?'<span class="mu">إحماء</span>':'')+'<span class="mu num" style="font-size:12px">سُجّلت '+irDay(q.at)+' '+irClock(q.at)+(q.up&&q.up!==q.at?' · عُدّلت '+irDay(q.up)+' '+irClock(q.up):'')+'</span><span class="sp"></span><button class="chip" data-a="iredit" data-s="'+s.id+'" data-k="'+esc(x.k)+'" data-i="'+esc(id)+'">تعديل</button><button class="chip" data-a="irdel" data-s="'+s.id+'" data-k="'+esc(x.k)+'" data-i="'+esc(id)+'">حذف</button>')+'</div>'}).join(''):'<div class="mu">لا مجموعات مسجّلة.</div>')+'</div>'});
 return h}
function irLogTab(){const o=UI.iro;if(o)return irSessDetail(o.sid,o.i);
 const v=UI.irlv||'ev',f=irFlt();let h='<div class="seg irsub" role="tablist">'+[['ev','الأحداث'],['ss','الحصص']].map(x=>'<button role="tab" aria-selected="'+(x[0]===v)+'" class="'+(x[0]===v?'on':'')+'" data-a="irlview" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
 h+='<div class="card irflt"><div class="g2"><label class="irf"><span class="mu">من تاريخ</span><input type="date" id="ir-ff" data-irf="from" value="'+esc(f.from||'')+'"></label><label class="irf"><span class="mu">إلى تاريخ</span><input type="date" id="ir-ft" data-irf="to" value="'+esc(f.to||'')+'"></label></div><label class="irf" style="margin-top:8px"><span class="mu">التمرين</span><select id="ir-fx" class="irsel" data-irf="x">'+irExOpts(f.x)+'</select></label>'+((f.from||f.to||f.x)?'<button class="chip" style="margin-top:8px" data-a="irfclr">مسح التصفية</button>':'')+'</div>';
 const inR=(d,xv)=>(!f.from||d>=f.from)&&(!f.to||d<=f.to)&&(!f.x||xv===f.x);
 if(v==='ev'){const L=irEvents().filter(e=>inR(e.pd||irDay(e.at),e.xv||(e.sid&&S.sx[e.sid]?'':'')) &&(!f.x||e.xv===f.x||(!e.xv&&e.sid&&S.sx[e.sid]&&S.sx[e.sid].ex.some(x=>irXvOf(x)===f.x))));
  if(!L.length)return h+'<div class="card mu">لا أحداث '+((f.from||f.to||f.x)?'ضمن هذه التصفية':'بعد. ستظهر هنا كل مجموعة وإضافة تمرين وتعديل.')+'</div>';
  let last='';return h+L.map(e=>{const d=e.pd||irDay(e.at),hd=d!==last?'<div class="irdh num">'+d+'</div>':'';last=d;
   return hd+'<button class="card irev" data-a="iropen" data-sid="'+esc(e.sid||'')+'" data-i="'+esc(e.i||'')+'" id="irev-'+esc(e.id)+'"><span class="irevic">'+ic(irEvIc(e.t))+'</span><span class="irevb"><span class="irevt">'+irEvTx(e)+'</span><span class="mu num" style="font-size:12px">سُجّل '+irDay(e.at)+' '+irClock(e.at)+(e.pd&&e.pd!==irDay(e.at)?' · لحصة '+e.pd:'')+'</span></span></button>'}).join('')}
 const A=sxAll().filter(s=>inR(s.date,f.x&&s.ex.some(x=>irXvOf(x)===f.x)?f.x:(f.x?'__':'')));
 if(!A.length)return h+'<div class="card mu">لا حصص '+((f.from||f.to||f.x)?'ضمن هذه التصفية':'بعد')+'.</div>';
 return h+A.map(s=>{const st=s.old?{t:'ملخص تاريخي',c:'old'}:irSt(s),n=s.old?s.ex.length:irProg(s).d;
  return '<button class="card irev" data-a="iropen" data-sid="'+esc(s.id)+'"><span class="irevic">'+ic('dumbbell')+'</span><span class="irevb"><span class="irevt">'+esc(sxTitle(s))+' '+irBadge(st)+'</span><span class="mu num" style="font-size:12px">'+s.date+' · '+F(n)+(s.old?' تمرين':' مجموعة')+'</span></span></button>'}).join('')}

/* ----- تبويب: التقدّم (الحصص المكتملة فقط) ----- */
function irChart(pts,opt){opt=opt||{};if(!pts.length)return '';const W=300,H=130,P=22,ys=pts.map(p=>p.y),mn=Math.min.apply(null,ys),mx=Math.max.apply(null,ys),sp=(mx-mn)||1,
  X=i=>pts.length===1?W/2:P+(W-2*P)*i/(pts.length-1),Y=y=>H-P-(H-2*P)*(y-mn)/sp;
 const line=pts.map((p,i)=>X(i).toFixed(1)+','+Y(p.y).toFixed(1)).join(' ');
 return '<svg class="irch" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(opt.aria||'رسم')+'"><polyline points="'+line+'" fill="none" stroke="var(--ac)" stroke-width="2"/>'+pts.map((p,i)=>'<g class="irpt" data-a="irpt" data-sid="'+esc(p.sid)+'" data-i="'+esc(p.i||'')+'" tabindex="0" role="button" aria-label="'+esc(p.date+' '+p.y)+'"><circle cx="'+X(i).toFixed(1)+'" cy="'+Y(p.y).toFixed(1)+'" r="16" fill="transparent" pointer-events="all"/><circle cx="'+X(i).toFixed(1)+'" cy="'+Y(p.y).toFixed(1)+'" r="'+(p.leg?4:5)+'" fill="'+(p.leg?'none':'var(--ac)')+'" stroke="var(--ac)" stroke-width="2"/><text x="'+X(i).toFixed(1)+'" y="'+(Y(p.y)-9).toFixed(1)+'" text-anchor="middle" class="num" font-size="10" fill="currentColor">'+F(p.y,1)+'</text></g>').join('')+'</svg>'}
function irWkLbl(w){const a=new Date(w+'T12:00:00'),b=new Date(a);b.setDate(a.getDate()+6);return w+' → '+iso(b)}
function irProgTab(){const H=irHist(),ks=Object.keys(H).sort((a,b)=>H[a].n<H[b].n?-1:1);
 let h='<div class="mu" style="margin:6px 0 10px">الرسوم والتقارير من الحصص المكتملة فقط. الحصص الجارية والجزئية في «السجل».</div>';
 if(!ks.length)h+='<div class="card mu" id="ir-prog-empty">لا حصص مكتملة بعد. أنهِ حصتك من «خطة اليوم» لتظهر نتائجها هنا.</div>';
 else{const sel=ks.indexOf(UI.irx)>=0?UI.irx:ks[0],hh=H[sel],pts=hh.pts;
  h+='<div class="chips irxs" style="margin-bottom:10px">'+ks.map(k=>'<button class="chip'+(k===sel?' on':'')+'" data-a="irx" data-v="'+esc(k)+'">'+esc(H[k].n)+'</button>').join('')+'</div>';
  const top=pts.map(p=>({y:p.top.w,date:p.date,sid:p.sid,leg:p.leg,i:p.sets.length?p.sets.slice().sort((a,b)=>b.w-a.w||b.r-a.r)[0].i:''}));
  h+='<div class="card" id="ir-chart"><h2>'+ic('chart')+esc(hh.n)+' · أثقل مجموعة في كل حصة</h2>'+irChart(top,{aria:'تطور وزن '+hh.n})+'<div class="mu" style="margin-top:6px">'+pts.map(p=>'<span class="num">'+p.date.slice(5)+'</span> '+esc(irSetTx(p.top))+(p.leg?' <i>(ملخص)</i>':'')).join(' · ')+'</div><div class="mu" style="margin-top:4px;font-size:12px">الدائرة المفرغة: ملخص تاريخي بلا مجموعات مسجّلة. اضغط نقطة لفتح الحصة.</div></div>';
  const AR=irAtReps(hh),rs=Object.keys(AR).map(Number).sort((a,b)=>a-b),rsel=rs.indexOf(+UI.irr)>=0?+UI.irr:(rs.slice().sort((a,b)=>AR[b].length-AR[a].length||a-b)[0]);
  if(rs.length){const arr=AR[rsel],d=arr.length>1?+(arr[arr.length-1].w-arr[0].w).toFixed(2):0;
   h+='<div class="card" id="ir-reps"><h2>'+ic('target')+'مقارنة الأوزان عند نفس التكرارات</h2><div class="chips" style="margin-bottom:8px">'+rs.map(r=>'<button class="chip'+(r===rsel?' on':'')+'" data-a="irrep" data-v="'+r+'">'+r+' تكرارًا</button>').join('')+'</div>'+irChart(arr.map(a=>({y:a.w,date:a.date,sid:a.sid,leg:a.leg,i:''})),{aria:'الوزن عند '+rsel+' تكرارات'})+'<div class="mu" style="margin-top:6px">'+(arr.length>1?'التغيّر بين أول وآخر حصة: <b class="num">'+(d>0?'+':'')+F(d,2)+' كغ</b>':'حصة واحدة عند هذا العدد.')+'</div></div>'}
  /* العضلات: أسبوعيًا */
  const wk=UI.irwk||W(),M=irMuscle(wk),mk=Object.keys(M).sort((a,b)=>(M[b].dir+M[b].sec)-(M[a].dir+M[a].sec));
  h+='<div class="card" id="ir-muscle"><div class="row" style="gap:8px"><h2 style="margin:0">'+ic('flame')+'مجموعات العمل لكل عضلة</h2><span class="sp"></span></div><div class="row" style="margin:8px 0;gap:8px"><button class="chip" data-a="irwkn" data-v="-1">الأسبوع السابق</button><span class="mu num" style="flex:1;text-align:center">'+irWkLbl(wk)+'</span><button class="chip" data-a="irwkn" data-v="1">التالي</button></div>'+
   (mk.length?mk.map(g=>{const m=M[g],on=UI.irm===g;return '<div class="irmus"><button class="irmh" data-a="irmus" data-v="'+esc(g)+'" aria-expanded="'+on+'"><b>'+esc(irLbl(g))+'</b><span class="sp"></span><span class="num">مباشرة '+F(m.dir)+'</span><span class="num mu">ثانوية '+F(m.sec)+'</span></button>'+(on?'<div class="irmi">'+m.items.map(it=>'<button class="irmit" data-a="iropen" data-sid="'+esc(it.sid)+'"><span>'+esc(it.n)+'</span><span class="mu num">'+it.date+' · '+F(it.n_)+' '+(it.kind==='dir'?'مباشرة':'ثانوية')+'</span></button>').join('')+'</div>':'')+'</div>'}).join(''):'<div class="mu">لا حصص مكتملة في هذا الأسبوع.</div>')+'</div>'}
 return h}

/* ----- الراوتر والإجراءات ----- */
function vIron(){irEns();const t=UI.irt||'day';
 const body={day:irDayTab,sch:irSchTab,log:irLogTab,prog:irProgTab}[t]||irDayTab;
 return trkBack()+'<h1>تمارين الحديد</h1>'+irTabs()+'<div id="ir-body">'+body()+'</div>'+(t==='day'?'<div class="row" style="margin:14px 0;justify-content:center"><button class="chip" data-a="trk" data-v="iron">الحصة خطوة بخطوة والصفحة السابقة</button></div>':'')}
(()=>{const VT=vTrain;vTrain=function(){if(UI.trk==='irs'&&!UI.ses&&!UI.sum)return vIron();return VT.apply(this,arguments)};
 const TH=trkHub;trkHub=function(){return TH.apply(this,arguments).replace('data-a="trk" data-v="iron"','data-a="trk" data-v="irs"')};
 /* الحصة الجارية التي بدأت من هذا القسم تُستأنف فيه لا في شاشة الخطوة بخطوة */
 const G=sxGo;sxGo=function(s,d){const c=irCur();if(c&&(!s||s.id===c.id)){S.tab='train';UI.trk='irs';UI.irt='day';S.sub=null;window.scrollTo(0,0);return}return G.apply(this,arguments)}})();
const irNum=id=>{const e=document.getElementById(id);return e?+n2(e.value).replace(',','.')||0:0};
const irTxt=id=>{const e=document.getElementById(id);return e?String(e.value||'').trim():''};
const irClr=pre=>{if(!UI.ird)return;Object.keys(UI.ird).forEach(k=>{if(k.indexOf(pre)===0)delete UI.ird[k]})};
function irPlanHas(d,xv){return S.plan[d].ex.find(e=>irXvOf({id:e.id,n:e.n})===xv)}
/* إضافة صف إلى يوم في الجدول مع إعادة استعمال الصف الموجود لنفس النسخة في اليوم نفسه */
function irPlanAdd(d,name,sets,reps,w){const xv=irXvOf({n:name}),dup=irPlanHas(d,xv);if(dup)return{e:dup,dup:true,xv:xv};
 const e=E(name,sets||3,reps||10,0);if(w)e.tw=w;S.plan[d].ex.push(e);irReg(xv,name);irLink(e.id,xv);return{e:e,dup:false,xv:xv}}
Object.assign(ACT,{
 irtab:b=>{UI.irt=b.dataset.v;UI.iro=null;UI.irEd=null;UI.irTpl=0;UI.irfin=0;window.scrollTo(0,0)},
 irgo:b=>{UI.irt=b.dataset.v;if(b.dataset.v==='all'){UI.irt='sch';UI.irv='all'}UI.iro=null;UI.irTpl=0;window.scrollTo(0,0)},
 irview:b=>{UI.irv=b.dataset.v;UI.irTpl=0},irlview:b=>{UI.irlv=b.dataset.v;UI.iro=null},
 irtpl:()=>{UI.irt='sch';UI.irTpl=1;window.scrollTo(0,0)},irtpl0:()=>{UI.irTpl=0},
 irbanx:()=>{UI.irAdd=null},
 irstart:b=>{UI.irt='day';UI.irTpl=0;if(irCur())return;if(b.dataset.v==='free'||!tasks().some(t=>t.d===TI()))irStart(true);else irStart(false);window.scrollTo(0,0)},
 irset:b=>{const n=b.dataset.n,w=irNum('ir-w-'+n),r=irNum('ir-r-'+n);if(!(r>0)){toast('أدخل عدد التكرارات');return false}
  const q=irAddSet(b.dataset.k,w,r);if(!q){toast('تعذّر حفظ المجموعة');return false}irClr('ir-w-');irClr('ir-r-');UI.irSaved={at:Date.now()};toast('حُفظت المجموعة')},
 irundo:b=>{const s=irCur();if(!s)return false;const x=irSessEx(s,b.dataset.k);if(!x||!x.sets.length)return false;const l=x.sets.slice().sort((a,c)=>(a.at||0)-(c.at||0)).pop();irDelSet(s.id,x.k,sxSid(l));toast('تراجعت عن آخر مجموعة')},
 iredit:b=>{const s=b.dataset.s||(irCur()||{}).id;UI.irEd={sid:s,k:b.dataset.k,i:b.dataset.i};irClr('ir-e')},
 irecancel:()=>{UI.irEd=null;irClr('ir-e')},
 irsave:b=>{const sid=b.dataset.s||(UI.irEd&&UI.irEd.sid),w=irNum('ir-ew'),r=irNum('ir-er');if(!(r>0)){toast('أدخل عدد التكرارات');return false}
  const ch=irEditSet(sid,b.dataset.k,b.dataset.i,w,r);UI.irEd=null;irClr('ir-e');toast(ch?'حُفظ التعديل':'لا تغيير')},
 irdel:b=>{const sid=b.dataset.s||(irCur()||{}).id;if(irDelSet(sid,b.dataset.k,b.dataset.i))toast('حُذفت المجموعة وأُعيد الحساب')},
 iradd:b=>{const name=irNorm(irTxt('ir-an')),sets=Math.round(irNum('ir-as'))||3,reps=Math.round(irNum('ir-ar'))||10,w=irNum('ir-aw');if(!name){toast('اكتب اسم التمرين');return false}
  const xv=irXvOf({n:name}),now=Date.now();irEns();
  if(b.dataset.d!=null){const d=+b.dataset.d,r=irPlanAdd(d,name,sets,reps,w);
   if(!r.dup)irLog('ex+',{xv:xv,n:name,d:d,plan:1,pd:TD(),id:r.e.id});UI.irAdd={t:r.dup?'dup':'plan',d:d,id:r.e.id,sid:null,xv:xv,n:name};UI.iraddd=null;irClr('ir-a');return}
  const s=irCur();if(!s)return false;
  if(s.fr){let x=s.ex.find(q=>irXvOf(q)===xv);if(x){UI.irAdd={t:'dup',d:TI(),n:name,xv:xv};return}
   x=irMkEx('F|'+s.id+'|'+(s.ex.length+1)+'.'+irHash(xv),'f'+irHash(xv),name,TI(),0,reps,s.ex.length);x.tg=0;s.ex.push(x);s.up=now;
   S.xp[xv]={n:name,xv:xv,at:now,tg:sets,tr:reps,w:w||0};
   irLog('ex+',{sid:s.id,k:x.k,xv:xv,n:name,plan:0,pd:s.date});UI.irAdd={t:'free',sid:s.id,k:x.k,xv:xv,n:name};irClr('ir-a');return}
  const d=s.dy!=null?s.dy:TI(),r=irPlanAdd(d,name,sets,reps,w),k=W()+'|'+d+'|'+r.e.id;
  if(!s.ex.some(q=>irXvOf(q)===xv)){const x=irMkEx(k,r.e.id,name,d,r.e.s,r.e.r,s.ex.length);s.ex.push(x);s.up=now}
  if(!r.dup)irLog('ex+',{sid:s.id,k:k,xv:xv,n:name,d:d,plan:1,pd:s.date,id:r.e.id});
  UI.irAdd={t:r.dup?'dup':'plan',d:d,id:r.e.id,sid:s.id,k:k,xv:xv,n:name};irClr('ir-a')},
 irundoadd:()=>{const a=UI.irAdd;if(!a)return false;const s=a.sid&&S.sx[a.sid],x=s&&s.ex.find(q=>irXvOf(q)===a.xv);
  if(x&&x.sets.length){toast('سجّلت مجموعات على هذا التمرين. احذفها أولًا');return false}
  if(a.t==='plan'){const i=S.plan[a.d].ex.findIndex(e=>e.id===a.id);if(i>=0)S.plan[a.d].ex.splice(i,1)}else if(a.t==='free'){delete S.xp[a.xv]}
  if(s&&x)s.ex.splice(s.ex.indexOf(x),1);if(s)s.up=Date.now();
  irLog('ex-',{sid:a.sid||undefined,k:a.k,xv:a.xv,n:a.n,d:a.d,plan:a.t==='plan'?1:0,pd:TD()});UI.irAdd=null;toast('تراجعت عن الإضافة')},
 iraddd:b=>{UI.iraddd=+b.dataset.d},
 irassign:b=>{const xv=b.dataset.xv,p=S.xp&&S.xp[xv],d=+(document.getElementById('ir-asg-'+xv)||{}).value;if(!p)return false;
  const r=irPlanAdd(d,p.n,p.tg||3,p.tr||10,p.w||0);delete S.xp[xv];if(!r.dup)irLog('asg',{xv:xv,n:p.n,d:d,plan:1,pd:TD(),id:r.e.id});UI.irAdd={t:r.dup?'dup':'plan',d:d,id:r.e.id,sid:null,xv:xv,n:p.n};toast('أُسنِد إلى '+DAYS[d])},
 irrm:b=>{const d=+b.dataset.d,i=+b.dataset.i,e=S.plan[d].ex[i];if(!e)return false;S.plan[d].ex.splice(i,1);irLog('ex-',{xv:irXvOf({id:e.id,n:e.n}),n:e.n,d:d,plan:1,pd:TD()});toast('حُذف من جدولي')},
 irfin:b=>{const v=b.dataset.v,s=irCur();if(v==='ask'){UI.irfin=1;return}if(v==='x'){UI.irfin=0;return}if(!s){UI.irfin=0;return}
  UI.irfin=0;if(v==='c'){irFinish(s,false);const td=TD();if(s.sec>=30)S.wt[td]=(+S.wt[td]||0)+s.sec;toast('أُنهيت الحصة وأُضيفت نتائجها إلى التقدّم')}else{irFinish(s,true);toast('حُفظت الحصة كجزئية')}},
 iropen:b=>{const sid=b.dataset.sid;if(!sid){UI.irt='sch';return}UI.irt='log';UI.iro={sid:sid,i:b.dataset.i||''};UI.irEd=null;window.scrollTo(0,0);setTimeout(()=>{const e=document.getElementById('irs-'+(b.dataset.i||''));if(e&&e.scrollIntoView)e.scrollIntoView({block:'center'})},60)},
 irpt:b=>{ACT.iropen(b)},
 irclose:()=>{UI.iro=null;UI.irEd=null},
 irfclr:()=>{UI.irf={}},
 irx:b=>{UI.irx=b.dataset.v;UI.irr=null},irrep:b=>{UI.irr=+b.dataset.v},
 irwkn:b=>{const d=new Date((UI.irwk||W())+'T12:00:00');d.setDate(d.getDate()+7*(+b.dataset.v));UI.irwk=iso(d);UI.irm=null},
 irmus:b=>{UI.irm=UI.irm===b.dataset.v?null:b.dataset.v}});
document.addEventListener('input',e=>{const t=e.target;if(t&&t.id&&t.id.indexOf('ir-')===0&&t.tagName==='INPUT'){UI.ird=UI.ird||{};UI.ird[t.id]=t.value}},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset)return;
 if(t.dataset.irf){UI.irf=UI.irf||{};UI.irf[t.dataset.irf]=t.value;render();return}
 if(t.dataset.irtw){const p=t.dataset.irtw.split(','),e2=S.plan[+p[0]]&&S.plan[+p[0]].ex[+p[1]];if(!e2)return;const v=+n2(t.value).replace(',','.')||0,o=e2.tw||0;
  if(v===o)return;e2.tw=v||0;if(!v)delete e2.tw;irLog('tw',{xv:irXvOf({id:e2.id,n:e2.n}),n:e2.n,d:+p[0],w:v,ow:o,pd:TD()});save();toast('حُفظ وزن الهدف')}},true);
