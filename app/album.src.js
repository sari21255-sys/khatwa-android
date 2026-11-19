/* ======================= ألبوم التقدّم: خط زمني للصور مع التاريخ ووزن وقت الصورة والنسبة (دهون %) =======================
   التخزين: نفس مفتاح fit_pp على الجهاز (لا رفع إلى السحابة، لأنه لا يوجد تكامل سحابي للصور). كل صورة: {id,d,w(كغ),bf(%),wd,img,at}.
   الصور القديمة {d,w,img} تُرقّى في مكانها: تأخذ معرّفًا ويبقى تاريخها ووزنها كما سُجّلا، ولا تُستنتج لها نسبة. */
function alMigrate(){let ch=0;PP.forEach((q,i)=>{if(!q.id){q.id='p'+(q.at||Date.now()).toString(36)+i.toString(36)+Math.random().toString(36).slice(2,5);ch++}if(q.at==null){q.at=Date.parse((q.d||TD())+'T12:00:00')||Date.now();ch++}
  if(q.bf===undefined){q.bf=null;ch++}if(q.w===undefined||q.w===''){q.w=0;ch++}});if(ch)savePP();return ch}
alMigrate();
const alSorted=()=>PP.slice().sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:(b.at||0)-(a.at||0));
const alKg=v=>{v=+v;return v>0?+(+fromU(v)).toFixed(2):0};
const alWTx=q=>q.w>0?F(toU(q.w),1)+' '+uL():'';
const alBfTx=q=>(q.bf!=null&&q.bf>0)?F(q.bf,1)+'٪'.replace('٪','%'):'';
const alMeta=q=>[alWTx(q),alBfTx(q)].filter(Boolean).join(' · ');
function alWeightNear(d){let best=null;try{sorted(S.bw).forEach(x=>{if(x[0]<=d)best={d:x[0],v:+x[1]}})}catch(e){}if(!best){try{const a=sorted(S.bw);if(a.length)best={d:a[0][0],v:+a[0][1]}}catch(e){}}return best}
function alStatus(){let ac='';try{ac=fxIsGuest()?'':'حسابك'}catch(e){}
 return '<div class="card alst" id="al-status" role="status"><b>'+ic('image')+' أين تُحفظ الصور؟</b><div class="mu" style="margin-top:6px">تُحفظ على هذا الجهاز فقط ولا تُرفع إلى السحابة، حتى مع تسجيل الدخول'+(ac?'':' أو كزائر')+'. لن تنتقل إلى جهاز آخر، ولا يشملها النسخ الاحتياطي للحساب. التاريخ والوزن والنسبة تُحفظ مع كل صورة في المكان نفسه.</div></div>'}
function alForm(){const a=UI.alp;if(!a)return '';const e=!!a.id,L=alWeightNear(a.d),wv=a.w>0?(+toU(a.w)).toFixed(1):'';
 return '<div class="card" id="al-form"><h2>'+ic('camera')+(e?'تعديل بيانات الصورة':'صورة جديدة')+'</h2>'+(a.img?'<img class="alprev" alt="معاينة الصورة" src="'+a.img+'">':'')+
  '<div class="mu" style="margin:8px 0 2px">تاريخ الصورة</div>'+qDatePicker('al-d',a.d,'',{y0:new Date().getFullYear()-10,y1:new Date().getFullYear(),desc:true})+
  '<label class="f" style="margin-top:10px">وزن وقت الصورة ('+uL()+') <span class="mu">اختياري</span><input id="al-w" class="irin num" dir="ltr" readonly inputmode="none" value="'+wv+'" placeholder="اضغط للاختيار"></label>'+
  '<div class="mu" id="al-wnote">'+(L?'آخر وزن محفوظ: <b class="num">'+F(toU(L.v),1)+' '+uL()+'</b> · <span class="num">'+L.d+'</span>. اضغط الحقل للبدء منه، وعدّله إن لزم.':'لا وزن محفوظ بعد. اختر وزنك أو اتركه فارغًا.')+'</div>'+
  '<label class="f" style="margin-top:10px">النسبة (دهون الجسم %) <span class="mu">اختياري</span><input id="al-bf" class="irin num" dir="ltr" inputmode="decimal" value="'+(a.bf>0?a.bf:'')+'" placeholder="مثال: 18.5"></label>'+
  '<div class="mu">تُدخل هذه النسبة بنفسك من قياس تثق به. لا تُستنتج من الصورة.</div><div class="mu" id="al-err" role="alert"></div>'+
  '<div class="row" style="gap:8px;margin-top:12px"><button class="btn" data-a="alsave" id="al-save">'+(e?'حفظ التعديل':'حفظ الصورة')+'</button><button class="chip" data-a="alcancel">إلغاء</button>'+(e&&a.old?'':'')+'</div></div>'}
function alCard(q){const sel=(UI.alc||[]).indexOf(q.id)>=0,dl=UI.aldel===q.id;
 return '<div class="alit" data-id="'+q.id+'"><button class="althumb" data-a="alzoom" data-v="'+q.id+'" aria-label="تكبير الصورة"><img alt="صورة التقدّم بتاريخ '+q.d+'" src="'+q.img+'"></button><div class="alinfo"><b class="num">'+q.d+'</b><div class="mu num">'+(alMeta(q)||'بلا وزن أو نسبة')+'</div><div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px"><button class="chip'+(sel?' on':'')+'" data-a="alsel" data-v="'+q.id+'" aria-pressed="'+sel+'">'+(sel?'مختارة للمقارنة':'قارن')+'</button><button class="chip" data-a="aledit" data-v="'+q.id+'">تعديل</button><button class="chip" data-a="aldel" data-v="'+q.id+'">'+(dl?'تأكيد الحذف':'حذف')+'</button></div></div></div>'}
function alCompare(){const ids=UI.alc||[];if(ids.length<2)return ids.length?'<div class="card mu" id="al-cmp-h">اختر صورة ثانية بتاريخ مختلف للمقارنة.</div>':'';
 const A=PP.find(x=>x.id===ids[0]),B=PP.find(x=>x.id===ids[1]);if(!A||!B)return '';const o=A.d<=B.d?[A,B]:[B,A],days=Math.round((Date.parse(o[1].d)-Date.parse(o[0].d))/864e5);
 let diff='';if(o[0].w>0&&o[1].w>0){const dw=toU(o[1].w)-toU(o[0].w);diff+='الوزن: '+(dw>0?'+':'')+F(dw,1)+' '+uL()}if(o[0].bf>0&&o[1].bf>0){const db=o[1].bf-o[0].bf;diff+=(diff?' · ':'')+'النسبة: '+(db>0?'+':'')+F(db,1)+'%'}
 if(o[0].d===o[1].d)return '<div class="card mu" id="al-cmp-h">اختر صورتين بتاريخين مختلفين.</div>';
 return '<div class="card" id="al-cmp"><h2>'+ic('image')+'مقارنة</h2><div class="g2">'+o.map((q,i)=>'<figure class="alfig"><img alt="" src="'+q.img+'"><figcaption class="num"><b>'+(i?'بعد':'قبل')+'</b> · '+q.d+'<br><span class="mu">'+(alMeta(q)||'—')+'</span></figcaption></figure>').join('')+'</div><div class="mu num" style="margin-top:8px">بين الصورتين <b>'+F(days)+'</b> يومًا'+(diff?' · '+diff:'')+'</div><div class="row" style="margin-top:8px"><button class="chip" data-a="alclr">إنهاء المقارنة</button></div></div>'}
function alZoom(){const q=PP.find(x=>x.id===UI.alz);if(!q)return '';const z=UI.alzs||1;
 return '<div class="alz" role="dialog" aria-modal="true" aria-label="عرض الصورة" id="al-zoom"><div class="alzt"><b class="num">'+q.d+(alMeta(q)?' · '+alMeta(q):'')+'</b><span class="sp"></span><button class="chip" data-a="alzs" data-v="-1" aria-label="تصغير">−</button><button class="chip" data-a="alzs" data-v="1" aria-label="تكبير">＋</button><button class="chip" data-a="alzx" aria-label="إغلاق">'+ic('x')+'</button></div><div class="alzb"><img alt="صورة التقدّم" src="'+q.img+'" style="width:'+(z*100)+'%"></div></div>'}
function alView(){alMigrate();const L=alSorted();let h=back()+'<h1>صور التقدّم</h1>'+alStatus();
 h+=UI.alp?alForm():'<div class="row" style="margin:10px 0"><label class="btn" style="cursor:pointer" id="al-add">'+ic('camera')+'إضافة صورة<input id="pp-in" type="file" accept="image/*" hidden></label><span class="mu" style="margin-inline-start:10px">'+F(L.length)+' صورة</span></div>';
 if(UI.msg){h+='<div class="tag" style="margin:8px 0" role="status">'+esc(UI.msg)+'</div>';UI.msg=''}
 h+=alCompare();
 if(!L.length&&!UI.alp)return h+'<div class="card mu" id="al-empty">لا صور بعد. أضف أول صورة لتبدأ خطك الزمني.</div>'+alZoom();
 let cur='';L.forEach(q=>{const m=q.d.slice(0,7);if(m!==cur){cur=m;h+='<div class="sechead alm"><h2 class="num">'+m+'</h2></div>'}h+=alCard(q)});
 return h+alZoom()}
vPpg=alView;
/* الإضافة تمرّ بنموذج: لا تُحفظ الصورة قبل أن يؤكد المستخدم التاريخ والوزن والنسبة */
ppAdd=function(f){const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{const k=Math.min(1,480/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);
  UI.alp={img:c.toDataURL('image/jpeg',.7),d:TD(),w:0,bf:0};render()};im.onerror=()=>{URL.revokeObjectURL(u);UI.msg='تعذّرت قراءة الصورة';render()};im.src=u};
function alRead(){const a=UI.alp;if(!a)return null;const g=k=>+((document.getElementById('al-d-'+k)||{}).value||0);let d=a.d;
 if(document.getElementById('al-d-y')){d=qReadDate('al-d')||a.d}
 const wi=document.getElementById('al-w'),bi=document.getElementById('al-bf');
 if(wi)a.w=alKg(wi.value);if(bi){const x=parseFloat(n2(bi.value).replace(',','.'));a.bf=isFinite(x)?x:0}a.d=d;return a}
['change','input'].forEach(t=>document.addEventListener(t,e=>{const x=e.target;if(x&&x.id&&(x.id.indexOf('al-')===0))alRead()},true));
(()=>{const E=fxEnhance;fxEnhance=function(){E.apply(this,arguments);document.querySelectorAll('#al-w').forEach(i=>{if(i.dataset.fxp)return;i.dataset.fxp='w';i.setAttribute('inputmode','none');i.classList.add('fxpick');i.setAttribute('aria-haspopup','dialog')})}})();
Object.assign(ACT,{
 alcancel:()=>{UI.alp=null},
 alsave:()=>{const a=alRead();if(!a)return false;const e=document.getElementById('al-err');
  if(a.d>TD()){if(e)e.textContent='لا يمكن اختيار تاريخ مستقبلي';return false}
  if(a.bf&&(a.bf<2||a.bf>70)){if(e)e.textContent='النسبة بين 2 و70';return false}
  if(a.id){const q=PP.find(x=>x.id===a.id);if(!q)return false;q.d=a.d;q.w=a.w||0;q.bf=a.bf>0?a.bf:null;q.wd=a.w>0?(alWeightNear(a.d)||{}).d||'':'';if(!savePP()){UI.msg='تعذّر الحفظ';return false}UI.msg='حُفظ التعديل';UI.alp=null;return}
  const q={id:'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),d:a.d,w:a.w||0,bf:a.bf>0?a.bf:null,img:a.img,at:Date.now()};PP.push(q);PP=PP.slice(-40);
  if(!savePP()){PP=PP.filter(x=>x.id!==q.id);UI.msg='مساحة التخزين ممتلئة، احذف بعض الصور';return false}UI.msg='أُضيفت الصورة';UI.alp=null},
 aledit:b=>{const q=PP.find(x=>x.id===b.dataset.v);if(!q)return false;UI.alp={id:q.id,img:q.img,d:q.d,w:q.w||0,bf:q.bf||0};window.scrollTo(0,0)},
 aldel:b=>{if(UI.aldel!==b.dataset.v){UI.aldel=b.dataset.v;return}PP=PP.filter(x=>x.id!==b.dataset.v);savePP();UI.aldel=null;UI.alc=(UI.alc||[]).filter(x=>x!==b.dataset.v);UI.msg='حُذفت الصورة'},
 alsel:b=>{const c=UI.alc||(UI.alc=[]),i=c.indexOf(b.dataset.v);if(i>=0)c.splice(i,1);else{c.push(b.dataset.v);if(c.length>2)c.shift()}},
 alclr:()=>{UI.alc=[]},alzoom:b=>{UI.alz=b.dataset.v;UI.alzs=1},alzx:()=>{UI.alz=null},alzs:b=>{UI.alzs=Math.max(1,Math.min(4,(UI.alzs||1)+(+b.dataset.v)*.5))},
 ppdel:b=>{const q=alSorted()[+b.dataset.i];if(q){PP=PP.filter(x=>x.id!==q.id);savePP()}}});
