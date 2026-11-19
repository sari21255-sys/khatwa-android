/* ======================= الرئيسية: مشهد الوقت =======================
   الفترات البصرية: الفجر، الصباح، الظهر، العصر، الغروب، الليل، آخر الليل. تُحسب من الشروق والغروب ومن بداية الفجر ونهايته الفلكية في بيانات الموقع،
   وتبقى مواقيت الصلاة وإعداداتها في بياناتها (rdPray/rdS) ولا تتغير. الشمس تتحرك على قوس بين الشروق والغروب الفعليين لموقع المستخدم، ثم يظهر القمر ليلًا.
   حركة القمر تأثير بصري بحت (لا مصدر فلكي لموضعه). بلا موقع: تُحسب الفترة تقريبيًا من ساعة الجهاز وتُوضَّح الحالة، ولا تُعرض مواعيد شروق وغروب. */
const SCP={fajr:['الفجر','sunrise'],morning:['الصباح','sun'],noon:['الظهر','sun'],asr:['العصر','sun'],sunset:['الغروب','sunset'],night:['الليل','moon'],late:['آخر الليل','moon']};
const SCI={
 cal:'<path d="M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 10h16M8 3v4M16 3v4"/>',
 clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
 pin:'<path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0c0 5.4 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
 sunrise:'<path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 5v4M5.6 9.6l1.7 1.7M18.4 9.6l-1.7 1.7M9.5 6.5L12 4l2.5 2.5"/>',
 sunset:'<path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 4v5M5.6 9.6l1.7 1.7M18.4 9.6l-1.7 1.7M9.5 7.5L12 10l2.5-2.5"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
 moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
 cloud:'<path d="M7 18h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 9.5 4.3 4.3 0 0 0 7 18z"/>',
 rain:'<path d="M7 14h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 5.5 4.3 4.3 0 0 0 7 14zM9 17l-1 3M13 17l-1 3M17 17l-1 3"/>',
 storm:'<path d="M7 13h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 4.5 4.3 4.3 0 0 0 7 13zM12 14l-2 4h3l-2 4"/>',
 snow:'<path d="M7 13h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 4.5 4.3 4.3 0 0 0 7 13zM9 17h.01M13 17h.01M11 20h.01M15 20h.01"/>',
 fog:'<path d="M4 9h16M6 13h12M4 17h16"/>',
 clear:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>'};
const scIc=(k,c)=>'<svg class="sci '+(c||'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(SCI[k]||'')+'</svg>';
const scHex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const scMix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
const scCss=a=>'rgb('+a.join(',')+')';
/* ألوان الأطراف (أعلى، أسفل) عند لحظات مفصلية؛ بينها يُمزج لونيًا فيتدرج المشهد */
const SCK={late:['#050816','#0e1533'],night:['#0a1030','#1a2552'],fajr:['#1d2a63','#6a5290'],rise:['#5b7bc9','#f2a96a'],morn:['#3f8fe0','#9fd0f5'],noon:['#1e78d8','#7ec3f7'],asr:['#3a86d6','#bcd9ee'],gold:['#5a7fc6','#f4b66e'],set:['#7a4a8a','#f0733f'],dusk:['#2c2a60','#8c4b6b']};
function scDay(ms,c){const ds=rdP(ms,c.tz).d,T=rdPray(ds),P=rdPray(rdAddD(ds,-1)),N=rdPray(rdAddD(ds,1));
 if([T.fajr,T.sunrise,T.dhuhr,T.asr,T.sunset].some(x=>x==null)||[P.sunset].some(x=>x==null)||[N.fajr,N.sunrise].some(x=>x==null))return null;
 const lateP=P.sunset+(T.fajr-P.sunset)*2/3,lateN=T.sunset+(N.fajr-T.sunset)*2/3;
 return{ds:ds,T:T,P:P,N:N,lateP:lateP,lateN:lateN}}
/* لا موقع: جدول ثابت تقريبي بحسب ساعة الجهاز */
function scApprox(ms,tz){const ds=rdP(ms,tz).d,at=(h,m)=>rdAt(ds,h*60+(m||0),tz),y=rdAddD(ds,-1),n=rdAddD(ds,1),aty=(h,m)=>rdAt(y,h*60+(m||0),tz),atn=(h,m)=>rdAt(n,h*60+(m||0),tz);
 return{ds:ds,approx:1,T:{fajr:at(4,50),sunrise:at(6),dhuhr:at(12),asr:at(15,30),sunset:at(18)},P:{sunset:aty(18)},N:{fajr:atn(4,50),sunrise:atn(6)},lateP:aty(18)+(at(4,50)-aty(18))*2/3,lateN:at(18)+(atn(4,50)-at(18))*2/3}}
function scKeys(D){const T=D.T,P=D.P,N=D.N,m=60000;
 return[[P.sunset+45*m,'night'],[D.lateP,'late'],[T.fajr,'fajr'],[T.sunrise,'rise'],[T.sunrise+(T.dhuhr-T.sunrise)*.5,'morn'],[T.dhuhr,'noon'],[T.asr,'asr'],[T.sunset-40*m,'gold'],[T.sunset,'set'],[T.sunset+45*m,'dusk'],[T.sunset+90*m,'night'],[D.lateN,'late'],[N.fajr,'fajr']]}
function scPeriodOf(ms,D){const T=D.T,m=60000,b=[[D.P.sunset+45*m,'night'],[D.lateP,'late'],[T.fajr,'fajr'],[T.sunrise,'morning'],[T.dhuhr-45*m,'noon'],[T.asr,'asr'],[T.sunset-35*m,'sunset'],[T.sunset+45*m,'night'],[D.lateN,'late'],[D.N.fajr,'fajr']];
 let p='night';b.forEach(x=>{if(ms>=x[0])p=x[1]});return p}
function scSky(ms,D){const K=scKeys(D);let a=K[0],b=K[K.length-1];
 if(ms<=K[0][0])return{top:scHex(SCK[K[0][1]][0]),bot:scHex(SCK[K[0][1]][1])};if(ms>=b[0])return{top:scHex(SCK[b[1]][0]),bot:scHex(SCK[b[1]][1])};
 for(let i=0;i<K.length-1;i++)if(ms>=K[i][0]&&ms<K[i+1][0]){a=K[i];b=K[i+1];break}
 const t=(ms-a[0])/Math.max(1,b[0]-a[0]);return{top:scMix(scHex(SCK[a[1]][0]),scHex(SCK[b[1]][0]),t),bot:scMix(scHex(SCK[a[1]][1]),scHex(SCK[b[1]][1]),t)}}
const scLum=a=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(a[0])+.7152*f(a[1])+.0722*f(a[2])};
const SCPANEL=[8,12,26,.86],SCCHIP=[8,12,26,.78];
const scBlend=(bg,p)=>bg.map((v,i)=>i<3?Math.round(v*(1-p[3])+p[i]*p[3]):0).slice(0,3);
/* أسوأ تباين للنص الأبيض على لوحة المعلومات والشرائح في هذه اللحظة */
function scContrast(ms,D){const s=scSky(ms,D),w=1.05,cp=w/(scLum(scBlend(s.bot,SCPANEL))+.05),cc=Math.min(w/(scLum(scBlend(s.top,SCCHIP))+.05),w/(scLum(scBlend(s.bot,SCCHIP))+.05));return Math.min(cp,cc)}
function scGeo(ms,D){const T=D.T,P=D.P,N=D.N;let sun=null,moon=null;
 if(ms>=T.sunrise&&ms<=T.sunset)sun=(ms-T.sunrise)/(T.sunset-T.sunrise);
 else{const a=ms<T.sunrise?P.sunset:T.sunset,z=ms<T.sunrise?T.sunrise:N.sunrise;moon=Math.max(0,Math.min(1,(ms-a)/(z-a)))}
 return{sun:sun,moon:moon}}
const scPt=p=>({x:+(24+272*p).toFixed(1),y:+(100-78*Math.sin(Math.PI*p)).toFixed(1)});
function scStars(ms,D){const T=D.T,m=60000;if(ms<T.fajr)return 1;if(ms<T.sunrise)return Math.max(0,1-(ms-T.fajr)/(T.sunrise-T.fajr));if(ms<T.sunset)return 0;return Math.min(1,(ms-T.sunset)/(60*m))}
function scGlow(ms,D){const T=D.T,m=60000,d=(a,b)=>Math.max(0,1-Math.abs(ms-a)/b);return Math.max(d(T.sunrise,50*m),d(T.sunset,50*m),d(T.fajr,30*m)*.6)}
const scReduced=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
function scDateTx(ms,tz){let g='',h='';try{g=new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn',{timeZone:tz,weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(ms)}catch(e){}
 try{h=new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn',{timeZone:tz,day:'numeric',month:'long',year:'numeric'}).format(ms)}catch(e){}return{g:g,h:h}}
function scState(){const s=rdS(),has=smHasLoc()||!!rdWx(),dev=Intl.DateTimeFormat().resolvedOptions().timeZone,c=has?rdCity():{id:'dev',n:'توقيت الجهاز',tz:dev},now=rdNow();
 let D=has?scDay(now,c):null;const approx=!D;if(!D)D=scApprox(now,c.tz);return{s:s,has:has,c:c,now:now,D:D,approx:approx}}
function scModel(st){const {D,now,c}=st,per=scPeriodOf(now,D),sk=scSky(now,D),g=scGeo(now,D);
 return{per:per,sk:sk,g:g,stars:scStars(now,D),glow:scGlow(now,D),key:[D.ds,c.tz,c.id||'',Intl.DateTimeFormat().resolvedOptions().timeZone,st.approx?1:0].join('|')}}
function scArt(st,M){const D=st.D,T=D.T,sp=M.g.sun!=null?scPt(M.g.sun):null,mp=M.g.moon!=null?scPt(M.g.moon):null,tz=st.c.tz,gl=sp||mp||scPt(.5);
 let stars='';for(let i=0;i<26;i++)stars+='<i style="left:'+((i*37+11)%97+1)+'%;top:'+((i*23+5)%62+2)+'%;animation-delay:'+((i%7)*.6)+'s"></i>';
 const sr=st.approx?'':'<span class="scchip scsr">'+scIc('sunrise')+'<span class="num">'+rdF(T.sunrise,tz)+'</span></span>',ss=st.approx?'':'<span class="scchip scss">'+scIc('sunset')+'<span class="num">'+rdF(T.sunset,tz)+'</span></span>';
 const clouds='<g class="scclouds"><ellipse cx="70" cy="34" rx="38" ry="9"/><ellipse cx="98" cy="30" rx="24" ry="10"/><ellipse cx="238" cy="46" rx="42" ry="9"/><ellipse cx="262" cy="42" rx="22" ry="8"/></g>';
 const body=sp?'<g class="scsun" transform="translate('+sp.x+' '+sp.y+')"><circle r="18" class="scsunglow"/><circle r="9" class="scsunc"/></g>':mp?'<g class="scmoon" transform="translate('+mp.x+' '+mp.y+')"><circle r="16" class="scmoonglow"/><path d="M4 -8a9 9 0 1 0 0 16a7 7 0 1 1 0 -16z" class="scmoonc"/></g>':'';
 return '<div class="scart" aria-hidden="true"><div class="scstars" style="opacity:'+M.stars.toFixed(2)+'">'+stars+'</div><div class="scglow" style="left:'+(gl.x/3.2).toFixed(1)+'%;top:'+(gl.y/1.2).toFixed(1)+'%;opacity:'+M.glow.toFixed(2)+'"></div>'+
  '<svg class="scsvg" viewBox="0 0 320 120" preserveAspectRatio="xMidYMax meet">'+clouds+'<path d="M24 100A136 78 0 0 1 296 100" class="scarc"/>'+body+'<path d="M0 104C50 96 90 108 150 102S270 96 320 104V120H0z" class="schill"/></svg>'+sr+ss+'</div>'}
function scAria(st,M){const p=SCP[M.per][0];return 'مشهد الوقت: '+p+(M.g.sun!=null?'، الشمس في السماء':M.g.moon!=null?'، القمر في السماء':'')+(st.approx?'، تقريبي بحسب ساعة الجهاز':'')}
function scWeather(st){const s=st.s,c=st.c;if(!st.has||!s.wxOn)return '';const w=rdWx(),cur=rdHour(st.now),sx=rdStale(),kind=cur&&sx!=='expired'?fxWxKind(cur.code):'';
 if(cur&&sx!=='expired')return '<div class="scwx row" style="gap:12px"><span class="scwi">'+scIc(kind||'clear')+'</span><b class="num sctemp">'+rdT(cur.temp)+'</b><div><div>'+rdCode(cur.code)+'</div><div class="scs">محسوسة <span class="num">'+rdT(cur.feels)+'</span> · '+(sx==='fresh'?'آخر تحديث ':'التوقع قديم · آخر تحديث ')+'<span class="num">'+rdF(w.at,c.tz)+'</span></div></div></div>';
 return '<div class="scs scwx">'+(sx==='expired'?'انتهت صلاحية التوقع المحفوظ.':'لا يتوفر توقع محفوظ.')+(RDW.err[rdKey(c)]?' · تعذّر التحديث':'')+(navigator.onLine===false?' · لا يوجد اتصال':'')+'</div>'}
function scLocState(st){const s=st.s;
 if(s.geoBusy)return '<div class="scs scloc" id="sc-loc" role="status">'+scIc('pin')+'جارٍ تحديد موقعك…</div>';
 if(st.has)return '<div class="scs scloc" id="sc-loc">'+scIc('pin')+'الموقع: '+esc(st.c.n)+(s.geo===1?' · من جوالك (تقريبي)':' · اخترته يدويًا')+'</div>';
 return '<div class="scs scloc" id="sc-loc" role="status">'+scIc('pin')+(s.geoDeny?'لم يُمنح إذن الموقع، فنعرض ساعة جهازك والمشهد تقريبيًا. فعّل الإذن من إعدادات الجهاز ثم حاول مجددًا.':s.geoFail?'تعذّر تحديد موقعك الآن. تأكد من تشغيل الموقع ثم حاول مجددًا.':'اسمح بالموقع ليظهر الطقس ومواعيد الشروق والغروب لمنطقتك.')+'</div>'}
function scCard(){const st=scState(),M=scModel(st),dt=scDateTx(st.now,st.c.tz),p=SCP[M.per];
 return '<div class="card scn fxscene sc-p-'+M.per+(scReduced()?' sc-rm':'')+'" id="sc-card" data-key="'+esc(M.key)+'" style="--sk1:'+scCss(M.sk.top)+';--sk2:'+scCss(M.sk.bot)+'" role="group" aria-label="'+esc(scAria(st,M))+'">'+scArt(st,M)+
  '<div class="scin"><div class="row scdt" style="gap:8px;flex-wrap:nowrap;align-items:flex-start"><div style="flex:1;min-width:0"><div class="scdate">'+scIc('cal')+'<span id="sc-date">'+esc(dt.g)+'</span></div>'+(dt.h?'<div class="scs scdate">'+scIc('cal')+'<span id="sc-hijri">'+esc(dt.h)+'</span></div>':'')+'</div>'+
  '<div class="sctimebox"><div class="sctime">'+scIc('clock')+'<b class="num" id="sc-time" data-rdclk>'+rdF(st.now,st.c.tz)+'</b></div><div class="scper"><span id="sc-per-ic">'+scIc(p[1])+'</span><b id="sc-per">'+p[0]+'</b></div></div></div>'+
  scLocState(st)+(st.has?'':'<div class="row" style="margin-top:8px"><button class="btn sm" data-a="rdgeo"'+(st.s.geoBusy?' disabled':'')+'>'+scIc('pin')+(st.s.geoBusy?'جارٍ تحديد الموقع…':'استخدم موقعي')+'</button></div>')+
  (st.has&&!st.s.geoBusy?'<div class="row" style="margin-top:8px;gap:8px;flex-wrap:wrap"><button class="chip" data-a="rdgeo">'+scIc('pin')+'استخدم موقعي</button></div>':'')+
  scWeather(st)+(st.approx?'<div class="scs">المشهد تقريبي بحسب توقيت الجهاز. مواعيد الشروق والغروب تظهر عند تحديد الموقع.</div>':'<div class="scs scnote">حركة القمر ليلًا تأثير بصري وليست موضعًا فلكيًا.</div>')+'</div></div>'}
const SC_OLD=rdTodayCard;
rdTodayCard=function(){let more='';try{if(smHasLoc()||rdWx()){const old=SC_OLD.apply(this,arguments),m=typeof old==='string'&&old.match(/<details class="sjmore[^"]*" id="rd-more"[\s\S]*<\/details>/);if(m)more=m[0]}}catch(e){lg(e)}
 return scCard()+more};
/* ---------- تحديث حيّ بلا إعادة رسم كاملة ---------- */
function scApply(force){const el=document.getElementById('sc-card');if(!el)return false;const st=scState(),M=scModel(st);
 if(el.dataset.key!==M.key){render();return true}
 el.style.setProperty('--sk1',scCss(M.sk.top));el.style.setProperty('--sk2',scCss(M.sk.bot));
 const set=(id,t)=>{const e=document.getElementById(id);if(e&&e.textContent!==t)e.textContent=t};set('sc-time',rdF(st.now,st.c.tz));
 const dt=scDateTx(st.now,st.c.tz);set('sc-date',dt.g);if(dt.h)set('sc-hijri',dt.h);
 const p=SCP[M.per];set('sc-per',p[0]);const pi=document.getElementById('sc-per-ic');if(pi)pi.innerHTML=scIc(p[1]);
 el.className=el.className.replace(/sc-p-\w+/,'sc-p-'+M.per);
 const art=el.querySelector('.scart');if(art){const sp=M.g.sun!=null?scPt(M.g.sun):null,mp=M.g.moon!=null?scPt(M.g.moon):null,have=el.querySelector('.scsun')?'sun':el.querySelector('.scmoon')?'moon':'';
  const want=sp?'sun':mp?'moon':'';if(have!==want){render();return true}
  const b=el.querySelector('.scsun,.scmoon'),q=sp||mp;if(b&&q)b.setAttribute('transform','translate('+q.x+' '+q.y+')');
  const s2=el.querySelector('.scstars');if(s2)s2.style.opacity=M.stars.toFixed(2);const gl=el.querySelector('.scglow'),pt=q||scPt(.5);if(gl){gl.style.opacity=M.glow.toFixed(2);gl.style.left=(pt.x/3.2).toFixed(1)+'%';gl.style.top=(pt.y/1.2).toFixed(1)+'%'}}
 el.setAttribute('aria-label',scAria(st,M));return true}
let SCT=0;
function scLoop(on){clearInterval(SCT);SCT=0;document.documentElement.classList.toggle('sc-hid',!on);if(on)SCT=setInterval(()=>{try{if(!document.hidden)scApply()}catch(e){lg(e)}},20000)}
const scResume=()=>{try{scApply();scLoop(!document.hidden)}catch(e){lg(e)}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)scLoop(false);else scResume()});
window.addEventListener('pageshow',scResume);window.addEventListener('focus',scResume);window.addEventListener('online',scResume);
document.addEventListener('resume',scResume);
(()=>{const R=render;render=function(){const r=R.apply(this,arguments);try{if(!SCT&&!document.hidden)scLoop(true)}catch(e){lg(e)}return r}})();
try{scLoop(!document.hidden)}catch(e){lg(e)}
Object.assign(ENT,{'الفجر':'Dawn','الصباح':'Morning','الظهر':'Noon','العصر':'Afternoon','الغروب':'Sunset','الليل':'Night','آخر الليل':'Late night','استخدم موقعي':'Use my location','جارٍ تحديد موقعك…':'Finding your location…'});
