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

/* ---------- الأرقام القياسية والأرقام العامة ---------- */
function qMeta(xv,name){const m=irMeta(xv,name),r=(S.xr||{})[xv]||{};return Object.assign({},m,{lt:r.lt||(m.q==='bw'?'bw':(/مساعد/.test(m.n||name||'')?'as':'w'))})}
function qWt(lt,w){w=+w||0;if(lt==='bw'||lt==='add')return w?('+'+F(w,2)+' كغ إضافي'):'وزن الجسم';if(lt==='as')return w?('مساعدة '+F(w,2)+' كغ'):'بلا مساعدة';return F(w,2)+' كغ'}
const qSet=(lt,q)=>qWt(lt,q.w)+' × '+F(q.r);
/* أفضل: الأعلى وزنًا (الأقل مساعدةً للمساعَد)، وعند التساوي الأكثر تكرارًا */
const qBetter=(lt,a,b)=>{if(!b)return true;const x=lt==='as'?-a.w:a.w,y=lt==='as'?-b.w:b.w;return x>y||(x===y&&a.r>b.r)};
function qAll(){const H=irHist(),M={};
 const add=(xv,n)=>{if(!M[xv])M[xv]={xv:xv,n:n,meta:qMeta(xv,n),pts:[],plan:[],sets:[]};return M[xv]};
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
function qTabs(){const t=UI.qt||'cur';return '<div class="seg irtabs" role="tablist">'+[['cur','الخطة الحالية'],['all','الخطة الشاملة']].map(x=>'<button role="tab" aria-selected="'+(x[0]===t)+'" class="'+(x[0]===t?'on':'')+'" data-a="qtab" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'}
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
function qEditor(date,xv,name,row,lt){const rows=UI.qrows||[],ref=qRefLast(xv,date,lt);
 let h='<div class="qed" id="q-editor"><div class="mu" style="margin:4px 0">'+qRefTx(ref,lt)+(ref&&(ref.sets||[]).length?' <button class="chip" data-a="qcopylast" data-v="'+esc(xv)+'">انسخ آخر أداء</button>':'')+'</div>';
 rows.forEach((q,i)=>{h+='<div class="qrow row" style="gap:6px;flex-wrap:nowrap" data-i="'+i+'"><span class="num mu" style="min-width:18px">'+(i+1)+'</span>'+
  '<input class="irin num" dir="ltr" inputmode="decimal" data-qr="'+i+',w" placeholder="'+(lt==='bw'?'إضافي':lt==='as'?'مساعدة':'كغ')+'" value="'+esc(q.w===''?'':q.w)+'" aria-label="الوزن">'+
  '<input class="irin num" dir="ltr" inputmode="numeric" data-qr="'+i+',r" placeholder="'+(row&&row.r?row.r:'تكرار')+'" value="'+esc(q.r===''?'':q.r)+'" aria-label="التكرارات">'+
  '<button class="chip" data-a="qrdup" data-i="'+i+'" aria-label="نسخ المجموعة">نسخ</button><button class="chip" data-a="qrdel" data-i="'+i+'" aria-label="حذف المجموعة">'+ic('x')+'</button></div>'});
 h+='<div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button class="chip" data-a="qradd">＋ مجموعة</button><span class="sp"></span><button class="chip" data-a="qxclose">إلغاء</button><button class="btn sm" data-a="qxsave" data-v="'+esc(xv)+'" data-n="'+esc(name)+'">حفظ الأداء</button></div></div>';
 return h}
function qExCard(date,xv,name,row,idx,cnt){const lt=qMeta(xv,name).lt,sets=qSets(date,xv),open=UI.qx===xv;
 let h='<div class="card qx" data-xv="'+esc(xv)+'"><div class="row" style="flex-wrap:nowrap;gap:8px"><b class="nm" style="flex:1;min-width:0">'+esc(name)+'</b>'+(row?'<span class="mu num">'+row.s+'×'+row.r+(row.tw?' · هدف '+esc(qWt(lt,row.tw)):'')+'</span>':'<span class="tag">خارج الجدول</span>')+'</div>';
 h+='<div style="margin:4px 0">'+qRefTx(qRefLast(xv,date,lt),lt)+'</div>';
 if(sets.length&&!open)h+='<div class="qsaved">'+sets.map((h2,i)=>'<span class="irset"><span class="num mu">'+(i+1)+'</span><b class="num">'+esc(qSet(lt,h2.q))+'</b></span>').join('')+'</div>';
 else if(!open)h+='<div class="mu">لم يُسجَّل أداء لهذا اليوم</div>';
 if(open)h+=qEditor(date,xv,name,row,lt);
 else{h+='<div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn sm" data-a="qxopen" data-v="'+esc(xv)+'" id="q-open-'+idx+'">'+(sets.length?'تعديل الأداء':'تسجيل الأداء')+'</button>';
  if(row){const di=qDi(date);h+='<button class="chip" data-a="qmv" data-d="'+di+'" data-i="'+idx+'" data-v="-1" aria-label="أعلى">↑</button><button class="chip" data-a="qmv" data-d="'+di+'" data-i="'+idx+'" data-v="1" aria-label="أسفل">↓</button>'+
   '<select class="irsel" id="q-mvd-'+idx+'" aria-label="نقل إلى يوم">'+DAYS.map((x,d)=>'<option value="'+d+'"'+(d===di?' selected':'')+'>'+x+'</option>').join('')+'</select><button class="chip" data-a="qmvday" data-d="'+di+'" data-i="'+idx+'">نقل</button><button class="chip" data-a="qrm" data-d="'+di+'" data-i="'+idx+'">إزالة من الجدول</button>'}
  h+='</div>'}
 return h+'</div>'}
function qAddForm(date){const di=qDi(date),cust=Object.keys(S.xr||{}).filter(k=>k.indexOf('C.')===0).map(k=>S.xr[k].n);
 return '<div class="card" id="q-addf"><h2>'+ic('dumbbell')+'إضافة تمرين إلى '+DAYS[di]+'</h2><label class="f">التمرين من المكتبة أو تمارينك السابقة<input id="ir-an" list="qnames" placeholder="ابحث أو اكتب اسم التمرين" value="'+esc(irD('ir-an'))+'" autocomplete="off"></label>'+
  '<div class="g3" style="margin:8px 0"><label class="irf"><span class="mu">مجموعات</span>'+irIn('ir-as','3','3')+'</label><label class="irf"><span class="mu">تكرارات</span>'+irIn('ir-ar','10','10')+'</label><label class="irf"><span class="mu">وزن الهدف</span>'+irIn('ir-aw','اختياري','')+'</label></div>'+
  '<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn" data-a="qadd" data-d="'+di+'">إضافة إلى الجدول</button><button class="chip" data-a="qcust">تمرين مخصص</button></div>'+
  '<datalist id="qnames">'+XL.map(x=>'<option value="'+esc(x.n)+'">').join('')+cust.map(n=>'<option value="'+esc(n)+'">').join('')+'</datalist></div>'}
function qCustomForm(){return '<div class="card" id="q-cust"><h2>'+ic('plus')+'تمرين مخصص</h2><label class="f">الاسم<input id="qc-n" placeholder="مثال: سحب كابل بمقبض ضيق" value="'+esc(irD('qc-n'))+'" autocomplete="off"></label>'+
  '<label class="f">العضلة الأساسية<select id="qc-g" class="irsel">'+Object.keys(IRM).map(k=>'<option value="'+k+'">'+IRM[k]+'</option>').join('')+'</select></label>'+
  '<label class="f">نوع الحمل<select id="qc-t" class="irsel"><option value="w">وزن خارجي (كغ)</option><option value="bw">وزن الجسم أو إضافي</option><option value="as">مساعدة (جهاز مساعد)</option></select></label>'+
  '<div class="row" style="gap:8px;margin-top:8px"><button class="btn" data-a="qcsave">حفظ التمرين</button><button class="chip" data-a="qccancel">إلغاء</button></div></div>'}
function qCurTab(){const d=qDate(),di=qDi(d),p=S.plan[di]||{t:'',ex:[]};let h=qDateBar();
 h+='<div class="row" style="margin:10px 0;gap:8px"><span class="mu">'+(p.ex.length?esc(p.t||'تمرين اليوم'):'لا تمارين مجدولة لهذا اليوم')+'</span><span class="sp"></span><span class="tag" id="ir-sync">'+esc(irSyncTx())+'</span></div>';
 const inPlan=new Set();
 p.ex.forEach((e,i)=>{const xv=irXvOf({id:e.id,n:e.n});inPlan.add(xv);h+=qExCard(d,xv,e.n,e,i)});
 const extra=qDayEx(d);Object.keys(extra).filter(xv=>!inPlan.has(xv)).forEach(xv=>{h+=qExCard(d,xv,extra[xv].n,null,-1)});
 if(!p.ex.length&&!Object.keys(extra).length)h+='<div class="card mu">أضف تمرينًا إلى هذا اليوم ثم سجّل أداءه.</div>';
 return h+(UI.qcu?qCustomForm():qAddForm(d))}
function qAllTab(){const M=qAll(),g=UI.qg||'',s=irNorm(UI.qs||'').toLowerCase(),pl=!!UI.qpl;
 let L=Object.keys(M).map(k=>M[k]).filter(e=>(!g||(e.meta.g||'')===g)&&(!pl||e.plan.length)&&(!s||irNorm(e.n).toLowerCase().indexOf(s)>=0));
 const gs={};Object.keys(M).forEach(k=>{const x=M[k].meta.g||'';gs[x]=(gs[x]||0)+1});
 let h='<div class="card qflt"><input id="qs" class="irin" placeholder="ابحث في تمارينك" value="'+esc(UI.qs||'')+'" aria-label="بحث"><div class="chips" style="margin-top:8px"><button class="chip'+(!g?' on':'')+'" data-a="qgrp" data-v="">الكل</button>'+Object.keys(gs).sort().map(k=>'<button class="chip'+(g===k?' on':'')+'" data-a="qgrp" data-v="'+esc(k)+'">'+esc(irLbl(k))+'</button>').join('')+'</div><label class="row" style="gap:6px;margin-top:8px"><input type="checkbox" id="qpl" '+(pl?'checked':'')+'><span>ضمن الخطة الحالية فقط</span></label></div>';
 if(!L.length)return h+'<div class="card mu" id="q-all-empty">لا تمارين بعد. أضف تمرينًا إلى خطتك الحالية فيظهر هنا مرة واحدة.</div>';
 const by={};L.forEach(e=>{const k=e.meta.g||'';(by[k]=by[k]||[]).push(e)});
 Object.keys(by).sort((a,b)=>irLbl(a)<irLbl(b)?-1:1).forEach(k=>{h+='<div class="sechead"><h2>'+esc(irLbl(k))+'</h2></div>';by[k].sort((a,b)=>a.n<b.n?-1:1).forEach(e=>{h+=qAllRow(e)})});
 return h}
function qAllRow(e){const lt=e.meta.lt,on=UI.qe===e.xv;
 let h='<div class="card qar" data-xv="'+esc(e.xv)+'"><button class="qarh" data-a="qexp" data-v="'+esc(e.xv)+'" aria-expanded="'+on+'"><span class="row" style="gap:8px;flex-wrap:nowrap"><b class="nm" style="flex:1;min-width:0;text-align:start">'+esc(e.n)+'</b>'+(e.plan.length?'<span class="tag">في الخطة الحالية</span>':'')+'</span>';
 if(!e.sets.length)h+='<span class="mu">لم يُسجّل أداء بعد</span>';
 else{h+='<span class="mu qmax">أقصى وزن: <b class="num">'+esc(qWt(lt,e.max.w))+'</b> × <span class="num">'+F(e.max.r)+'</span> · <span class="num">'+e.max.date+'</span></span>'+
  '<span class="mu qlast">آخر تسجيل <span class="num">'+e.lastDate+'</span>: <b class="num">'+F(e.last.length)+' '+(e.last.length===1?'مجموعة':'مجموعات')+'</b> · '+e.last.map(q=>esc(qSet(lt,q))).join(' · ')+'</span>'}
 h+='</button>';
 if(on){h+='<div class="qrec"><b>سجل الأرقام القياسية</b>';
  if(!e.rec.length)h+='<div class="mu">لا أرقام بعد.</div>';else h+=e.rec.map(q=>'<div class="irset"><b class="num">'+esc(qSet(lt,q))+'</b><span class="sp"></span><span class="mu num">'+q.date+(q.leg?' · ملخص':'')+'</span></div>').join('');
  h+='<div class="row" style="gap:8px;margin:8px 0;flex-wrap:wrap"><button class="chip" data-a="qfull" data-v="'+esc(e.xv)+'">'+(UI.qf===e.xv?'إخفاء كامل سجل الأداء':'كامل سجل الأداء')+'</button>'+
   '<select class="irsel" id="q-addd" aria-label="اليوم">'+DAYS.map((x,d)=>'<option value="'+d+'"'+(d===qDi(qDate())?' selected':'')+'>'+x+'</option>').join('')+'</select><button class="chip" data-a="qaddto" data-v="'+esc(e.xv)+'">أضف إلى الجدول</button></div>';
  if(UI.qf===e.xv)h+=qFullLog(e);
  const AR=irAtReps({pts:e.pts}),rs=Object.keys(AR).map(Number).sort((a,b)=>a-b);
  if(rs.length>0){const rsel=rs.indexOf(+UI.qr)>=0?+UI.qr:rs[rs.length-1],arr=AR[rsel];
   h+='<div class="mu" style="margin-top:8px"><b>مقارنة الوزن عند نفس التكرارات</b></div><div class="chips" style="margin:6px 0">'+rs.map(r=>'<button class="chip'+(r===rsel?' on':'')+'" data-a="qrep" data-v="'+r+'">'+r+' تكرارًا</button>').join('')+'</div>'+
    (arr.length?irChart(arr.map(a=>({y:a.w,date:a.date,sid:a.sid||'',leg:a.leg,i:''})),{aria:'الوزن عند '+rsel+' تكرارات'}):'')+'<div class="mu num">'+arr.map(a=>a.date+' · '+esc(qWt(lt,a.w))).join(' | ')+'</div>'}
  h+='</div>'}
 return h+'</div>'}
function qFullLog(e){const by={};e.sets.forEach(q=>{(by[q.date]=by[q.date]||[]).push(q)});
 return '<div class="qfull" id="q-full">'+Object.keys(by).sort().reverse().map(d=>'<div class="irdh num">'+d+'</div>'+by[d].map((q,i)=>'<div class="irset"><span class="num mu">'+(i+1)+'</span><b class="num">'+esc(qSet(e.meta.lt,q))+'</b>'+(q.leg?'<span class="mu">ملخص تاريخي</span>':'')+'<span class="sp"></span>'+(q.leg?'':'<button class="chip" data-a="qgoedit" data-d="'+d+'" data-v="'+esc(e.xv)+'">تعديل</button>')+'</div>').join('')).join('')+'</div>'}
function qIronView(){irEns();const t=UI.qt||'cur';
 if(t==='prog'||t==='log'){UI.irt=t;return trkBack()+'<div class="row" style="margin:0 0 8px"><button class="chip" data-a="qtab" data-v="cur">'+ic('back')+'العودة إلى خطتي</button></div><h1>'+(t==='prog'?'التقدّم':'سجل الأحداث')+'</h1><div id="ir-body">'+(t==='prog'?irProgTab():irLogTab())+'</div>'}
 return trkBack()+'<h1>خطتي</h1>'+qTabs()+'<div id="ir-body">'+(t==='all'?qAllTab():qCurTab())+'</div>'+
  '<div class="row" style="margin:14px 0;gap:8px;justify-content:center;flex-wrap:wrap"><button class="chip" data-a="qtab" data-v="prog">التقدّم والرسوم</button><button class="chip" data-a="qtab" data-v="log">سجل الأحداث</button></div>'}
vIron=qIronView;

/* ---------- الأوامر ---------- */
function qOpenEd(xv,date){const sets=qSets(date,xv);UI.qx=xv;UI.qrows=sets.length?sets.map(h=>({i:sxSid(h.q),w:h.q.w||'',r:h.q.r})):[{w:'',r:''}]}
Object.assign(ACT,{
 qtab:b=>{UI.qt=b.dataset.v;UI.qx=null;UI.qcu=0;window.scrollTo(0,0)},
 qday:b=>{const d=new Date(qDate()+'T12:00:00');d.setDate(d.getDate()+(+b.dataset.v));const x=iso(d);if(x>TD()){toast('لا يمكن التسجيل في تاريخ قادم');return false}UI.qd=x;UI.qx=null;UI.qdp=0},
 qtoday:()=>{UI.qd=TD();UI.qx=null;UI.qdp=0},
 qpick:()=>{UI.qdp=!UI.qdp},
 qdgo:()=>{const x=qReadDate('qd');if(!x)return false;if(x>TD()){toast('لا يمكن التسجيل في تاريخ قادم');return false}UI.qd=x;UI.qdp=0;UI.qx=null},
 qxopen:b=>{qOpenEd(b.dataset.v,qDate())},
 qxclose:()=>{UI.qx=null;UI.qrows=null;return},
 qradd:()=>{const r=UI.qrows||(UI.qrows=[]),l=r[r.length-1]||{w:'',r:''};r.push({w:l.w,r:l.r})},
 qrdup:b=>{const r=UI.qrows,i=+b.dataset.i;if(!r||!r[i])return false;r.splice(i+1,0,{w:r[i].w,r:r[i].r})},
 qrdel:b=>{const r=UI.qrows,i=+b.dataset.i;if(!r||!r[i])return false;r.splice(i,1);if(!r.length)r.push({w:'',r:''})},
 qcopylast:b=>{const ref=qRefLast(b.dataset.v,qDate());if(!ref||!(ref.sets||[]).length)return false;UI.qrows=ref.sets.map(q=>({w:q.w||'',r:q.r}))},
 qxsave:b=>{const xv=b.dataset.v,name=b.dataset.n,rows=(UI.qrows||[]).map(q=>({i:q.i,w:qNum(q.w),r:Math.round(qNum(q.r))}));
  if(!rows.some(q=>q.r>0)&&!rows.some(q=>q.i)){toast('أدخل التكرارات لمجموعة واحدة على الأقل');return false}
  const n=qSave(qDate(),xv,name,rows);UI.qx=null;UI.qrows=null;toast(n?'حُفظ الأداء':'لا تغيير')},
 qmv:b=>{const d=+b.dataset.d,i=+b.dataset.i,j=i+(+b.dataset.v),a=S.plan[d].ex;if(j<0||j>=a.length)return false;const t=a[i];a[i]=a[j];a[j]=t},
 qmvday:b=>{const d=+b.dataset.d,i=+b.dataset.i,to=+(document.getElementById('q-mvd-'+i)||{}).value;if(to===d||isNaN(to))return false;const e=S.plan[d].ex[i];if(!e)return false;
  if(irPlanHas(to,irXvOf({id:e.id,n:e.n}))){toast('التمرين موجود في اليوم الآخر');return false}S.plan[d].ex.splice(i,1);S.plan[to].ex.push(e);irLog('asg',{xv:irXvOf({id:e.id,n:e.n}),n:e.n,d:to,plan:1,pd:TD(),id:e.id});toast('نُقل إلى '+DAYS[to])},
 qrm:b=>{ACT.irrm(b)},
 qadd:b=>{const name=irNorm(irTxt('ir-an')),sets=Math.round(irNum('ir-as'))||3,reps=Math.round(irNum('ir-ar'))||10,w=irNum('ir-aw'),d=+b.dataset.d;if(!name){toast('اكتب اسم التمرين');return false}
  const r=irPlanAdd(d,name,sets,reps,w);if(!r.dup)irLog('ex+',{xv:r.xv,n:name,d:d,plan:1,pd:TD(),id:r.e.id});irClr('ir-a');toast(r.dup?'التمرين موجود في هذا اليوم':'أُضيف إلى الجدول وإلى الخطة الشاملة')},
 qcust:()=>{UI.qcu=1},qccancel:()=>{UI.qcu=0},
 qcsave:()=>{const n=irNorm(irTxt('qc-n')),g=(document.getElementById('qc-g')||{}).value||'',t=(document.getElementById('qc-t')||{}).value||'w';if(!n){toast('اكتب اسم التمرين');return false}
  if(irLib(n)){toast('هذا التمرين موجود في المكتبة. اختره من القائمة');return false}const xv=irXv(n);irEns();
  if(S.xr[xv]&&S.xr[xv].cu){toast('هذا التمرين المخصص موجود');return false}
  S.xr[xv]={n:n,g:g,s:[],q:t==='bw'?'bw':'',en:'',lt:t,cu:1,at:Date.now()};irClr('qc-');UI.qcu=0;toast('أُضيف تمرين مخصص إلى الخطة الشاملة')},
 qgrp:b=>{UI.qg=b.dataset.v},
 qexp:b=>{UI.qe=UI.qe===b.dataset.v?null:b.dataset.v;UI.qf=null;UI.qr=null},
 qfull:b=>{UI.qf=UI.qf===b.dataset.v?null:b.dataset.v},
 qrep:b=>{UI.qr=+b.dataset.v},
 qaddto:b=>{const xv=b.dataset.v,e=qAll()[xv],d=+(document.getElementById('q-addd')||{}).value;if(!e||isNaN(d))return false;const r=irPlanAdd(d,e.n,3,10,0);
  if(!r.dup)irLog('ex+',{xv:xv,n:e.n,d:d,plan:1,pd:TD(),id:r.e.id});toast(r.dup?'التمرين موجود في هذا اليوم':'أُضيف إلى '+DAYS[d])},
 qgoedit:b=>{UI.qt='cur';UI.qd=b.dataset.d;UI.qdp=0;qOpenEd(b.dataset.v,b.dataset.d);window.scrollTo(0,0)}});
document.addEventListener('input',e=>{const t=e.target;if(!t)return;
 if(t.dataset&&t.dataset.qr&&UI.qrows){const p=t.dataset.qr.split(','),r=UI.qrows[+p[0]];if(r)r[p[1]]=t.value}
 else if(t.id==='qs'){UI.qs=t.value;const p=t.selectionStart;render();const n=document.getElementById('qs');if(n){n.focus();try{n.setSelectionRange(p,p)}catch(x){}}}
 else if(t.id&&t.id.indexOf('qc-')===0&&t.tagName==='INPUT'){UI.ird=UI.ird||{};UI.ird[t.id]=t.value}},true);
document.addEventListener('change',e=>{const t=e.target;if(t&&t.id==='qpl'){UI.qpl=t.checked;render()}},true);

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
