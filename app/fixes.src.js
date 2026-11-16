/* ===== جولة إصلاح Android (فرع ux/sijil-android-fixes) ===== */
const FXMARK='<svg class="sjmk" viewBox="0 0 56 56" role="img" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="9" stroke-linejoin="miter"><g transform="translate(13 7) skewX(-12)"><path d="M33 5H5V21H33V37H5"/></g></svg>';
/* 1) الشريط السفلي: التمرين · التغذية · اليوم (الشعار) · التقدّم · المزيد. في RTL أول عنصر على اليمين. */
sjNav=function(){
 if(UI.ses||(S.sub==='wk'&&UI.wk))return '';
 const it=[['train','dumbbell','التمرين'],['food','fork','التغذية'],['dash',0,'اليوم'],['pg','chart','التقدّم'],['ex','grid','المزيد']];
 return '<div class="pill2">'+it.map(n=>{const on=n[0]===S.tab||(n[0]==='dash'&&S.tab==='home');
  return '<button class="'+(n[1]?'':'sjplus sjhome ')+(on?'on cur':'')+'" data-a="go" data-v="'+n[0]+'" aria-label="'+n[2]+'"'+(on?' aria-current="page"':'')+'>'+(n[1]?ic(n[1])+'<span>'+n[2]+'</span>':FXMARK+'<span class="sr">'+n[2]+'</span>')+'</button>'}).join('')+'</div>'};
/* 2) «المزيد»: روابط مجمّعة بلا إعادة عرض لمحتوى الشاشات الأخرى */
vEx=function(){
 const P=S.prof,R=(k,n,t,a,d)=>'<button class="sjrow" '+a+'>'+sjI(k,n)+'<span class="t">'+t+(d?'<small>'+d+'</small>':'')+'</span>'+ic('next')+'</button>',S2=v=>'data-a="sub" data-v="'+v+'"';
 let h='<div class="sjttl"><div><h1>المزيد</h1><div class="mu">إدارة التطبيق وتفضيلاتك</div></div></div>';
 h+='<button class="sjrow" data-a="go" data-v="me" style="background:var(--sj-btn)!important;color:var(--sj-btnt)!important"><span class="av" style="width:40px;height:40px;display:grid;place-items:center;border-radius:50%;flex:none;overflow:hidden">'+(P.av?'<img alt="" src="'+P.av+'" style="width:100%;height:100%;object-fit:cover">':esc((P.name||'س').charAt(0)))+'</span><span class="t">الملف الشخصي<small style="color:inherit;opacity:.75">بياناتك وأهدافك</small></span>'+ic('next')+'</button>';
 h+='<div class="sjsec">التطبيق</div>'+R('nt','gear','الإعدادات',S2('set'),'المظهر والوقت والصلاة والحساب والبيانات')+R('nt','bell','مركز الإشعارات',S2('nc'),ncUnread()?F(ncUnread())+' غير مقروء':'')+R('nt','users','المجتمع',S2('comm'));
 h+='<div class="sjsec">المعرفة والأدوات</div>'+R('rp','book','الثقافة الرياضية',S2('cul'))+R('wt','calc','الأدوات والحاسبات',S2('tools'),'الأدوات والمنبهات')+R('md','spark','المدرب الذكي',S2('coach'));
 h+='<div class="sjsec">النادي</div>'+R('ar','pin','النادي',S2('gyms'),'الأندية القريبة')+R('ar','calendar','جدول زيارتي للنادي',S2('vis'))+R('ar','bell','منبه الذهاب والغياب',S2('rem'));
 h+='<div class="sjsec">الدعم</div><a class="sjrow" href="privacy.html">'+sjI('dt','info')+'<span class="t">الخصوصية والدعم<small>سياسة الخصوصية وطرق التواصل</small></span>'+ic('next')+'</a>';
 return h};
/* 3) الإعدادات: تُنقل كل الإعدادات السابقة إلى مجموعاتها النهائية ويُحذف قسم «إعدادات سابقة» */
function fxLang(){const cur=document.body.classList.contains('nobi')?'0':document.body.classList.contains('en1')?'en':'1';
 return '<div class="mu" style="margin:10px 0 6px">اللغة</div><div class="seg nobi-x">'+[['1','عربي + English'],['0','عربي فقط'],['en','English only']].map(x=>'<button class="'+(cur===x[0]?'on':'')+'" data-a="biset" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'}
function fxAi(){return CFG.aiUrl&&!IN_CLAUDE?'<div class="row" style="margin:6px 0" id="ai-row"><div class="t"><b>الذكاء الاصطناعي</b><div class="mu">'+(aiOk()?'وافقت على إرسال طلباتك للتحليل':'لا يُرسل شيء قبل موافقتك')+'</div></div><span class="sp"></span>'+(aiOk()?'<button class="chip" data-a="aiwd">سحب الموافقة</button>':'<span class="mu">غير مفعّلة</span>')+'</div>':''}
function fxBackup(){return '<div class="card"><h2>'+ic('download')+'النسخ الاحتياطي</h2><div class="row"><button class="btn sm ghost" data-a="exp">'+ic('download')+'تصدير بياناتي</button></div><div class="mu" style="margin:14px 0 6px">استرجاع نسخة محفوظة (الصق محتوى ملف JSON أو ارفعه)</div><textarea id="impall" placeholder="{...}"></textarea><div class="row" style="margin-top:8px"><input type="file" id="impall-f" accept=".json" style="flex:1;width:auto"><button class="btn sm" data-a="impall">استرجاع</button></div>'+(UI.msg?'<div class="tag" style="margin-top:8px">'+esc(UI.msg)+'</div>':'')+'</div>'}
(()=>{const Vs=vSet;vSet=function(){let x=Vs.apply(this,arguments);
 x=x.replace(/<details class="sjgrp" data-g="dt"[\s\S]*?<\/details>/,'');
 const i=x.indexOf('<details class="sjmore" id="set-old"');if(i>=0)x=x.slice(0,i);
 /* اللغة في «المظهر واللغة» */
 x=x.replace(/(<details class="sjgrp" data-g="ap"[\s\S]*?<div class="sjgb">)/,'$1'+fxLang().replace(/\$/g,'$$$$'));
 const n=ncUnread?0:0;
 x+=rdRow('dly','bell','#FF8659','تذكير التمرين اليومي','',setNotifHtml());
 x+=rdRow('acc','user','#8EAECE','الحساب والمزامنة',(S.acct&&S.acct.email)?'مسجّل':'',setAccHtml()+setSyncHtml()+setPinHtml());
 x+=rdRow('dat','info','#8EAECE','البيانات والنسخ والخصوصية','على الجهاز',
  '<div class="mu">الطقس يُخزَّن مؤقتًا على جهازك (تُرسل خطوط الإحداثيات للمدينة فقط إلى مزوّد الطقس). الموقع التقريبي لا يُحفظ إلا إن اخترت.</div><button class="chip" data-a="rdclr">مسح الأماكن المحفوظة وتوقع الطقس</button>'+fxAi()+fxBackup()+setImportHtml()+setPrivHtml()+'<div class="row"><span>الإصدار</span><span class="sp"></span><b class="num" dir="ltr">'+APPV+'</b></div>');
 return x}})();
ACT.rdgoold=function(b){UI.sgo=UI.sgo||{};UI.sgo[(b&&b.dataset&&b.dataset.v)||'dat']=true};
/* الملف الشخصي: الأهداف المنقولة من الإعدادات السابقة */
(()=>{const Pf=rdProf;rdProf=function(){return Pf.apply(this,arguments)+setGoalHtml()}})();
/* 4) «اليوم»: الإجراء الأقرب، هدف الأسبوع، الساعة والطقس. الباقي له مكانه الأصلي */
(()=>{const T=vToday;vToday=function(){let h=T.apply(this,arguments);
 h=h.replace(/<div class="sjgrid">[\s\S]*?<\/button><\/div>/,'');
 const i=h.indexOf('<details class="sjmore" id="td-more"');if(i>=0)h=h.slice(0,i);
 return h}})();
/* لوحة المفاتيح: نخفي الشريط السفلي أثناء الكتابة (الهوامش تأتي من Capacitor adjustMarginsForEdgeToEdge) */
(()=>{const t=e=>e&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName)&&!/^(checkbox|radio|file|button|range)$/.test(e.type||'');
 document.addEventListener('focusin',e=>{if(t(e.target)){document.body.classList.add('kbd');setTimeout(()=>{try{e.target.scrollIntoView({block:'center'})}catch(x){}},250)}});
 document.addEventListener('focusout',()=>{setTimeout(()=>{if(!t(document.activeElement))document.body.classList.remove('kbd')},120)});
})();
/* نوع المجموعة والجهد RPE: داخل إجراء تابع للمجموعة بدل صفوف دائمة */
(()=>{const W=vWk;vWk=function(){let h=W.apply(this,arguments);
 const a=h.indexOf('<div class="chips" style="justify-content:center;margin-bottom:8px"><button class="chip');
 if(a<0)return h;const b=h.indexOf('<div class="chips" style="justify-content:center;margin-bottom:8px;align-items:center">',a),e=b<0?-1:h.indexOf('</div>',b);if(e<0)return h;
 const blk=h.slice(a,e+6);return h.slice(0,a)+'<details class="sjmore sjsetd" id="wk-det"'+(UI.wkDet?' open':'')+'><summary>تفاصيل المجموعة · النوع والجهد</summary><div class="sjmb">'+blk+'</div></details>'+h.slice(e+6)}})();
document.addEventListener('toggle',ev=>{const d=ev.target;if(d&&d.id==='wk-det')UI.wkDet=d.open},true);
/* ===== 5) أدوات الإدخال: ورقة سفلية مشتركة + منتقيات ===== */
const fxQ=s=>document.querySelector(s);
function fxSheet(title,body,onSave,opts){opts=opts||{};fxClose();
 const d=document.createElement('div');d.id='fx-sheet';d.className='fxs';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label',title);
 d.innerHTML='<div class="fxb" data-fxx="1"></div><div class="fxp"><div class="fxg"></div><div class="fxh"><b>'+title+'</b></div><div class="fxc"></div><div class="fxa"><button type="button" class="btn ghost" data-fxx="1">إلغاء</button>'+(opts.del?'<button type="button" class="btn ghost fxdel" data-fxd="1">حذف</button>':'')+'<button type="button" class="btn" data-fxs="1">'+(opts.ok||'حفظ')+'</button></div></div>';
 d.querySelector('.fxc').appendChild(body);document.body.appendChild(d);document.body.classList.add('fxopen');
 d.addEventListener('click',e=>{const t=e.target.closest('[data-fxx],[data-fxs],[data-fxd]');if(!t)return;
  if(t.dataset.fxs){const r=onSave&&onSave();if(r!==false)fxClose()}else if(t.dataset.fxd){opts.del&&opts.del();fxClose()}else fxClose()});
 setTimeout(()=>{const f=d.querySelector('.fxw .on,.fxn,input');if(f&&f.focus)try{f.focus({preventScroll:true})}catch(x){}},50);return d}
function fxClose(){const d=fxQ('#fx-sheet');if(d)d.remove();document.body.classList.remove('fxopen')}
document.addEventListener('keydown',e=>{if(e.key==='Escape')fxClose()});
/* عجلة أرقام: العنصر المحدد في الوسط */
function fxWheel(min,max,step,val,fmt,label){const w=document.createElement('div');w.className='fxw';w.setAttribute('role','spinbutton');w.setAttribute('aria-label',label);w.tabIndex=0;
 const vals=[];for(let v=min;v<=max+1e-9;v+=step)vals.push(+v.toFixed(2));
 w.innerHTML='<div class="fxl">'+vals.map(v=>'<div class="fxi" data-v="'+v+'">'+fmt(v)+'</div>').join('')+'</div><i class="fxm"></i>';
 const L=w.firstChild;let cur=vals.reduce((a,v)=>Math.abs(v-val)<Math.abs(a-val)?v:a,vals[0]);
 const H=44,idx=()=>Math.max(0,Math.min(vals.length-1,Math.round(L.scrollTop/H))),mark=()=>{[...L.children].forEach((c,i)=>c.classList.toggle('on',vals[i]===cur))};
 requestAnimationFrame(()=>{L.scrollTop=vals.indexOf(cur)*H;mark()});
 let tm;L.addEventListener('scroll',()=>{cur=vals[idx()];mark();w.setAttribute('aria-valuenow',cur);clearTimeout(tm)},{passive:true});
 L.addEventListener('click',e=>{const i=e.target.closest('.fxi');if(i){cur=+i.dataset.v;L.scrollTo({top:vals.indexOf(cur)*H,behavior:'smooth'})}});
 w.addEventListener('keydown',e=>{const k=e.key==='ArrowUp'?-1:e.key==='ArrowDown'?1:0;if(k){e.preventDefault();const i=Math.max(0,Math.min(vals.length-1,vals.indexOf(cur)+k));cur=vals[i];L.scrollTo({top:i*H,behavior:'smooth'})}});
 w.get=()=>cur;return w}
/* لوحة أرقام للكميات */
function fxPad(init,unit,max){let v=String(init||'');const b=document.createElement('div');b.className='fxn';
 b.innerHTML='<div class="fxv"><b class="num" id="fxnv">'+(v||'0')+'</b> <span class="mu">'+unit+'</span></div><div class="fxk">'+[1,2,3,4,5,6,7,8,9,'C',0,'⌫'].map(k=>'<button type="button" data-k="'+k+'" aria-label="'+(k==='C'?'مسح':k==='⌫'?'حذف':k)+'">'+k+'</button>').join('')+'</div>';
 b.addEventListener('click',e=>{const k=e.target.closest('[data-k]');if(!k)return;const c=k.dataset.k;if(c==='C')v='';else if(c==='⌫')v=v.slice(0,-1);else if((v+c).length<=5&&+(v+c)<=(max||99999))v=(v==='0'?'':v)+c;b.querySelector('#fxnv').textContent=v||'0'});
 b.get=()=>+v||0;return b}
/* الطول: بكرة سم */
function fxHeight(inp){const w=fxWheel(100,230,1,+inp.value||170,v=>String(v),'الطول');const r=document.createElement('div');r.className='fxr';r.innerHTML='<span class="fxu">سم</span>';r.prepend(w);
 fxSheet('الطول',r,()=>{inp.value=w.get();inp.dispatchEvent(new Event('change',{bubbles:true}));fxPaint(inp)})}
/* الوزن: كسور بوحدة المستخدم */
function fxWeight(inp,title){const u=typeof uL==='function'?uL():'كغ',lb=/lb|رطل/i.test(u),v0=+inp.value||(lb?154:70),lo=lb?40:20,hi=lb?660:300;
 const a=fxWheel(lo,hi,1,Math.floor(v0),v=>String(v),'الجزء الصحيح'),c=fxWheel(0,9,1,Math.round((v0-Math.floor(v0))*10),v=>'.'+v,'الكسر');const r=document.createElement('div');r.className='fxr';r.appendChild(a);r.appendChild(c);r.insertAdjacentHTML('beforeend','<span class="fxu">'+u+'</span>');
 fxSheet(title||'الوزن',r,()=>{inp.value=(a.get()+c.get()/10).toFixed(1);inp.dispatchEvent(new Event('change',{bubbles:true}));inp.dispatchEvent(new Event('input',{bubbles:true}));fxPaint(inp)})}
/* العمر من تاريخ الميلاد */
const fxAge=iso=>{const b=new Date(iso+'T12:00:00'),n=new Date(),k=n.getFullYear()-b.getFullYear()-((n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))?1:0);return k};
function fxDob(inp){const td=TD(),d=document.createElement('div');d.className='fxd';const cur=S.prof.dob||'';
 d.innerHTML='<label class="f">تاريخ الميلاد<input type="date" id="fx-dob" max="'+td+'" min="1920-01-01" value="'+cur+'"></label><div class="fxage"><b class="num" id="fx-age">'+(cur?F(fxAge(cur)):'—')+'</b> <span class="mu">سنة</span></div><div class="mu" id="fx-dob-e" role="alert"></div>';
 const i=d.querySelector('#fx-dob');i.addEventListener('input',()=>{const v=i.value,e=d.querySelector('#fx-dob-e');if(!v){d.querySelector('#fx-age').textContent='—';return}if(v>td){e.textContent='لا يمكن اختيار تاريخ مستقبلي';d.querySelector('#fx-age').textContent='—';return}e.textContent='';d.querySelector('#fx-age').textContent=F(fxAge(v))});
 fxSheet('تاريخ الميلاد',d,()=>{const v=i.value;if(!v||v>td){d.querySelector('#fx-dob-e').textContent=v>td?'لا يمكن اختيار تاريخ مستقبلي':'اختر تاريخ الميلاد';return false}S.prof.dob=v;inp.value=fxAge(v);inp.dispatchEvent(new Event('change',{bubbles:true}));save();fxPaint(inp)});
 setTimeout(()=>{try{i.showPicker&&i.showPicker()}catch(e){}},200)}
/* تحويل الحقول الرقمية إلى حقول اختيار (تقرأ القيمة الحالية وتكتب إلى الحقل نفسه فتعمل المعالجات القديمة) */
const FXMAP=[['[data-c="pf:age"],#wz-m-age','age'],['[data-c="pf:ht"],#wz-m-ht','ht'],['[data-c="pf:startW"],#wz-m-startW,[data-c="pf:goal"],#we-w,[data-c="tl:w"]','w']];
function fxPaint(i){const k=i.dataset.fxp,v=+i.value;let h=i.parentElement.querySelector('.fxhint');if(k==='age'&&S.prof.dob){if(!h){h=document.createElement('small');h.className='mu fxhint';i.parentElement.appendChild(h)}h.textContent='من تاريخ الميلاد '+S.prof.dob}}
function fxEnhance(){FXMAP.forEach(([sel,k])=>document.querySelectorAll(sel).forEach(i=>{if(i.dataset.fxp)return;i.dataset.fxp=k;i.setAttribute('inputmode','none');i.classList.add('fxpick');i.setAttribute('aria-haspopup','dialog');fxPaint(i)}))}
document.addEventListener('click',e=>{const i=e.target.closest&&e.target.closest('input.fxpick');if(!i)return;e.preventDefault();i.blur();const k=i.dataset.fxp;
 if(k==='age')fxDob(i);else if(k==='ht')fxHeight(i);else fxWeight(i,(i.closest('label')||{}).textContent?i.closest('label').childNodes[0].textContent.trim():'')},true);
document.addEventListener('focusin',e=>{const i=e.target;if(i.classList&&i.classList.contains('fxpick')){i.blur()}},true);
(()=>{const R=render;render=function(){const r=R.apply(this,arguments);try{if(S.prof&&S.prof.dob){const a=fxAge(S.prof.dob);if(a>0&&a<120&&S.prof.age!==a)S.prof.age=a}fxEnhance()}catch(e){lg(e)}return r}})();
/* ===== 6) الماء: سجل بإدخالات، كميات سريعة، كمية مخصّصة، تراجع وتعديل، وحماية من الضغط المزدوج ===== */
function fxWl(d){S.wl=S.wl||{};const a=S.wl[d]=S.wl[d]||[];const tot=+S.wtr[d]||0,s=a.reduce((x,e)=>x+e.ml,0);if(tot!==s&&!a.some(e=>e.leg)){if(tot>s)a.unshift({id:'leg',ml:tot-s,t:0,leg:1});else{S.wtr[d]=s}}return a}
function fxWSet(d,a){S.wl[d]=a;S.wtr[d]=Math.max(0,a.reduce((x,e)=>x+e.ml,0))}
let fxWLast=0;
function fxWAdd(d,ml){if(!(ml>0))return false;const n=Date.now();if(n-fxWLast<700)return false;fxWLast=n;const a=fxWl(d);a.push({id:'w'+n,ml:ml,t:n});fxWSet(d,a);return true}
waterCard=function(d,compact){const a=fxWl(d),ml=+S.wtr[d]||0,g=waterGoal(),us=a.filter(e=>!e.leg);
 const log=a.length?'<div class="fxlog" id="w-log">'+a.slice().reverse().map(e=>'<button type="button" class="fxle" data-a="wted" data-d="'+d+'" data-id="'+esc(e.id)+'" aria-label="تعديل '+F(e.ml)+' مل">'+(e.leg?'<span class="mu">رصيد سابق</span>':'<span class="num mu" dir="ltr">'+rdF(e.t,rdCity().tz)+'</span>')+'<b class="num">'+F(e.ml)+' مل</b>'+ic('next')+'</button>').join('')+'</div>':'';
 return '<div class="card" id="w-card"><div class="row" style="margin-bottom:8px"><h2 style="margin:0">'+ic('drop')+'الماء</h2><span class="sp"></span><span class="mu"><b class="num" id="w-tot" style="color:#42B9FF;font-size:17px">'+F(ml)+'</b> من <span class="num">'+F(g)+'</span> مل</span></div><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="'+g+'" aria-valuenow="'+ml+'"><i style="width:'+pct(ml,g)+'%;background:#42B9FF"></i></div>'
 +'<div class="fxq" style="margin-top:10px">'+[250,500,750].map(v=>'<button type="button" class="chip fxwb" data-a="wtr" data-d="'+d+'" data-v="'+v+'" aria-label="إضافة '+v+' مل">'+ic('drop')+'<span class="num">+'+v+'</span></button>').join('')+'<button type="button" class="chip" data-a="wtc" data-d="'+d+'">'+ic('plus')+'كمية مخصّصة</button><button type="button" class="chip" data-a="wtu" data-d="'+d+'"'+(us.length?'':' disabled')+' aria-label="تراجع عن آخر إضافة">'+ic('back')+'تراجع</button></div>'+log
 +(compact?'':'<label class="f" style="margin-top:10px">هدف الماء اليومي (مل)<input type="number" inputmode="numeric" data-c="pf:water" value="'+(S.prof.water||'')+'" placeholder="'+g+'"></label>')+'</div>'};
Object.assign(ACT,{
 wtr:b=>{const d=b.dataset.d||TD(),v=+b.dataset.v;if(v<0){const a=fxWl(d),u=a.filter(e=>!e.leg).pop();if(u){a.splice(a.indexOf(u),1);fxWSet(d,a)}return}if(!fxWAdd(d,v))return false},
 wtu:b=>{const d=b.dataset.d||TD(),a=fxWl(d),u=a.filter(e=>!e.leg).pop();if(!u)return false;a.splice(a.indexOf(u),1);fxWSet(d,a)},
 wtc:b=>{const d=b.dataset.d||TD(),p=fxPad('','مل',5000);fxSheet('كمية مخصّصة',p,()=>{const v=p.get();if(!(v>0)||v>5000)return false;fxWLast=0;fxWAdd(d,v);save();render()},{ok:'إضافة'});return false},
 wted:b=>{const d=b.dataset.d||TD(),a=fxWl(d),e=a.find(x=>x.id===b.dataset.id);if(!e)return false;const p=fxPad(e.ml,'مل',5000);
  fxSheet(e.leg?'تعديل الرصيد السابق':'تعديل إدخال',p,()=>{const v=p.get();if(!(v>0)||v>5000)return false;e.ml=v;fxWSet(d,a);save();render()},{del:()=>{a.splice(a.indexOf(e),1);fxWSet(d,a);save();render()}});return false}});
/* ===== 7) صورة الملف الشخصي: معاينة قص دائرية (سحب وتكبير وتوسيط) ===== */
function fxCrop(file){const url=URL.createObjectURL(file),im=new Image();im.onload=()=>{
 const V=280,box=document.createElement('div');box.className='fxcrop';
 box.innerHTML='<div class="fxcv" style="width:'+V+'px;height:'+V+'px"><canvas width="'+V+'" height="'+V+'"></canvas><i class="fxring"></i></div><label class="fxz"><span class="mu">تكبير</span><input type="range" min="1" max="4" step="0.01" value="1" aria-label="تكبير الصورة"></label><div class="row" style="justify-content:center"><button type="button" class="chip" data-fxc="1">توسيط</button></div>';
 const cv=box.querySelector('canvas'),cx=cv.getContext('2d'),rg=box.querySelector('input');
 let base=Math.max(V/im.width,V/im.height),z=1,ox=(V-im.width*base)/2,oy=(V-im.height*base)/2;
 const clamp=()=>{const s=base*z,w=im.width*s,h=im.height*s;ox=Math.min(0,Math.max(V-w,ox));oy=Math.min(0,Math.max(V-h,oy))};
 const draw=()=>{clamp();cx.fillStyle='#000';cx.fillRect(0,0,V,V);cx.drawImage(im,ox,oy,im.width*base*z,im.height*base*z)};
 const zoomTo=(nz,fx,fy)=>{nz=Math.max(1,Math.min(4,nz));const s0=base*z,s1=base*nz;ox=fx-(fx-ox)*s1/s0;oy=fy-(fy-oy)*s1/s0;z=nz;rg.value=z;draw()};
 rg.addEventListener('input',()=>zoomTo(+rg.value,V/2,V/2));
 box.querySelector('[data-fxc]').addEventListener('click',()=>{z=1;rg.value=1;ox=(V-im.width*base)/2;oy=(V-im.height*base)/2;draw()});
 const P=new Map();let d0=0,z0=1;
 cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.clientX,e.clientY]);if(P.size===2){const a=[...P.values()];d0=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);z0=z}});
 cv.addEventListener('pointermove',e=>{if(!P.has(e.pointerId))return;const p=P.get(e.pointerId);if(P.size===1){ox+=e.clientX-p[0];oy+=e.clientY-p[1];P.set(e.pointerId,[e.clientX,e.clientY]);draw()}else if(P.size===2){P.set(e.pointerId,[e.clientX,e.clientY]);const a=[...P.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);zoomTo(z0*d/(d0||1),V/2,V/2)}});
 ['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,e=>{P.delete(e.pointerId)}));
 cv.addEventListener('wheel',e=>{e.preventDefault();zoomTo(z*(e.deltaY<0?1.08:.92),V/2,V/2)},{passive:false});
 draw();
 const sh=fxSheet('صورة الملف الشخصي',box,()=>{const o=document.createElement('canvas');o.width=o.height=192;const s=base*z;o.getContext('2d').drawImage(im,-ox/s,-oy/s,V/s,V/s,0,0,192,192);
  try{S.prof.av=o.toDataURL('image/jpeg',.85)}catch(e){lg(e)}
  const c2=document.createElement('canvas'),tw=Math.min(720,im.width),th=Math.round(tw*1.25);c2.width=tw;c2.height=th;let cw=im.width,ch=im.width*1.25;if(ch>im.height){ch=im.height;cw=ch/1.25}c2.getContext('2d').drawImage(im,(im.width-cw)/2,(im.height-ch)/2,cw,ch,0,0,tw,th);try{S.prof.ph=c2.toDataURL('image/jpeg',.8)}catch(e){lg(e)}
  URL.revokeObjectURL(url);save();render()});
 sh.querySelectorAll('[data-fxx]').forEach(x=>x.addEventListener('click',()=>URL.revokeObjectURL(url)))};
 im.onerror=()=>{URL.revokeObjectURL(url);toast('تعذّر فتح الصورة')};im.src=url}
document.addEventListener('change',e=>{const t=e.target;if(t&&t.id==='av-in'){e.stopImmediatePropagation();const f=t.files&&t.files[0];t.value='';if(f)fxCrop(f)}},true);

/* ===== المرحلة 5: الساعة والموقع والطقس ===== */
[['abha','أبها','Abha',18.2164,42.5053,'Asia/Riyadh'],['tabuk','تبوك','Tabuk',28.3835,36.5662,'Asia/Riyadh'],['buraydah','بريدة','Buraydah',26.326,43.975,'Asia/Riyadh'],['hail','حائل','Hail',27.5114,41.72,'Asia/Riyadh'],['taif','الطائف','Taif',21.2703,40.4158,'Asia/Riyadh'],['yanbu','ينبع','Yanbu',24.0895,38.0618,'Asia/Riyadh'],['khobar','الخبر','Al Khobar',26.2172,50.1971,'Asia/Riyadh'],['jazan','جازان','Jazan',16.8892,42.5511,'Asia/Riyadh'],['abudhabi','أبوظبي','Abu Dhabi',24.4539,54.3773,'Asia/Dubai'],['doha','الدوحة','Doha',25.2854,51.531,'Asia/Qatar'],['kuwait','الكويت','Kuwait City',29.3759,47.9774,'Asia/Kuwait'],['manama','المنامة','Manama',26.2285,50.586,'Asia/Bahrain'],['muscat','مسقط','Muscat',23.588,58.3829,'Asia/Muscat'],['amman','عمّان','Amman',31.9454,35.9284,'Asia/Amman'],['istanbul','إسطنبول','Istanbul',41.0082,28.9784,'Europe/Istanbul'],['london','لندن','London',51.5072,-0.1276,'Europe/London'],['newyork','نيويورك','New York',40.7128,-74.006,'America/New_York'],['kualalumpur','كوالالمبور','Kuala Lumpur',3.139,101.6869,'Asia/Kuala_Lumpur']].forEach(c=>{if(!RDC.some(x=>x[0]===c[0]))RDC.push(c)});
function fxNearTz(la,lo){let b=null,d=1e9;RDC.forEach(c=>{const k=(c[3]-la)*(c[3]-la)+(c[4]-lo)*(c[4]-lo);if(k<d){d=k;b=c}});return d<4&&b?b[5]:Intl.DateTimeFormat().resolvedOptions().timeZone}
function fxPhase(now,c){const sd=rdSun(now,c);if(sd.sunrise==null||sd.sunset==null){const hr=rdP(now,c.tz).h;return{ph:hr>=6&&hr<18?'day':'night',p:null}}
 if(now<sd.sunrise-45*6e4)return{ph:'night',p:null,sd};if(now<sd.sunrise+45*6e4)return{ph:'dawn',p:0,sd};if(now<sd.sunset-45*6e4)return{ph:'day',p:(now-sd.sunrise)/(sd.sunset-sd.sunrise),sd};if(now<sd.sunset+45*6e4)return{ph:'dusk',p:1,sd};return{ph:'night',p:null,sd}}
function fxWxKind(code){return code==null?'':code>=95?'storm':(code>=51&&code<=67)||(code>=80&&code<=82)?'rain':code>=71&&code<=77?'snow':code>=45&&code<=48?'fog':code>=2?'cloud':'clear'}
function fxArc(f,now,c){const W=300,H=86,cx=150,cy=80,r=130;let p=f.p;let body='';
 if(f.ph==='night'){const sd=f.sd,hr=rdP(now,c.tz),m=(hr.h*60+hr.m+1440-18*60)%1440;p=Math.max(0,Math.min(1,m/(12*60)));const a=Math.PI*(1-p),x=cx+r*Math.cos(a),y=cy-Math.min(70,r*Math.sin(a)*.55);body='<circle class="fxmoon" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="9"/><circle cx="'+(x+4).toFixed(1)+'" cy="'+(y-2).toFixed(1)+'" r="8" class="fxmoon2"/>'}
 else{p=Math.max(0,Math.min(1,p==null?.5:p));const a=Math.PI*(1-p),x=cx+r*Math.cos(a),y=cy-Math.min(70,r*Math.sin(a)*.55);body='<circle class="fxsun" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="9"/>'}
 return '<svg class="fxarc" viewBox="0 0 '+W+' '+H+'" aria-hidden="true"><path d="M20 80 Q150 -10 280 80" class="fxarcp"/><line x1="10" y1="80" x2="290" y2="80" class="fxhor"/>'+body+'</svg>'}
const FXPH={dawn:['#3b3b7a','#e58a6b'],day:['#1e6fd6','#6cb7f5'],dusk:['#4a2c6e','#f08a4b'],night:['#060b1f','#1b2a5a']};
function fxSceneImg(kind,ph){let s='';if(ph==='night')for(let i=0;i<22;i++)s+='<circle cx="'+((i*47+13)%300)+'" cy="'+((i*29+7)%60)+'" r="'+(i%3?.8:1.3)+'" fill="#fff" opacity=".7"/>';
 if(kind==='cloud'||kind==='rain'||kind==='storm'||kind==='snow')s+='<g fill="#fff" opacity=".22"><ellipse cx="70" cy="34" rx="40" ry="12"/><ellipse cx="105" cy="30" rx="28" ry="14"/><ellipse cx="230" cy="48" rx="46" ry="12"/></g>';
 if(kind==='rain'||kind==='storm')for(let i=0;i<16;i++)s+='<line x1="'+(i*19+5)+'" y1="'+((i*13)%40+40)+'" x2="'+(i*19)+'" y2="'+((i*13)%40+54)+'" stroke="#cfe6ff" stroke-width="1" opacity=".45"/>';
 if(kind==='fog')s+='<rect x="0" y="50" width="300" height="10" fill="#fff" opacity=".18"/><rect x="0" y="68" width="300" height="8" fill="#fff" opacity=".12"/>';
 return 'url("data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" preserveAspectRatio="xMidYMid slice">'+s+'</svg>')+'")'}
const FX_OLD_TC=rdTodayCard;
rdTodayCard=function(){const s=rdS();if(!s.wxOn&&!s.prOn)return '';
 const old=FX_OLD_TC();const m=old.match(/<details class="sjmore" id="rd-more"[\s\S]*<\/details>/);const more=m?m[0]:'';
 const c=rdCity(),now=rdNow(),w=rdWx(),cur=rdHour(now),st=rdStale(),dev=Intl.DateTimeFormat().resolvedOptions().timeZone,f=fxPhase(now,c),
  kind=cur&&st!=='expired'?fxWxKind(cur.code):'',g=FXPH[f.ph];
 const out=!w||st==='expired';
 let h='<div class="card sjwx fxscene fxph-'+f.ph+' fxk-'+(kind||'none')+'" style="--g1:'+g[0]+';--g2:'+g[1]+'"><div class="fximg" style="background-image:'+fxSceneImg(kind,f.ph)+'"></div><div class="fxtint"></div><div class="fxin">'+
  '<div class="row" style="gap:8px"><button class="fxcity" data-a="fxcity" aria-label="اختيار المدينة: '+esc(c.n)+'">'+ic('pin')+' <b>'+esc(c.n)+'</b> <small>▾</small></button><span class="sp"></span><span class="num fxclk" data-rdclk>'+rdF(now,c.tz)+'</span></div>';
 if(dev&&dev!==c.tz)h+='<div class="fxs2">توقيت '+esc(c.n)+' يختلف عن توقيت الجهاز</div>';
 h+=fxArc(f,now,c);
 if(s.wxOn){if(!out&&cur)h+='<div class="row" style="gap:12px;margin:2px 0 4px"><b class="num fxtemp">'+rdT(cur.temp)+'</b><div><div>'+rdCode(cur.code)+'</div><div class="fxs2">محسوسة '+rdT(cur.feels)+'</div></div></div>';
  else h+='<div class="fxs2" style="margin:6px 0">'+(st==='expired'?'انتهت صلاحية التوقع المحفوظ.':'لا يتوفر توقع محفوظ.')+(RDW.err[rdKey(c)]?' · تعذّر التحديث لهذه المدينة':'')+(navigator.onLine===false?' · لا يوجد اتصال':'')+'</div>';
  if(w)h+='<div class="fxs2'+(st==='stale'||st==='expired'?' fxwarn':'')+'">'+(st==='fresh'?'آخر تحديث ':'التوقع قديم · آخر تحديث ')+rdF(w.at,c.tz)+'</div>';
  const sd=f.sd||rdSun(now,c);if(s.sunOn&&sd.sunrise!=null)h+='<div class="row" style="gap:14px;margin-top:4px"><span>الشروق <b class="num">'+rdF(sd.sunrise,c.tz)+'</b></span><span>الغروب <b class="num">'+rdF(sd.sunset,c.tz)+'</b></span></div>'}
 return h+'</div>'+more.replace('class="sjmore"','class="sjmore fxmore"')+'</div>'};
/* اختيار المدينة */
function fxCityList(q){q=(q||'').trim().toLowerCase();const en=document.body.classList.contains('en1'),cur=rdCity();
 const L=RDC.filter(x=>!q||x[1].toLowerCase().indexOf(q)>=0||x[2].toLowerCase().indexOf(q)>=0);
 return L.length?L.map(x=>'<button type="button" class="fxcr'+(cur.id===x[0]?' on':'')+'" data-fxcity="'+x[0]+'"><span>'+esc(en?x[2]:x[1])+'</span><small dir="ltr">'+esc(x[5])+'</small></button>').join(''):'<div class="mu" style="padding:12px">لا توجد مدينة بهذا الاسم. جرّب اسمًا آخر أو أدخل مدينة مخصصة من الإعدادات.</div>'}
function fxPickCity(id){const s=rdS();s.city=id;s.cus=null;s.geo=0;UI._rdf=undefined;save();rdNtSoon&&rdNtSoon();fxClose();render()}
ACT.fxcity=()=>{const b=document.createElement('div');b.innerHTML='<input class="fxsearch" type="search" placeholder="ابحث عن مدينة" aria-label="بحث عن مدينة" autocomplete="off"><div class="fxcl">'+fxCityList('')+'</div><button type="button" class="btn ghost" data-fxgeo="1" style="margin-top:8px;width:100%">'+ic('pin')+' استخدم موقعي</button>';
 const d=fxSheet('اختر مدينة',b,function(){fxClose()},{ok:'إغلاق'});
 const inp=d.querySelector('.fxsearch'),L=d.querySelector('.fxcl');
 inp.addEventListener('input',()=>{L.innerHTML=fxCityList(inp.value)});
 d.addEventListener('click',e=>{const t=e.target.closest('[data-fxcity]');if(t)fxPickCity(t.dataset.fxcity);if(e.target.closest('[data-fxgeo]')){fxClose();ACT.rdgeo()}});return false};
/* استخدم موقعي: إذن أثناء الاستخدام (تقريبي) أو الويب */
let FXGEO=0;
ACT.rdgeo=()=>{const tk=++FXGEO;
 const done=(la,lo)=>{if(tk!==FXGEO)return;const s=rdS();s.cus={n:'موقعي التقريبي',lat:+la.toFixed(2),lon:+lo.toFixed(2),tz:fxNearTz(la,lo)};s.geo=1;UI._rdf=undefined;save();render();toast('تم تحديد المدينة من موقعك التقريبي')};
 const fail=m=>{if(tk!==FXGEO)return;toast(m||'تعذّر تحديد الموقع. اختر مدينة يدويًا.');UI.fxgeoerr=m||'تعذّر تحديد الموقع';ACT.fxcity()};
 const G=NAT&&NP('Geolocation');
 if(G){G.requestPermissions({permissions:['coarseLocation']}).then(r=>{const ok=r&&(r.coarseLocation==='granted'||r.location==='granted');if(!ok){fail('رُفض إذن الموقع. اختر مدينتك من القائمة.');return}
   return G.getCurrentPosition({enableHighAccuracy:false,timeout:10000,maximumAge:36e5}).then(p=>done(p.coords.latitude,p.coords.longitude))}).catch(()=>fail('الموقع معطّل أو غير متاح. فعّله من إعدادات الجهاز أو اختر مدينة.'));return false}
 if(!navigator.geolocation){fail('الموقع غير متاح على هذا الجهاز');return false}
 navigator.geolocation.getCurrentPosition(p=>done(p.coords.latitude,p.coords.longitude),()=>fail('رُفض إذن الموقع. اختر مدينتك من القائمة.'),{maximumAge:36e5,timeout:8000,enableHighAccuracy:false});return false};
const FX_RDSET=rdSet;
rdSet=function(){let h=FX_RDSET.apply(this,arguments);if(typeof h!=='string')return h;
 const btn='<div class="row" style="margin-top:10px;gap:8px"><div class="t"><b>اختر مدينة</b><div class="mu">بحث وقائمة مدن.</div></div><span class="sp"></span><button class="chip" data-a="fxcity">اختر مدينة</button></div><div class="row" style="margin-top:10px"><div class="t"><b>استخدم موقعي</b><div class="mu">إذن «أثناء الاستخدام» والموقع التقريبي فقط، ولا يعمل في الخلفية. يُرسَل خطّا العرض والطول لمزوّد الطقس (Open-Meteo) دون هويتك. عند الرفض اختر مدينة يدويًا.</div></div><span class="sp"></span><button class="chip" data-a="rdgeo">استخدم موقعي</button></div>';
 return h.replace(/<div class="mu" style="margin-top:10px">«استخدم موقعي» غير مفعّل[^<]*<\/div>/,btn)};

/* ===== المرحلة 6: الخطوات والنوم والنبض بحسب مصدر فعلي ===== */
var FXHIDE={};
function fxStp(){if(!S.stp||typeof S.stp!=='object'||Array.isArray(S.stp))S.stp={};const o=S.stp;if(!o.src)o.src={};return o}
const FXS={st:'',busy:0};
/* تقدّم العدّاد: يعالج اليوم الجديد وإعادة تشغيل الجهاز (العدّاد يبدأ من الصفر) دون عدّ مزدوج */
function fxStepAdv(st,c,day){
 if(!st||st.day!==day)return{day:day,boot:c.bootAt,last:c.steps,acc:0,from:c.at};
 if(Math.abs(c.bootAt-st.boot)<=120000&&c.steps>=st.last)return{day:day,boot:c.bootAt,last:c.steps,acc:st.acc+(c.steps-st.last),from:st.from};
 return{day:day,boot:c.bootAt,last:c.steps,acc:st.acc+c.steps,from:st.from}}
/* مصدر واحد للإجمالي: Health Connect إن وُجدت قراءته لليوم وإلا عدّاد الهاتف. لا جمع بينهما أبدًا */
function fxStepResolve(day){const o=fxStp(),r=o.src[day]||{};let v=null,src='';
 if(r.hc>0){v=r.hc;src='hc'}else if(r.sn!=null){v=r.sn;src='sensor'}
 if(v==null)return null;const c=S.cd[day]=S.cd[day]||{};c.steps=Math.round(v);c.stsrc=src;c.stat=src==='hc'?r.hat:r.sat;return{v:Math.round(v),src:src}}
function fxStepHc(day,v){const r=fxStp().src;(r[day]=r[day]||{}).hc=v;r[day].hat=Date.now();fxStepResolve(day)}
function fxToday(){return iso(new Date())}
async function fxStepSensor(ask){const P=NAT&&NP('StepCounter');
 if(!P){FXS.st=NAT?'unavail':'web';return 0}
 if(FXS.busy)return 0;FXS.busy=1;
 try{const a=await P.isAvailable();if(!a||!a.available){FXS.st='nosensor';return 0}
  let pm=await P.checkPermissions();
  if(pm.activity!=='granted'&&ask)pm=await P.requestPermissions({permissions:['activity']});
  if(pm.activity!=='granted'){FXS.st=pm.activity==='denied'?'denied':'prompt';fxStp().deny=pm.activity==='denied'?1:0;return 0}
  fxStp().deny=0;
  const r=await P.read(),o=fxStp(),day=fxToday();
  o.st=fxStepAdv(o.st,{steps:+r.steps,bootAt:+r.bootAt,at:+r.at},day);
  const d=o.src[day]=o.src[day]||{};d.sn=o.st.acc;d.sat=+r.at;d.from=o.st.from;
  fxStepResolve(day);save();FXS.st='ok';return 1}
 catch(e){FXS.st=String(e&&e.message||e)==='permission'?'prompt':'err';return 0}
 finally{FXS.busy=0}}
function fxStepStatus(){const o=fxStp(),day=fxToday(),r=o.src[day]||{},c=S.cd[day]||{},t=x=>x?rdF(x,Intl.DateTimeFormat().resolvedOptions().timeZone):'';
 const has=r.hc>0||r.sn!=null;
 let l;if(has){l='<b class="num">'+F(c.steps||0)+'</b> خطوة اليوم · المصدر: '+(c.stsrc==='hc'?'Health Connect':'عدّاد خطوات الهاتف')+(c.stsrc==='sensor'&&r.from?' · العدّ منذ '+t(r.from):'')+' · آخر قراءة '+t(c.stat)}
 else l='لا توجد قراءة خطوات اليوم.'+(FXS.st==='denied'||o.deny?' إذن النشاط البدني مرفوض؛ فعّله من إعدادات التطبيق في النظام.':FXS.st==='nosensor'?' الجهاز بلا حساس خطوات.':FXS.st==='web'?' القراءة التلقائية متاحة في تطبيق Android فقط.':'');
 return '<div class="card" id="fx-stp"><h2>'+ic('step')+'خطوات الهاتف</h2><div class="mu">'+l+'</div><div class="mu" style="margin-top:6px">تُقرأ تلقائيًا من Health Connect عند توفّرها، وإلا من عدّاد الهاتف. لا يُجمع المصدران ولا يوجد إدخال يدوي.</div>'+(NAT?'<div class="row" style="margin-top:8px"><button class="btn sm" data-a="fxstp">'+(has?'حدّث الآن':'تفعيل عدّاد الهاتف')+'</button></div>':'')+'</div>'}
ACT.fxstp=()=>{fxStepSensor(true).then(()=>{try{S.prof.hcOn&&hcSync(false)}catch(e){}render()});return false};
(function(){const V=hcCard;hcCard=function(){return fxStepStatus()+V.apply(this,arguments)}})();
/* لا إدخال يدوي للخطوات أو النوم أو النبض */
FXHIDE['cd:steps']=function(l,v){const c=S.cd[fxToday()]||{};return '<div class="f">'+l+'<b class="num">'+(c.steps?F(c.steps):'—')+'</b><small class="mu">'+(c.steps?(c.stsrc==='hc'?'Health Connect':c.stsrc==='sensor'?'عدّاد الهاتف':'مستورد'):'لا بيانات')+'</small></div>'};
FXHIDE['sleep']=FXHIDE['deep']=function(){return ''};
FXHIDE['cd:hr']=function(l,v){const c=S.cd[fxToday()]||{};return c.hrsrc&&c.hrat&&Date.now()-c.hrat<864e5?'<div class="f">'+l+'<b class="num">'+F(c.hr)+'</b><small class="mu">Health Connect</small></div>':''};
var fxNoLog=function(){return true};
(function(){const V=vLink;vLink=function(){let h=V.apply(this,arguments);if(typeof h!=='string')return h;
 h=h.replace(/<div class="card"><h2>[^]*?نبض لحظي بالبلوتوث[^]*?<\/div><\/div>(?=<)/,'');
 h=h.replace(/<button class="lnk"[^>]*data-v="watch">[^]*?<\/button>/,'');
 h=h.replace(/<div style="padding:8px 0;border-top:1px solid var\(--bd\)">(?:(?!<\/div><\/div>)[^])*?(?:بلوتوث|البلوتوث)[^]*?<\/div><\/div>/g,'');
 h=h.replace(/، أو الصق البيانات كنصٍ?\.?/,'.').replace(/ أو لصق البيانات بصيغة[^.<]*\./,'.');return h}})();
/* مزامنة تلقائية عند الفتح والعودة، دون طلب إذن */
function fxAutoSync(){if(!NAT)return;try{fxStepSensor(false).then(()=>{if(S.prof.hcOn)return hcSync(false)}).then(()=>{try{render()}catch(e){}})}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)fxAutoSync()});
setTimeout(fxAutoSync,1500);

/* ===== المرحلة 4: إنهاء جزئي بتأكيد، ومصدر القيمة الابتدائية ===== */
(function(){const V=ACT.wkend;
 ACT.wkend=function(b){const U=UI.wk,sx=U&&U.sid&&S.sx[U.sid];
  if(sx&&sx.st!=='c'&&!UI.fxfin){const a=sxProg(sx);if(a.d<a.t){const body=document.createElement('div');
    body.innerHTML='<p style="margin:0 0 6px">أنجزت <b class="num">'+F(a.d)+'</b> من <b class="num">'+F(a.t)+'</b> مجموعة.</p><p class="mu" style="margin:0">سيُحفظ التمرين كحصة جزئية بما أنجزته، وتُحتسب مرة واحدة.</p>';
    fxSheet('إنهاء التمرين؟',body,function(){UI.fxfin=1;try{const r=V(b);save();render();return r}finally{UI.fxfin=0}},{ok:'إنهاء وحفظ'});return false}}
  return V(b)}})();
(function(){const V=vWk;vWk=function(){let h=V.apply(this,arguments);if(typeof h!=='string'||h.indexOf('class="wkt"')<0)return h;
  h=h.replace('<div class="wkt">','<div class="wkt"><button class="chip" data-a="wkback" id="wk-back">'+ic('next')+'العودة إلى اليوم</button>');
  const U=UI.wk;let src='';try{if(U&&U.ks&&U.i<U.ks.length){const t=tasks().find(x=>x.k===U.ks[U.i]);if(t){const e=t.e;
    src=U.w!=null?'القيمة الحالية: آخر ما أدخلته في هذه الجلسة':(sugg(e)?'القيمة الابتدائية: اقتراح التدرّج من جلساتك السابقة':(S.base[e.n]||lastW(e.n))?'القيمة الابتدائية: من آخر جلسة لهذا التمرين':'القيمة الابتدائية: من الخطة')}}}catch(x){}
  return src?h.replace('<div class="bar"','<div class="mu" id="wk-src" style="text-align:center;font-size:12px">'+src+'</div><div class="bar"'):h}})();
/* قيم الوزن/التكرارات تُحفظ في حالة الجلسة لحظة الكتابة، فلا يمحوها أي إعادة رسم (مثل انتهاء طلب الطقس أثناء التمرين) */
document.addEventListener('input',e=>{const t=e.target,U=UI.wk;if(!U||!t||(t.id!=='wk-w'&&t.id!=='wk-r'))return;if(t.value==='')return;const v=+String(t.value).replace(',','.');if(!isFinite(v))return;if(t.id==='wk-w')U.w=v;else U.r=v},true);

/* وجهات الخدمات الفريدة: خطة التمارين والأجهزة داخل «التمرين»، وربط الساعات والخطوات داخل «التقدّم» */
(function(){const row=(k,n,t,v,d)=>'<button class="sjrow" data-a="sub" data-v="'+v+'">'+sjI(k,n)+'<span class="t">'+t+(d?'<small>'+d+'</small>':'')+'</span>'+ic('next')+'</button>';
 const VT=vTrain;vTrain=function(){const h=VT.apply(this,arguments);if(typeof h!=='string'||UI.ses||UI.sum||(UI.trk&&UI.trk!=='iron'&&UI.trk!=='hub'))return h;
  return h+'<div class="sjsec">خطط ومكتبات</div>'+row('tr','list','خطة التمارين','plan','الأسبوع والتعديل')+row('tr','dumbbell','الأجهزة الرياضية','nau','دليل الأجهزة')};
 const VP=vPg;vPg=function(){const h=VP.apply(this,arguments);if(typeof h!=='string')return h;return h+'<div class="sjsec">مصادر البيانات</div>'+row('wt','watch','ربط الساعات والخطوات','link','Health Connect وعدّاد الهاتف')}})();

/* ترجمات الإنجليزية للنصوص الجديدة */
Object.assign(ENT,{'تذكير التمرين اليومي':'Daily workout reminder','الحساب والمزامنة':'Account & sync','البيانات والنسخ والخصوصية':'Data, backup & privacy','النسخ الاحتياطي':'Backup',
 'الطقس يُخزَّن مؤقتًا على جهازك (تُرسل خطوط الإحداثيات للمدينة فقط إلى مزوّد الطقس). الموقع التقريبي لا يُحفظ إلا إن اخترت.':'Weather is cached on your device (only the city coordinates are sent to the weather provider). Your approximate location is saved only if you choose.',
 'اختر مدينة':'Choose a city','ابحث عن مدينة':'Search for a city','استخدم موقعي':'Use my location','إغلاق':'Close','إلغاء':'Cancel','التمرين':'Workout','التغذية':'Nutrition','اليوم':'Today','التقدّم':'Progress','المزيد':'More',
 'الماء':'Water','كمية مخصّصة':'Custom amount','إنهاء التمرين؟':'End workout?','إنهاء وحفظ':'End & save','خطط ومكتبات':'Plans & libraries','خطة التمارين':'Workout plan','الأجهزة الرياضية':'Gym equipment','مصادر البيانات':'Data sources','ربط الساعات والخطوات':'Watches & steps','خطوات الهاتف':'Phone steps','حدّث الآن':'Refresh now','تفعيل عدّاد الهاتف':'Enable phone step counter',
 'جدول زيارتي للنادي':'My gym visit schedule','منبه الذهاب والغياب':'Visit & absence alarm','النادي':'Gym','الأندية القريبة':'Nearby gyms'});

/* العودة إلى «اليوم» من التمرين النشط: لا تُنهي الحصة؛ كل مجموعة محفوظة لحظة تسجيلها، والاستئناف من «اليوم» يفتح الجلسة نفسها */
ACT.wkback=function(){S.sub=null;S.tab='dash';window.scrollTo(0,0)};
