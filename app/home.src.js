/* ======================= الرئيسية: خانات منفصلة =======================
   التاريخ واليوم، الوقت، الحرارة (كل منها خانة)، مواقيت الصلاة (كل صلاة خانة بشريط الوقت المتبقي)،
   فاصل «One Day / Day One» بلا إطار، واختصارات بصور يتحكم المستخدم بها (S.hmsc). المواقيت من rdPray فقط. */
const HMP=[['fajr','الفجر','sunrise'],['sunrise','الشروق','sun'],['dhuhr','الظهر','sun'],['asr','العصر','cloud'],['maghrib','المغرب','sunset'],['isha','العشاء','moon']];
const hmN=v=>String(v).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
function hmDate(ms,tz){const o={g:{},h:{}};
 try{new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn',{timeZone:tz,weekday:'long',day:'numeric',month:'long',year:'numeric'}).formatToParts(ms).forEach(p=>o.g[p.type]=p.value)}catch(e){}
 try{new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn',{timeZone:tz,day:'numeric',month:'long',year:'numeric'}).formatToParts(ms).forEach(p=>o.h[p.type]=p.value)}catch(e){}
 return o}
function hmCells(st,M){const d=hmDate(st.now,st.c.tz),p=SCP[M.per],cur=st.has&&st.s.wxOn?rdHour(st.now):null,sx=cur?rdStale():'',ok=cur&&sx!=='expired';
 const date='<div class="hmc hmdate" id="hm-date"><div class="hmwd" id="hm-wd">'+esc(d.g.weekday||'')+'</div><div class="hmbig num" id="hm-day">'+esc(d.g.day||'')+'</div>'+
  '<div class="hmh" id="sc-hijri">'+(d.h.day?esc(d.h.day+' '+d.h.month+' '+d.h.year+' هـ'):'')+'</div><div class="hmg" id="hm-g">'+esc((d.g.day||'')+' '+(d.g.month||'')+' '+(d.g.year||''))+'</div></div>';
 const time='<div class="hmc hmtime"><div class="hmk">'+scIc('clock')+'الوقت</div><b class="num hmclk" id="sc-time" data-rdclk>'+rdF(st.now,st.c.tz)+'</b><div class="hmper"><span id="sc-per-ic">'+scIc(p[1])+'</span><b id="sc-per">'+p[0]+'</b></div></div>';
 const wx=ok?'<div class="hmc hmwx" id="hm-wx"><div class="hmk">'+scIc(fxWxKind(cur.code)||'clear')+'الحرارة</div><b class="num hmtp">'+rdT(cur.temp)+'</b><div class="hmwl">'+esc(rdCode(cur.code))+' · محسوسة <span class="num" dir="ltr">'+rdT(cur.feels)+'</span></div></div>'
  :'<div class="hmc hmwx" id="hm-wx"><div class="hmk">'+scIc('cloud')+'الحرارة</div><b class="num hmtp">—</b><div class="hmwl">'+(st.has?(sx==='expired'?'انتهت صلاحية التوقع':'لا يتوفر توقع محفوظ'):'حدّد موقعك لتظهر')+'</div></div>';
 return '<div class="hmgrid">'+date+time+wx+'</div>'}
/* ---------- الصلاة ---------- */
function hmPD(now,c){const ds=rdP(now,c.tz).d,T=rdPray(ds),N=rdPray(rdAddD(ds,1)),P=rdPray(rdAddD(ds,-1));if(HMP.some(x=>T[x[0]]==null)||N.fajr==null||P.isha==null)return null;
 const ev=HMP.map((x,i)=>({k:x[0],n:x[1],ic:x[2],t:T[x[0]],e:i<5?T[HMP[i+1][0]]:N.fajr}));
 const fri=new Date(Date.UTC.apply(null,ds.split('-').map((v,i)=>i===1?+v-1:+v))).getUTCDay()===5;if(fri)ev[2].n='الجمعة';
 let ci=-1;ev.forEach((x,i)=>{if(now>=x.t)ci=i});
 const cur=ci>=0?ev[ci]:{k:'isha',n:'العشاء',t:P.isha,e:T.fajr,prev:1},nxt=ci<5?ev[ci+1]:{k:'fajr',n:'الفجر',t:N.fajr,e:N.fajr,nx:1};
 if(ci<0)return{ds:ds,ev:ev,ci:-1,cur:cur,nxt:ev[0],fri:fri};
 return{ds:ds,ev:ev,ci:ci,cur:cur,nxt:ci<5?ev[ci+1]:nxt,fri:fri}}
function hmClk(ms){ms=Math.max(0,Math.floor(ms/1000));const h=Math.floor(ms/3600),m=Math.floor(ms%3600/60),s=ms%60,z=n=>String(n).padStart(2,'0');return h+':'+z(m)+':'+z(s)}
function hmPray(){const c=rdCity(),now=rdNow(),D=hmPD(now,c);if(!D)return '';
 const nx=D.nxt,st0=D.cur.t,fr=Math.max(0,Math.min(1,(now-st0)/Math.max(1,nx.t-st0)));
 let h='<div class="hmpr" id="hm-pray" data-k="'+D.ci+'"><div class="sechead"><h2>مواقيت الصلاة</h2><span class="mu hmcity">'+scIc('pin')+esc(c.n)+(smHasLoc()?'':' · تقريبي')+'</span></div>'+
  '<div class="hmc hmnext"><div class="hmnk">باقي على '+(nx.k==='dhuhr'&&D.fri?'صلاة الجمعة':esc(nx.n))+'</div><b class="num hmcd" id="hm-cd">'+hmClk(nx.t-now)+'</b>'+
  '<div class="hmbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(fr*100)+'"><i id="hm-nb" style="width:'+(fr*100).toFixed(1)+'%"></i></div>'+
  '<div class="hmbl"><span>'+esc(D.cur.n)+' <b class="num">'+rdF(st0,c.tz)+'</b></span><span>'+esc(nx.n)+' <b class="num">'+rdF(nx.t,c.tz)+'</b></span></div></div><div class="hmtiles">';
 D.ev.forEach((x,i)=>{const past=now>=x.e,curr=i===D.ci,left=curr?Math.max(0,Math.min(1,(x.e-now)/Math.max(1,x.e-x.t))):0;
  h+='<div class="hmc hmt'+(curr?' on':past?' past':'')+(i===D.ci+1?' nx':'')+'" data-i="'+i+'"><span class="hmti">'+scIc(x.ic)+'</span><b>'+esc(x.n)+'</b><span class="num hmtm">'+rdF(x.t,c.tz)+'</span>'+
   '<div class="hmtb"><i'+(curr?' id="hm-tb"':'')+' style="width:'+(left*100).toFixed(1)+'%"></i></div><small class="num hmtl">'+(curr?'متبقٍ <span id="hm-tl">'+hmClk(x.e-now).replace(/^0:/,'')+'</span>':past?'انتهى':'')+'</small></div>'});
 return h+'</div></div>'}
function hmTick(){const el=document.getElementById('hm-pray');if(!el||document.hidden)return;const c=rdCity(),now=rdNow(),D=hmPD(now,c);if(!D)return;
 if(String(D.ci)!==el.dataset.k){render();return}
 const set=(id,t)=>{const e=document.getElementById(id);if(e&&e.textContent!==t)e.textContent=t},nx=D.nxt,st0=D.cur.t,fr=Math.max(0,Math.min(1,(now-st0)/Math.max(1,nx.t-st0)));
 set('hm-cd',hmClk(nx.t-now));const nb=document.getElementById('hm-nb');if(nb)nb.style.width=(fr*100).toFixed(1)+'%';
 if(D.ci>=0){const x=D.ev[D.ci];set('hm-tl',hmClk(x.e-now).replace(/^0:/,''));const tb=document.getElementById('hm-tb');if(tb)tb.style.width=(Math.max(0,Math.min(1,(x.e-now)/Math.max(1,x.e-x.t)))*100).toFixed(1)+'%'}}
setInterval(()=>{try{hmTick()}catch(e){lg(e)}},1000);
/* ---------- المشهد بلا نصوص التاريخ والوقت (صارت خانات) ---------- */
const HMGL='<svg class="hmgl" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0c0 5.4 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>';
function hmLoc(st){const s=st.s;let t=st.has?esc(st.c.n):s.geoBusy?'جارٍ التحديد…':s.geoDeny?'الموقع غير مفعّل':s.geoFail?'تعذّر التحديد':'حدّد موقعك';
 return '<button class="hmlc'+(st.has?' on':'')+(s.geoBusy?' busy':'')+'" data-a="rdgeo" id="sc-loc" aria-label="استخدم موقعي"'+(s.geoBusy?' disabled':'')+'><span class="hmgw">'+HMGL+'</span><b>'+t+'</b></button>'}
scCard=function(){const st=scState(),M=scModel(st);
 return '<div class="card scn fxscene sc-p-'+M.per+(scReduced()?' sc-rm':'')+'" id="sc-card" data-key="'+esc(M.key)+'" style="--sk1:'+scCss(M.sk.top)+';--sk2:'+scCss(M.sk.bot)+'" role="group" aria-label="'+esc(scAria(st,M))+'">'+scArt(st,M)+
  '<div class="scin hmscin">'+hmLoc(st)+'</div></div>'};
/* تفعيل الموقع والطقس تلقائيًا عند استعمال التطبيق: مرة واحدة تُطلب الصلاحية، وبعد الرفض لا نكرر الطلب */
async function hmAuto(){const s=rdS();if(smHasLoc()||s.geoBusy)return;
 if(!s.wxOn||!s.sunOn){s.wxOn=1;s.sunOn=1;save()}
 let state='';try{if(navigator.permissions&&navigator.permissions.query)state=(await navigator.permissions.query({name:'geolocation'})).state}catch(e){}
 if(!navigator.geolocation&&!NAT)return;
 if(state==='denied'){if(!s.geoDeny){s.geoDeny=1;save();render()}return}
 if(state==='granted'){s.geoDeny=0;ACT.rdgeo();return}
 if(s.geoAsked)return;s.geoAsked=1;save();ACT.rdgeo()}
(()=>{const A=scApply;scApply=function(f){const r=A.apply(this,arguments);try{const st=scState(),d=hmDate(st.now,st.c.tz),set=(id,t)=>{const e=document.getElementById(id);if(e&&e.textContent!==t)e.textContent=t};
 set('hm-wd',d.g.weekday||'');set('hm-day',d.g.day||'');set('hm-g',(d.g.day||'')+' '+(d.g.month||'')+' '+(d.g.year||''));if(d.h.day)set('sc-hijri',d.h.day+' '+d.h.month+' '+d.h.year+' هـ')}catch(e){lg(e)}return r}})();
/* ---------- الفاصل ---------- */
function hmDiv(){return '<div class="hmod" role="img" aria-label="One Day. Day One."><div class="hmod1"><span>One Day</span></div><div class="hmod2">Day One</div></div>'}
/* ---------- الاختصارات ---------- */
const HMS={
 wgt:['متابعة الوزن','scale',()=>{S.tab='me';S.sub='wgt'}],
 wlog:['تسجيل وقت التمرين','timer',()=>{S.tab='train';S.sub=null;UI.trk='irs';UI.qt='cur';UI.qd=TD();UI.qx=null}],
 food:['تسجيل طعام','fork',()=>{S.tab='food';S.sub=null;UI.fm='today';UI.fd='';const h=+rdP(Date.now(),Intl.DateTimeFormat().resolvedOptions().timeZone).h;fdOpen(h<11?'b':h<16?'l':h<21?'d':'s')}],
 water:['تسجيل الماء','drop',()=>{S.tab='food';S.sub=null;UI.fm='today';UI.fd='';setTimeout(()=>{const e=document.getElementById('w-card');if(e)e.scrollIntoView({block:'center'})},80)}],
 photos:['صور التقدّم','image',()=>{S.tab='me';S.sub='ppg'}],
 plan:['خطتي','dumbbell',()=>{S.tab='train';S.sub=null;UI.trk='irs';UI.qt='cur';UI.qd=TD();UI.qx=null}],
 run:['تسجيل جري','step',()=>{S.tab='train';S.sub=null;UI.trk='run'}],
 rpt:['التقارير','chart',()=>{S.tab='me';S.sub='rpt'}],
 bdy:['بيانات الجسم','pulse',()=>{S.tab='me';S.sub='bdy'}],
 ach:['الأوسمة','trophy',()=>{S.tab='me';S.sub='ach'}],
 steps:['الخطوات','steps',()=>{S.tab='ex';S.sub='link'}]};
const HMD=['wgt','wlog','food','water','photos','plan'];
function hmList(){const a=Array.isArray(S.hmsc)?S.hmsc.filter(k=>HMS[k]):null;return a?a.filter((k,i)=>a.indexOf(k)===i):HMD.slice()}
function hmTile(k){const x=HMS[k];return '<button class="hmsc" data-a="hmgo" data-v="'+k+'"><span class="hmpic" aria-hidden="true"><span class="hmbk">'+ic(x[1])+'</span><span class="hmfg">'+ic(x[1])+'</span></span><b>'+x[0]+'</b></button>'}
function hmShort(){const L=hmList(),ed=!!UI.hmed;
 let h='<div class="sechead"><h2>اختصاراتي</h2><button class="chip" data-a="hmed">'+ic(ed?'check':'edit')+(ed?'تم':'تخصيص')+'</button></div>';
 if(!ed)return h+(L.length?'<div class="hmgs">'+L.map(hmTile).join('')+'</div>':'<div class="hmc mu" style="padding:16px;text-align:center">لا اختصارات. اضغط «تخصيص» لإضافتها.</div>');
 h+='<div class="hmed">'+L.map((k,i)=>'<div class="hmrow"><span class="hmpic sm" aria-hidden="true"><span class="hmfg">'+ic(HMS[k][1])+'</span></span><b>'+HMS[k][0]+'</b><span class="sp"></span>'+
  '<button class="chip" data-a="hmmv" data-v="'+k+'" data-d="-1" aria-label="أعلى"'+(i?'':' disabled')+'>↑</button><button class="chip" data-a="hmmv" data-v="'+k+'" data-d="1" aria-label="أسفل"'+(i<L.length-1?'':' disabled')+'>↓</button><button class="chip" data-a="hmtg" data-v="'+k+'" aria-label="إزالة">'+ic('x')+'</button></div>').join('')+'</div>';
 const rest=Object.keys(HMS).filter(k=>L.indexOf(k)<0);
 if(rest.length)h+='<div class="mu" style="margin:10px 0 6px">أضف اختصارًا</div><div class="chips">'+rest.map(k=>'<button class="chip" data-a="hmtg" data-v="'+k+'">'+ic('plus')+HMS[k][0]+'</button>').join('')+'</div>';
 return h+'<div class="row" style="margin-top:10px"><button class="chip" data-a="hmrs">استرجاع الاختصارات الافتراضية</button></div>'}
Object.assign(ACT,{
 hmgo:b=>{const x=HMS[b.dataset.v];if(!x)return false;x[2]();window.scrollTo(0,0)},
 hmed:()=>{UI.hmed=!UI.hmed},
 hmtg:b=>{const L=hmList(),k=b.dataset.v,i=L.indexOf(k);if(i>=0)L.splice(i,1);else if(HMS[k])L.push(k);S.hmsc=L},
 hmmv:b=>{const L=hmList(),i=L.indexOf(b.dataset.v),j=i+(+b.dataset.d);if(i<0||j<0||j>=L.length)return false;const t=L[i];L[i]=L[j];L[j]=t;S.hmsc=L},
 hmrs:()=>{S.hmsc=null}});
/* ---------- الصفحة ---------- */
vDash=function(){const st=scState(),M=scModel(st);if(!UI._hmAuto){UI._hmAuto=1;setTimeout(()=>{try{hmAuto()}catch(e){lg(e)}},400)}
 return '<div class="smhm"><div class="smhero"><div class="smlg">'+SJLOGO+'</div><div class="smart">'+SJART+'</div><p class="smtx">سجلّك الرياضي في مكان واحد: تمارينك وأكلك ونموّك مع الأيام.</p></div>'+
  hmCells(st,M)+rdTodayCard()+hmPray()+hmDiv()+hmShort()+'</div>'};
Object.assign(ENT,{'الوقت':'Time','الحرارة':'Temperature','مواقيت الصلاة':'Prayer times','اختصاراتي':'My shortcuts','تخصيص':'Customize','تم':'Done','متابعة الوزن':'Weight tracking','تسجيل وقت التمرين':'Log workout time','تسجيل طعام':'Log food','تسجيل الماء':'Log water','صور التقدّم':'Progress photos','تسجيل جري':'Log a run','بيانات الجسم':'Body data','الأوسمة':'Badges','الخطوات':'Steps','أضف اختصارًا':'Add a shortcut','استرجاع الاختصارات الافتراضية':'Restore default shortcuts','باقي على':'Time left until','متبقٍ':'Left','انتهى':'Ended','الجمعة':'Friday'});
/* تنقّل سلس: يتحرّك المحتوى (ظهور خفيف) عند تغيّر الصفحة فقط، لا عند كل إعادة رسم */
(()=>{const R=render;let K='';render=function(){try{const k=S.tab+'|'+(S.sub||'')+'|'+(UI.trk||'')+'|'+(UI.qt||'');const a=document.getElementById('app');if(a)a.classList.toggle('sjnv',k!==K);K=k}catch(e){}return R.apply(this,arguments)}})();
