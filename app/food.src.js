/* ======================= يومية التغذية المبسّطة =======================
   اليومية تفتح على التاريخ، المسجّل والهدف والمتبقي، ثم البروتين والكربوهيدرات والدهون، وأقسام الفطور والغداء والعشاء والوجبات الخفيفة.
   لكل قسم «إضافة طعام» بنافذة واحدة: بحث، الأخيرة، المفضلة، وجباتي المحفوظة. الاستهلاك يُحسب من الأطعمة التي حفظها المستخدم كمتناولة فقط (S.meals).
   كل طعام يحفظ كميته الفعلية (gm بالغرام و pr لكل 100 غ، أو pm و sq للحصص المحفوظة) فيُعاد حسابه عند تعديل الكمية. التخطيط والوصفات والتحليل خلف اليومية. */
const FDS=[['b','الفطور'],['l','الغداء'],['d','العشاء'],['s','الوجبات الخفيفة']];
const fdDate=()=>UI.fd||TD();
const fdNum=v=>{const x=parseFloat(n2(String(v==null?'':v)).replace(',','.'));return isFinite(x)&&x>0?x:0};
const fdSName=k=>(FDS.find(s=>s[0]===k)||['','غير مصنّف'])[1];
function fdFavs(){if(!S.ffav||typeof S.ffav!=='object')S.ffav={};return S.ffav}
const fdBase=n=>String(n||'').replace(/\s*×.*$/,'').replace(/\s*\(\d+(\.\d+)?\s*غ\)$/,'').trim();
/* عنصر موحّد: {key,n,per100:{k,p,c,f}|null,pm:{k,p,c,f}|null,sg:حصة بالغرام|0,su:وصف الحصة,my:معرّف}  */
const fdFromFood=x=>({key:'f:'+x.n,n:x.n,per100:{k:x.k,p:x.p,c:x.cb,f:x.f},pm:null,sg:x.g,su:x.u,my:''});
const fdFromLib=m=>({key:'m:'+m.id,n:m.n,per100:null,pm:{k:m.kcal,p:m.p,c:m.c,f:m.f},sg:0,su:'حصة',my:m.id});
function fdFromMeal(m){const base=fdBase(m.n);
 if(m.pr)return{key:'r:'+base,n:base,per100:m.pr,pm:null,sg:m.sg||100,su:m.su||'100 غ',my:'',last:{gm:m.gm,ub:m.ub}};
 const q=m.sq||1;return{key:'r:'+base,n:base,per100:null,pm:{k:Math.round(m.kcal/q),p:mr1(m.p/q),c:mr1(m.c/q),f:mr1(m.f/q)},sg:0,su:'حصة',my:m.lid||'',last:{gm:0,ub:'sv',sq:q}}}
function fdRecent(){const seen={},o=[];for(let i=0;i<45&&o.length<30;i++){const d=addDays(fdDate(),-i);(S.meals[d]||[]).slice().reverse().forEach(m=>{const k=fdBase(m.n);if(!k||seen[k])return;seen[k]=1;o.push(fdFromMeal(m))})}return o}
function fdFavList(){const F2=fdFavs();return Object.keys(F2).filter(k=>F2[k]).map(n=>{const f=FOODS.find(x=>x.n===n);if(f)return fdFromFood(f);const l=S.lib.find(x=>x.n===n);if(l)return fdFromLib(l);const r=fdRecent().find(x=>x.n===n);return r||null}).filter(Boolean)}
function fdAllList(q){q=nrmF(q);if(!q)return [];return FOODS.filter(x=>nrmF(x.n).indexOf(q)>=0||nrmF(x.e).indexOf(q)>=0).slice(0,40).map(fdFromFood).concat(S.lib.filter(m=>nrmF(m.n).indexOf(q)>=0).map(fdFromLib))}
function fdList(){const f=UI.fds;if(f.q&&nrmF(f.q))return fdAllList(f.q);return f.tab==='fav'?fdFavList():f.tab==='meals'?S.lib.map(fdFromLib):fdRecent()}
/* القيم لكمية معيّنة. unit: 'g' أو 'sv'. يعيد {k,p,c,f,gm,sq,text} */
function fdCalc(it,unit,qty){qty=+qty||0;let m,gm=0,sq=0;
 if(it.per100){gm=unit==='sv'?qty*(it.sg||100):qty;const r=gm/100;m={k:Math.round(it.per100.k*r),p:mr1(it.per100.p*r),c:mr1(it.per100.c*r),f:mr1(it.per100.f*r)};if(unit==='sv')sq=qty}
 else{sq=qty;m={k:Math.round(it.pm.k*qty),p:mr1(it.pm.p*qty),c:mr1(it.pm.c*qty),f:mr1(it.pm.f*qty)}}
 return Object.assign(m,{gm:gm,sq:sq})}
const fdQtyTx=m=>m.gm?(m.ub==='sv'&&m.sq?F(m.sq,m.sq%1?2:0)+' حصة · ':'')+F(m.gm,m.gm%1?1:0)+' غ':(m.sq?'× '+F(m.sq,m.sq%1?2:0):'');
/* ---------- الواجهة ---------- */
function fdDateBar(){const d=fdDate(),td=TD();
 let h='<div class="card fddate"><div class="row" style="gap:8px;flex-wrap:nowrap"><button class="chip" data-a="fdday" data-v="-1" aria-label="اليوم السابق">'+ic('next')+'</button><div style="flex:1;text-align:center"><b class="num">'+d+'</b>'+(d===td?'<span class="tag" style="margin-inline-start:6px">اليوم</span>':'')+'</div><button class="chip" data-a="fdday" data-v="1" aria-label="اليوم التالي"'+(d>=td?' disabled':'')+'>'+ic('back')+'</button></div>'+
  '<div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button class="chip" data-a="fdpick">'+ic('cal')+'تاريخ آخر</button>'+(d!==td?'<button class="chip" data-a="fdtoday">العودة إلى اليوم</button>':'')+'</div>';
 if(UI.fdp)h+=qDatePicker('fdd',d,'fddgo');return h+'</div>'}
function fdSummary(d){const s=foodSum(d),nt=S.nt,left=(+nt.kcal||0)-s.kcal;
 return '<div class="card hl" id="fd-sum"><div class="fdkc"><div><small class="mu">المسجّل</small><b class="num" id="fd-logged">'+F(s.kcal)+'</b></div><div><small class="mu">الهدف</small><b class="num" id="fd-goal">'+F(nt.kcal)+'</b></div><div><small class="mu">'+(left>=0?'المتبقي':'تجاوز')+'</small><b class="num" id="fd-left">'+F(Math.abs(left))+'</b></div></div><div class="mu" style="text-align:center">سعرة حرارية</div>'+
  '<div class="bar" style="margin:8px 0 12px"><i style="width:'+pct(s.kcal,nt.kcal)+'%"></i></div>'+bl(s.p,nt.p,'بروتين','غ')+bl(s.c,nt.c,'كربوهيدرات','غ')+bl(s.f,nt.f,'دهون','غ')+'</div>'}
function fdRow(m,i,d){const ed=UI.fde&&UI.fde.id===m.id;
 let h='<div class="fdrow" data-id="'+m.id+'"><div class="row" style="gap:8px;flex-wrap:nowrap"><div style="flex:1;min-width:0"><b class="nm">'+esc(fdBase(m.n))+'</b><div class="mu num">'+(fdQtyTx(m)?esc(fdQtyTx(m))+' · ':'')+F(m.kcal)+' سعرة · P '+F(m.p,m.p%1?1:0)+' · C '+F(m.c,m.c%1?1:0)+' · F '+F(m.f,m.f%1?1:0)+'</div></div><button class="chip" data-a="fded" data-id="'+m.id+'">'+(ed?'إغلاق':'تعديل')+'</button></div>';
 if(ed){const u=m.pr?'غرام':'حصة',v=m.pr?(m.gm||''):(m.sq||1);
  h+='<div class="fded"><label class="f">الكمية ('+u+')<input id="fde-q" class="irin num" dir="ltr" inputmode="decimal" value="'+esc(v)+'"></label><label class="f">نقل إلى وجبة<select id="fde-s" class="irsel">'+FDS.map(s=>'<option value="'+s[0]+'"'+(s[0]===m.slot?' selected':'')+'>'+s[1]+'</option>').join('')+'</select></label><div class="row" style="gap:8px;margin-top:8px"><button class="btn sm" data-a="fdesave" data-id="'+m.id+'">حفظ</button><button class="chip" data-a="fddel" data-id="'+m.id+'">'+(UI.fdx===m.id?'تأكيد الحذف':'حذف')+'</button></div></div>'}
 return h+'</div>'}
function fdSection(slot,d){const L=(S.meals[d]||[]).map((m,i)=>[m,i]).filter(x=>(x[0].slot||'')===slot),kc=L.reduce((a,x)=>a+(+x[0].kcal||0),0);
 return '<div class="card fdsec" data-slot="'+slot+'"><div class="row" style="margin-bottom:6px"><h2 style="margin:0">'+esc(fdSName(slot))+'</h2><span class="sp"></span><b class="num">'+F(kc)+'</b><span class="mu">سعرة</span></div>'+
  (L.length?L.map(x=>fdRow(x[0],x[1],d)).join(''):'<div class="mu">لا طعام مسجّل</div>')+
  '<div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn sm" data-a="fdadd" data-s="'+slot+'" id="fd-add-'+slot+'">'+ic('plus')+'إضافة طعام</button><button class="chip" data-a="fdcopy" data-s="'+slot+'">نسخ وجبة سابقة</button></div></div>'}
function fdView(){const d=fdDate();let h='<h1>التغذية</h1>'+fdDateBar()+fdSummary(d);
 FDS.forEach(s=>{h+=fdSection(s[0],d)});
 const loose=(S.meals[d]||[]).filter(m=>!FDS.some(s=>s[0]===m.slot));if(loose.length)h+=fdSection('',d);
 h+='<div class="card fdmore"><h2>خلف اليومية</h2><div class="row" style="gap:8px;flex-wrap:wrap"><button class="chip" data-a="fdgo" data-v="month">التخطيط</button><button class="chip" data-a="fdgo" data-v="lib">الوصفات ووجباتي</button><button class="chip" data-a="fdgo" data-v="ins">التحليل</button><button class="chip" data-a="fdtools">'+(UI.fdt?'إخفاء الأدوات':'بحث وباركود وتصوير')+'</button></div></div>';
 if(UI.fdt)h+=qaRail()+(UI.qa==='search'?offCard():'');
 return h+fdSheet()}
/* ---------- النافذة الموحّدة ---------- */
function fdSheet(){const f=UI.fds;if(!f)return '';
 if(f.mode==='copy')return fdCopySheet(f);if(f.mode==='cust')return fdCustSheet(f);
 const L=fdList();f.list=L;const it=f.sel!=null?L[f.sel]||f.pick:f.pick||null;
 let b='<input id="fds-q" type="search" class="irin" placeholder="ابحث: دجاج، أرز، تمر…" value="'+esc(f.q)+'" autocomplete="off" aria-label="بحث">'+
  '<div class="chips" style="margin:8px 0">'+[['recent','الأخيرة'],['fav','المفضلة'],['meals','وجباتي المحفوظة']].map(t=>'<button class="chip'+(f.tab===t[0]&&!nrmF(f.q)?' on':'')+'" data-a="fdtab" data-v="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>';
 b+='<div class="fpl" id="fds-l">'+fdRows(L)+'</div>';
 if(it)b+='<div id="fds-d">'+fdDetail(it)+'</div>';
 b+='<div class="row" style="margin-top:10px"><button class="chip" data-a="fdcust">طعام مخصص ومغذيات تفصيلية</button></div>';
 return '<div class="dro fpo" data-a="fdclose"><div class="fps" data-stop="1" role="dialog" aria-modal="true" aria-label="إضافة طعام" id="fds"><div class="row" style="margin-bottom:8px"><b style="font-size:18px">'+ic('plus')+' إضافة إلى '+esc(fdSName(f.slot))+'</b><span class="sp"></span><button class="chip" data-a="fdclose" aria-label="إغلاق">'+ic('x')+'</button></div>'+b+'</div></div>'}
function fdRows(L){if(!L.length)return '<div class="mu" style="text-align:center;padding:16px">'+(nrmF(UI.fds.q)?'لا نتائج. جرّب كلمة أخرى.':UI.fds.tab==='fav'?'لا أطعمة مفضلة بعد. افتح طعامًا واضغط ★.':UI.fds.tab==='meals'?'لا وجبات محفوظة.':'لا أطعمة حديثة بعد. ابحث لإضافة أول طعام.')+'</div>';
 return L.map((x,i)=>{const kc=x.per100?Math.round(x.per100.k*(x.sg||100)/100):x.pm.k;return '<button class="fpr'+(UI.fds.sel===i?' on':'')+'" data-a="fdsel" data-i="'+i+'"><span class="t"><b>'+esc(x.n)+'</b><small class="mu">'+esc(x.per100?x.su:'حصة محفوظة')+'</small></span><span class="fpm"><b class="num">'+F(kc)+'</b><small>سعرة</small></span></button>'}).join('')}
function fdDefault(it){const l=it.last;if(it.per100)return l&&l.gm?{u:l.ub==='sv'?'sv':'g',q:l.ub==='sv'&&l.sq?l.sq:l.gm}:{u:'g',q:it.sg||100};return{u:'sv',q:l&&l.sq?l.sq:1}}
function fdDetail(it){const f=UI.fds;if(!f.q0||f.q0.key!==it.key){const d0=fdDefault(it);f.q0={key:it.key,u:d0.u,q:d0.q}}const u=f.q0.u,q=f.q0.q,m=fdCalc(it,u,q),fav=!!fdFavs()[it.n];
 return '<div class="fpd" id="fds-det"><div class="row" style="margin-bottom:8px"><b>'+esc(it.n)+'</b><span class="sp"></span><button class="chip'+(fav?' on':'')+'" data-a="fdfav" aria-pressed="'+fav+'" aria-label="مفضلة">★</button></div>'+
  (it.per100?'<div class="row" style="gap:6px;margin-bottom:8px">'+[['g','غرام'],['sv','حصة · '+it.su]].map(x=>'<button class="chip'+(u===x[0]?' on':'')+'" data-a="fdunit" data-v="'+x[0]+'">'+esc(x[1])+'</button>').join('')+'</div>':'')+
  '<label class="f">'+(u==='g'?'الكمية (غرام)':'عدد الحصص')+'<input id="fds-g" class="irin num" dir="ltr" inputmode="decimal" value="'+esc(q)+'"></label>'+
  '<div class="fpq" id="fds-m">'+fpMacHtml({k:m.k,p:m.p,c:m.c,f:m.f})+'</div><button class="btn" style="width:100%;margin-top:10px" data-a="fdsave" id="fds-save">'+ic('plus')+'إضافة إلى '+esc(fdSName(f.slot))+'</button></div>'}
function fdCopySheet(f){const d=fdDate();let best='',L=[];for(let i=1;i<=30;i++){const x=addDays(d,-i),a=(S.meals[x]||[]).filter(m=>(m.slot||'')===f.slot);if(a.length){best=x;L=a;break}}
 const src=f.cd||best;const A=(S.meals[src]||[]).filter(m=>(m.slot||'')===f.slot);if(f.chk==null||f.cdOf!==src){f.chk={};A.forEach(m=>{f.chk[m.id]=1});f.cdOf=src}
 let b='<div class="mu" style="margin-bottom:6px">اختر اليوم الذي تنسخ منه، وراجع الأطعمة قبل النسخ.</div>'+qDatePicker('fdc',src||d,'fdcgo')+(A.length?A.map(m=>'<label class="fdcp row" style="gap:8px;flex-wrap:nowrap;margin:6px 0"><input type="checkbox" data-fdc="'+m.id+'" '+(f.chk[m.id]?'checked':'')+'><span style="flex:1;min-width:0"><b>'+esc(fdBase(m.n))+'</b><span class="mu num"> · '+(fdQtyTx(m)?esc(fdQtyTx(m))+' · ':'')+F(m.kcal)+' سعرة</span></span></label>').join('')+'<button class="btn" style="width:100%;margin-top:10px" data-a="fdcgo2" id="fdc-go">نسخ المحدد إلى '+esc(fdSName(f.slot))+' · '+d+'</button>':'<div class="mu" style="padding:14px 0;text-align:center">لا أطعمة مسجّلة في '+esc(fdSName(f.slot))+' بهذا التاريخ.</div>');
 return '<div class="dro fpo" data-a="fdclose"><div class="fps" data-stop="1" role="dialog" aria-modal="true" aria-label="نسخ وجبة سابقة"><div class="row" style="margin-bottom:8px"><b style="font-size:18px">نسخ وجبة سابقة · '+esc(fdSName(f.slot))+'</b><span class="sp"></span><button class="chip" data-a="fdclose" aria-label="إغلاق">'+ic('x')+'</button></div>'+b+'</div></div>'}
function fdCustSheet(f){const c=f.c||{};const i=(id,l,ph,v)=>'<label class="f">'+l+'<input id="'+id+'" class="irin num" dir="ltr" inputmode="decimal" placeholder="'+(ph||'0')+'" value="'+esc(v||'')+'"></label>';
 return '<div class="dro fpo" data-a="fdclose"><div class="fps" data-stop="1" role="dialog" aria-modal="true" aria-label="طعام مخصص"><div class="row" style="margin-bottom:8px"><b style="font-size:18px">طعام مخصص</b><span class="sp"></span><button class="chip" data-a="fdclose" aria-label="إغلاق">'+ic('x')+'</button></div>'+
  '<label class="f">الاسم<input id="fdk-n" class="irin" placeholder="مثال: ساندويتش منزلي" value="'+esc(c.n||'')+'" autocomplete="off"></label><div class="mu">القيم لكامل الكمية التي أكلتها.</div><div class="g2">'+i('fdk-k','السعرات','0',c.k)+i('fdk-p','بروتين (غ)','0',c.p)+i('fdk-c','كربوهيدرات (غ)','0',c.c)+i('fdk-f','دهون (غ)','0',c.f)+'</div>'+
  '<details style="margin-top:8px"><summary>مغذيات تفصيلية (اختياري)</summary><div class="g2">'+i('fdk-fi','ألياف (غ)','',c.fi)+i('fdk-su','سكر (غ)','',c.su)+i('fdk-na','صوديوم (ملغ)','',c.na)+'</div></details>'+
  '<label class="row" style="gap:8px;margin-top:8px"><input type="checkbox" id="fdk-save"><span>احفظه في وجباتي المحفوظة</span></label><div class="mu" id="fdk-e" role="alert"></div>'+
  '<div class="row" style="gap:8px;margin-top:10px"><button class="btn" data-a="fdksave" id="fdk-go">إضافة إلى '+esc(fdSName(f.slot))+'</button><button class="chip" data-a="fdclose">إلغاء</button></div></div></div>'}
(()=>{const V=vFood;vFood=function(){if(UI.fm==='ins'||UI.fm==='month'||UI.fm==='lib'){const h=V.apply(this,arguments);return typeof h==='string'?h.replace('<h1>التغذية</h1>','<h1>التغذية</h1><div class="row" style="margin-bottom:8px"><button class="chip" data-a="fdgo" data-v="today">'+ic('back')+'العودة إلى اليومية</button></div>'):h}return fdView()}})();
/* ---------- الأوامر ---------- */
const fdOpen=slot=>{UI.fds={slot:slot,mode:'add',tab:'recent',q:'',sel:null,pick:null,q0:null}};
Object.assign(ACT,{
 fdday:b=>{const x=addDays(fdDate(),+b.dataset.v);if(x>TD())return false;UI.fd=x===TD()?'':x;UI.fdp=0;UI.fde=null},
 fdtoday:()=>{UI.fd='';UI.fdp=0},fdpick:()=>{UI.fdp=!UI.fdp},
 fddgo:()=>{const x=qReadDate('fdd');if(!x)return false;if(x>TD()){toast('لا يمكن التسجيل في تاريخ قادم');return false}UI.fd=x===TD()?'':x;UI.fdp=0},
 fdgo:b=>{UI.fm=b.dataset.v;window.scrollTo(0,0)},fdtools:()=>{UI.fdt=!UI.fdt},
 fdadd:b=>{fdOpen(b.dataset.s)},fdclose:(b,ev)=>{if(ev&&ev.target.closest('[data-stop]')&&!ev.target.closest('button[data-a="fdclose"]'))return false;UI.fds=null},
 fdtab:b=>{const f=UI.fds;f.tab=b.dataset.v;f.q='';f.sel=null;f.pick=null;f.q0=null},
 fdsel:b=>{const f=UI.fds;f.sel=+b.dataset.i;f.pick=f.list[f.sel]||null;f.q0=null},
 fdunit:b=>{const f=UI.fds,it=f.pick;if(!it||!f.q0)return false;const u=b.dataset.v;if(u===f.q0.u)return false;const cur=fdNum(($('#fds-g')||{}).value)||f.q0.q;
  f.q0.q=u==='sv'?+(cur/(it.sg||100)).toFixed(2):Math.round(cur*(it.sg||100));f.q0.u=u},
 fdfav:()=>{const it=UI.fds&&UI.fds.pick;if(!it)return false;const F2=fdFavs();if(F2[it.n])delete F2[it.n];else F2[it.n]=1},
 fdsave:()=>{const f=UI.fds,it=f&&f.pick;if(!it||!f.q0)return false;const q=fdNum(($('#fds-g')||{}).value);if(!(q>0)){toast('أدخل الكمية');return false}
  const u=f.q0.u,m=fdCalc(it,u,q),d=fdDate();const r={n:it.n,kcal:m.k,p:m.p,c:m.c,f:m.f,slot:f.slot};
  if(it.per100){r.gm=Math.round(m.gm*10)/10;r.ub=u;if(u==='sv')r.sq=q;r.pr=it.per100;r.sg=it.sg;r.su=it.su}else{r.sq=q;r.pm=it.pm;if(it.my)r.lid=it.my}
  mealSave(d,r);toast('أُضيف: '+it.n);UI.fds=null},
 fdcust:()=>{const f=UI.fds;UI.fds={slot:f.slot,mode:'cust',c:{}}},
 fdksave:()=>{const f=UI.fds,g=id=>($('#'+id)||{}).value,n=String(g('fdk-n')||'').trim(),k=fdNum(g('fdk-k')),e=$('#fdk-e');
  if(!n){if(e)e.textContent='اكتب اسم الطعام';return false}if(!(k>0)){if(e)e.textContent='أدخل السعرات';return false}
  const r={n:n,kcal:k,p:fdNum(g('fdk-p')),c:fdNum(g('fdk-c')),f:fdNum(g('fdk-f')),slot:f.slot,sq:1,pm:{k:k,p:fdNum(g('fdk-p')),c:fdNum(g('fdk-c')),f:fdNum(g('fdk-f'))}};
  [['fi','fdk-fi'],['su','fdk-su'],['na','fdk-na']].forEach(a=>{const v=fdNum(g(a[1]));if(v)r[a[0]]=v});
  if(($('#fdk-save')||{}).checked&&!S.lib.some(x=>x.n===n))S.lib.push({id:uid(),n:n,kcal:Math.round(k),p:r.p,c:r.c,f:r.f});
  mealSave(fdDate(),r);toast('أُضيف: '+n);UI.fds=null},
 fdcopy:b=>{UI.fds={slot:b.dataset.s,mode:'copy',cd:'',chk:null}},
 fdcgo:()=>{const x=qReadDate('fdc');if(!x)return false;UI.fds.cd=x;UI.fds.chk=null},
 fdcgo2:()=>{const f=UI.fds,d=fdDate(),src=f.cd||f.cdOf,A=(S.meals[src]||[]).filter(m=>(m.slot||'')===f.slot&&f.chk[m.id]);if(!A.length){toast('اختر طعامًا واحدًا على الأقل');return false}
  A.forEach(m=>{const c=Object.assign({},m);delete c.id;mealSave(d,c)});toast('نُسخ '+F(A.length)+' إلى '+fdSName(f.slot));UI.fds=null},
 fded:b=>{UI.fde=UI.fde&&UI.fde.id===b.dataset.id?null:{id:b.dataset.id};UI.fdx=null},
 fdesave:b=>{const d=fdDate(),a=S.meals[d]||[],m=a.find(x=>x.id===b.dataset.id);if(!m)return false;const q=fdNum(($('#fde-q')||{}).value),s=($('#fde-s')||{}).value||m.slot;if(!(q>0)){toast('أدخل كمية صحيحة');return false}
  if(m.pr){const r=q/100;m.gm=Math.round(q*10)/10;m.kcal=Math.round(m.pr.k*r);m.p=mr1(m.pr.p*r);m.c=mr1(m.pr.c*r);m.f=mr1(m.pr.f*r);if(m.ub==='sv'){m.sq=+(q/(m.sg||100)).toFixed(2)}}
  else{if(!m.pm){const o=m.sq||1;m.pm={k:Math.round(m.kcal/o),p:mr1(m.p/o),c:mr1(m.c/o),f:mr1(m.f/o)}}m.sq=q;m.kcal=Math.round(m.pm.k*q);m.p=mr1(m.pm.p*q);m.c=mr1(m.pm.c*q);m.f=mr1(m.pm.f*q)}
  m.slot=s;UI.fde=null;toast('حُفظ التعديل')},
 fddel:b=>{if(UI.fdx!==b.dataset.id){UI.fdx=b.dataset.id;return}const d=fdDate(),a=S.meals[d]||[],i=a.findIndex(x=>x.id===b.dataset.id);if(i>=0)a.splice(i,1);UI.fdx=null;UI.fde=null;toast('حُذف من اليومية')}});
document.addEventListener('input',e=>{const t=e.target;if(!t||!UI.fds)return;
 if(t.id==='fds-q'){UI.fds.q=t.value;UI.fds.sel=null;UI.fds.pick=null;UI.fds.q0=null;const l=document.getElementById('fds-l');UI.fds.list=fdList();if(l)l.innerHTML=fdRows(UI.fds.list);const d=document.getElementById('fds-d');if(d)d.innerHTML=''}
 else if(t.id==='fds-g'){const it=UI.fds.pick;if(it&&UI.fds.q0){UI.fds.q0.q=t.value;const m=fdCalc(it,UI.fds.q0.u,fdNum(t.value)),box=document.getElementById('fds-m');if(box)box.innerHTML=fpMacHtml({k:m.k,p:m.p,c:m.c,f:m.f})}}},true);
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.fdc&&UI.fds&&UI.fds.chk){UI.fds.chk[t.dataset.fdc]=t.checked?1:0}},true);
