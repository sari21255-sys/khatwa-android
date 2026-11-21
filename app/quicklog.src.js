/* ======================= التسجيل السريع: بلا تشغيل حصة. المستخدم يختار التاريخ والتمرين ويحفظ أداءه =======================
   التخزين لا يتغيّر: S.sx (حصص) و S.plan (الجدول) و S.xr (نسخ التمارين) و S.sxl (سجل الأحداث).
   كل تاريخ فيه أداء محفوظ يملك «سجل يوم» واحدًا معرّفه sxql-<التاريخ> وحالته مكتملة دائمًا؛ وإن وُجدت حصص قديمة في التاريخ نفسه
   فتبقى بمعرّفاتها وتُقرأ معها، ولا يُحسب اليوم إلا مرة واحدة (qDays). لا يُنشأ أي مجموعة لم يحفظها المستخدم. */
const qDi=ds=>(new Date(ds+'T12:00:00').getDay()+1)%7;
const qSid=ds=>'sxql-'+ds;
const qIsDay=s=>s&&String(s.id).indexOf('sxql-')===0;
const qNoon=ds=>Date.parse(ds+'T12:00:00')||Date.now();
const qDate=()=>UI.qd||(UI.qd=TD());
const qNum=v=>{const x=parseFloat(n2(String(v==null?'':v)).replace(',','.'));return isFinite(x)?x:0};
const qFmt=ds=>{const i=qDi(ds);return DAYS[i]+' · '+ds};
/* حصص تُخفى إن لم يبقَ فيها شيء: سجل يوم بلا مجموعات، أو حصة قديمة جزئية بلا مجموعات وبلا حجم */
(()=>{const L0=sxList;sxList=function(){return L0.apply(this,arguments).filter(s=>{const n=(s.ex||[]).reduce((a,x)=>a+(x.sets||[]).length+(x.rm||[]).length,0);return n>0||(!qIsDay(s)&&(+s.vol>0||s.st==='c'&&s.ex.length>0))})}})();

/* ---------- الترحيل: لا حصة جارية ولا جزئية بعد اليوم ---------- */
function qMigrate(){let ch=0;
 Object.keys(S.sx||{}).forEach(k=>{const s=S.sx[k];if(!s||!Array.isArray(s.ex))return;
  if(s.st==='p'||s.ar){s.st='c';delete s.ar;if(!s.fin)s.fin=s.up||s.ts||Date.now();s.up=Date.now();s.sec=0;s.mg=1;ch++}});
 try{SJ().ss.forEach(s=>{if(s.st!=='done'){tkFinish(s,1);ch++}});UI.ses=null;UI.sum=null;UI.tconf=null}catch(e){lg(e)}
 if(ch){try{save()}catch(e){lg(e)}}return ch}
qMigrate();

/* ---------- قراءة وحفظ الأداء ---------- */
/* كل ما حُفظ في تاريخ ما لنسخة تمرين: [{s,x,q}] مرتّبة بوقت التسجيل */
function qSets(date,xv){const o=[];sxList().forEach(s=>{if(s.date!==date)return;s.ex.forEach(x=>{if(irXvOf(x)!==xv)return;(x.sets||[]).filter(q=>q.ty!=='w').forEach(q=>o.push({s:s,x:x,q:q}))})});
 return o.sort((a,b)=>(a.q.at||0)-(b.q.at||0))}
function qDayEx(date){const m={};sxList().forEach(s=>{if(s.date!==date)return;s.ex.forEach(x=>{if(!irSets(x).length)return;const xv=irXvOf(x);(m[xv]=m[xv]||{xv:xv,n:x.n,id:x.id})})});return m}
function qDay(date){let s=S.sx[qSid(date)];if(s)return s;const now=Date.now(),di=qDi(date);
 return S.sx[qSid(date)]={id:qSid(date),wk:wkey(date),date:date,ts:qNoon(date),up:now,dy:di,kd:'t',t:(S.plan[di]||{}).t||'تمرين',st:'c',sec:0,vol:0,fin:now,u:irUser(),ex:[]}}
function qRowFor(date,xv){const di=qDi(date);return (S.plan[di]||{ex:[]}).ex.find(e=>irXvOf({id:e.id,n:e.n})===xv)||null}
/* يحفظ صفوف الأداء كما هي: صف له معرّف يُعدَّل، وصف جديد يُضاف، ومعرّف غاب عن الصفوف يُحذف. rows:[{sid,k,i,w,r}] */
function qSave(date,xv,name,rows){const now=Date.now(),have=qSets(date,xv);let n=0;
 const keep=new Set(rows.filter(r=>r.i).map(r=>r.i));
 have.forEach(h=>{const id=sxSid(h.q);if(!keep.has(id)){irDelSet(h.s.id,h.x.k,id);n++}});
 rows.forEach(r=>{if(!(r.r>0))return;
  if(r.i){const f=have.find(h=>sxSid(h.q)===r.i);if(f&&irEditSet(f.s.id,f.x.k,r.i,r.w,r.r))n++;return}
  const s=qDay(date);let x=s.ex.find(q=>irXvOf(q)===xv);
  if(!x){const e=qRowFor(date,xv),k=e&&wkey(date)===W()?W()+'|'+qDi(date)+'|'+e.id:'ql|'+date+'|'+xv;
   x=irMkEx(k,e?e.id:'q'+irHash(xv),name,qDi(date),e?e.s:0,e?e.r:0,s.ex.length);s.ex.push(x)}
  const q={i:sxRid(),w:Math.max(0,+r.w||0),r:Math.round(+r.r),ty:'n',rp:0,at:qNoon(date)+(x.sets.length+1)*1000,up:now};x.sets.push(q);s.up=now;x.sk=0;irReg(xv,name);
  irLog('set+',{sid:s.id,k:x.k,xv:xv,n:name,i:q.i,w:q.w,r:q.r,pd:date});irRecon(s,x);n++});
 save();return n}

/* ---------- صور التمارين: على هذا الجهاز فقط (مفتاح fit_xi) مثل ألبوم التقدّم؛ مصغّرة 320 بكسل مربّعة ---------- */
let XI={};try{XI=JSON.parse(localStorage.getItem('fit_xi')||'{}')||{}}catch(e){XI={}}
const xiSave=()=>{try{localStorage.setItem('fit_xi',JSON.stringify(XI));return true}catch(e){lg(e);return false}};

/* ---------- الأرقام القياسية والأرقام العامة ---------- */
function qMeta(xv,name){const m=irMeta(xv,name),r=(S.xr||{})[xv]||{};return Object.assign({},m,{lt:r.lt||(m.q==='bw'?'bw':(/مساعد/.test(m.n||name||'')?'as':'w'))})}
function qWt(lt,w){w=+w||0;if(lt==='bw'||lt==='add')return w?('+'+F(w,2)+' كغ إضافي'):'وزن الجسم';if(lt==='as')return w?('مساعدة '+F(w,2)+' كغ'):'بلا مساعدة';return F(w,2)+' كغ'}
const qSet=(lt,q)=>qWt(lt,q.w)+' × '+F(q.r);
/* أفضل: الأعلى وزنًا (الأقل مساعدةً للمساعَد)، وعند التساوي الأكثر تكرارًا */
const qBetter=(lt,a,b)=>{if(!b)return true;const x=lt==='as'?-a.w:a.w,y=lt==='as'?-b.w:b.w;return x>y||(x===y&&a.r>b.r)};
function qAll(){const H=irHist(),M={};
 const add=(xv,n)=>{if(!M[xv])M[xv]={xv:xv,n:n,meta:qMeta(xv,n),pts:[],plan:[],sets:[],img:XI[xv]||'',cu:!!((S.xr||{})[xv]&&S.xr[xv].cu)};return M[xv]};
 Object.keys(H).forEach(xv=>{const e=add(xv,H[xv].n);e.pts=H[xv].pts});
 S.plan.forEach((p,d)=>p.ex.forEach(e=>{const xv=irXvOf({id:e.id,n:e.n});add(xv,e.n).plan.push(d)}));
 Object.keys(S.xr||{}).forEach(xv=>{if(S.xr[xv]&&S.xr[xv].n)add(xv,S.xr[xv].n)});
 Object.keys(M).forEach(xv=>{const e=M[xv],lt=e.meta.lt;
  e.pts.forEach(p=>{if(p.leg){if(p.top&&p.top.r>0)e.sets.push({date:p.date,w:p.top.w,r:p.top.r,leg:1,sid:p.sid,k:p.k,at:0})}
   else p.sets.forEach(q=>e.sets.push({date:p.date,w:q.w,r:q.r,leg:0,sid:p.sid,k:p.k,i:q.i,at:q.at||0}))});
  e.sets.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:(a.at-b.at));
  let best=null;e.rec=[];e.sets.forEach(q=>{if(qBetter(lt,q,best)){best=q;e.rec.push(q)}});e.max=best;
  const ld=e.sets.length?e.sets[e.sets.length-1].date:'';e.lastDate=ld;e.last=e.sets.filter(q=>q.date===ld)});
 return M}

/* ---------- الواجهة ---------- */
function qTabs(){const t=UI.qt||'cur';return '<div class="seg irtabs" role="tablist">'+[['cur','الخطة الحالية'],['all','أرشيف تماريني']].map(x=>'<button role="tab" aria-selected="'+(x[0]===t)+'" class="'+(x[0]===t?'on':'')+'" data-a="qtab" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'}
function qDateBar(){const d=qDate(),td=TD();
 let h='<div class="card qdate"><div class="row" style="gap:8px;flex-wrap:nowrap"><button class="chip" data-a="qday" data-v="1" aria-label="اليوم التالي">'+ic('back')+'</button><div style="flex:1;text-align:center"><b class="num">'+qFmt(d)+'</b>'+(d===td?'<span class="tag" style="margin-inline-start:6px">اليوم</span>':'')+'</div><button class="chip" data-a="qday" data-v="-1" aria-label="اليوم السابق">'+ic('next')+'</button></div>'+
  '<div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button class="chip" data-a="qpick">'+ic('cal')+'اختيار تاريخ سابق</button>'+(d!==td?'<button class="chip" data-a="qtoday">العودة إلى اليوم</button>':'')+'</div>';
 if(UI.qdp)h+=qDatePicker('qd',d,'qdgo');
 return h+'</div>'}
/* منتقي التاريخ: يوم وشهر وسنة بأرقام 0–9 (يُعاد استعماله في تاريخ الميلاد) */
const QMON=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function qDatePicker(id,ds,act,o){o=o||{};const p=String(ds).split('-'),y=+p[0],m=+p[1],d=+p[2],y0=o.y0||(new Date().getFullYear()-2),y1=o.y1||new Date().getFullYear();
 const opt=(a,b,sel,f)=>{let s='';for(let i=a;i<=b;i++)s+='<option value="'+i+'"'+(i===sel?' selected':'')+'>'+(f?f(i):i)+'</option>';return s};
 const ysel=o.desc?Array.from({length:y1-y0+1},(_,i)=>y1-i):Array.from({length:y1-y0+1},(_,i)=>y0+i);
 return '<div class="qdp row" style="gap:6px;margin-top:8px;flex-wrap:nowrap"><select id="'+id+'-d" class="irsel num" aria-label="اليوم">'+opt(1,31,d)+'</select><select id="'+id+'-m" class="irsel" aria-label="الشهر">'+opt(1,12,m,i=>i+' · '+QMON[i-1])+'</select><select id="'+id+'-y" class="irsel num" aria-label="السنة">'+ysel.map(v=>'<option value="'+v+'"'+(v===y?' selected':'')+'>'+v+'</option>').join('')+'</select>'+(act?'<button class="btn sm" data-a="'+act+'">اذهب</button>':'')+'</div>'}
function qReadDate(id){const g=k=>+((document.getElementById(id+'-'+k)||{}).value||0);const y=g('y'),m=g('m');let d=g('d');if(!y||!m||!d)return '';const mx=new Date(y,m,0).getDate();if(d>mx)d=mx;return y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0')}
function qRefLast(xv,date,lt){let b=null;sxList().forEach(s=>{if(s.date>=date)return;s.ex.forEach(x=>{if(irXvOf(x)!==xv)return;const a=irSets(x);if(!a.length)return;if(!b||s.date>b.date)b={date:s.date,sets:a}})});
 if(!b){const l=irLast(xv,null);if(l&&l.date<date&&l.sets&&l.sets.length)b={date:l.date,sets:l.sets};else if(l&&l.date<date)b={date:l.date,sets:[],top:l.top}}
 return b}
function qRefTx(b,lt){if(!b)return '<span class="mu">لا أداء سابقًا لهذا التمرين</span>';
 const a=b.sets||[];if(!a.length&&b.top)return '<span class="mu">آخر أداء: <b class="num">'+esc(qSet(lt,b.top))+'</b> · <span class="num">'+b.date+'</span> · ملخص تاريخي</span>';
 return '<span class="mu">آخر أداء <span class="num">'+b.date+'</span>: <b class="num">'+a.map(q=>esc(qSet(lt,q))).join(' · ')+'</b></span>'}
const qLim=(a,b)=>{const o=[];for(let i=a;i<=b;i++)o.push(i);return o};
/* قوائم اختيار: الوزن بالكسور (كغ + ‎.00 ‎.25 ‎.50 ‎.75)، والتكرارات، وعدد المجموعات. لا لوحة مفاتيح عند التسجيل */
function qWSel(attr,v,max){v=+v||0;const wh=Math.floor(v),fr=Math.round((v-wh)*100)/100,top=Math.max(max||300,wh);let a='',b='';
 for(let k=0;k<=top;k++)a+='<option value="'+k+'"'+(k===wh?' selected':'')+'>'+k+'</option>';
 const fs=[0,.25,.5,.75];if(fs.indexOf(fr)<0)fs.push(fr);fs.sort((x,y)=>x-y);
 fs.forEach(f=>{b+='<option value="'+f+'"'+(f===fr?' selected':'')+'>'+f.toFixed(2).slice(1)+'</option>'});
 return '<select class="irsel num" dir="ltr" '+attr.replace('@','w')+' aria-label="الوزن كغ">'+a+'</select><select class="irsel num" dir="ltr" '+attr.replace('@','f')+' aria-label="كسر الوزن">'+b+'</select>'}
function qNSel(attr,v,a,b,lbl){v=Math.round(+v)||a;const top=Math.max(b,v);return '<select class="irsel num" dir="ltr" '+attr+' aria-label="'+lbl+'">'+qLim(a,top).map(k=>'<option value="'+k+'"'+(k===v?' selected':'')+'>'+k+'</option>').join('')+'</select>'}
function qEditor(date,xv,name,row,lt){const rows=UI.qrows||[],ref=qRefLast(xv,date,lt),wl=lt==='bw'?'الإضافي كغ':lt==='as'?'المساعدة كغ':'الوزن كغ';
 let h='<div class="qed" id="q-editor"><div class="row qcnt" style="gap:8px;flex-wrap:nowrap"><label class="mu" for="q-cnt">عدد المجموعات</label>'+qNSel('id="q-cnt"',rows.length,1,12,'عدد المجموعات')+'<span class="sp"></span>'+(ref&&(ref.sets||[]).length?'<button class="chip" data-a="qcopylast" data-v="'+esc(xv)+'">انسخ آخر أداء</button>':'')+'</div>'+
  (UI.qpre===xv?'<div class="mu qpre">القيم معبّأة من آخر أداء للمراجعة. عدّلها ثم اضغط «حفظ الأداء».</div>':'')+
  '<div class="qrh mu" aria-hidden="true"><span>المجموعة</span><span>'+wl+'</span><span>التكرارات</span><span></span></div>';
 rows.forEach((q,i)=>{h+='<div class="qrow" data-i="'+i+'"><span class="num mu">'+(i+1)+'</span><span class="qw">'+qWSel('data-qr="'+i+',@"',q.w)+'</span>'+qNSel('data-qr="'+i+',r"',q.r,1,60,'التكرارات')+
  '<button class="chip" data-a="qrdel" data-i="'+i+'" aria-label="حذف المجموعة '+(i+1)+'">'+ic('x')+'</button></div>'});
 h+='<div class="row qact" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button class="chip" data-a="qradd">＋ مجموعة</button><span class="sp"></span><button class="chip" data-a="qxclose">إلغاء</button><button class="btn sm" data-a="qxsave" data-v="'+esc(xv)+'" data-n="'+esc(name)+'">حفظ الأداء</button></div></div>';
 return h}
/* ---------- الخطة الحالية: يوم ← قسم عضلة ← تمارين ---------- */
const QLEG=['quad','ham','glu','add','hip'],QSECS=['back','sho','legs','chest','bic','tri','core','calf','fore','full'];
const qSec=g=>g?(QLEG.indexOf(g)>=0?'legs':g):'_';
const qSecLbl=k=>k==='_'?'غير مصنّف':irLbl(k);
const qSecShort=k=>{const l=qSecLbl(k);return /^ال\S+$/.test(l)?l.slice(2):l};
const qExSec=e=>qSec(qMeta(irXvOf({id:e.id,n:e.n}),e.n).g);
/* عضلات اليوم: المحفوظة بترتيبها ثم أي عضلة لتمرينها صف في اليوم (يُشتق للأيام القديمة بلا حقل mg) */
function qDayMg(d){const p=S.plan[d],o=[];(Array.isArray(p.mg)?p.mg:[]).forEach(k=>{if(o.indexOf(k)<0)o.push(k)});p.ex.forEach(e=>{const k=qExSec(e);if(o.indexOf(k)<0)o.push(k)});return o}
function qMgFix(d){const p=S.plan[d];if(!p)return;p.mg=qDayMg(d);if(p.mg.length)p.t=p.mg.map(qSecShort).join(' و')}
const qCnt=n=>!n?'بلا تمارين':n===1?'تمرين واحد':n===2?'تمرينان':n<=10?F(n)+' تمارين':F(n)+' تمرينًا';
const qDayTitle=d=>{const m=qDayMg(d);return DAYS[d]+' · '+(m.length?m.map(qSecShort).join(' و'):'لم يُحدّد')};
function qWeekDate(d){const sd=qDate(),k=qDi(sd),x=new Date(sd+'T12:00:00');x.setDate(x.getDate()+d-k);return iso(x)}
const qOpenDay=d=>UI.qdo&&UI.qdo[d]!==undefined?UI.qdo[d]:qDi(qDate())===d;
const qOpenMu=(d,s)=>UI.qmo&&UI.qmo[d+'|'+s]!==undefined?UI.qmo[d+'|'+s]:true;
function qExCard(date,xv,name,row,idx,cnt,pos){const lt=qMeta(xv,name).lt,sets=qSets(date,xv),open=UI.qx===xv&&(UI.qxdt||qDate())===date,pe=row&&UI.qpe===row.id&&!open;
 let h='<div class="card qx" data-xv="'+esc(xv)+'"><div class="row" style="flex-wrap:nowrap;gap:8px"><b class="nm" style="flex:1;min-width:0">'+esc(name)+'</b>'+(row?'':'<span class="tag">خارج الجدول</span>')+(row&&!open?'<button class="chip qpeb'+(pe?' on':'')+'" data-a="qpe" data-v="'+esc(row.id)+'" aria-pressed="'+!!pe+'" aria-label="تعديل '+esc(name)+' في الجدول">'+(pe?'تم':'تعديل')+'</button>':'')+'</div>';
 if(row)h+='<div class="qpl"><span><small class="mu">المجموعات</small><b class="num">'+F(row.s)+'</b></span><span><small class="mu">التكرارات</small><b class="num">'+F(row.r)+'</b></span>'+(row.tw?'<span><small class="mu">الهدف</small><b class="num">'+esc(qWt(lt,row.tw))+'</b></span>':'')+'</div>';
 h+='<div class="qlastl">'+qRefTx(qRefLast(xv,date,lt),lt)+'</div>';
 if(sets.length&&!open)h+='<div class="qsaved" aria-label="أداء '+date+'">'+sets.map((h2,i)=>'<span class="irset"><span class="num mu">'+(i+1)+'</span><b class="num">'+esc(qSet(lt,h2.q))+'</b></span>').join('')+'</div>';
 if(open)h+=qEditor(date,xv,name,row,lt);
 else if(pe){const di=qDi(date);
  h+='<div class="qpe" id="q-pe"><div class="g3"><label class="irf"><span class="mu">المجموعات</span>'+qNSel('id="qpe-s"',row.s,1,12,'المجموعات')+'</label><label class="irf"><span class="mu">التكرارات</span>'+qNSel('id="qpe-r"',row.r,1,60,'التكرارات')+'</label></div>'+
   '<div class="mu" style="margin-top:8px">وزن الهدف كغ (0 = بلا هدف)</div><div class="row" style="gap:6px;flex-wrap:nowrap">'+qWSel('id="qpe-@"',row.tw||0)+'</div>'+
   '<div class="row qedt" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="chip" data-a="qmv2" data-d="'+di+'" data-i="'+idx+'" data-v="-1" aria-label="أعلى"'+(pos===0?' disabled':'')+'>↑</button><button class="chip" data-a="qmv2" data-d="'+di+'" data-i="'+idx+'" data-v="1" aria-label="أسفل"'+(pos===cnt-1?' disabled':'')+'>↓</button>'+
   '<select class="irsel" id="q-mvd-'+idx+'" aria-label="نقل إلى يوم">'+DAYS.map((x,d)=>'<option value="'+d+'"'+(d===di?' selected':'')+'>'+x+'</option>').join('')+'</select><button class="chip" data-a="qmvday" data-d="'+di+'" data-i="'+idx+'">نقل</button></div>'+
   '<div class="row" style="gap:8px;margin-top:8px"><button class="btn sm" data-a="qpesave" data-d="'+di+'" data-i="'+idx+'">حفظ التعديل</button><button class="chip" data-a="qrm" data-d="'+di+'" data-i="'+idx+'">إزالة من الجدول</button></div></div>'}
 else if(date>TD())h+='<div class="mu" style="margin-top:8px">يوم قادم: يُسجَّل الأداء في موعده.</div>';
 else h+='<div class="row" style="gap:6px;margin-top:8px"><button class="btn sm" data-a="qxopen" data-v="'+esc(xv)+'" data-d="'+qDi(date)+'" data-date="'+date+'" id="q-open-'+idx+'-'+qDi(date)+'">'+(sets.length?'تعديل الأداء':'تسجيل الأداء')+'</button></div>';
 return h+'</div>'}
function qMePanel(d){const m=UI.qme,cur=qDayMg(d),all=QSECS.concat(cur.filter(k=>QSECS.indexOf(k)<0));
 const lost=cur.filter(k=>m.sel.indexOf(k)<0),ex=S.plan[d].ex.filter(e=>lost.indexOf(qExSec(e))>=0);
 let h='<div class="qme" id="q-me"><b>عضلات '+DAYS[d]+'</b><div class="mu">اختر عضلة أو أكثر. تبقى كل عضلة مرة واحدة في اليوم.</div><div class="qmel">'+all.map(k=>'<label class="qmec"><input type="checkbox" id="qme-'+k+'" data-k="'+k+'"'+(m.sel.indexOf(k)>=0?' checked':'')+'><span>'+esc(qSecLbl(k))+'</span></label>').join('')+'</div>';
 if(m.conf&&ex.length)h+='<div class="qwarn" role="alert"><b>تنبيه قبل الإزالة</b><div>سيُزال من جدول '+DAYS[d]+' '+F(ex.length)+' تمرين: '+ex.map(e=>esc(e.n)).join('، ')+'.</div><div class="mu">تبقى هذه التمارين وسجلات أدائها السابقة في «أرشيف تماريني» وبتواريخها الأصلية.</div></div>';
 return h+'<div class="row" style="gap:8px;margin-top:8px"><button class="btn sm" data-a="qmesave" data-d="'+d+'" id="q-me-save">'+(m.conf&&ex.length?'تأكيد وحفظ':'حفظ')+'</button><button class="chip" data-a="qmex">إلغاء</button></div></div>'}
function qAxPanel(d,sec){const a=UI.qax;if(a.man)return qManualForm();
 const q=irNorm(UI.qxq||'').toLowerCase(),M=qAll(),inDay=new Set(S.plan[d].ex.map(e=>irXvOf({id:e.id,n:e.n})));
 const mt=s=>!q||irNorm(s).toLowerCase().indexOf(q)>=0;
 const arch=Object.keys(M).map(k=>M[k]).filter(e=>qSec(e.meta.g)===sec&&!inDay.has(e.xv)&&mt(e.n)).sort((x,y)=>x.n<y.n?-1:1);
 const lib=XL.filter(x=>qSec(x.g)===sec&&!M[irXv(x.n)]&&(mt(x.n)||String(x.e||'').toLowerCase().indexOf(q)>=0)).slice(0,20);
 const row=(v,n,sub)=>'<div class="qlr row" style="gap:8px;flex-wrap:nowrap"><span style="flex:1;min-width:0"><b class="nm">'+esc(n)+'</b>'+(sub?'<div class="mu">'+sub+'</div>':'')+'</span><button class="chip" data-a="qpadd" data-d="'+d+'" data-v="'+esc(v)+'">أضف</button></div>';
 let h='<div class="card qax" id="q-ax"><div class="row" style="gap:8px"><b>إضافة تمرين: '+esc(qSecLbl(sec))+'</b><span class="sp"></span><button class="chip" data-a="qaxx">إغلاق</button></div><input id="qxq" class="irin" placeholder="ابحث عن تمرين" value="'+esc(UI.qxq||'')+'" aria-label="بحث" autocomplete="off" style="margin:8px 0">';
 h+='<div class="mu"><b>من أرشيف تماريني</b></div>'+(arch.length?arch.map(e=>row(e.xv,e.n,e.sets.length?'أقصى وزن '+esc(qWt(e.meta.lt,e.max.w)):'لم يُسجّل وزن بعد')).join(''):'<div class="mu">لا تمارين أخرى لهذه العضلة في أرشيفك.</div>');
 h+='<div class="mu" style="margin-top:8px"><b>من قائمة التمارين</b></div>'+(lib.length?lib.map(x=>row('lib:'+x.id,x.n,'')).join(''):'<div class="mu">لا نتائج.</div>');
 return h+'<div class="row" style="margin-top:10px"><button class="btn ghost" data-a="qaxm" data-d="'+d+'" data-v="'+sec+'" id="q-ax-man">إضافة يدوية بصورة</button></div></div>'}
function qMuSec(d,date,sec){const p=S.plan[d],items=[];p.ex.forEach((e,i)=>{if(qExSec(e)===sec)items.push({e:e,i:i,xv:irXvOf({id:e.id,n:e.n})})});
 const open=qOpenMu(d,sec),ax=UI.qax&&UI.qax.d===d&&UI.qax.sec===sec;
 let h='<div class="qms" data-sec="'+sec+'"><button class="qmh" data-a="qmtog" data-d="'+d+'" data-v="'+sec+'" aria-expanded="'+open+'" id="q-mh-'+d+'-'+sec+'"><b>'+esc(qSecLbl(sec))+'</b><small class="mu num">'+qCnt(items.length)+'</small><span class="qchev">'+ic('next')+'</span></button>';
 if(open){h+='<div class="qmb">';items.forEach((x,j)=>{h+=qExCard(date,x.xv,x.e.n,x.e,x.i,items.length,j)});
  if(!items.length)h+='<div class="mu">أضف تمارين هذه العضلة.</div>';
  h+=ax?qAxPanel(d,sec):'<div class="row" style="margin:8px 0"><button class="btn sm ghost" data-a="qaxo" data-d="'+d+'" data-v="'+sec+'" id="q-ax-'+d+'-'+sec+'">'+ic('plus')+'إضافة تمرين</button></div>';h+='</div>'}
 return h+'</div>'}
function qDayCard(d){const p=S.plan[d],date=qWeekDate(d),sel=qDi(qDate())===d,open=qOpenDay(d),mg=qDayMg(d),n=p.ex.length;
 let h='<section class="card qday'+(sel?' sel':'')+'" data-d="'+d+'"><button class="qdh" data-a="qdtog" data-v="'+d+'" aria-expanded="'+open+'" id="q-dh-'+d+'"><span class="qdt"><b>'+esc(qDayTitle(d))+'</b><small class="mu num">'+date+(date===TD()?' · اليوم':'')+' · '+qCnt(n)+'</small></span><span class="qchev">'+ic('next')+'</span></button>';
 if(open){h+='<div class="qdb">';
  if(UI.qme&&UI.qme.d===d)h+=qMePanel(d);
  else h+='<div class="row qdact" style="gap:8px;flex-wrap:wrap"><button class="chip" data-a="qmeo" data-d="'+d+'" id="q-me-'+d+'">'+(mg.length?'تعديل عضلات اليوم':'إضافة عضلة')+'</button>'+(mg.length?'<button class="chip" data-a="qmeo" data-d="'+d+'" data-add="1" id="q-meadd-'+d+'">＋ إضافة عضلة</button>':'')+'</div>';
  mg.forEach(sec=>{h+=qMuSec(d,date,sec)});
  const inP=new Set(p.ex.map(e=>irXvOf({id:e.id,n:e.n}))),extra=qDayEx(date),xs=Object.keys(extra).filter(xv=>!inP.has(xv));
  if(xs.length){h+='<div class="qms"><div class="mu" style="margin:8px 0 4px"><b>أُدّيت خارج الجدول في '+date+'</b></div>';xs.forEach(xv=>{h+=qExCard(date,xv,extra[xv].n,null,-1)});h+='</div>'}
  if(!mg.length&&!xs.length)h+='<div class="mu" style="margin:8px 0">لم تُحدَّد عضلات هذا اليوم بعد.</div>';
  h+='</div>'}
 return h+'</section>'}
function qCurTab(){let h=qDateBar();
 h+='<div class="row qall" style="margin:10px 0;gap:8px;flex-wrap:wrap"><button class="chip" data-a="qopenall" id="q-openall">فتح كامل الجدول</button><button class="chip" data-a="qcloseall" id="q-closeall">إغلاق كامل الجدول</button><span class="sp"></span><span class="tag" id="ir-sync">'+esc(irSyncTx())+'</span></div>';
 for(let d=0;d<7;d++)h+=qDayCard(d);
 return h}
const qThumb=(e,big)=>'<span class="qth'+(big?' big':'')+'" aria-hidden="true">'+(e.img?'<img alt="" src="'+e.img+'">':ic('dumbbell'))+'</span>';
function qAllTab(){const M=qAll(),g=UI.qg||'',s=irNorm(UI.qs||'').toLowerCase(),pl=!!UI.qpl;
 let L=Object.keys(M).map(k=>M[k]).filter(e=>(!g||(e.meta.g||'')===g)&&(!pl||e.plan.length)&&(!s||irNorm(e.n).toLowerCase().indexOf(s)>=0));
 const gs={};Object.keys(M).forEach(k=>{const x=M[k].meta.g||'';gs[x]=(gs[x]||0)+1});
 let h=qArchHead();
 h+='<div class="card qflt"><input id="qs" class="irin" placeholder="ابحث في أرشيف تماريني" value="'+esc(UI.qs||'')+'" aria-label="بحث"><div class="chips" style="margin-top:8px"><button class="chip'+(!g?' on':'')+'" data-a="qgrp" data-v="">الكل</button>'+Object.keys(gs).sort().map(k=>'<button class="chip'+(g===k?' on':'')+'" data-a="qgrp" data-v="'+esc(k)+'">'+esc(irLbl(k))+'</button>').join('')+'</div><label class="row" style="gap:6px;margin-top:8px"><input type="checkbox" id="qpl" '+(pl?'checked':'')+'><span>ضمن الخطة الحالية فقط</span></label></div>';
 if(!L.length)return h+'<div class="card mu" id="q-all-empty">'+(Object.keys(M).length?'لا نتائج مطابقة.':'أرشيفك فارغ. أضف تمرينًا من القائمة أو يدويًا، أو أضف تمرينًا إلى خطتك الحالية فيظهر هنا مرة واحدة.')+'</div>';
 const by={};L.forEach(e=>{const k=e.meta.g||'';(by[k]=by[k]||[]).push(e)});
 Object.keys(by).sort((a,b)=>irLbl(a)<irLbl(b)?-1:1).forEach(k=>{h+='<div class="sechead"><h2>'+esc(irLbl(k))+'</h2></div>';by[k].sort((a,b)=>a.n<b.n?-1:1).forEach(e=>{h+=qAllRow(e)})});
 return h}
/* رأس الأرشيف: إضافة تمرين من القائمة أو يدويًا */
function qArchHead(){const m=UI.qadd;
 let h='<div class="card qah"><div class="row" style="gap:8px;flex-wrap:wrap"><b>أضف تمرينًا إلى أرشيفك</b><span class="sp"></span>'+(m?'<button class="chip" data-a="qaddx">إغلاق</button>':'<button class="btn sm" data-a="qaddo" id="q-addarch">'+ic('plus')+'إضافة تمرين</button>')+'</div>';
 if(m==='pick')h+='<div class="g2" style="margin-top:10px"><button class="btn ghost" data-a="qaddm" data-v="lib" id="q-add-lib">من قائمة التمارين</button><button class="btn ghost" data-a="qaddm" data-v="man" id="q-add-man">إضافة يدوية</button></div>';
 h+='</div>';
 if(m==='lib')h+=qLibPanel();else if(m==='man')h+=qManualForm();
 return h}
function qLibPanel(){const q=irNorm(UI.qlq||'').toLowerCase(),g=UI.qlg||'';
 let L=XL.filter(x=>(!g||x.g===g)&&(!q||irNorm(x.n).toLowerCase().indexOf(q)>=0||String(x.e||'').toLowerCase().indexOf(q)>=0));const tot=L.length;L=L.slice(0,30);
 let h='<div class="card" id="q-lib"><h2>'+ic('dumbbell')+'قائمة التمارين</h2><input id="qlq" class="irin" placeholder="ابحث عن تمرين" value="'+esc(UI.qlq||'')+'" aria-label="بحث في القائمة" autocomplete="off">'+
  '<label class="f" style="margin-top:8px">العضلة<select id="qlg" class="irsel"><option value="">كل العضلات</option>'+Object.keys(IRM).map(k=>'<option value="'+k+'"'+(g===k?' selected':'')+'>'+IRM[k]+'</option>').join('')+'</select></label>'+
  '<div class="mu" style="margin:6px 0">'+F(tot)+' تمرين'+(tot>30?' · أول 30، ضيّق البحث':'')+'</div>';
 h+=L.map(x=>{const xv=irXv(x.n),has=!!(S.xr||{})[xv];return '<div class="qlr row" style="gap:8px;flex-wrap:nowrap"><span style="flex:1;min-width:0"><b class="nm">'+esc(x.n)+'</b><div class="mu">'+esc(irLbl(x.g))+'</div></span>'+(has?'<span class="tag">في أرشيفك</span>':'<button class="chip" data-a="qlibadd" data-v="'+x.id+'">أضف</button>')+'</div>'}).join('');
 return h+'</div>'}
const qMfNew=()=>({n:'',g:'chest',t:'w',s:3,r:10,w:'',pr:5,d:TD(),img:'',day:''});
function qManualForm(){const m=UI.qmf||(UI.qmf=qMfNew()),ed=!!m.xv,lock=ed&&!(S.xr[m.xv]&&S.xr[m.xv].cu),ph=m.img?'<img alt="معاينة الصورة" src="'+m.img+'">':ic('dumbbell');
 let h='<div class="card" id="q-man"><h2>'+ic('plus')+(ed?'تعديل التمرين':'إضافة يدوية')+'</h2>'+
  '<label class="f">اسم التمرين<input id="qm-n" class="irin" placeholder="مثال: سحب كابل بمقبض ضيق" value="'+esc(m.n)+'"'+(ed?' readonly':'')+' autocomplete="off"></label>'+
  '<label class="f">العضلة<select id="qm-g" class="irsel"'+(lock?' disabled':'')+'>'+Object.keys(IRM).map(k=>'<option value="'+k+'"'+(m.g===k?' selected':'')+'>'+IRM[k]+'</option>').join('')+'</select></label>'+
  '<label class="f">نوع الحمل<select id="qm-t" class="irsel"'+(lock?' disabled':'')+'><option value="w"'+(m.t==='w'?' selected':'')+'>وزن خارجي (كغ)</option><option value="bw"'+(m.t==='bw'?' selected':'')+'>وزن الجسم أو إضافي</option><option value="as"'+(m.t==='as'?' selected':'')+'>مساعدة (جهاز مساعد)</option></select></label>'+
  '<div class="mu" style="margin-top:10px">صورة التمرين</div><div class="row qph" style="gap:10px"><span class="qth big" id="qm-ph">'+ph+'</span><label class="chip" style="cursor:pointer">'+(m.img?'تغيير الصورة':'رفع صورة من الجهاز')+'<input id="qm-file" type="file" accept="image/*" hidden></label>'+(m.img?'<button class="chip" data-a="qmimgx">إزالة الصورة</button>':'')+'</div>'+
  (UI.xcrop?qCropUi():'')+
  '<div class="mu qimgn">تُحفظ الصورة على هذا الجهاز فقط، ولا تنتقل مع المزامنة.</div>'+
  '<div class="g2" style="margin-top:10px"><label class="irf"><span class="mu">المجموعات</span>'+qNSel('id="qm-s"',m.s,1,12,'المجموعات')+'</label><label class="irf"><span class="mu">التكرارات</span>'+qNSel('id="qm-r"',m.r,1,60,'التكرارات')+'</label></div>';
 if(!ed){const wo=m.w===''?'':Math.floor(+m.w||0),fr=m.w===''?0:Math.round(((+m.w||0)-Math.floor(+m.w||0))*100)/100;
  let a='<option value=""'+(m.w===''?' selected':'')+'>بدون أداء سابق</option>',b='';for(let k=0;k<=300;k++)a+='<option value="'+k+'"'+(wo===k?' selected':'')+'>'+k+'</option>';
  [0,.25,.5,.75].forEach(f=>{b+='<option value="'+f+'"'+(f===fr?' selected':'')+'>'+f.toFixed(2).slice(1)+'</option>'});
  h+='<div class="mu" style="margin-top:10px">أقصى وزن سابق (اختياري)</div><div class="row" style="gap:6px;flex-wrap:nowrap"><select id="qm-w" class="irsel num" dir="ltr" aria-label="أقصى وزن سابق كغ">'+a+'</select><select id="qm-f" class="irsel num" dir="ltr" aria-label="كسر الوزن"'+(m.w===''?' disabled':'')+'>'+b+'</select><span class="mu">كغ</span></div>'+
   (m.w===''?'<div class="mu">يظهر عندها «لم يُسجّل وزن بعد».</div>':'<label class="f" style="margin-top:8px">التكرارات بهذا الوزن'+qNSel('id="qm-pr"',m.pr,1,60,'التكرارات بهذا الوزن')+'</label><div class="mu" style="margin-top:8px">تاريخ رفع هذا الوزن</div>'+qDatePicker('qm-d',m.d,'',{y0:new Date().getFullYear()-10,y1:new Date().getFullYear(),desc:true})+'<div class="mu">يُحفظ سجل أداء تاريخيًا بهذا الوزن والتاريخ.</div>');
  h+='<label class="f" style="margin-top:10px">إضافة إلى الجدول (اختياري)<select id="qm-day" class="irsel"><option value="">لا، أرشيف فقط</option>'+DAYS.map((x,d)=>'<option value="'+d+'"'+(String(m.day)===String(d)?' selected':'')+'>'+x+'</option>').join('')+'</select></label>'}
 return h+'<div class="mu" id="qm-err" role="alert"></div><div class="row" style="gap:8px;margin-top:10px"><button class="btn" data-a="qmsave" id="qm-save">'+(ed?'حفظ التعديل':'حفظ التمرين')+'</button><button class="chip" data-a="qmcancel">إلغاء</button></div></div>'}
/* قص الصورة: معاينة مربّعة 240 بكسل، تكبير وإزاحة بمنزلقين أو بسحب المعاينة؛ الناتج 320×320 JPEG */
let XC={img:null};
function qCropUi(){const c=UI.xcrop;return '<div class="qcrop" id="q-crop"><canvas id="xc-cv" width="240" height="240" aria-label="معاينة القص"></canvas>'+
 '<label class="f">التكبير<input type="range" id="xc-z" min="1" max="3" step="0.05" value="'+c.z+'"></label><label class="f">أفقيًا<input type="range" id="xc-x" min="-1" max="1" step="0.02" value="'+c.x+'"></label><label class="f">رأسيًا<input type="range" id="xc-y" min="-1" max="1" step="0.02" value="'+c.y+'"></label>'+
 '<div class="row" style="gap:8px;margin-top:6px"><button class="btn sm" data-a="xcok" id="xc-ok">اعتماد القص</button><button class="chip" data-a="xcx">إلغاء</button></div></div>'}
function xcPaint(cv,B){const im=XC.img,c=UI.xcrop;if(!cv||!im||!c)return;const g=cv.getContext('2d'),s=B/Math.min(im.width,im.height)*c.z,dw=im.width*s,dh=im.height*s;
 g.fillStyle='#000';g.fillRect(0,0,B,B);g.drawImage(im,(B-dw)/2-(dw-B)/2*c.x,(B-dh)/2-(dh-B)/2*c.y,dw,dh)}
function xcDraw(){xcPaint(document.getElementById('xc-cv'),240)}
function xcOut(){const cv=document.createElement('canvas');cv.width=cv.height=320;xcPaint(cv,320);return cv.toDataURL('image/jpeg',.78)}
(()=>{const R=render;render=function(){const r=R.apply(this,arguments);try{xcDraw()}catch(e){}return r}})();
function qXcLoad(f){const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{URL.revokeObjectURL(u);XC.img=im;UI.xcrop={z:1,x:0,y:0};render()};im.onerror=()=>{URL.revokeObjectURL(u);toast('تعذّرت قراءة الصورة')};im.src=u}
function qMfRead(){const m=UI.qmf;if(!m)return;const v=id=>{const e=document.getElementById(id);return e?e.value:null};
 const n=v('qm-n');if(n!==null)m.n=n;['g','t','day'].forEach(k=>{const x=v('qm-'+k);if(x!==null)m[k]=x});
 const s=v('qm-s');if(s!==null)m.s=+s;const r=v('qm-r');if(r!==null)m.r=+r;const pr=v('qm-pr');if(pr!==null)m.pr=+pr;
 const w=v('qm-w');if(w!==null){m.w=w===''?'':(+w+(+v('qm-f')||0))}
 if(document.getElementById('qm-d-y'))m.d=qReadDate('qm-d')||m.d}
document.addEventListener('change',e=>{const t=e.target;if(!t)return;
 if(t.id==='qm-file'){if(t.files&&t.files[0])qXcLoad(t.files[0]);return}
 if(t.id==='qlg'){UI.qlg=t.value;render();return}
 if(t.type==='checkbox'&&t.id&&t.id.indexOf('qme-')===0&&UI.qme){const k=t.dataset.k,s=UI.qme.sel,i=s.indexOf(k);if(t.checked&&i<0)s.push(k);if(!t.checked&&i>=0)s.splice(i,1);UI.qme.conf=0;render();return}
 if(t.id&&t.id.indexOf('qm-')===0&&UI.qmf){const was=UI.qmf.w;qMfRead();if(t.id==='qm-w'&&(was===''||UI.qmf.w==='')&&was!==UI.qmf.w)render()}},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.id)return;
 if(t.id==='qlq'){UI.qlq=t.value;const p=t.selectionStart;render();const n=document.getElementById('qlq');if(n){n.focus();try{n.setSelectionRange(p,p)}catch(x){}}}
 else if(t.id==='qxq'){UI.qxq=t.value;const p=t.selectionStart;render();const n=document.getElementById('qxq');if(n){n.focus();try{n.setSelectionRange(p,p)}catch(x){}}}
 else if(t.id==='qm-n'&&UI.qmf)UI.qmf.n=t.value;
 else if((t.id==='xc-z'||t.id==='xc-x'||t.id==='xc-y')&&UI.xcrop){UI.xcrop[t.id.slice(3)]=+t.value;xcDraw()}},true);
(()=>{let dr=null;document.addEventListener('pointerdown',e=>{const c=e.target;if(c&&c.id==='xc-cv'&&UI.xcrop){dr={x:e.clientX,y:e.clientY,cx:UI.xcrop.x,cy:UI.xcrop.y};try{c.setPointerCapture(e.pointerId)}catch(x){}}},true);
 document.addEventListener('pointermove',e=>{if(!dr||!UI.xcrop||!XC.img)return;const cv=document.getElementById('xc-cv');if(!cv)return;const k=240/cv.getBoundingClientRect().width,im=XC.img,s=240/Math.min(im.width,im.height)*UI.xcrop.z,mx=(im.width*s-240)/2,my=(im.height*s-240)/2;
  if(mx>1)UI.xcrop.x=Math.max(-1,Math.min(1,dr.cx-(e.clientX-dr.x)*k/mx));if(my>1)UI.xcrop.y=Math.max(-1,Math.min(1,dr.cy-(e.clientY-dr.y)*k/my));
  ['x','y'].forEach(a=>{const i=document.getElementById('xc-'+a);if(i)i.value=UI.xcrop[a]});xcDraw()},true);
 document.addEventListener('pointerup',()=>{dr=null},true)})();
function qAllRow(e){const lt=e.meta.lt,on=UI.qe===e.xv;
 let h='<div class="card qar" data-xv="'+esc(e.xv)+'"><button class="qarh" data-a="qexp" data-v="'+esc(e.xv)+'" aria-expanded="'+on+'"><span class="row" style="gap:10px;flex-wrap:nowrap;align-items:flex-start">'+qThumb(e)+'<span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px"><span class="row" style="gap:6px;flex-wrap:nowrap"><b class="nm" style="flex:1;min-width:0;text-align:start">'+esc(e.n)+'</b>'+(e.plan.length?'<span class="tag">في الخطة الحالية</span>':'')+'</span>';
 if(!e.sets.length)h+='<span class="mu qnone">لم يُسجّل وزن بعد</span>';
 else{h+='<span class="mu qmax">أقصى وزن: <b class="num">'+esc(qWt(lt,e.max.w))+'</b> · <span class="num">'+e.max.date+'</span> · التكرارات <b class="num">'+F(e.max.r)+'</b></span>'+
  '<span class="mu qlast">آخر أداء <span class="num">'+e.lastDate+'</span> · المجموعات <b class="num">'+F(e.last.length)+'</b> · التكرارات <b class="num">'+e.last.map(q=>F(q.r)).join('، ')+'</b></span>'}
 h+='</span></span></button>';
 if(on){h+='<div class="qrec"><b>تطوّر الأوزان القياسية</b>';
  if(!e.rec.length)h+='<div class="mu qnone">لم يُسجّل وزن بعد</div>';
  else h+='<div class="qrr qrh3 mu"><span>الوزن</span><span>التاريخ</span><span>التكرارات</span></div>'+e.rec.slice().reverse().map(q=>'<div class="qrr"><b class="num">'+esc(qWt(lt,q.w))+'</b><span class="num">'+q.date+(q.leg?' · ملخص':'')+'</span><span class="num">'+F(q.r)+'</span></div>').join('');
  h+='<div class="row" style="gap:8px;margin:8px 0;flex-wrap:wrap"><button class="chip" data-a="qfull" data-v="'+esc(e.xv)+'">'+(UI.qf===e.xv?'إخفاء كامل سجل الأداء':'كامل سجل الأداء')+'</button><button class="chip" data-a="qxedit" data-v="'+esc(e.xv)+'">تعديل التمرين</button>'+
   (!e.sets.length&&!e.plan.length?'<button class="chip" data-a="qxdel" data-v="'+esc(e.xv)+'">'+(UI.qxd===e.xv?'تأكيد الإزالة':'إزالة من الأرشيف')+'</button>':'')+'</div>'+
   '<div class="row" style="gap:8px;margin:8px 0;flex-wrap:wrap"><select class="irsel" id="q-addd" aria-label="اليوم">'+DAYS.map((x,d)=>'<option value="'+d+'"'+(d===qDi(qDate())?' selected':'')+'>'+x+'</option>').join('')+'</select><button class="chip" data-a="qaddto" data-v="'+esc(e.xv)+'">أضف إلى الجدول</button></div>';
  if(UI.qf===e.xv)h+=qFullLog(e);
  const AR=irAtReps({pts:e.pts}),rs=Object.keys(AR).map(Number).sort((a,b)=>a-b);
  if(rs.length>0){const rsel=rs.indexOf(+UI.qr)>=0?+UI.qr:rs[rs.length-1],arr=AR[rsel];
   h+='<div class="mu" style="margin-top:8px"><b>مقارنة الوزن عند نفس التكرارات</b></div><div class="chips" style="margin:6px 0">'+rs.map(r=>'<button class="chip'+(r===rsel?' on':'')+'" data-a="qrep" data-v="'+r+'">'+r+' تكرارًا</button>').join('')+'</div>'+
    (arr.length?irChart(arr.map(a=>({y:a.w,date:a.date,sid:a.sid||'',leg:a.leg,i:''})),{aria:'الوزن عند '+rsel+' تكرارات'}):'')+'<div class="mu num">'+arr.map(a=>a.date+' · '+esc(qWt(lt,a.w))).join(' | ')+'</div>'}
  h+='</div>'}
 return h+'</div>'}
function qFullLog(e){const by={};e.sets.forEach(q=>{(by[q.date]=by[q.date]||[]).push(q)});
 return '<div class="qfull" id="q-full">'+Object.keys(by).sort().reverse().map(d=>'<div class="irdh num">'+d+'</div>'+by[d].map((q,i)=>'<div class="irset"><span class="num mu">'+(i+1)+'</span><b class="num">'+esc(qSet(e.meta.lt,q))+'</b>'+(q.leg?'<span class="mu">ملخص تاريخي</span>':'')+'<span class="sp"></span>'+(q.leg?'':'<button class="chip" data-a="qgoedit" data-d="'+d+'" data-v="'+esc(e.xv)+'">تعديل</button>')+'</div>').join('')).join('')+'</div>'}
function qToolRow(ic0,tx,sub,a){return '<button class="sjrow" '+a+'>'+sjI('tr',ic0)+'<span class="t">'+tx+'<small>'+sub+'</small></span>'+ic('next')+'</button>'}
/* كل ما يخص التدريب في مكان واحد: الخطة الحالية، أرشيف تماريني، ثم الأدوات (الجدول، التقدّم، السجل، الأجهزة) */
function qIronView(){irEns();const t=UI.qt||'cur';
 if(t==='prog'||t==='log'){UI.irt=t;return trkBack()+'<div class="row" style="margin:0 0 8px"><button class="chip" data-a="qtab" data-v="cur">'+ic('back')+'العودة إلى خطتي</button></div><h1>'+(t==='prog'?'التقدّم والأوزان القياسية':'سجل الأداء والأحداث')+'</h1><div id="ir-body">'+(t==='prog'?irProgTab():irLogTab())+'</div>'}
 return trkBack()+'<h1>خطتي</h1>'+qTabs()+'<div id="ir-body">'+(t==='all'?qAllTab():qCurTab())+'</div>'+
  '<div class="sjsec">أدوات التدريب</div>'+qToolRow('cal','إنشاء الجدول وتعديله','الأيام والتمارين والمجموعات','data-a="sub" data-v="plan" id="q-t-plan"')+qToolRow('chart','التقدّم والأوزان القياسية','رسوم التمارين والعضلات','data-a="qtab" data-v="prog" id="q-t-prog"')+qToolRow('box','سجل الأداء','كل الأحداث والتعديلات','data-a="qtab" data-v="log" id="q-t-log"')+qToolRow('dumbbell','الأجهزة الرياضية','دليل الأجهزة','data-a="sub" data-v="nau" id="q-t-nau"')}
vIron=qIronView;

/* ---------- الأوامر ---------- */
function qOpenEd(xv,date){const sets=qSets(date,xv);UI.qx=xv;UI.qpre=null;
 if(sets.length){UI.qrows=sets.map(h=>({i:sxSid(h.q),w:+h.q.w||0,r:h.q.r}));return}
 const ref=qRefLast(xv,date),row=qRowFor(date,xv),ra=(ref&&ref.sets)||[],n=Math.max(1,Math.min(12,(row&&+row.s)||ra.length||3));
 UI.qrows=Array.from({length:n},(_,i)=>{const b=ra[i]||ra[ra.length-1];return{w:b?(+b.w||0):(row&&+row.tw||0),r:b?b.r:((row&&+row.r)||10)}});
 if(ra.length)UI.qpre=xv}
Object.assign(ACT,{
 qtab:b=>{UI.qt=b.dataset.v;UI.qx=null;UI.qcu=0;UI.qadd=null;UI.qmf=null;UI.xcrop=null;window.scrollTo(0,0)},
 qday:b=>{const d=new Date(qDate()+'T12:00:00');d.setDate(d.getDate()+(+b.dataset.v));const x=iso(d);if(x>TD()){toast('لا يمكن التسجيل في تاريخ قادم');return false}UI.qd=x;UI.qx=null;UI.qdp=0},
 qtoday:()=>{UI.qd=TD();UI.qx=null;UI.qdp=0},
 qpick:()=>{UI.qdp=!UI.qdp},
 qdgo:()=>{const x=qReadDate('qd');if(!x)return false;if(x>TD()){toast('لا يمكن التسجيل في تاريخ قادم');return false}UI.qd=x;UI.qdp=0;UI.qx=null},
 qxopen:b=>{const dt=b.dataset.date||qDate();if(dt>TD()){toast('لا يمكن التسجيل في تاريخ قادم');return false}UI.qxdt=dt;UI.qpe=null;qOpenEd(b.dataset.v,dt)},
 qxclose:()=>{UI.qx=null;UI.qrows=null;return},
 qradd:()=>{const r=UI.qrows||(UI.qrows=[]),l=r[r.length-1]||{w:0,r:10};if(r.length>=12){toast('الحد الأقصى 12 مجموعة');return false}r.push({w:l.w,r:l.r})},
 qrdup:b=>{const r=UI.qrows,i=+b.dataset.i;if(!r||!r[i])return false;r.splice(i+1,0,{w:r[i].w,r:r[i].r})},
 qrdel:b=>{const r=UI.qrows,i=+b.dataset.i;if(!r||!r[i])return false;r.splice(i,1);if(!r.length)r.push({w:0,r:10})},
 qcopylast:b=>{const ref=qRefLast(b.dataset.v,UI.qxdt||qDate());if(!ref||!(ref.sets||[]).length)return false;UI.qrows=ref.sets.map(q=>({w:+q.w||0,r:q.r}));UI.qpre=b.dataset.v},
 qxsave:b=>{const xv=b.dataset.v,name=b.dataset.n,rows=(UI.qrows||[]).map(q=>({i:q.i,w:qNum(q.w),r:Math.round(qNum(q.r))}));
  if(!rows.some(q=>q.r>0)&&!rows.some(q=>q.i)){toast('أدخل التكرارات لمجموعة واحدة على الأقل');return false}
  const n=qSave(UI.qxdt||qDate(),xv,name,rows);UI.qx=null;UI.qrows=null;toast(n?'حُفظ الأداء':'لا تغيير')},
 qmvday:b=>{const d=+b.dataset.d,i=+b.dataset.i,to=+(document.getElementById('q-mvd-'+i)||{}).value;if(to===d||isNaN(to))return false;const e=S.plan[d].ex[i];if(!e)return false;
  if(irPlanHas(to,irXvOf({id:e.id,n:e.n}))){toast('التمرين موجود في اليوم الآخر');return false}qMgFix(d);S.plan[d].ex.splice(i,1);S.plan[to].ex.push(e);qMgFix(to);UI.qpe=null;irLog('asg',{xv:irXvOf({id:e.id,n:e.n}),n:e.n,d:to,plan:1,pd:TD(),id:e.id});toast('نُقل إلى '+DAYS[to])},
 qrm:b=>{qMgFix(+b.dataset.d);UI.qpe=null;return ACT.irrm(b)},
 qaddo:()=>{UI.qadd='pick'},qaddx:()=>{UI.qadd=null;UI.qmf=null;UI.xcrop=null;XC.img=null},
 qaddm:b=>{UI.qadd=b.dataset.v;if(b.dataset.v==='man'&&!UI.qmf)UI.qmf=qMfNew()},
 qcust:()=>{UI.qt='all';UI.qadd='man';UI.qmf=qMfNew();window.scrollTo(0,0)},
 qlibadd:b=>{const x=XL.find(a=>a.id===b.dataset.v);if(!x)return false;const xv=irXv(x.n);irEns();if(S.xr[xv]){toast('موجود في أرشيفك');return false}irReg(xv,x.n);UI.qe=xv;toast('أُضيف إلى أرشيف تماريني: '+x.n)},
 qmimgx:()=>{qMfRead();if(UI.qmf)UI.qmf.img=''},
 xcok:()=>{if(!UI.qmf||!XC.img)return false;qMfRead();UI.qmf.img=xcOut();UI.xcrop=null;XC.img=null},
 xcx:()=>{UI.xcrop=null;XC.img=null},
 qmcancel:()=>{UI.qadd=null;UI.qax=null;UI.qmf=null;UI.xcrop=null;XC.img=null},
 qxedit:b=>{const xv=b.dataset.v,m=qMeta(xv,(qAll()[xv]||{}).n),r=(S.xr||{})[xv]||{};UI.qadd='man';UI.qmf={xv:xv,n:m.n,g:m.g||'chest',t:m.lt||'w',s:r.ds||3,r:r.dr||10,w:'',pr:5,d:TD(),img:XI[xv]||'',day:''};window.scrollTo(0,0)},
 qxdel:b=>{const xv=b.dataset.v;if(UI.qxd!==xv){UI.qxd=xv;return}const e=qAll()[xv];if(!e||e.sets.length||e.plan.length){UI.qxd=null;toast('لا يمكن إزالة تمرين له أداء أو في الجدول');return false}
  delete S.xr[xv];delete XI[xv];xiSave();UI.qxd=null;UI.qe=null;toast('أُزيل من الأرشيف')},
 qmsave:()=>{qMfRead();const m=UI.qmf;if(!m)return false;const er=msg=>{const e=document.getElementById('qm-err');if(e)e.textContent=msg;toast(msg);return false};
  const name=irNorm(m.n);irEns();
  if(m.xv){const r=S.xr[m.xv]||(irReg(m.xv,m.n),S.xr[m.xv]);r.ds=m.s;r.dr=m.r;if(r.cu){r.g=m.g;r.lt=m.t;r.q=m.t==='bw'?'bw':''}
   if(m.img)XI[m.xv]=m.img;else delete XI[m.xv];if(!xiSave())return er('مساحة التخزين ممتلئة، احذف بعض الصور');UI.qe=m.xv;UI.qadd=null;UI.qmf=null;toast('حُفظ التعديل');return}
  if(!name)return er('اكتب اسم التمرين');
  if(irLib(name))return er('هذا التمرين موجود في القائمة. اختره من «من قائمة التمارين»');
  const xv=irXv(name);if(S.xr[xv])return er('هذا التمرين موجود في أرشيفك');
  let date=m.d||TD(),hasW=m.w!=='';if(hasW&&date>TD())return er('لا يمكن اختيار تاريخ مستقبلي');
  S.xr[xv]={n:name,g:m.g,s:[],q:m.t==='bw'?'bw':'',en:'',lt:m.t,cu:1,at:Date.now(),ds:m.s,dr:m.r};
  if(m.img){XI[xv]=m.img;if(!xiSave()){delete XI[xv];delete S.xr[xv];return er('مساحة التخزين ممتلئة، احذف بعض الصور')}}
  if(hasW)qSave(date,xv,name,[{w:+m.w||0,r:m.pr||5}]);
  if(m.day!==''){const r=irPlanAdd(+m.day,name,m.s,m.r,0);if(!r.dup)irLog('ex+',{xv:xv,n:name,d:+m.day,plan:1,pd:TD(),id:r.e.id})}
  if(m.day!=='')qMgFix(+m.day);UI.qe=xv;UI.qg='';UI.qs='';UI.qpl=false;UI.qadd=null;UI.qax=null;UI.qmf=null;toast('أُضيف إلى أرشيف تماريني'+(m.day!==''?' وإلى '+DAYS[+m.day]:''))},
 qdtog:b=>{const d=+b.dataset.v;UI.qdo=UI.qdo||{};UI.qdo[d]=!qOpenDay(d);UI.qx=null;UI.qpe=null},
 qmtog:b=>{const k=b.dataset.d+'|'+b.dataset.v;UI.qmo=UI.qmo||{};UI.qmo[k]=!qOpenMu(+b.dataset.d,b.dataset.v)},
 qopenall:()=>{UI.qdo={};UI.qmo={};for(let d=0;d<7;d++){UI.qdo[d]=true;qDayMg(d).forEach(s=>{UI.qmo[d+'|'+s]=true})}},
 qcloseall:()=>{UI.qdo={};UI.qmo={};UI.qx=null;UI.qpe=null;UI.qax=null;UI.qme=null;for(let d=0;d<7;d++){UI.qdo[d]=false;qDayMg(d).forEach(s=>{UI.qmo[d+'|'+s]=false})}},
 qpe:b=>{UI.qpe=UI.qpe===b.dataset.v?null:b.dataset.v;UI.qx=null},
 qpesave:b=>{const d=+b.dataset.d,i=+b.dataset.i,e=S.plan[d].ex[i],v=id=>+(document.getElementById(id)||{}).value||0;if(!e)return false;
  e.s=v('qpe-s')||e.s;e.r=v('qpe-r')||e.r;const w=v('qpe-w')+v('qpe-f');if(w>0)e.tw=w;else delete e.tw;UI.qpe=null;toast('حُفظ تعديل التمرين في الجدول')},
 qmv2:b=>{const d=+b.dataset.d,i=+b.dataset.i,v=+b.dataset.v,a=S.plan[d].ex;if(!a[i])return false;const sec=qExSec(a[i]);let k=i+v;while(k>=0&&k<a.length&&qExSec(a[k])!==sec)k+=v;if(k<0||k>=a.length)return false;const x=a[i];a[i]=a[k];a[k]=x;qMgFix(d)},
 qmeo:b=>{const d=+b.dataset.d;UI.qme={d:d,sel:qDayMg(d).slice(),conf:0};UI.qax=null},
 qmex:()=>{UI.qme=null},
 qmesave:b=>{const m=UI.qme;if(!m)return false;const d=m.d,p=S.plan[d],cur=qDayMg(d),sel=m.sel.slice(),rem=cur.filter(k=>sel.indexOf(k)<0),lost=p.ex.filter(e=>rem.indexOf(qExSec(e))>=0);
  if(lost.length&&!m.conf){m.conf=1;return}
  p.ex=p.ex.filter(e=>lost.indexOf(e)<0);p.mg=cur.filter(k=>sel.indexOf(k)>=0).concat(sel.filter(k=>cur.indexOf(k)<0));p.t=p.mg.map(qSecShort).join(' و')||p.t;
  lost.forEach(e=>irLog('ex-',{xv:irXvOf({id:e.id,n:e.n}),n:e.n,d:d,plan:1,pd:TD()}));
  UI.qme=null;UI.qpe=null;UI.qx=null;toast(lost.length?'حُفظت العضلات وأُزيلت '+lost.length+' تمرين من الجدول':'حُفظت عضلات اليوم')},
 qaxo:b=>{UI.qax={d:+b.dataset.d,sec:b.dataset.v};UI.qxq='';UI.qx=null},
 qaxx:()=>{UI.qax=null;UI.qmf=null;UI.xcrop=null;XC.img=null},
 qaxm:b=>{UI.qax={d:+b.dataset.d,sec:b.dataset.v,man:1};UI.qmf=Object.assign(qMfNew(),{g:b.dataset.v==='legs'?'quad':b.dataset.v,day:String(+b.dataset.d)})},
 qpadd:b=>{const d=+b.dataset.d,v=b.dataset.v;let name;if(v.indexOf('lib:')===0){const x=XL.find(a=>a.id===v.slice(4));if(!x)return false;name=x.n}else{const e=qAll()[v];if(!e)return false;name=e.n}
  const xv=irXv(name),xr=(S.xr||{})[xv]||{};qMgFix(d);const r=irPlanAdd(d,name,xr.ds||3,xr.dr||10,0);
  if(r.dup){toast('التمرين موجود في هذا اليوم');return false}irLog('ex+',{xv:r.xv,n:name,d:d,plan:1,pd:TD(),id:r.e.id});qMgFix(d);UI.qax=null;toast('أُضيف إلى '+DAYS[d]+' وإلى أرشيف تماريني')},
 qgrp:b=>{UI.qg=b.dataset.v},
 qexp:b=>{UI.qe=UI.qe===b.dataset.v?null:b.dataset.v;UI.qf=null;UI.qr=null},
 qfull:b=>{UI.qf=UI.qf===b.dataset.v?null:b.dataset.v},
 qrep:b=>{UI.qr=+b.dataset.v},
 qaddto:b=>{const xv=b.dataset.v,e=qAll()[xv],d=+(document.getElementById('q-addd')||{}).value;if(!e||isNaN(d))return false;const xr=(S.xr||{})[xv]||{};qMgFix(d);const r=irPlanAdd(d,e.n,xr.ds||3,xr.dr||10,0);qMgFix(d);
  if(!r.dup)irLog('ex+',{xv:xv,n:e.n,d:d,plan:1,pd:TD(),id:r.e.id});toast(r.dup?'التمرين موجود في هذا اليوم':'أُضيف إلى '+DAYS[d])},
 qgoedit:b=>{UI.qt='cur';UI.qd=b.dataset.d;UI.qdp=0;UI.qxdt=b.dataset.d;qOpenEd(b.dataset.v,b.dataset.d);window.scrollTo(0,0)}});
document.addEventListener('input',e=>{const t=e.target;if(!t)return;
 if(t.id==='qs'){UI.qs=t.value;const p=t.selectionStart;render();const n=document.getElementById('qs');if(n){n.focus();try{n.setSelectionRange(p,p)}catch(x){}}}
 else if(t.id&&t.id.indexOf('qc-')===0&&t.tagName==='INPUT'){UI.ird=UI.ird||{};UI.ird[t.id]=t.value}},true);
document.addEventListener('change',e=>{const t=e.target;if(!t)return;
 if(t.id==='qpl'){UI.qpl=t.checked;render();return}
 if(t.id==='q-cnt'&&UI.qrows){const n=+t.value,r=UI.qrows;while(r.length>n)r.pop();while(r.length<n){const l=r[r.length-1]||{w:0,r:10};r.push({w:l.w,r:l.r})}render();return}
 if(t.tagName==='SELECT'&&t.dataset&&t.dataset.qr&&UI.qrows){const i=+t.dataset.qr.split(',')[0],r=UI.qrows[i],row=t.closest('.qrow');if(!r||!row)return;
  const q=a=>row.querySelector('[data-qr="'+i+','+a+'"]');r.w=(+q('w').value||0)+(+q('f').value||0);r.r=+q('r').value}},true);

/* ---------- لا بدء ولا استئناف ولا إنهاء: كل المداخل القديمة تفتح خطتي ---------- */
function qGoPlan(date){S.tab='train';S.sub=null;UI.trk='irs';UI.qt='cur';UI.qd=date||TD();UI.qx=null;UI.qdp=0;UI.ses=null;UI.sum=null;window.scrollTo(0,0)}
Object.assign(ACT,{wkstart:()=>{qGoPlan(TD())},sxres:b=>{const s=S.sx[b.dataset.v];qGoPlan(s?s.date:TD())},mkpick:()=>{const d=new Date();d.setDate(d.getDate()-1);qGoPlan(iso(d))},
 smres:()=>{qGoPlan(TD())},tkqs:b=>{S.tab='train';UI.trk=b.dataset.k==='iron'?'irs':b.dataset.k;UI.ql='';if(b.dataset.k==='iron'){qGoPlan(TD())}},
 irstart:()=>{qGoPlan(TD())},irfin:()=>false,tkpause:()=>false,tkend:()=>false,tkopen:()=>{qGoPlan(TD())}});
sxGo=function(s,d){qGoPlan(s?s.date:TD())};

/* ======================= تسجيل مباشر لكل الرياضات بعد النشاط (الجري، السباحة، الكالسثينكس، كروسفت) ======================= */
const qTkDay=()=>qDate();
function qTkAdd(k,acc,d,plan,extra){const day=qTkDay(),n=SJ().ss.filter(x=>x.day===day).length,s=Object.assign({id:tkId(),k:k,st:'done',day:day,t0:qNoon(day),t1:qNoon(day)+(n+1)*1000,acc:Math.max(0,Math.round(acc)),ra:null,plan:plan||null,src:'يدوي',man:1,d:d||{}},extra||{});
 SJ().ss.push(s);tkCalc(s);return s}
function qTkForm(k){const d=qTkDay();let h='<div class="card" id="q-tkf"><h2>'+ic('plus')+'سجّل نشاط '+esc(qFmt(d))+'</h2>';
 const mins='<label class="irf"><span class="mu">المدة (دقيقة)</span><input class="irin num" dir="ltr" inputmode="numeric" data-tf="mm'+k+'" value="'+esc(tkF('mm'+k))+'" placeholder="0"></label>';
 if(k==='run'||k==='swim'){const sw=k==='swim',u=sw?(tkF('mu')||swCfg().u):'km';
  h+='<div class="g3">'+mins+'<label class="irf"><span class="mu">المسافة ('+(sw?(u==='yd'?'ياردة':'متر'):'كم')+')</span><input class="irin num" dir="ltr" inputmode="decimal" data-tf="ml'+k+'" value="'+esc(tkF('ml'+k))+'" placeholder="0"></label>'+(sw?'<label class="irf"><span class="mu">الوحدة</span><select class="irsel" data-tf="mu"><option value="m"'+(u!=='yd'?' selected':'')+'>متر</option><option value="yd"'+(u==='yd'?' selected':'')+'>ياردة</option></select></label>':'')+'</div>'}
 if(k==='cali'){const sel=UI.qck||CSK[0].id,sk=caSk(sel),si=Math.min(caSt(sel).i,sk.st.length-1),rows=UI.qcr||(UI.qcr=[{v:'',w:''}]);
  h+='<div class="chips" style="margin-bottom:8px">'+CSK.map(x=>'<button class="chip'+(x.id===sel?' on':'')+'" data-a="qcsk" data-v="'+x.id+'">'+x.n+'</button>').join('')+'</div>'+
   '<label class="f">المرحلة<select class="irsel" data-tf="cst">'+sk.st.map((s,i)=>'<option value="'+i+'"'+(i===(+(tkF('cst')||si))?' selected':'')+'>'+s.n+'</option>').join('')+'</select></label>'+
   '<label class="f">المساعدة<select class="irsel" data-tf="cas"><option value="none">بلا</option><option value="band">رباط</option><option value="machine">جهاز</option></select></label>'+
   rows.map((r,i)=>'<div class="qrow row" style="gap:6px;flex-wrap:nowrap"><span class="num mu" style="min-width:18px">'+(i+1)+'</span><input class="irin num" dir="ltr" inputmode="numeric" data-qc="'+i+',v" placeholder="'+(sk.m==='hold'?'ثبات (ث)':'تكرار')+'" value="'+esc(r.v)+'"><input class="irin num" dir="ltr" inputmode="decimal" data-qc="'+i+',w" placeholder="وزن إضافي" value="'+esc(r.w)+'"><button class="chip" data-a="qcdup" data-i="'+i+'">نسخ</button><button class="chip" data-a="qcdel" data-i="'+i+'" aria-label="حذف">'+ic('x')+'</button></div>').join('')+
   '<div class="row" style="gap:8px;margin:8px 0"><button class="chip" data-a="qcadd">＋ مجموعة</button></div><div class="g3">'+mins+'</div>'}
 if(k==='fn'){const T=fnAll(),id=UI.qfn||T[0].id,t=T.find(a=>a.id===id)||T[0],sc=UI.qfs||'rx',fm=t.fmt,fin=tkF('ff')!=='p';
  h+='<div class="chips" style="margin-bottom:8px">'+T.map(x=>'<button class="chip'+(x.id===t.id?' on':'')+'" data-a="qfnt" data-v="'+x.id+'">'+esc(x.n)+'</button>').join('')+'</div>'+
   '<div class="mu" style="margin-bottom:6px">'+FN_F[fm]+(t.cap?' · سقف '+F(t.cap)+' د':'')+(t.rounds?' · '+F(t.rounds)+' جولات':'')+' · '+t.mv.map(m=>esc(m[0])+' '+F(m[1])).join('، ')+'</div>'+
   '<div class="row" style="gap:6px;margin-bottom:8px">'+[['rx','قياسية'],['sc','معدّلة']].map(x=>'<button class="chip'+(sc===x[0]?' on':'')+'" data-a="qfsc" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  const inp=(n,l,ph)=>'<label class="irf"><span class="mu">'+l+'</span><input class="irin num" dir="ltr" inputmode="numeric" data-tf="'+n+'" value="'+esc(tkF(n))+'" placeholder="'+(ph||'0')+'"></label>';
  if(fm==='amrap')h+='<div class="g3">'+inp('fr','الجولات')+inp('fx','تكرارات إضافية')+'</div>';
  else if(fm==='emom')h+='<div class="g3">'+inp('fi','دقائق مكتملة','0')+'</div>';
  else{h+='<label class="f">الحالة<select class="irsel" data-tf="ff" data-a="qff"><option value="f"'+(fin?' selected':'')+'>أنهيت كل الجولات</option><option value="p"'+(fin?'':' selected')+'>لم أُنهِ (جزئي)</option></select></label>';
   h+=fin?'<div class="g3">'+inp('fm','الدقائق')+inp('fs','الثواني')+'</div>':'<div class="g3">'+inp('fr','جولات كاملة')+inp('fx','تكرارات إضافية')+'</div>'}}
 h+='<div class="row" style="margin-top:10px"><span class="sp"></span><button class="btn" data-a="qtkpush" data-k="'+k+'" id="q-tk-save">حفظ في السجل</button></div></div>';return h}
tkLogCard=function(k){const f=k||UI.lf||'all',L=tkAllLog(f);
 let h='<div class="card" id="tk-log"><h2>'+ic('chart')+' سجل '+(k?TKN(k):'التمارين')+'</h2>';
 if(!k)h+='<div class="sjflt">'+[['all','الكل']].concat(TK.map(t=>[t[0],t[1]])).map(t=>'<button class="chip'+(f===t[0]?' on':'')+'" data-a="tkflt" data-v="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>';
 const days=new Set(L.map(x=>x.day));h+='<div class="row" style="margin:8px 0"><span class="mu">أيام التدريب</span><b class="num">'+F(days.size)+'</b></div>';
 h+=L.length?L.slice(0,40).map(x=>'<div class="row sjli"><span class="tag">'+TKN(x.k)+'</span><span style="flex:1">'+x.line+'</span><span class="mu">'+tkDay(x.day)+'</span>'+(x.id?'<button class="chip" data-a="qtkdel" data-id="'+x.id+'" aria-label="حذف">'+(UI.qdd===x.id?'تأكيد الحذف':ic('x'))+'</button>':'')+'</div>').join(''):'<div class="mu">لا يوجد سجل بعد.</div>';
 return h+'</div>'}
tkView=function(k){if(k==='dl')return tkBackH()+tkDeadlift();qMigrate();
 return trkBack()+'<h1>'+TKN(k)+'</h1>'+qDateBar()+qTkForm(k)+tkLogCard(k)+tkProg(k)};
trkSub=function(k){if(k==='iron'){const t=TD(),p=S.plan[qDi(t)],n=Object.keys(qDayEx(t)).length;return p.ex.length?esc(p.t||'تمرين')+' · '+F(n)+'/'+F(p.ex.length)+' سُجّلت':(n?F(n)+' تمارين سُجّلت':'يوم راحة')}
 const l=tkDone(k)[0];return l?'آخر نشاط: '+tkDay(l.day):'سجّل أول نشاط'};
Object.assign(ACT,{
 qcsk:b=>{UI.qck=b.dataset.v;UI.tf=UI.tf||{};UI.tf.cst=''},
 qcadd:()=>{const r=UI.qcr||(UI.qcr=[]),l=r[r.length-1]||{v:'',w:''};r.push({v:l.v,w:l.w})},
 qcdup:b=>{const r=UI.qcr,i=+b.dataset.i;if(!r||!r[i])return false;r.splice(i+1,0,{v:r[i].v,w:r[i].w})},
 qcdel:b=>{const r=UI.qcr,i=+b.dataset.i;if(!r||!r[i])return false;r.splice(i,1);if(!r.length)r.push({v:'',w:''})},
 qfnt:b=>{UI.qfn=b.dataset.v;UI.tf=UI.tf||{};UI.tf.ff='';UI.tf.fr=UI.tf.fx=UI.tf.fi=UI.tf.fm=UI.tf.fs=''},
 qfsc:b=>{UI.qfs=b.dataset.v},qff:()=>false,
 qtkdel:b=>{if(UI.qdd!==b.dataset.id){UI.qdd=b.dataset.id;return}const a=SJ().ss,i=a.findIndex(x=>x.id===b.dataset.id);if(i>=0)a.splice(i,1);UI.qdd=null;toast('حُذف من السجل')},
 qtkpush:b=>{const k=b.dataset.k,m=tkNum(tkF('mm'+k))||0;let s;UI.tf=UI.tf||{};
  if(k==='run'||k==='swim'){const l=tkNum(tkF('ml'+k))||0;if(!(m>0)&&!(l>0)){toast('أدخل المدة أو المسافة');return false}
   if(k==='run')s=qTkAdd('run',m*60000,{dist:l||'',laps:[],mode:'manual'});
   else{const c=swCfg(),u=tkF('mu')||c.u;s=qTkAdd('swim',m*60000,{ven:'open',pool:c.pool,u:u==='yd'?'yd':'m',sets:[],open:{dist:l||''}})}}
  else if(k==='cali'){const id=UI.qck||CSK[0].id,sk=caSk(id),i=Math.min(+(tkF('cst')||caSt(id).i),sk.st.length-1),as=tkF('cas')||'none',rows=(UI.qcr||[]).map(r=>({v:tkNum(r.v)||0,w:tkNum(r.w)||0})).filter(r=>r.v>0);
   if(!rows.length){toast(sk.m==='hold'?'أدخل ثواني الثبات لمجموعة واحدة على الأقل':'أدخل التكرارات لمجموعة واحدة على الأقل');return false}
   const day=qTkDay();s=qTkAdd('cali',m*60000,{ents:rows.map((r,j)=>({sk:id,i:i,v:sk.st[i].n,m:sk.m,val:r.v,as:as,w:r.w,sd:'both',at:qNoon(day)+j*1000})),eq:caCfg().eq});UI.qcr=[{v:'',w:''}]}
  else{const T=fnAll(),t=T.find(a=>a.id===(UI.qfn||T[0].id))||T[0],fm=t.fmt,sc=UI.qfs||'rx',fin=tkF('ff')!=='p',r=Math.round(tkNum(tkF('fr'))||0),x=Math.round(tkNum(tkF('fx'))||0),iv=Math.min(t.cap||99,Math.round(tkNum(tkF('fi'))||0)),sec=Math.round((tkNum(tkF('fm'))||0)*60+(tkNum(tkF('fs'))||0));
   const plan={id:t.id,n:t.n,ver:t.ver||1,fmt:fm,cap:t.cap||0,rounds:t.rounds||0,mv:JSON.parse(JSON.stringify(t.mv)),sc:sc,eq:''};let d={r:0,m:0,ex:0,iv:[],undo:[]},acc=0;
   if(fm==='amrap'){if(!(r>0||x>0)){toast('أدخل الجولات أو التكرارات');return false}d.r=r;d.ex=x;acc=(t.cap||0)*60000}
   else if(fm==='emom'){if(!(iv>0)){toast('أدخل الدقائق المكتملة');return false}d.iv=Array.from({length:iv},(_,i)=>i+1);acc=iv*60000}
   else if(fin){if(!(sec>0)){toast('أدخل الزمن');return false}d.r=t.rounds||0;acc=sec*1000}
   else{if(!(r>0||x>0)){toast('أدخل الجولات أو التكرارات');return false}d.r=r;d.ex=x;acc=(t.cap||0)*60000}
   s=qTkAdd('fn',acc,d,plan)}
  ['mm'+k,'ml'+k,'fr','fx','fi','fm','fs','ff'].forEach(n=>{UI.tf[n]=''});toast('حُفظ في السجل · '+qFmt(qTkDay()))}});
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.qc&&UI.qcr){const p=t.dataset.qc.split(','),r=UI.qcr[+p[0]];if(r)r[p[1]]=t.value}},true);

Object.assign(ACT,{tkplan:b=>{S.tab='train';UI.trk=b.dataset.k;UI.ses=null;UI.sum=null;window.scrollTo(0,0)},
 tkqs:b=>{const k=b.dataset.k;UI.ql='';if(k==='iron'){qGoPlan(TD());return}S.tab='train';UI.trk=k;UI.ses=null;UI.sum=null;window.scrollTo(0,0)},
 tkopen:b=>{const s=tkFind(b.dataset.id);S.tab='train';UI.trk=s?s.k:'hub';UI.ses=null;UI.sum=null;window.scrollTo(0,0)},
 mkpick:()=>{const d=new Date();d.setDate(d.getDate()-1);qGoPlan(iso(d));UI.qdp=1}});
(()=>{const Q=tkQuick;tkQuick=function(){const h=Q.apply(this,arguments);return typeof h==='string'?h.replace('ابدأ جلسة','سجّل أداءً').replace('سجّل نشاطًا سابقًا','سجّل بتاريخ سابق'):h};
 const B=tkTodayBlock;tkTodayBlock=function(){const h=B.apply(this,arguments);return typeof h==='string'?h.replace(/>ابدأ<\/button>/g,'>سجّل</button>').replace(/>استكمل<\/button>/g,'>سجّل</button>'):h};
 const V=vToday;vToday=function(){const h=V.apply(this,arguments);return typeof h==='string'?h.replace(' · لم تبدأ بعد','').replace(' · جزئية','').replace('جلسات مكتملة</div>','أيام تدريب</div>').replace(' تمارين مكتملة',' تمارين سُجّلت'):h}})();

/* ---------- يوم التدريب: وجود أداء محفوظ لذلك التاريخ، ويُحسب مرة واحدة ---------- */
function qTrainDays(wk){const set=new Set();
 sxList().forEach(s=>{if(wkey(s.date)!==wk)return;if(s.ex.some(x=>irSets(x).length))set.add(s.date)});
 SJ().ss.forEach(s=>{if(s.st==='done'&&s.day&&wkey(s.day)===wk)set.add(s.day)});return set}
wkDays=function(){const set=qTrainDays(W());let t=0;S.plan.forEach(p=>{if(p.ex.length)t++});return{n:set.size,t:Math.max(t,set.size)}};
sxHero=function(rest,late){const td=TD(),n=Object.keys(qDayEx(td)).length,ms=0;
 return{mk:'<button class="btn ghost" style="width:100%;margin-top:8px" data-a="mkpick" id="mk-go">'+ic('cal')+'سجّل بتاريخ سابق</button>',
  note:n?'<div class="tag" style="margin:10px 0 0" id="sx-partial">'+ic('check')+' سُجّل اليوم · '+F(n)+' '+(n>1?'تمارين':'تمرين')+'</div>':'',
  btn:'<button class="btn big" style="flex:1;min-width:0;padding-inline:10px" data-a="wkstart" id="sx-go">'+ic('plus')+(n?'أضف أداءً':'سجّل أداء اليوم')+'</button>'}};
