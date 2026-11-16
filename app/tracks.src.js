/* ===== المسارات الرياضية الخمسة: سجل جلسات مشترك + الجري والسباحة والكالسثينكس والتدريب الوظيفي + الديدلفت ===== */
/* البيانات: S.sj = {ss:[جلسات], tw:{يوم:[{k,t}]}, cal:{مهارة:{i,h}}, cfg:{}, ft:[قوالب وظيفي]}. جلسات الحديد تبقى في S.sx دون تكرار. */
const TK=[['iron','الحديد','Iron','ir','dumbbell'],['run','الجري','Running','ru','step'],['swim','السباحة','Swimming','wt','drop'],['cali','الكالسثينكس','Calisthenics','wm','target'],['fn','التدريب الوظيفي','Functional training','rp','timer']];
const TKN=k=>(TK.find(a=>a[0]===k)||[k,k])[1];
const SJ=()=>{if(!S.sj||typeof S.sj!=='object')S.sj={};const o=S.sj;if(!Array.isArray(o.ss))o.ss=[];['tw','cal','cfg'].forEach(k=>{if(!o[k]||typeof o[k]!=='object'||Array.isArray(o[k]))o[k]={}});if(!Array.isArray(o.ft))o.ft=[];return o};
const tkNow=()=>Date.now();
const tkAct=s=>(s.acc||0)+(s.ra?tkNow()-s.ra:0);
const tkT=ms=>{const t=Math.max(0,Math.round(ms/1000)),h=Math.floor(t/3600),m=Math.floor(t%3600/60),c=t%60;return (h?h+':'+String(m).padStart(2,'0'):String(m))+':'+String(c).padStart(2,'0')};
const tkMin=ms=>F(Math.round(ms/60000))+' د';
const tkId=()=>'s'+tkNow().toString(36)+Math.random().toString(36).slice(2,6);
const tkFind=id=>SJ().ss.find(x=>x.id===id);
const tkOpen=()=>SJ().ss.find(x=>x.st!=='done');
const tkDone=k=>SJ().ss.filter(x=>x.st==='done'&&(!k||x.k===k)).sort((a,b)=>(b.t1||0)-(a.t1||0));
const tkDay=d=>{const t=TD();if(d===t)return 'اليوم';const y=iso(new Date(Date.now()-864e5));return d===y?'أمس':sjMD(d)};
const tkF=n=>(UI.tf&&UI.tf[n]!==undefined)?UI.tf[n]:'';
const tkNum=v=>{const x=parseFloat(n2(String(v==null?'':v)).replace(',','.'));return isFinite(x)?x:null};
const tkPace=(ms,km)=>km>0&&ms>0?tkT(ms/km)+' /كم':'—';
UI.tf=UI.tf||{};UI.ttab=UI.ttab||'ov';
document.addEventListener('input',ev=>{const t=ev.target;if(t&&t.dataset&&t.dataset.tf)UI.tf[t.dataset.tf]=t.value});
document.addEventListener('change',ev=>{const t=ev.target;if(t&&t.dataset&&t.dataset.tf)UI.tf[t.dataset.tf]=t.value});

/* ----- قوالب أصلية ----- */
const RUN_T=[
 {id:'wr',n:'مشي وجري',e:'Walk-run',d:'تناوب بين مشي هادئ وجري قصير، مناسب لأول جولة.',segs:(()=>{const a=[];for(let i=0;i<8;i++){a.push({n:'مشي',s:90,km:.12},{n:'جري',s:60,km:.15})}return a})()},
 {id:'ez',n:'جري سهل',e:'Easy run',d:'ثلاثون دقيقة بوتيرة تسمح لك بالكلام.',segs:[{n:'جري سهل',s:1800,km:4}]},
 {id:'iv',n:'فواصل سريعة',e:'Intervals',d:'إحماء، ست جولات سريعة بينها راحة، ثم تهدئة.',segs:[{n:'إحماء',s:300,km:.6}].concat((()=>{const a=[];for(let i=0;i<6;i++)a.push({n:'سريع',s:120,km:.4},{n:'راحة',s:90,km:.2});return a})(),[{n:'تهدئة',s:300,km:.6}])}
];
const RUN5=[[1,1.5],[2,1.5],[3,1.5],[5,1.5],[8,2],[10,2],[15,2],[25,0]];
function run5Plan(w){const x=RUN5[Math.max(0,Math.min(7,w-1))],r=x[0],wk=x[1],segs=[];if(!wk){segs.push({n:'جري',s:r*60,km:r/6})}else{const tot=24*60,per=(r+wk)*60,n=Math.max(1,Math.round(tot/per));segs.push({n:'إحماء مشي',s:300,km:.4});for(let i=0;i<n;i++){segs.push({n:'جري',s:r*60,km:r/6});if(wk&&i<n-1)segs.push({n:'مشي',s:Math.round(wk*60),km:wk/12})}segs.push({n:'تهدئة مشي',s:300,km:.4})}
 return {id:'5k',n:'نحو 5 كم · الأسبوع '+w,e:'5K plan',d:'أسبوع '+w+' من 8',segs:segs,ver:1}}
const SW_T=[
 {id:'tech',n:'تقنية',e:'Technique',d:'تقصير المسافة وإتقان الضربة والتنفس.',sets:[{st:'حرة',rep:4,d:50,rest:20},{st:'ظهر',rep:4,d:25,rest:15},{st:'صدر',rep:4,d:25,rest:15},{st:'حرة',rep:2,d:100,rest:30}]},
 {id:'endu',n:'تحمّل',e:'Endurance',d:'مسافة طويلة متصلة ثم تكرارات متوسطة.',sets:[{st:'حرة',rep:1,d:400,rest:60},{st:'حرة',rep:4,d:100,rest:20}]},
 {id:'intv',n:'فواصل',e:'Intervals',d:'ثماني مسافات قصيرة بزمن انطلاق ثابت.',sets:[{st:'حرة',rep:8,d:50,send:60}]}
];
const SW_ST=['حرة','ظهر','صدر','فراشة','متنوع'];
const CSK=[
 {id:'pu',n:'الضغط',e:'Push-up',m:'reps',st:[{n:'ضغط على الحائط',e:'Wall push-up',c:15,eq:'none'},{n:'ضغط مائل',e:'Incline push-up',c:12,eq:'none',alt:'ضع اليدين على كرسي ثابت'},{n:'ضغط عادي',e:'Push-up',c:15,eq:'none'},{n:'ضغط الماسة',e:'Diamond push-up',c:12,eq:'none'},{n:'ضغط ذراع واحدة',e:'One-arm push-up',c:5,eq:'none',uni:1}]},
 {id:'pl',n:'العقلة',e:'Pull-up',m:'reps',st:[{n:'سحب أسترالي',e:'Australian row',c:12,eq:'bar',alt:'طاولة ثابتة أو مقبض منخفض'},{n:'عقلة بمساعدة',e:'Assisted pull-up',c:8,eq:'bar',alt:'رباط مطاطي أو آلة مساعدة'},{n:'عقلة',e:'Pull-up',c:10,eq:'bar'},{n:'عقلة عريضة',e:'Wide pull-up',c:8,eq:'bar'},{n:'عقلة بوزن إضافي',e:'Weighted pull-up',c:5,eq:'bar'}]},
 {id:'hs',n:'الوقوف على اليدين',e:'Handstand',m:'hold',st:[{n:'وضع الغراب',e:'Crow pose',c:20,eq:'none'},{n:'وقوف بالحائط',e:'Wall handstand',c:30,eq:'none'},{n:'وقوف حر قصير',e:'Free handstand',c:10,eq:'none'},{n:'وقوف حر ثابت',e:'Stable handstand',c:30,eq:'none'}]},
 {id:'ls',n:'L-sit',e:'L-sit',m:'hold',st:[{n:'ثني الركبتين',e:'Tuck hold',c:15,eq:'none'},{n:'ساق واحدة ممدودة',e:'One-leg L-sit',c:15,eq:'none'},{n:'L-sit كامل',e:'L-sit',c:20,eq:'none'},{n:'V-sit',e:'V-sit',c:10,eq:'none'}]}
];
const CAL_P=[
 {id:'b0',n:'مبتدئ بلا معدات',e:'Beginner, no equipment',d:'ضغط وثبات وحركات جذع بلا أي أداة.',it:[['pu',3],['ls',3],['hs',3]]},
 {id:'b1',n:'عندي بار عقلة',e:'With a pull-up bar',d:'سحب وضغط وثبات، بتدرّج يناسب البار.',it:[['pl',4],['pu',3],['ls',3]]},
 {id:'sk',n:'مسار مهارة: الوقوف على اليدين',e:'Skill track: handstand',d:'ثبات يومي مع قوة دفع مساندة.',it:[['hs',5],['pu',3],['ls',2]]}
];
const FN_T=[
 {id:'a12',n:'اثنتا عشرة دقيقة',e:'AMRAP 12',fmt:'amrap',cap:12,mv:[['قرفصاء هوائية',15],['ضغط',10],['كرنش',12]],d:'أكبر عدد من الجولات في اثنتي عشرة دقيقة.',ver:1},
 {id:'e10',n:'كل دقيقة',e:'EMOM 10',fmt:'emom',cap:10,mv:[['بيربي',6],['قفز حبل',20]],d:'في بداية كل دقيقة أنجز العمل ثم ارتح بما تبقى.',ver:1},
 {id:'ft3',n:'ثلاث جولات بالزمن',e:'For Time',fmt:'ft',rounds:3,cap:15,mv:[['قرفصاء هوائية',20],['ضغط',15],['طعن',20]],d:'أنهِ الجولات بأقل زمن، وسقف خمس عشرة دقيقة.',ver:1},
 {id:'rf5',n:'خمس جولات ثابتة',e:'Fixed rounds',fmt:'rf',rounds:5,mv:[['سحب أسترالي',8],['قفز صندوق',10]],d:'عدد جولات محدد، سجّل الزمن الكلي.',ver:1}
];
const FN_F={amrap:'AMRAP',emom:'EMOM',ft:'For Time',rf:'جولات ثابتة'};

/* ----- إنشاء الجلسات وإدارتها ----- */
function tkNew(k,plan,extra){const o=tkOpen();if(o){UI.tconf={k:k,plan:plan,extra:extra};S.tab='train';UI.trk=k==='iron'?'hub':k;UI.ses=null;return false}
 const s=Object.assign({id:tkId(),k:k,st:'act',day:TD(),t0:tkNow(),acc:0,ra:tkNow(),plan:plan?JSON.parse(JSON.stringify(plan)):null,src:'يدوي',d:{}},extra||{});SJ().ss.push(s);UI.ses=s.id;S.tab='train';UI.trk=k;UI.tconf=null;window.scrollTo(0,0);return s}
function tkPause(s){if(s.ra){s.acc=tkAct(s);s.ra=null;s.st='pau'}}
function tkResume(s){if(!s.ra&&s.st!=='done'){s.ra=tkNow();s.st='act'}}
function tkFinish(s,par){if(s.st==='done')return;tkPause(s);s.st='done';s.t1=tkNow();if(par)s.par=1;tkCalc(s);UI.ses=null;UI.sum=s.id}
function tkSumLine(s){const r=s.res||{};
 if(s.k==='run')return tkMin(s.acc)+(r.km?' · '+F(r.km,2)+' كم':'')+' · '+(r.pace||'—');
 if(s.k==='swim')return (r.dist?F(r.dist)+' '+(s.d.u==='yd'?'ياردة':'م'):'—')+' · '+tkMin(s.acc);
 if(s.k==='cali')return F((s.d.ents||[]).length)+' مجموعة · '+tkMin(s.acc);
 if(s.k==='fn')return fnLine(s);return tkMin(s.acc)}
function tkCalc(s){s.res=s.res||{};const d=s.d||{};
 if(s.k==='run'){const km=tkNum(d.dist)||0;s.res.km=km;s.res.pace=km>0?tkPace(s.acc,km):'—';s.res.elapsed=(s.t1||tkNow())-s.t0}
 if(s.k==='swim')swCalc(s);
 if(s.k==='fn')fnCalc(s)}

/* ----- مداخل المسارات ----- */
function trkSub(k){if(k==='iron'){const T=tasks(),ti=TI(),pw=S.plan[ti];const now=T.filter(t=>t.d===ti);return pw.ex.length?esc(pw.t)+' · '+now.filter(t=>t.r).length+'/'+now.length:'يوم راحة'}
 const o=tkOpen();if(o&&o.k===k)return 'جلسة جارية · '+tkT(tkAct(o));
 const pl=(SJ().tw[TI()]||[]).filter(e=>e.k===k)[0];if(pl)return 'اليوم: '+esc(tkTplName(k,pl.t));
 const l=tkDone(k)[0];return l?'آخر نشاط: '+tkDay(l.day):'ابدأ أول حصة'}
function trkHub(){let h='<h1>التمرين</h1><div class="mu" style="margin-bottom:12px">اختر المسار</div>'+tkConf()+tkBanner(0)+'<div class="sjtrk">';
 h+=TK.map(x=>'<button class="sjtk" data-a="trk" data-v="'+x[0]+'">'+sjI(x[3],x[4])+'<b>'+x[1]+'</b><small>'+x[2]+'</small><span class="mu">'+trkSub(x[0])+'</span></button>').join('');
 return h+'</div>'}
function tkBanner(inSes){const o=tkOpen();if(!o||inSes)return '';
 return '<div class="card sjact"><div class="row"><b>'+ic('timer')+' جلسة جارية: '+TKN(o.k)+'</b><span class="sp"></span><span class="num" data-tk="a2">'+tkT(tkAct(o))+'</span></div><div class="row" style="margin-top:8px;gap:8px"><button class="btn sm" data-a="tkopen" data-id="'+o.id+'">استكمال</button><button class="btn sm ghost" data-a="tkend" data-id="'+o.id+'">إنهاء</button></div></div>'}
function tkConf(){const c=UI.tconf;if(!c)return '';const o=tkOpen();if(!o){UI.tconf=null;return ''}
 return '<div class="card sjact"><b>لديك جلسة جارية في «'+TKN(o.k)+'»</b><div class="mu" style="margin:6px 0 10px">اختر ما تريد قبل بدء «'+TKN(c.k)+'».</div><div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm" data-a="tkcf" data-v="resume">متابعة الجارية</button><button class="btn sm ghost" data-a="tkcf" data-v="swap">إنهاؤها وبدء الجديدة</button><button class="btn sm ghost" data-a="tkcf" data-v="no">إلغاء</button></div></div>'}
function tkTplName(k,id){if(k==='run'){if(id==='5k')return 'نحو 5 كم';const t=RUN_T.find(a=>a.id===id);return t?t.n:id}if(k==='swim'){const t=SW_T.find(a=>a.id===id);return t?t.n:id}if(k==='cali'){const t=CAL_P.find(a=>a.id===id);return t?t.n:id}if(k==='fn'){const t=fnAll().find(a=>a.id===id);return t?t.n:id}return id}
const TKTABS=[['ov','نظرة عامة'],['pl','الخطط'],['lib','المكتبة'],['lg','السجل والتقدّم']];
function tkView(k){if(UI.ses)return vSes();if(UI.sum)return vSum();
 if(k==='dl')return tkBackH()+tkDeadlift();
 const cfg=SJ().cfg;let h=trkBack()+'<h1>'+TKN(k)+'</h1>'+tkConf()+tkBanner(0)+'<div class="sjtabs" role="tablist">'+TKTABS.map(t=>'<button role="tab" aria-selected="'+(UI.ttab===t[0])+'" class="'+(UI.ttab===t[0]?'on':'')+'" data-a="tktab" data-v="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>';
 const T={run:[runOv,runPl,runLib],swim:[swOv,swPl,swLib],cali:[caOv,caPl,caLib],fn:[fnOv,fnPl,fnLib]}[k];
 if(UI.ttab==='lg')return h+tkLogCard(k)+(k==='run'?'':'')+tkProg(k);
 return h+T[{ov:0,pl:1,lib:2}[UI.ttab]||0]()}
const tkBackH=()=>'<button class="back" data-a="trk" data-v="iron">'+ic('next')+'الحديد</button>';

/* ----- خطط الأسبوع ----- */
function tkAddWk(k,t){return '<select class="sjdt2" data-twsel data-k="'+k+'" data-t="'+t+'" aria-label="أضف إلى أسبوعي"><option value="">أضف إلى أسبوعي</option>'+DAYS.map((d,i)=>'<option value="'+i+'">'+d+'</option>').join('')+'</select>'}
function tkWkList(k){const tw=SJ().tw;let r='';Object.keys(tw).forEach(d=>(tw[d]||[]).forEach((e,i)=>{if(e.k===k)r+='<div class="row sjwi"><span>'+DAYS[+d]+' · '+esc(tkTplName(k,e.t))+'</span><span class="sp"></span><button class="x" data-a="tkwdel" data-d="'+d+'" data-i="'+i+'" aria-label="حذف من الأسبوع">حذف</button></div>'}));
 return r?'<div class="card"><h2>'+ic('cal')+' حصصي هذا الأسبوع</h2>'+r+'</div>':''}

/* ======================= الجري ======================= */
function runCfg(){const c=SJ().cfg;if(!c.run)c.run={lvl:'b',dpw:3,tm:'t'};return c.run}
function run5Week(){const c=runCfg(),n=tkDone('run').filter(s=>s.plan&&s.plan.id==='5k').length,st=c.lvl==='i'?3:1;return Math.min(8,st+Math.floor(n/(c.dpw||3)))}
function runPlan(id){if(id==='5k')return run5Plan(run5Week());const t=RUN_T.find(a=>a.id===id);return t?{id:t.id,n:t.n,segs:t.segs,ver:1}:null}
function runStart(id,mode){const p=id?runPlan(id):null;return tkNew('run',p,{d:{mode:mode||'out',dist:'',laps:[],seg:0,tm:runCfg().tm||'t'}})}
function runOv(){const c=runCfg(),nxt=run5Plan(run5Week());
 return '<div class="card"><h2>'+ic('step')+' ابدأ الآن</h2><div class="sjg">'+[['out','جري خارجي','يدوي: الزمن والمسافة بلا GPS'],['walk','مشي','نشاط هادئ'],['free','جلسة حرة','بلا قالب']].map(x=>'<button class="sjt" data-a="runst" data-m="'+x[0]+'">'+sjI('ru','step')+'<span>'+x[1]+'</span><small class="mu">'+x[2]+'</small></button>').join('')+'</div></div>'+
 '<div class="card"><h2>الجلسة التالية في خطة 5 كم</h2><div class="mu">'+esc(nxt.d)+' · '+tkMin(nxt.segs.reduce((a,x)=>a+x.s*1000,0))+'</div><div class="row" style="gap:8px;margin-top:10px"><button class="btn sm" data-a="runst" data-id="5k">ابدأ</button>'+tkAddWk('run','5k')+'</div></div>'+
 '<div class="card"><h2>سجّل جولة سابقة</h2>'+tkManualForm('run')+'</div>'+tkWkList('run')+
 '<button class="sjrow" data-a="trk" data-v="cardio">'+sjI('hr','pulse')+'<span class="t">النشاط والخطوات<small>الكارديو اليومي والمؤشرات</small></span>'+ic('next')+'</button>'}
function runPl(){const c=runCfg();
 let h='<div class="card"><h2>إعداد خطة 5 كم</h2><div class="g3"><label class="f">المستوى<select data-tf="rlvl" data-a="runcfg" data-k="lvl"><option value="b"'+(c.lvl==='b'?' selected':'')+'>مبتدئ</option><option value="i"'+(c.lvl==='i'?' selected':'')+'>متوسط</option></select></label><label class="f">أيام الأسبوع<select data-a="runcfg" data-k="dpw">'+[2,3,4].map(n=>'<option value="'+n+'"'+(c.dpw===n?' selected':'')+'>'+n+'</option>').join('')+'</select></label><label class="f">هدف الفاصل<select data-a="runcfg" data-k="tm"><option value="t"'+(c.tm==='t'?' selected':'')+'>زمن</option><option value="d"'+(c.tm==='d'?' selected':'')+'>مسافة</option></select></label></div></div>';
 h+=RUN_T.map(t=>'<div class="card"><h2>'+t.n+' <small class="mu">'+t.e+'</small></h2><div class="mu">'+t.d+' · '+tkMin(t.segs.reduce((a,x)=>a+x.s*1000,0))+'</div><div class="row" style="gap:8px;margin-top:10px"><button class="btn sm" data-a="runst" data-id="'+t.id+'">ابدأ</button>'+tkAddWk('run',t.id)+'</div></div>').join('');
 return h+tkWkList('run')}
function runLib(){return '<div class="card"><h2>أنماط التسجيل</h2><div class="mu" style="line-height:1.9">• <b>يدوي:</b> تدخل الزمن والمسافة بنفسك، ويعمل دون إنترنت أو إذن موقع.<br>• <b>GPS:</b> غير مفعّل في هذه النسخة. يتطلب اختبار الإذن وقفل الشاشة على جهاز Android.<br>• <b>مستورد:</b> الاستيراد من الساعات وHealth Connect ينتظر التحقق على جهاز.</div></div><div class="card"><h2>الوتيرة</h2><div class="mu">تُحسب الوتيرة من الزمن النشط والمسافة المدخلة. إن غابت المسافة تظهر «—».</div></div>'}
function runBody(s){const d=s.d,sg=s.plan&&s.plan.segs||[],a=tkAct(s);
 let cur=null,nx=null,rem='';
 if(sg.length){let i=0;if(d.tm==='d'){i=Math.min(d.seg||0,sg.length-1)}else{let c=0;for(i=0;i<sg.length;i++){c+=sg[i].s*1000;if(a<c)break}i=Math.min(i,sg.length-1)}cur=sg[i];nx=sg[i+1];rem=d.tm==='d'?F(cur.km,2)+' كم':''}
 let h='';
 if(cur)h+='<div class="card sjseg"><div class="mu">الفاصل الحالي</div><b style="font-size:22px">'+esc(cur.n)+'</b> <span class="num" data-tk="seg">'+(d.tm==='d'?rem:'')+'</span><div class="mu" style="margin-top:6px">التالي: '+(nx?esc(nx.n)+' · '+(d.tm==='d'?F(nx.km,2)+' كم':tkT(nx.s*1000)):'نهاية الحصة')+'</div></div>';
 h+='<div class="card"><label class="f">المسافة (كم) — تُحدَّث في أي وقت<input type="number" inputmode="decimal" data-tf="rdist" data-a="rundist" value="'+esc(d.dist||'')+'" placeholder="0.0"></label><div class="row" style="margin-top:8px"><span class="mu">متوسط الوتيرة</span><span class="sp"></span><b class="num" data-tk="pace">'+tkPace(a,tkNum(d.dist)||0)+'</b></div></div>';
 h+='<div class="row" style="gap:8px"><button class="btn" data-a="runlap">لفّة'+(d.laps&&d.laps.length?' ('+F(d.laps.length)+')':'')+'</button></div>';
 if(d.laps&&d.laps.length)h+='<div class="card"><h2>اللفّات</h2>'+d.laps.map((l,i)=>'<div class="row"><span>'+F(i+1)+'</span><span class="sp"></span><span class="num">'+tkT(l-(d.laps[i-1]||0))+'</span></div>').join('')+'</div>';
 return h}
function runSum(s){const r=s.res;return '<div class="card"><div class="sjkv"><div><small>الزمن النشط</small><b class="num">'+tkT(s.acc)+'</b></div><div><small>الزمن المنقضي</small><b class="num">'+tkT(r.elapsed||0)+'</b></div><div><small>المسافة</small><b class="num">'+(r.km?F(r.km,2)+' كم':'—')+'</b></div><div><small>متوسط الوتيرة</small><b class="num">'+r.pace+'</b></div></div><div class="mu" style="margin-top:8px">المصدر: '+esc(s.src)+(s.par?' · جلسة جزئية':'')+(s.d.laps&&s.d.laps.length?' · '+F(s.d.laps.length)+' لفّة':'')+'</div></div>'}

/* ======================= السباحة ======================= */
function swCfg(){const c=SJ().cfg;if(!c.swim)c.swim={pool:25,u:'m',ven:'pool'};return c.swim}
const swU=u=>u==='yd'?'ياردة':'م';
const swLen=(set,pool)=>Math.round(set.rep*set.d/pool*100)/100;
function swPlan(id){const t=SW_T.find(a=>a.id===id);return t?{id:t.id,n:t.n,ver:1,sets:JSON.parse(JSON.stringify(t.sets))}:null}
function swStart(id,ven){const c=swCfg(),p=id?swPlan(id):null;const sets=(p?p.sets:[{st:'حرة',rep:1,d:c.pool,rest:30}]).map(x=>Object.assign({},x,{len:null,sec:null,str:null,done:0}));
 return tkNew('swim',p,{d:{ven:ven||c.ven||'pool',pool:c.pool,u:c.u,sets:sets,open:{dist:''}}})}
function swSetLine(x,u){return F(x.rep)+' × '+F(x.d)+' '+swU(u)+' '+x.st+(x.send?' · انطلاق كل '+tkT(x.send*1000):x.rest?' · راحة '+F(x.rest)+' ث':'')}
function swOv(){const c=swCfg();
 return '<div class="card"><h2>طول المسبح</h2><div class="row" style="gap:8px;flex-wrap:wrap">'+[[25,'m'],[50,'m'],[25,'yd']].map(p=>'<button class="chip'+(c.pool===p[0]&&c.u===p[1]?' on':'')+'" data-a="swpool" data-p="'+p[0]+'" data-u="'+p[1]+'">'+p[0]+' '+swU(p[1])+'</button>').join('')+'</div><div class="row" style="gap:8px;margin-top:10px"><label class="f" style="flex:1">طول مخصص<input type="number" inputmode="decimal" data-tf="swcus" value="'+esc(tkF('swcus'))+'" placeholder="مثلًا 33.3"></label><select data-tf="swcu"><option value="m">متر</option><option value="yd">ياردة</option></select><button class="btn sm" data-a="swcus">حفظ</button></div><div class="mu" style="margin-top:6px">الحالي: '+F(c.pool,2)+' '+swU(c.u)+' · يُثبَّت داخل كل جلسة.</div></div>'+
 '<div class="card"><h2>'+ic('drop')+' ابدأ الآن</h2><div class="sjg"><button class="sjt" data-a="swst" data-ven="pool">'+sjI('wt','drop')+'<span>مسبح</span><small class="mu">جلسة حرة</small></button><button class="sjt" data-a="swst" data-ven="open">'+sjI('wt','drop')+'<span>مياه مفتوحة</span><small class="mu">زمن ومسافة يدوية</small></button></div></div>'+
 '<div class="card"><h2>سجّل حصة سابقة</h2>'+tkManualForm('swim')+'</div>'+tkWkList('swim')}
function swPl(){const c=swCfg();return SW_T.map(t=>{const L=t.sets.reduce((a,x)=>a+swLen(x,c.pool),0),D=t.sets.reduce((a,x)=>a+x.rep*x.d,0);
 return '<div class="card"><h2>'+t.n+' <small class="mu">'+t.e+'</small></h2><div class="mu">'+t.d+'</div><div style="margin:8px 0;line-height:1.9">'+t.sets.map(x=>'• '+swSetLine(x,c.u)).join('<br>')+'</div><div class="mu">الإجمالي '+F(D)+' '+swU(c.u)+' · '+F(L,1)+' طول</div><div class="row" style="gap:8px;margin-top:10px"><button class="btn sm" data-a="swst" data-id="'+t.id+'">ابدأ</button>'+tkAddWk('swim',t.id)+'</div></div>'}).join('')+tkWkList('swim')}
function swLib(){return '<div class="card"><h2>الأنماط</h2><div class="mu" style="line-height:1.9">'+SW_ST.map(s=>'• '+s).join('<br>')+'</div></div><div class="card"><h2>الراحة وزمن الانطلاق</h2><div class="mu" style="line-height:1.9"><b>راحة ثابتة:</b> تستريح مدة محددة بعد كل تكرار مهما كان زمن السباحة.<br><b>انطلاق كل مدة:</b> تنطلق كل مدة ثابتة، فتقصر راحتك كلما طالت سباحتك.</div></div><div class="card"><h2>الأطوال والتحويل</h2><div class="mu">100 ياردة = 91.44 م. تُحسب المسافة من الأطوال المكتملة × طول المسبح المحفوظ في الجلسة.</div></div>'}
function swBody(s){const d=s.d;
 if(d.ven==='open')return '<div class="card"><label class="f">المسافة (م) — يدوية<input type="number" inputmode="decimal" data-tf="swopen" data-a="swopen" value="'+esc(d.open.dist||'')+'" placeholder="0"></label><div class="mu" style="margin-top:6px">الزمن يُحسب من المؤقت أعلاه.</div></div>';
 const pre=d.sets.some(x=>x.done)||0;
 return '<div class="mu" style="margin:0 0 8px">مسبح '+F(d.pool,2)+' '+swU(d.u)+'</div>'+d.sets.map((x,i)=>{const pl=swLen(x,d.pool);
  return '<div class="card sjsw'+(x.done?' ok':'')+'"><div class="row"><b>'+swSetLine(x,d.u)+'</b></div>'+
   '<div class="mu">المخطط: '+F(pl,1)+' طول</div>'+
   '<div class="g3" style="margin-top:8px"><label class="f">أطوال مكتملة<input type="number" inputmode="decimal" data-a="swlen" data-i="'+i+'" data-tf="swl'+i+'" value="'+(x.len!=null?x.len:'')+'" placeholder="'+F(pl,1)+'"></label><label class="f">ضربات/طول (اختياري)<input type="number" inputmode="decimal" data-a="swstr" data-i="'+i+'" value="'+(x.str||'')+'"></label><label class="f">زمن (ث)<input type="number" inputmode="decimal" data-a="swsec" data-i="'+i+'" value="'+(x.sec!=null?x.sec:'')+'"></label></div>'+
   '<div class="row" style="gap:8px;margin-top:8px">'+(x.t0?'<button class="btn sm" data-a="swstop" data-i="'+i+'">انتهيت</button><span class="num mu" data-tk="sw'+i+'">'+tkT(tkNow()-x.t0)+'</span>':'<button class="btn sm ghost" data-a="swgo" data-i="'+i+'">ابدأ المجموعة</button>')+'<button class="btn sm'+(x.done?' ghost':'')+'" data-a="swdone" data-i="'+i+'">'+(x.done?'تراجع':'تمّت')+'</button></div></div>'}).join('')+
  '<button class="btn sm ghost" data-a="swaddset">+ مجموعة</button>'}
function swCalc(s){const d=s.d;s.res=s.res||{};const u=d.u;
 if(d.ven==='open'){const dist=tkNum(d.open&&d.open.dist)||0;s.res.dist=dist;s.res.pace=dist>0?tkT(s.acc/(dist/100))+' /100 '+(u==='yd'?'ياردة':'م'):'—';return}
 const ds=d.sets.filter(x=>x.done);let L=0,sw=0,all=true;const by={};
 ds.forEach(x=>{const l=x.len!=null?x.len:swLen(x,d.pool);L+=l;by[x.st]=(by[x.st]||0)+l*d.pool;if(x.sec!=null&&x.sec>0)sw+=x.sec;else all=false});
 const dist=Math.round(L*d.pool*100)/100;s.res.dist=dist;s.res.len=L;s.res.by=by;
 s.res.swimSec=all&&ds.length?sw:null;s.res.restSec=all&&ds.length?Math.max(0,Math.round(s.acc/1000)-sw):null;
 s.res.pace=s.res.swimSec&&dist>0?tkT(s.res.swimSec*1000/(dist/100))+' /100 '+(u==='yd'?'ياردة':'م'):'—';
 const sw2=ds.filter(x=>x.sec>0&&x.str>0&&(x.len||swLen(x,d.pool))>0).map(x=>{const l=x.len!=null?x.len:swLen(x,d.pool);return x.sec/l+x.str});
 s.res.swolf=sw2.length?Math.round(sw2.reduce((a,b)=>a+b,0)/sw2.length):null}
function swSum(s){const r=s.res,u=s.d.u;return '<div class="card"><div class="sjkv"><div><small>المسافة</small><b class="num">'+F(r.dist,1)+' '+swU(u)+'</b></div><div><small>الزمن الكلي</small><b class="num">'+tkT(s.acc)+'</b></div><div><small>زمن السباحة</small><b class="num">'+(r.swimSec!=null?tkT(r.swimSec*1000):'—')+'</b></div><div><small>زمن الراحة</small><b class="num">'+(r.restSec!=null?tkT(r.restSec*1000):'—')+'</b></div><div><small>متوسط 100</small><b class="num">'+r.pace+'</b></div><div><small>SWOLF</small><b class="num">'+(r.swolf!=null?F(r.swolf):'—')+'</b></div></div><div class="mu" style="margin-top:8px">'+(s.d.ven==='open'?'مياه مفتوحة':'مسبح '+F(s.d.pool,2)+' '+swU(u)+' · الأطوال: '+F(r.len||0,1))+'. '+(r.swolf!=null?'SWOLF محسوب من زمن وضربات موثّقة لنفس الطول ضمن هذا المسبح.':'لا يُحسب SWOLF إلا مع زمن وعدد ضربات لنفس الطول.')+(u==='yd'?' ('+F((r.dist||0)*.9144,1)+' م)':'')+'</div>'+
 (r.by&&Object.keys(r.by).length?'<div style="margin-top:8px">'+Object.keys(r.by).map(k=>'<div class="row"><span>'+k+'</span><span class="sp"></span><span class="num">'+F(r.by[k])+' '+swU(u)+'</span></div>').join('')+'</div>':'')+'</div>'+
 (s.d.ven==='open'?'':'<div class="card"><h2>تصحيح الأطوال</h2>'+s.d.sets.map((x,i)=>'<div class="row" style="gap:8px;margin-bottom:6px"><span style="flex:1">'+swSetLine(x,u)+'</span><input type="number" inputmode="decimal" style="width:84px" data-a="swfix" data-sid="'+s.id+'" data-i="'+i+'" value="'+(x.len!=null?x.len:swLen(x,s.d.pool))+'" aria-label="أطوال مكتملة"></div>').join('')+'</div>')}

/* ======================= الكالسثينكس ======================= */
function caCfg(){const c=SJ().cfg;if(!c.cali)c.cali={eq:'none'};return c.cali}
function caSt(id){const m=SJ().cal;if(!m[id])m[id]={i:0,h:[]};return m[id]}
const caSk=id=>CSK.find(x=>x.id===id);
const caUnit=sk=>sk.m==='hold'?'ث':'تكرار';
function caAll(){const r=[];tkDone('cali').forEach(s=>((s.d&&s.d.ents)||[]).forEach(e=>r.push(Object.assign({day:s.day,sid:s.id},e))));return r}
function caBest(sk,i,as){let b=null;caAll().forEach(e=>{if(e.sk===sk&&e.i===i&&(!as||e.as===as)&&(b==null||e.val>b))b=e.val});return b}
function caStart(id){const p=CAL_P.find(a=>a.id===id)||null;return tkNew('cali',p?{id:p.id,n:p.n,ver:1,it:p.it}:null,{d:{ents:[],eq:caCfg().eq}})}
function caOv(){const c=caCfg();
 return '<div class="card"><h2>الأدوات المتوفرة</h2><div class="row" style="gap:8px">'+[['none','بلا معدات'],['bar','عندي بار عقلة']].map(x=>'<button class="chip'+(c.eq===x[0]?' on':'')+'" data-a="caeq" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div></div>'+
 '<div class="card"><h2>'+ic('target')+' ابدأ الآن</h2><div class="sjg"><button class="sjt" data-a="cast" data-id="">'+sjI('wm','target')+'<span>جلسة حرة</span></button>'+CAL_P.slice(0,1).map(p=>'<button class="sjt" data-a="cast" data-id="'+p.id+'">'+sjI('wm','target')+'<span>'+p.n+'</span></button>').join('')+'</div></div>'+
 '<div class="card"><h2>مهاراتي الآن</h2>'+CSK.map(sk=>{const st=caSt(sk.id),cur=sk.st[Math.min(st.i,sk.st.length-1)];return '<button class="sjrow" data-a="casel" data-id="'+sk.id+'">'+sjI('wm','target')+'<span class="t">'+sk.n+'<small>'+cur.n+' · الهدف '+F(cur.c)+' '+caUnit(sk)+'</small></span>'+ic('next')+'</button>'}).join('')+'</div>'+tkWkList('cali')}
function caPl(){const c=caCfg();return CAL_P.map(p=>{const need=p.it.some(x=>caSk(x[0]).st.some(s=>s.eq==='bar')&&x[0]==='pl');
 return '<div class="card"><h2>'+p.n+' <small class="mu">'+p.e+'</small></h2><div class="mu">'+p.d+'</div><div style="margin:8px 0;line-height:1.9">'+p.it.map(x=>'• '+caSk(x[0]).n+' × '+x[1]+' مجموعات').join('<br>')+'</div>'+(need&&c.eq==='none'?'<div class="mu">تحتاج بار عقلة، أو استخدم البديل: سحب تحت طاولة ثابتة.</div>':'')+'<div class="row" style="gap:8px;margin-top:10px"><button class="btn sm" data-a="cast" data-id="'+p.id+'">ابدأ</button>'+tkAddWk('cali',p.id)+'</div></div>'}).join('')+tkWkList('cali')}
function caLib(){if(UI.cask)return caMap(UI.cask);return '<div class="card"><h2>خرائط المهارات</h2>'+CSK.map(sk=>'<button class="sjrow" data-a="casel" data-id="'+sk.id+'">'+sjI('wm','target')+'<span class="t">'+sk.n+'<small>'+sk.e+' · '+F(sk.st.length)+' مراحل</small></span>'+ic('next')+'</button>').join('')+'</div>'}
function caMap(id){const sk=caSk(id),st=caSt(id),eq=caCfg().eq;
 let h='<button class="back" data-a="casel" data-id="">'+ic('next')+'المهارات</button><h2>'+sk.n+' <small class="mu">'+sk.e+'</small></h2>';
 h+=sk.st.map((s,i)=>{const b=caBest(id,i),ok=b!=null&&b>=s.c,cur=i===st.i,past=i<st.i;
  const why=i===0?'مرحلة البداية.':'تظهر بعد تحقيق '+F(sk.st[i-1].c)+' '+caUnit(sk)+' في «'+sk.st[i-1].n+'» (بقرارك).';
  return '<div class="card sjst'+(cur?' cur':'')+(past?' past':'')+'"><div class="row"><b>'+F(i+1)+'. '+s.n+'</b><span class="sp"></span>'+(cur?'<span class="tag">الحالية</span>':past?'<span class="tag">سابقة</span>':'')+'</div><div class="mu">'+s.e+' · الشرط: '+F(s.c)+' '+caUnit(sk)+(s.eq==='bar'&&eq==='none'?' · يحتاج بارًا':'')+'</div><div class="mu">'+why+'</div>'+(s.alt&&(eq==='none'||s.eq==='none')?'<div class="mu">بديل: '+s.alt+'</div>':'')+(b!=null?'<div class="mu">أفضل تسجيل: <b class="num">'+F(b)+'</b> '+caUnit(sk)+(ok?' · الشرط محقق':'')+'</div>':'')+
   (!cur?'<button class="btn sm ghost" data-a="castage" data-id="'+id+'" data-i="'+i+'">اجعلها مرحلتي'+(i>st.i?' (ترقية)':'')+'</button>':(ok&&i<sk.st.length-1?'<button class="btn sm" data-a="castage" data-id="'+id+'" data-i="'+(i+1)+'">ترقية إلى «'+sk.st[i+1].n+'»</button>':''))+'</div>'}).join('');
 if(st.h.length)h+='<div class="card"><h2>تاريخ المراحل</h2>'+st.h.map(x=>'<div class="row"><span>'+tkDay(x.d)+' · '+esc(sk.st[x.i]?sk.st[x.i].n:'')+'</span></div>').join('')+'</div>';
 return h}
function caBody(s){const it=(s.plan&&s.plan.it)||CSK.map(x=>[x.id,3]);let h='';
 h+=it.map(x=>{const sk=caSk(x[0]),st=caSt(x[0]),cur=sk.st[Math.min(st.i,sk.st.length-1)],n=(s.d.ents||[]).filter(e=>e.sk===x[0]).length;
  return '<div class="card"><div class="row"><b>'+sk.n+'</b><span class="sp"></span><span class="mu">'+F(n)+' / '+F(x[1])+' مجموعات</span></div><div class="mu">'+cur.n+' · الهدف '+F(cur.c)+' '+caUnit(sk)+'</div>'+
   '<div class="g3" style="margin-top:8px"><label class="f">'+(sk.m==='hold'?'ثبات (ث)':'تكرار')+'<input type="number" inputmode="numeric" data-tf="cv'+x[0]+'"></label><label class="f">مساعدة<select data-tf="ca'+x[0]+'"><option value="none">بلا</option><option value="band">رباط</option><option value="machine">جهاز</option></select></label><label class="f">وزن إضافي<input type="number" inputmode="decimal" data-tf="cw'+x[0]+'" placeholder="0"></label></div>'+
   (cur.uni?'<label class="f">الجهة<select data-tf="cs'+x[0]+'"><option value="both">الاثنتان</option><option value="L">اليسرى</option><option value="R">اليمنى</option></select></label>':'')+
   '<button class="btn sm" data-a="calog" data-sk="'+x[0]+'" style="margin-top:8px">سجّل مجموعة</button></div>'}).join('');
 const e=s.d.ents||[];if(e.length)h+='<div class="card"><h2>المسجّل</h2>'+e.map((x,i)=>'<div class="row"><span>'+esc(x.v)+' · '+F(x.val)+' '+(caSk(x.sk).m==='hold'?'ث':'تكرار')+(x.as!=='none'?' · '+(x.as==='band'?'رباط':'جهاز'):'')+(x.w?' · +'+F(x.w,1):'')+(x.sd&&x.sd!=='both'?' · '+(x.sd==='L'?'يسار':'يمين'):'')+'</span><span class="sp"></span><button class="x" data-a="cadel" data-i="'+i+'">حذف</button></div>').join('')+'</div>';
 return h}
function caSum(s){const e=s.d.ents||[];return '<div class="card"><h2>'+F(e.length)+' مجموعة</h2>'+e.map(x=>'<div class="row"><span>'+esc(x.v)+(x.as!=='none'?' · '+(x.as==='band'?'رباط':'جهاز'):'')+'</span><span class="sp"></span><b class="num">'+F(x.val)+' '+(caSk(x.sk).m==='hold'?'ث':'')+'</b></div>').join('')+'</div>'}

/* ======================= التدريب الوظيفي ======================= */
const fnAll=()=>FN_T.concat(SJ().ft);
const fnPer=p=>p.mv.reduce((a,m)=>a+(+m[1]||0),0);
function fnStart(id,sc,eqp){const t=fnAll().find(a=>a.id===id);if(!t)return false;
 return tkNew('fn',{id:t.id,n:t.n,ver:t.ver||1,fmt:t.fmt,cap:t.cap||0,rounds:t.rounds||0,mv:JSON.parse(JSON.stringify(t.mv)),sc:sc||'rx',eq:eqp||''},{d:{r:0,m:0,ex:0,iv:[],undo:[]}})}
function fnKey(p){return p.id+'@'+p.ver+'|'+p.sc+'|'+(p.eq||'').trim()}
function fnOv(){return '<div class="card"><h2>'+ic('timer')+' ابدأ حصة</h2>'+fnAll().map(t=>'<button class="sjrow" data-a="fnpick" data-id="'+t.id+'">'+sjI('rp','timer')+'<span class="t">'+t.n+'<small>'+FN_F[t.fmt]+(t.cap?' · '+F(t.cap)+' د':'')+(t.rounds?' · '+F(t.rounds)+' جولات':'')+'</small></span>'+ic('next')+'</button>').join('')+'</div>'+tkWkList('fn')+'<div class="card"><h2>سجّل نتيجة سابقة</h2>'+tkManualForm('fn')+'</div>'}
function fnPl(){let h=fnAll().map(t=>'<div class="card"><h2>'+t.n+' <small class="mu">'+t.e+(t.ver>1?' · v'+t.ver:'')+'</small></h2><div class="mu">'+(t.d||'')+'</div><div style="margin:8px 0;line-height:1.9">'+FN_F[t.fmt]+(t.cap?' · '+F(t.cap)+' د':'')+(t.rounds?' · '+F(t.rounds)+' جولات':'')+'<br>'+t.mv.map(m=>'• '+F(m[1])+' '+esc(m[0])).join('<br>')+'</div><div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm" data-a="fnpick" data-id="'+t.id+'">ابدأ</button><button class="btn sm ghost" data-a="fnedit" data-id="'+t.id+'">تعديل</button>'+tkAddWk('fn',t.id)+'</div></div>').join('');
 h+='<div class="card"><h2>'+ic('plus')+' '+(UI.fb&&UI.fb.id?'تعديل الحصة':'حصة جديدة')+'</h2>'+fnBuilder()+'</div>';return h+tkWkList('fn')}
function fnBuilder(){const b=UI.fb||(UI.fb={fmt:'amrap',mv:[['',10]],cap:12,rounds:3,n:''});
 return '<label class="f">الاسم<input data-a="fbn" value="'+esc(b.n)+'" placeholder="اسم الحصة"></label><div class="g3"><label class="f">الصيغة<select data-a="fbf">'+Object.keys(FN_F).map(k=>'<option value="'+k+'"'+(b.fmt===k?' selected':'')+'>'+FN_F[k]+'</option>').join('')+'</select></label><label class="f">السقف (د)<input type="number" inputmode="numeric" data-a="fbc" value="'+(b.cap||'')+'"></label><label class="f">الجولات<input type="number" inputmode="numeric" data-a="fbr" value="'+(b.rounds||'')+'"></label></div>'+
 b.mv.map((m,i)=>'<div class="row" style="gap:6px;margin-top:6px"><input style="flex:1" data-a="fbmn" data-i="'+i+'" value="'+esc(m[0])+'" placeholder="الحركة" aria-label="الحركة"><input type="number" style="width:76px" data-a="fbmr" data-i="'+i+'" value="'+m[1]+'" aria-label="التكرارات"><button class="x" data-a="fbmd" data-i="'+i+'">حذف</button></div>').join('')+
 '<div class="row" style="gap:8px;margin-top:10px"><button class="btn sm ghost" data-a="fbma">+ حركة</button><button class="btn sm" data-a="fbsave">حفظ الحصة</button></div>'}
function fnLib(){return '<div class="card"><h2>صيغ الحصص</h2><div class="mu" style="line-height:1.9"><b>AMRAP:</b> أكبر عدد من الجولات خلال مدة محددة.<br><b>EMOM:</b> في بداية كل دقيقة تؤدي العمل ثم ترتاح بما تبقى.<br><b>For Time:</b> تنهي العمل بأقل زمن، مع سقف زمني اختياري.<br><b>جولات ثابتة:</b> عدد جولات محدد وتُسجَّل مدة إنجازها.</div></div><div class="card"><h2>التعديل والمقارنة</h2><div class="mu">عند تعديل الحصة يزداد رقم إصدارها، وتُقارَن النتيجة بآخر محاولة من الحصة نفسها بالإصدار والنسخة (قياسية/معدّلة) والمعدات. أي تغيير يخلق فئة مقارنة مستقلة. التدريب الوظيفي اسم عام، وأنماط الحصص مأخوذة من صيغ شائعة.</div></div>'}
function fnCur(s){const p=s.plan;return p.mv[Math.min(s.d.m,p.mv.length-1)]}
function fnBody(s){const p=s.plan,d=s.d,a=tkAct(s);
 let h='<div class="card"><div class="row"><b>'+FN_F[p.fmt]+'</b><span class="sp"></span><span class="mu">'+(p.sc==='rx'?'قياسية':p.sc==='sc'?'معدّلة':'مخصصة')+(p.eq?' · '+esc(p.eq):'')+'</span></div><div class="mu">'+(p.fmt==='amrap'?'أكبر عدد جولات في '+F(p.cap)+' د':p.fmt==='emom'?F(p.cap)+' دقائق، عمل كل دقيقة':p.fmt==='ft'?F(p.rounds)+' جولات بأقل زمن · سقف '+F(p.cap)+' د':F(p.rounds)+' جولات ثابتة')+'</div></div>';
 if(p.fmt==='amrap'||p.fmt==='ft'||p.fmt==='rf'){h+='<div class="card sjfn"><div class="mu">الحركة الحالية</div><b style="font-size:26px">'+F(fnCur(s)[1])+' '+esc(fnCur(s)[0])+'</b><div class="mu" style="margin-top:6px">الجولة <b class="num" data-tk="rnd">'+F(d.r+1)+'</b>'+(p.rounds?' من '+F(p.rounds):'')+' · الحركة '+F(d.m+1)+' من '+F(p.mv.length)+'</div><div class="mu">التالي: '+(p.mv[d.m+1]?F(p.mv[d.m+1][1])+' '+esc(p.mv[d.m+1][0]):'جولة جديدة')+'</div><div class="row" style="gap:8px;margin-top:10px"><button class="btn" data-a="fnnext">أنجزت الحركة ✓</button><button class="btn sm ghost" data-a="fnround">+ جولة كاملة</button><button class="btn sm ghost" data-a="fnundo">تراجع</button></div><div class="mu" style="margin-top:8px">المنجز: '+F(d.r)+' جولة + '+F(d.ex)+' تكرار</div></div>'}
 if(p.fmt==='emom'){const mi=Math.min(p.cap,Math.floor(a/60000)+1);h+='<div class="card sjfn"><div class="mu">الدقيقة</div><b style="font-size:30px" class="num" data-tk="min">'+F(mi)+' / '+F(p.cap)+'</b><div style="margin:8px 0">'+p.mv.map(m=>'• '+F(m[1])+' '+esc(m[0])).join('<br>')+'</div><div class="row" style="gap:8px"><button class="btn" data-a="fnemom">أنجزت هذه الدقيقة ✓</button></div><div class="mu" style="margin-top:8px">المكتملة: '+F(d.iv.length)+' من '+F(p.cap)+'</div></div>'}
 return h}
function fnTimerTxt(s){const p=s.plan,a=tkAct(s);if(p.cap&&(p.fmt==='amrap'||p.fmt==='ft'||p.fmt==='emom'))return {main:tkT(Math.max(0,p.cap*60000-a)),sub:'متبقٍ',cap:true};return {main:tkT(a),sub:'منقضٍ',cap:false}}
function fnCalc(s){const p=s.plan,d=s.d;const per=fnPer(p);let r=s.res=s.res||{};r.fmt=p.fmt;r.rounds=d.r;r.extra=d.ex;r.total=d.r*per+d.ex;r.sec=Math.round(s.acc/1000);r.key=fnKey(p);
 if(p.fmt==='emom'){r.iv=d.iv.length;r.of=p.cap;r.partial=d.iv.length<p.cap}
 if(p.fmt==='ft'||p.fmt==='rf'){const done=d.r>=p.rounds;r.capped=!done&&p.cap&&s.acc>=p.cap*60000-500;r.partial=!done}
 if(p.fmt==='amrap')r.partial=false;
 const prev=tkDone('fn').filter(x=>x.id!==s.id&&x.res&&x.res.key===r.key)[0];r.prev=prev?{id:prev.id,total:prev.res.total,sec:prev.res.sec,iv:prev.res.iv,partial:prev.res.partial}:null}
function fnLine(s){const r=s.res||{};if(!r.fmt)return tkMin(s.acc);
 if(r.fmt==='amrap')return F(r.rounds)+' جولة + '+F(r.extra)+' تكرار';
 if(r.fmt==='emom')return F(r.iv)+' / '+F(r.of)+' دقيقة'+(r.partial?' · جزئي':'');
 return (r.partial?(r.capped?'بلغ السقف · ':'جزئي · ')+F(r.rounds)+' جولة + '+F(r.extra)+' تكرار':tkT(r.sec*1000))}
function fnSum(s){const r=s.res,p=s.plan;let cmp='لا توجد محاولة سابقة مماثلة. هذه فئة المقارنة: «'+esc(p.n)+'» الإصدار '+F(p.ver)+' · '+(p.sc==='rx'?'قياسية':'معدّلة')+(p.eq?' · '+esc(p.eq):'')+'.';
 if(r.prev){if(r.fmt==='amrap'){const df=r.total-r.prev.total;cmp=df>0?'أفضل من آخر محاولة مماثلة بـ '+F(df)+' تكرار.':df<0?'أقل من آخر محاولة مماثلة بـ '+F(-df)+' تكرار.':'مساوية لآخر محاولة مماثلة.'}else if(r.fmt==='emom'){const df=r.iv-r.prev.iv;cmp=df>0?'أكثر بـ '+F(df)+' دقيقة مكتملة من آخر محاولة.':df<0?'أقل بـ '+F(-df)+' دقيقة.':'مساوية لآخر محاولة.'}else{if(r.partial||r.prev.partial)cmp='إحدى المحاولتين جزئية، فلا تُقارن الزمنان مباشرة.';else{const df=r.prev.sec-r.sec;cmp=df>0?'أسرع من آخر محاولة مماثلة بـ '+tkT(df*1000)+'.':df<0?'أبطأ بـ '+tkT(-df*1000)+'.':'نفس زمن آخر محاولة.'}}}
 return '<div class="card"><div class="sjkv"><div><small>النتيجة</small><b class="num">'+fnLine(s)+'</b></div><div><small>الزمن</small><b class="num">'+tkT(s.acc)+'</b></div></div><div class="mu" style="margin-top:8px">'+cmp+'</div>'+(r.partial&&r.fmt!=='emom'?'<div class="mu">حالة جزئية: '+(r.capped?'بلغتَ سقف الوقت':'لم تكتمل الحصة')+'، والمنجز محفوظ.</div>':'')+'</div>'}

/* ======================= التسجيل اليدوي لنشاط سابق ======================= */
function tkManualForm(k){const unit=k==='run'?'كم':k==='swim'?swU(swCfg().u):'';
 return '<div class="g3"><label class="f">التاريخ<input type="date" data-tf="md'+k+'" value="'+esc(tkF('md'+k)||TD())+'"></label><label class="f">الدقائق<input type="number" inputmode="numeric" data-tf="mm'+k+'" value="'+esc(tkF('mm'+k))+'"></label>'+(unit?'<label class="f">المسافة ('+unit+')<input type="number" inputmode="decimal" data-tf="ml'+k+'" value="'+esc(tkF('ml'+k))+'"></label>':'<label class="f">ملاحظة<input data-tf="mn'+k+'" value="'+esc(tkF('mn'+k))+'"></label>')+'</div><button class="btn sm" data-a="tkman" data-k="'+k+'" style="margin-top:8px">حفظ في السجل</button>'}

/* ======================= الشاشة الحيّة والملخّص ======================= */
function vSes(){const s=tkFind(UI.ses);if(!s){UI.ses=null;return trkHub()}
 const k=s.k,ft=k==='fn'?fnTimerTxt(s):null,pau=s.st==='pau';
 let h='<div class="sjses"><div class="row" style="gap:8px"><button class="chip" data-a="tkmin" aria-label="تصغير">'+ic('next')+'</button><b style="flex:1;font-size:18px">'+TKN(k)+(s.plan?' · '+esc(s.plan.n):'')+'</b><button class="chip" data-a="tkend" data-id="'+s.id+'">إنهاء</button></div>';
 h+='<div class="sjclock'+(pau?' pau':'')+'"><b class="num" data-tk="main">'+(ft?ft.main:tkT(tkAct(s)))+'</b><small class="mu">'+(pau?'متوقفة مؤقتًا':ft?ft.sub:'الزمن النشط')+'</small></div>';
 h+='<div class="row" style="gap:8px;margin:0 0 12px"><button class="btn" data-a="tkpause" data-id="'+s.id+'">'+(pau?'استئناف':'إيقاف مؤقت')+'</button></div>';
 h+=({run:runBody,swim:swBody,cali:caBody,fn:fnBody}[k])(s);
 h+='<div style="margin-top:16px"><button class="btn sm ghost" data-a="tkdisc" data-id="'+s.id+'">'+(UI.disc===s.id?'تأكيد حذف الجلسة':'حذف الجلسة')+'</button></div></div>';return h}
function vSum(){const s=tkFind(UI.sum);if(!s){UI.sum=null;return trkHub()}
 let h='<div class="sjses"><h1>'+TKN(s.k)+' · الملخّص</h1><div class="mu" style="margin-bottom:10px">'+tkDay(s.day)+(s.par?' · جلسة جزئية':'')+'</div>';
 h+=({run:runSum,swim:swSum,cali:caSum,fn:fnSum}[s.k])(s);
 return h+'<div class="row" style="gap:8px;margin-top:12px"><button class="btn" data-a="tksumx">تم، اعرض السجل</button></div></div>'}
function tkLive(){if(!UI.ses)return;const s=tkFind(UI.ses);if(!s)return;const q=k=>document.querySelector('[data-tk="'+k+'"]');
 const a=tkAct(s);let e;
 if(s.k==='fn'){const p=s.plan,t=fnTimerTxt(s);if(e=q('main'))e.textContent=t.main;
  if(p.fmt==='emom'&&(e=q('min')))e.textContent=F(Math.min(p.cap,Math.floor(a/60000)+1))+' / '+F(p.cap);
  if(s.st!=='pau'&&p.cap&&a>=p.cap*60000){tkFinish(s,p.fmt==='ft'&&s.d.r<p.rounds);save();render();return}}
 else{if(e=q('main'))e.textContent=tkT(a)}
 if(s.k==='run'){const d=s.d;if(e=q('pace'))e.textContent=tkPace(a,tkNum(d.dist)||0);const sg=(s.plan&&s.plan.segs)||[];if(sg.length&&d.tm!=='d'){let c=0,i=0;for(i=0;i<sg.length;i++){c+=sg[i].s*1000;if(a<c)break}const cu=Math.min(i,sg.length-1);if(UI._rs!==undefined&&UI._rs!==cu){render()}UI._rs=cu;if(e=q('seg'))e.textContent=i<sg.length?tkT(c-a):''}}
 if(s.k==='swim')(s.d.sets||[]).forEach((x,i)=>{if(x.t0&&(e=q('sw'+i)))e.textContent=tkT(tkNow()-x.t0)})}
setInterval(()=>{try{tkLive();const o=tkOpen();const e=document.querySelector('[data-tk=a2]');if(o&&e)e.textContent=tkT(tkAct(o))}catch(e){}},500);

/* ======================= السجل الموحّد والتقدّم ======================= */
function tkAllLog(f){const r=[];SJ().ss.filter(s=>s.st==='done').forEach(s=>r.push({k:s.k,day:s.day,ts:s.t1||0,ms:s.acc,line:tkSumLine(s),id:s.id}));
 try{sxList().forEach(x=>{const n=(x.ex||[]).reduce((a,e)=>a+(e.sets||[]).length,0);if(n)r.push({k:'iron',day:x.date,ts:x.ts||0,ms:(x.sec||0)*1000,line:esc(x.t||'جلسة حديد')+' · '+F(n)+' مجموعة'})})}catch(e){}
 return r.filter(x=>!f||f==='all'||x.k===f).sort((a,b)=>(b.day+b.ts>a.day+a.ts?1:-1))}
function tkLogCard(k){const f=k||UI.lf||'all',L=tkAllLog(f),ms=L.reduce((a,x)=>a+x.ms,0);
 let h='<div class="card" id="tk-log"><h2>'+ic('chart')+' سجل التمارين</h2>';
 if(!k)h+='<div class="sjflt">'+[['all','الكل']].concat(TK.map(t=>[t[0],t[1]])).map(t=>'<button class="chip'+(f===t[0]?' on':'')+'" data-a="tkflt" data-v="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>';
 h+='<div class="row" style="margin:8px 0"><span class="mu">الجلسات</span><b class="num">'+F(L.length)+'</b><span class="sp"></span><span class="mu">المدة</span><b class="num">'+F(Math.round(ms/60000))+' د</b></div>';
 h+=L.length?L.slice(0,40).map(x=>'<div class="row sjli"><span class="tag">'+TKN(x.k)+'</span><span style="flex:1">'+x.line+'</span><span class="mu">'+tkDay(x.day)+'</span></div>').join(''):'<div class="mu">لا توجد جلسات بعد.</div>';
 return h+'</div>'}
function tkProg(k){let h='<div class="card"><h2>أرقامي الشخصية</h2>';const D=tkDone(k);
 if(k==='run'){const b=D.filter(s=>s.res&&s.res.km>0);const lg=b.slice().sort((x,y)=>y.res.km-x.res.km)[0],fs=b.filter(s=>s.res.km>=1).sort((x,y)=>x.acc/x.res.km-y.acc/y.res.km)[0];
  h+=lg?'<div class="row"><span>أطول جولة</span><span class="sp"></span><b class="num">'+F(lg.res.km,2)+' كم</b></div>':'';h+=fs?'<div class="row"><span>أسرع وتيرة (جولة ≥ 1 كم)</span><span class="sp"></span><b class="num">'+tkPace(fs.acc,fs.res.km)+'</b></div><div class="mu">الأساس: متوسط الوتيرة لكل جولة</div>':'';
  if(b.length>=2){const l=b[0],p=b[1];h+='<div class="mu" style="margin-top:6px">آخر جولة: '+(l.res.km&&p.res.km?(l.acc/l.res.km<p.acc/p.res.km?'أسرع':'أبطأ')+' من التي قبلها (مقارنة الوتيرة)':'')+'</div>'}}
 if(k==='swim'){const b=D.filter(s=>s.res&&s.res.dist>0&&s.d.ven!=='open');const ls=b.slice().sort((x,y)=>y.res.dist-x.res.dist)[0];h+=ls?'<div class="row"><span>أطول حصة</span><span class="sp"></span><b class="num">'+F(ls.res.dist)+' '+swU(ls.d.u)+'</b></div><div class="mu">مسبح '+F(ls.d.pool,2)+' '+swU(ls.d.u)+'</div>':'';const pc=b.filter(s=>s.res.swimSec).sort((x,y)=>x.res.swimSec/x.res.dist-y.res.swimSec/y.res.dist)[0];h+=pc?'<div class="row"><span>أسرع متوسط 100</span><span class="sp"></span><b class="num">'+pc.res.pace+'</b></div>':''}
 if(k==='cali'){h+=CSK.map(sk=>sk.st.map((s,i)=>{const bs=['none','band','machine'].map(a=>{const v=caBest(sk.id,i,a);return v!=null?'<div class="row"><span>'+sk.n+' · '+s.n+(a!=='none'?' ('+(a==='band'?'رباط':'جهاز')+')':'')+'</span><span class="sp"></span><b class="num">'+F(v)+' '+caUnit(sk)+'</b></div>':''}).join('');return bs}).join('')).join('')||'<div class="mu">سجّل أول مجموعة لتظهر أرقامك لكل نسخة ونوع مساعدة.</div>'}
 if(k==='fn'){const m={};D.forEach(s=>{if(s.res&&s.res.key){(m[s.res.key]=m[s.res.key]||[]).push(s)}});h+=Object.keys(m).map(x=>{const a=m[x],b=a[0];return '<div class="row"><span>'+esc(b.plan.n)+' · v'+F(b.plan.ver)+' · '+(b.plan.sc==='rx'?'قياسية':'معدّلة')+'</span><span class="sp"></span><b class="num">'+fnLine(b)+'</b></div><div class="mu">'+F(a.length)+' محاولة</div>'}).join('')||'<div class="mu">لا توجد نتائج بعد.</div>'}
 return h+'</div>'}

/* ======================= الديدلفت داخل الحديد ======================= */
function dlVar(n){n=String(n||'');if(!/ديدلفت|deadlift/i.test(n))return null;if(/سومو/.test(n))return 'سومو';if(/روماني/.test(n))return 'روماني';if(/سداسي|trap|hex/i.test(n))return 'بار سداسي';return 'تقليدي'}
function dlData(){const o={};try{sxList().forEach(x=>(x.ex||[]).forEach(e=>{const v=dlVar(e.n);if(!v)return;(e.sets||[]).forEach(q=>{if(q.w>0&&q.r>0&&q.ty!=='w'){(o[v]=o[v]||[]).push({w:+q.w,r:+q.r,day:x.date})}})}))}catch(e){}return o}
const dlBand=r=>r<=1?'1':r<=3?'2–3':r<=6?'4–6':r<=10?'7–10':'11+';
function tkDeadlift(){const D=dlData(),vs=['تقليدي','سومو','روماني','بار سداسي'],sel=UI.dlv&&vs.indexOf(UI.dlv)>=0?UI.dlv:'تقليدي',L=D[sel]||[];
 let h='<h1>الديدلفت</h1><div class="mu" style="margin-bottom:8px">كل نسخة لها سجل وأرقام مستقلة، ومصدرها جلسات الحديد.</div><div class="sjflt">'+vs.map(v=>'<button class="chip'+(sel===v?' on':'')+'" data-a="dlv" data-v="'+v+'">'+v+(D[v]?' · '+F(D[v].length):'')+'</button>').join('')+'</div>';
 if(!L.length)return h+'<div class="card"><b>لا توجد مجموعات «'+sel+'» بعد</b><div class="mu">أضف تمرين «'+(sel==='تقليدي'?'ديدلفت':sel==='روماني'?'رومانيان ديدلفت':sel==='سومو'?'سومو ديدلفت':'ديدلفت بار سداسي')+'» إلى خطتك وسجّل مجموعاتك داخل جلسة الحديد.</div></div>';
 const best=L.slice().sort((a,b)=>b.w-a.w)[0],bands={};L.forEach(x=>{const k=dlBand(x.r);if(!bands[k]||x.w>bands[k].w)bands[k]=x});
 const est=L.filter(x=>x.r>=1&&x.r<=12).map(x=>({v:x.r===1?x.w:x.w*(1+x.r/30),x:x})).sort((a,b)=>b.v-a.v)[0];
 h+='<div class="card"><div class="sjkv"><div><small>أفضل وزن</small><b class="num">'+F(toU(best.w),1)+' '+uL()+'</b></div><div><small>عدد المجموعات</small><b class="num">'+F(L.length)+'</b></div></div>'+(est?'<div class="mu" style="margin-top:8px"><b>الحد الأقصى المقدّر لتكرار واحد:</b> <span class="num">'+F(toU(est.v),1)+' '+uL()+'</span><br>الطريقة: وزن × (1 + التكرارات ÷ 30)، من أفضل مجموعة بين 1 و12 تكرارًا. تقدير وليس رفعة مسجّلة.</div>':'')+'</div>';
 h+='<div class="card"><h2>أفضل وزن لكل نطاق تكرار</h2>'+['1','2–3','4–6','7–10','11+'].map(k=>'<div class="row"><span>'+k+' تكرار</span><span class="sp"></span><b class="num">'+(bands[k]?F(toU(bands[k].w),1)+' '+uL()+' × '+F(bands[k].r):'—')+'</b></div>').join('')+'</div>';
 h+='<div class="card"><h2>آخر المجموعات</h2>'+L.slice(-8).reverse().map(x=>'<div class="row"><span>'+tkDay(x.day)+'</span><span class="sp"></span><span class="num">'+F(toU(x.w),1)+' '+uL()+' × '+F(x.r)+'</span></div>').join('')+'</div>';return h}

/* ======================= اليوم و«+» ======================= */
function tkTodayBlock(){let h=tkBanner(0);const pl=(SJ().tw[TI()]||[]);
 if(pl.length){const D=tkDone();h+='<div class="card"><h2>'+ic('cal')+' حصص اليوم</h2>'+pl.map(e=>{const dn=D.some(s=>s.day===TD()&&s.plan&&s.plan.id===e.t&&s.k===e.k),o=tkOpen(),res=o&&o.k===e.k&&o.plan&&o.plan.id===e.t;
  return '<div class="row sjli"><span class="tag">'+TKN(e.k)+'</span><span style="flex:1">'+esc(tkTplName(e.k,e.t))+'</span>'+(dn?'<span class="tag ok">تمّت</span>':res?'<button class="btn sm" data-a="tkopen" data-id="'+o.id+'">استكمل</button>':'<button class="btn sm" data-a="tkplan" data-k="'+e.k+'" data-t="'+e.t+'">ابدأ</button>')+'</div>'}).join('')+'</div>'}
 return h}
function tkQuick(){const m=UI.ql;
 const back='<button class="chip" data-a="qlm" data-v="menu" aria-label="رجوع">'+ic('next')+'</button>';let b;
 if(m==='wo'){b='<div class="sjg">'+TK.map(t=>'<button class="sjt" data-a="qlm" data-v="wo:'+t[0]+'">'+sjI(t[3],t[4])+'<span>'+t[1]+'</span></button>').join('')+'</div>'}
 else{const k=m.slice(3);b='<div class="sjg"><button class="sjt" data-a="tkqs" data-k="'+k+'">'+sjI('wt','play')+'<span>ابدأ جلسة</span></button>'+(k==='iron'?'':'<button class="sjt" data-a="qlm" data-v="wm:'+k+'">'+sjI('wm','cal')+'<span>سجّل نشاطًا سابقًا</span></button>')+'</div>'}
 if(/^wm:/.test(m)){const k=m.slice(3);b=tkManualForm(k)}
 const ttl=m==='wo'?'اختر المسار':/^wm:/.test(m)?'نشاط سابق · '+TKN(m.slice(3)):TKN(m.slice(3));
 return '<div class="sjq" data-a="qlx"><div class="sjs" role="dialog" aria-modal="true" aria-label="'+ttl+'" tabindex="-1" data-stop="1"><div class="grab"></div><div class="sjh"><b>'+ttl+'</b><span class="row" style="gap:6px">'+back+'<button class="chip" data-a="qlx" aria-label="إغلاق">'+ic('x')+'</button></span></div>'+b+'</div></div>'}

/* ----- الأوامر ----- */
Object.assign(ACT,{
 tktab:b=>{UI.ttab=b.dataset.v;UI.cask=null},
 trk:b=>{const v=b.dataset.v;if(v!==UI.trk){UI.ttab='ov';UI.cask=null}UI.trk=v;UI.ses=null;UI.sum=null;window.scrollTo(0,0)},
 trkhub:()=>{UI.trk='hub';UI.ses=null;UI.sum=null;window.scrollTo(0,0)},
 tkopen:b=>{const s=tkFind(b.dataset.id);if(!s)return false;UI.ses=s.id;UI.sum=null;S.tab='train';UI.trk=s.k;if(s.st==='pau'){}window.scrollTo(0,0)},
 tkmin:()=>{UI.ses=null},
 tkpause:b=>{const s=tkFind(b.dataset.id);if(!s)return false;s.st==='pau'?tkResume(s):tkPause(s)},
 tkend:b=>{const s=tkFind(b.dataset.id);if(!s)return false;const par=s.k==='fn'?(s.res&&0):0;tkFinish(s,tkPartial(s));S.tab='train';UI.trk=s.k},
 tkdisc:b=>{if(UI.disc!==b.dataset.id){UI.disc=b.dataset.id;return}const a=SJ().ss,i=a.findIndex(x=>x.id===b.dataset.id);if(i>=0)a.splice(i,1);UI.disc=null;UI.ses=null},
 tksumx:()=>{UI.sum=null;UI.ttab='lg'},
 tkcf:b=>{const c=UI.tconf,o=tkOpen();const v=b.dataset.v;if(v==='no'||!c||!o){UI.tconf=null;return}if(v==='resume'){UI.tconf=null;UI.ses=o.id;UI.trk=o.k;return}
  tkFinish(o,1);UI.sum=null;UI.tconf=null;if(c.k==='run')runStart(c.plan&&c.plan.id,c.extra&&c.extra.d&&c.extra.d.mode);else tkNew(c.k,c.plan,c.extra)},
 tkflt:b=>{UI.lf=b.dataset.v},
 tkwdel:b=>{const a=SJ().tw[b.dataset.d];if(a)a.splice(+b.dataset.i,1)},
 tkplan:b=>{const k=b.dataset.k,t=b.dataset.t;if(k==='run')runStart(t);else if(k==='swim')swStart(t);else if(k==='cali')caStart(t);else if(k==='fn')fnStart(t)},
 tkqs:b=>{const k=b.dataset.k;UI.ql='';if(k==='iron'){_sjWo();return false}if(k==='run')runStart(null,'free');else if(k==='swim')swStart(null);else if(k==='cali')caStart('');else{S.tab='train';UI.trk='fn';UI.ttab='ov'}},
 tkman:b=>{const k=b.dataset.k,m=tkNum(tkF('mm'+k)),dt=tkF('md'+k)||TD();if(!m||m<=0){toast('أدخل الدقائق');return false}
  const l=tkNum(tkF('ml'+k)),s={id:tkId(),k:k,st:'done',day:dt,t0:Date.parse(dt+'T12:00:00')||tkNow(),t1:tkNow(),acc:Math.round(m*60000),ra:null,plan:null,src:'يدوي',man:1,d:{}};
  if(k==='run'){s.d={dist:l||'',laps:[],mode:'manual'}}if(k==='swim'){const c=swCfg();s.d={ven:'pool',pool:c.pool,u:c.u,sets:[],open:{dist:l||''}};s.d.ven='open'}if(k==='cali'||k==='fn'){s.d={ents:[],note:tkF('mn'+k)||''}}
  SJ().ss.push(s);tkCalc(s);if(k==='fn'){s.res={fmt:'x'}}UI.tf={};UI.ql='';toast('تم حفظ النشاط في السجل');S.tab='train';UI.trk=k;UI.ttab='lg'},
 /* الجري */
 runst:b=>{runStart(b.dataset.id||null,b.dataset.m||'out')},
 runcfg:(b,ev)=>{const t=ev&&ev.target;if(!t||t.tagName!=='SELECT')return false;const c=runCfg();c[b.dataset.k]=b.dataset.k==='dpw'?+t.value:t.value;return false},
 rundist:()=>false,
 runlap:()=>{const s=tkFind(UI.ses);if(!s)return false;s.d.laps.push(tkAct(s));if(s.d.tm==='d')s.d.seg=(s.d.seg||0)+1},
 /* السباحة */
 swpool:b=>{const c=swCfg();c.pool=+b.dataset.p;c.u=b.dataset.u},
 swcus:()=>{const v=tkNum(tkF('swcus'));if(!v||v<=0){toast('أدخل طولًا صحيحًا');return false}const c=swCfg();c.pool=v;c.u=tkF('swcu')==='yd'?'yd':'m';UI.tf.swcus=''},
 swst:b=>{swStart(b.dataset.id||null,b.dataset.ven)},
 swlen:()=>false,swstr:()=>false,swsec:()=>false,swopen:()=>false,swfix:()=>false,
 swgo:b=>{const s=tkFind(UI.ses);if(!s)return false;s.d.sets[+b.dataset.i].t0=tkNow()},
 swstop:b=>{const s=tkFind(UI.ses);if(!s)return false;const x=s.d.sets[+b.dataset.i];x.sec=Math.round((tkNow()-x.t0)/1000);x.t0=null},
 swdone:b=>{const s=tkFind(UI.ses);if(!s)return false;const x=s.d.sets[+b.dataset.i];if(x.done){x.done=0;return}if(x.len==null)x.len=swLen(x,s.d.pool);x.done=1;if(x.t0){x.sec=Math.round((tkNow()-x.t0)/1000);x.t0=null}},
 swaddset:()=>{const s=tkFind(UI.ses);if(!s)return false;s.d.sets.push({st:'حرة',rep:1,d:s.d.pool,rest:30,len:null,sec:null,str:null,done:0})},
 /* الكالسثينكس */
 caeq:b=>{caCfg().eq=b.dataset.v},
 cast:b=>{caStart(b.dataset.id||'')},
 casel:b=>{UI.cask=b.dataset.id||null;UI.ttab='lib'},
 castage:b=>{const st=caSt(b.dataset.id);st.i=+b.dataset.i;st.h.push({i:st.i,d:TD()})},
 calog:b=>{const s=tkFind(UI.ses);if(!s)return false;const id=b.dataset.sk,sk=caSk(id),st=caSt(id),i=Math.min(st.i,sk.st.length-1),v=tkNum(tkF('cv'+id));if(!v||v<=0){toast('أدخل التكرارات أو الثواني');return false}
  s.d.ents.push({sk:id,i:i,v:sk.st[i].n,m:sk.m,val:v,as:tkF('ca'+id)||'none',w:tkNum(tkF('cw'+id))||0,sd:tkF('cs'+id)||'both',at:tkNow()});UI.tf['cv'+id]=''},
 cadel:b=>{const s=tkFind(UI.ses);if(!s)return false;s.d.ents.splice(+b.dataset.i,1)},
 /* الوظيفي */
 fnpick:b=>{const t=fnAll().find(a=>a.id===b.dataset.id);if(!t)return false;UI.fp2=t.id;UI.fsc='rx';UI.ttab='ov'},
 fnedit:b=>{const t=fnAll().find(a=>a.id===b.dataset.id);if(!t)return false;UI.fb={id:t.id,n:t.n,fmt:t.fmt,cap:t.cap||'',rounds:t.rounds||'',mv:JSON.parse(JSON.stringify(t.mv))}},
 fbn:()=>false,fbf:()=>false,fbc:()=>false,fbr:()=>false,fbmn:()=>false,fbmr:()=>false,
 fbma:()=>{(UI.fb=UI.fb||{fmt:'amrap',mv:[],cap:12,rounds:3,n:''}).mv.push(['',10])},
 fbmd:b=>{UI.fb.mv.splice(+b.dataset.i,1)},
 fbsave:()=>{const b=UI.fb;if(!b||!b.n||!b.n.trim()||!b.mv.filter(m=>m[0].trim()).length){toast('أدخل اسم الحصة وحركة واحدة على الأقل');return false}
  const mv=b.mv.filter(m=>m[0].trim()).map(m=>[m[0].trim(),+m[1]||1]),o=SJ(),base=FN_T.find(x=>x.id===b.id),own=o.ft.find(x=>x.id===b.id);
  const rec={id:own?own.id:('u'+tkNow().toString(36)),n:b.n.trim(),e:b.n.trim(),fmt:b.fmt,cap:+b.cap||0,rounds:+b.rounds||0,mv:mv,d:'حصة مخصصة',ver:own?(own.ver||1)+1:1};
  if(base){/* تعديل قالب أصلي ينشئ نسخة مستقلة بإصدار أعلى */rec.id='u'+tkNow().toString(36);rec.ver=(base.ver||1)+1}
  if(own)Object.assign(own,rec);else o.ft.push(rec);UI.fb=null;toast('تم حفظ الحصة')},
 fnstart:()=>{const id=UI.fp2;if(!id)return false;const sc=UI.fsc||'rx';UI.fp2=null;fnStart(id,sc,tkF('fneq'))},
 fnsc:b=>{UI.fsc=b.dataset.v},
 fnnext:()=>{const s=tkFind(UI.ses);if(!s)return false;const p=s.plan,d=s.d;d.undo.push([d.r,d.m,d.ex]);d.ex+=+p.mv[d.m][1]||0;d.m++;if(d.m>=p.mv.length){d.r++;d.m=0;d.ex=0;if(p.rounds&&d.r>=p.rounds&&p.fmt!=='amrap'){tkFinish(s,false)}}},
 fnround:()=>{const s=tkFind(UI.ses);if(!s)return false;const p=s.plan,d=s.d;d.undo.push([d.r,d.m,d.ex]);d.r++;d.m=0;d.ex=0;if(p.rounds&&d.r>=p.rounds&&p.fmt!=='amrap')tkFinish(s,false)},
 fnundo:()=>{const s=tkFind(UI.ses);if(!s||!s.d.undo.length)return false;const u=s.d.undo.pop();s.d.r=u[0];s.d.m=u[1];s.d.ex=u[2]},
 fnemom:()=>{const s=tkFind(UI.ses);if(!s)return false;const mi=Math.min(s.plan.cap,Math.floor(tkAct(s)/60000)+1);if(s.d.iv.indexOf(mi)<0)s.d.iv.push(mi);if(s.d.iv.length>=s.plan.cap)tkFinish(s,false)},
 dlv:b=>{UI.dlv=b.dataset.v}
});
function tkPartial(s){if(s.k==='fn'){const p=s.plan,d=s.d;if(p.fmt==='emom')return d.iv.length<p.cap;if(p.fmt==='amrap')return false;return d.r<p.rounds}return false}
/* حقول بلا إعادة رسم: تُحدَّث القيمة مباشرة في الجلسة */
document.addEventListener('change',ev=>{const t=ev.target,a=t&&t.dataset&&t.dataset.a;let s=tkFind(UI.ses),n=tkNum(t&&t.value);
 if(t&&t.dataset&&t.dataset.twsel!==undefined){const d=t.value;if(d==='')return;const o=SJ().tw;(o[d]=o[d]||[]);if(!o[d].some(e=>e.k===t.dataset.k&&e.t===t.dataset.t))o[d].push({k:t.dataset.k,t:t.dataset.t});t.value='';save();render();toast('أُضيفت إلى أسبوعك');return}
 if(!a)return;
 if(a==='rundist'&&s){s.d.dist=t.value;save()}
 if(a==='swopen'&&s){s.d.open.dist=t.value;save()}
 if(s&&/^sw(len|str|sec)$/.test(a)){const x=s.d.sets[+t.dataset.i],f={swlen:'len',swstr:'str',swsec:'sec'}[a];x[f]=n;if(a==='swlen'&&n!=null)x.done=x.done||0;save()}
 if(a==='swfix'){const q=tkFind(t.dataset.sid);if(q){q.d.sets[+t.dataset.i].len=n;if(!q.d.sets[+t.dataset.i].done)q.d.sets[+t.dataset.i].done=1;tkCalc(q);save();render()}}
 if(a==='runcfg'){const c=runCfg();c[t.dataset.k]=t.dataset.k==='dpw'?+t.value:t.value;save()}
 if(UI.fb&&/^fb/.test(a)){const b=UI.fb;if(a==='fbn')b.n=t.value;if(a==='fbf')b.fmt=t.value;if(a==='fbc')b.cap=t.value;if(a==='fbr')b.rounds=t.value;if(a==='fbmn')b.mv[+t.dataset.i][0]=t.value;if(a==='fbmr')b.mv[+t.dataset.i][1]=n||1}});
/* ----- ربط بالتطبيق ----- */
(()=>{const V=view;view=function(){if(UI.ses||UI.sum){S.tab='train';return tkView(UI.trk)}return V.apply(this,arguments)};
 const H=sjHead;sjHead=function(){return (UI.ses||UI.sum)?'':H.apply(this,arguments)};
 const N=sjNav;sjNav=function(){return UI.ses?'':N.apply(this,arguments)};
 const Q=sjQuickHtml;sjQuickHtml=function(){if(UI.ql==='wo'||/^(wo|wm):/.test(UI.ql||''))return tkQuick();return Q.apply(this,arguments)};
 const qm=ACT.qlm;ACT.qlm=function(b){const v=b.dataset.v;if(v==='wo'){UI.fab=0;UI.qa='';UI.ql='wo';return}return qm.apply(this,arguments)};
 const T=vToday;vToday=function(){let h=T.apply(this,arguments);const m='<details class="sjmore" id="td-more"';const i=h.indexOf(m);const b=tkTodayBlock();return i<0?h+b:h.slice(0,i)+b+h.slice(i)};
 const P=vPg;vPg=function(){let h=P.apply(this,arguments);const m='<details class="sjmore" id="pg-more"';const i=h.indexOf(m);const b=tkLogCard(null);return i<0?h+b:h.slice(0,i)+b+h.slice(i)};
 const VT=vTrain;vTrain=function(){if(UI.ses||UI.sum)return tkView(UI.trk);if(UI.trk==='dl'||['run','swim','cali','fn'].indexOf(UI.trk)>=0)return tkView(UI.trk);let h=VT.apply(this,arguments);if(UI.trk==='iron'){const r='<button class="sjrow" data-a="trk" data-v="dl">'+sjI('tr','dumbbell')+'<span class="t">الديدلفت<small>أرقام كل نسخة: تقليدي، سومو، روماني</small></span>'+ic('next')+'</button>';const i=h.indexOf('</h1>');h=i<0?r+h:h.slice(0,i+5)+r+h.slice(i+5)}return h};
 /* قراءة قالب الوظيفي قبل البدء: اختيار النسخة والمعدات */
 const FO=fnOv;fnOv=function(){if(UI.fp2){const t=fnAll().find(a=>a.id===UI.fp2);return '<div class="card"><h2>'+esc(t.n)+'</h2><div class="mu">'+FN_F[t.fmt]+'</div><div class="row" style="gap:8px;margin:10px 0">'+[['rx','قياسية'],['sc','معدّلة']].map(x=>'<button class="chip'+((UI.fsc||'rx')===x[0]?' on':'')+'" data-a="fnsc" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div><label class="f">المعدات أو التعديل (اختياري)<input data-tf="fneq" value="'+esc(tkF('fneq'))+'" placeholder="مثلًا: دمبل 10 كغ"></label><div class="row" style="gap:8px;margin-top:10px"><button class="btn" data-a="fnstart">ابدأ</button><button class="btn ghost" data-a="tkcancelfp">إلغاء</button></div></div>'}return FO.apply(this,arguments)};
 ACT.tkcancelfp=()=>{UI.fp2=null};
})();
Object.assign(ENT,{"التدريب الوظيفي":"Functional training","الجري":"Running","الكالسثينكس":"Calisthenics","الديدلفت":"Deadlift","ابدأ جلسة":"Start session","إيقاف مؤقت":"Pause","استئناف":"Resume","إنهاء":"Finish","لفّة":"Lap","جلسة جارية":"Session in progress","سجل التمارين":"Workout log","الكل":"All","نظرة عامة":"Overview","الخطط":"Plans","المكتبة":"Library","السجل والتقدّم":"Log & progress","حصص اليوم":"Today's sessions"});
