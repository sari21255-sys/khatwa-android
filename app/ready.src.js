/* ===== الإعدادات المجمّعة، الملف الشخصي، الطقس والصلاة، «جهّز تمرينك»، مركز الإشعارات ===== */
/* البيانات في S.sj.set (تفضيلات)، S.sj.wx (تخزين مؤقت للطقس). المزوّدات واجهات قابلة للاستبدال في الاختبار: WXP، WXA، NTS، window.__now. */
const RDC=[['madinah','المدينة المنورة','Madinah',24.4686,39.6142,'Asia/Riyadh'],['makkah','مكة المكرمة','Makkah',21.4225,39.8262,'Asia/Riyadh'],['riyadh','الرياض','Riyadh',24.7136,46.6753,'Asia/Riyadh'],['jeddah','جدة','Jeddah',21.4858,39.1925,'Asia/Riyadh'],['dammam','الدمام','Dammam',26.4207,50.0888,'Asia/Riyadh'],['tabuk','تبوك','Tabuk',28.3838,36.5662,'Asia/Riyadh'],['abha','أبها','Abha',18.2164,42.5053,'Asia/Riyadh'],['cairo','القاهرة','Cairo',30.0444,31.2357,'Africa/Cairo'],['dubai','دبي','Dubai',25.2048,55.2708,'Asia/Dubai'],['amman','عمّان','Amman',31.9539,35.9106,'Asia/Amman'],['damascus','دمشق','Damascus',33.5138,36.2765,'Asia/Damascus'],['istanbul','إسطنبول','Istanbul',41.0082,28.9784,'Europe/Istanbul'],['london','لندن','London',51.5074,-0.1278,'Europe/London'],['newyork','نيويورك','New York',40.7128,-74.006,'America/New_York']];
const RDPN={fajr:'الفجر',sunrise:'الشروق',dhuhr:'الظهر',asr:'العصر',maghrib:'المغرب',isha:'العشاء'};
const RDPK=['fajr','dhuhr','asr','maghrib','isha'];
const RDM={mwl:['رابطة العالم الإسلامي',18,17],uq:['أم القرى',18.5,'90'],isna:['أمريكا الشمالية',15,15],egypt:['الهيئة المصرية',19.5,17.5],karachi:['كراتشي',18,18]};
const RDK={run:'الجري',swim:'السباحة',cali:'الكالسثينكس',fn:'التدريب الوظيفي',iron:'الحديد'};
const RDDUR={run:40,swim:45,cali:45,fn:30,iron:60};
const rdNow=()=>window.__now||Date.now();
function rdS(){const o=SJ();if(!o.set||typeof o.set!=='object'||Array.isArray(o.set))o.set={};const s=o.set;
 const D={city:'madinah',cus:null,wxOn:1,sunOn:1,prOn:1,pm:'mwl',asr:'s',pa:{},lead:15,units:{t:'c',d:'km',f:'ml'},fav:[],goals:{},place:'gym',days:[],rest:90,places:[],pref:{io:'out',time:'',water:0,prayer:0},nt:{on:1,wo:1,prep:1,prayer:1,hydr:1,quiet:{on:0,from:'22:00',to:'06:00'},silent:0,resume:1,wk:0,wkd:5,wkt:'18:00',wl:0,wlt:'09:00',wld:[5],hyF:'09:00',hyT:'21:00',hyN:3,sun:0,wlead:30,plead:15},rd:{},geo:0};
 Object.keys(D).forEach(k=>{if(s[k]===undefined)s[k]=JSON.parse(JSON.stringify(D[k]))});
 ['units','pref','nt','pa','rd'].forEach(k=>{if(!s[k]||typeof s[k]!=='object')s[k]=JSON.parse(JSON.stringify(D[k]));else if(D[k])Object.keys(D[k]).forEach(j=>{if(s[k][j]===undefined)s[k][j]=JSON.parse(JSON.stringify(D[k][j]))})});
 if(!Array.isArray(s.fav))s.fav=[];if(!Array.isArray(s.places))s.places=[];if(!Array.isArray(s.days))s.days=[];return s}
function rdCity(){const s=rdS();if(s.cus&&isFinite(+s.cus.lat)&&isFinite(+s.cus.lon)&&s.cus.tz)return{id:'cus',n:s.cus.n||'مدينة مخصصة',lat:+s.cus.lat,lon:+s.cus.lon,tz:s.cus.tz,cus:1};const c=RDC.find(x=>x[0]===s.city)||RDC[0];return{id:c[0],n:c[1],lat:c[3],lon:c[4],tz:c[5]}}
function rdTzOk(z){try{new Intl.DateTimeFormat('en',{timeZone:z});return true}catch(e){return false}}
/* ---- الوقت حسب المنطقة الزمنية ---- */
function rdP(ms,tz){const o={};new Intl.DateTimeFormat('en-CA',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).formatToParts(ms).forEach(p=>o[p.type]=p.value);return{d:o.year+'-'+o.month+'-'+o.day,h:+o.hour,m:+o.minute}}
function rdOff(ms,tz){const p=rdP(ms,tz),a=p.d.split('-').map(Number);return(Date.UTC(a[0],a[1]-1,a[2],p.h,p.m)-Math.floor(ms/6e4)*6e4)/6e4}
function rdAt(ds,min,tz){const a=ds.split('-').map(Number),base=Date.UTC(a[0],a[1]-1,a[2])+min*6e4;let g=base-rdOff(base,tz)*6e4;g=base-rdOff(g,tz)*6e4;return g}
function rdAddD(ds,n){const a=ds.split('-').map(Number),d=new Date(Date.UTC(a[0],a[1]-1,a[2]+n));return d.toISOString().slice(0,10)}
function rdF(ms,tz){return '\u2066'+new Date(ms).toLocaleTimeString('en-US',{timeZone:tz,hour:'2-digit',minute:'2-digit',hour12:!(S.prof&&S.prof.h24)})+'\u2069'}
function rdHM(t){const a=String(t||'').split(':');return a.length<2||!isFinite(+a[0])?null:(+a[0])*60+(+a[1]||0)}
/* ---- حساب المواقيت محليًا (خوارزمية PrayTimes) ---- */
const rdr=Math.PI/180,sn=a=>Math.sin(a*rdr),cs=a=>Math.cos(a*rdr),tn=a=>Math.tan(a*rdr),asn=x=>Math.asin(x)/rdr,acs=x=>Math.acos(Math.max(-1,Math.min(1,x)))/rdr,at2=(y,x)=>Math.atan2(y,x)/rdr,acot=x=>Math.atan(1/x)/rdr,fa=a=>a-360*Math.floor(a/360),fh=a=>a-24*Math.floor(a/24);
function rdJD(y,m,d){if(m<=2){y-=1;m+=12}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
function rdTimes(ds,c,pm,asr){const a=ds.split('-').map(Number),M=RDM[pm]||RDM.mwl,tz=rdOff(rdAt(ds,720,c.tz),c.tz)/60,jd=rdJD(a[0],a[1],a[2])-c.lon/360;
 const sp=t=>{const D=jd+t-2451545,g=fa(357.529+.98560028*D),q=fa(280.459+.98564736*D),L=fa(q+1.915*sn(g)+.02*sn(2*g)),e=23.439-3.6e-7*D,RA=at2(cs(e)*sn(L),cs(L))/15;return{dec:asn(sn(e)*sn(L)),eq:q/15-fh(RA+0)+(Math.abs(q/15-fh(RA))>12?(q/15-fh(RA)>0?-24:24):0)}};
 const mid=t=>fh(12-sp(t).eq),ang=(A,t,ccw)=>{const d=sp(t).dec,v=acs((-sn(A)-sn(d)*sn(c.lat))/(cs(d)*cs(c.lat)))/15;return mid(t)+(ccw?-v:v)},asrT=(f,t)=>{const d=sp(t).dec;return ang(-acot(f+tn(Math.abs(c.lat-d))),t)};
 const adj=h=>h+tz-c.lon/15,o={};
 o.fajr=adj(ang(M[1],5/24,1));o.sunrise=adj(ang(.833,6/24,1));o.dhuhr=adj(mid(12/24))+1/60;o.asr=adj(asrT(asr==='h'?2:1,13/24));o.sunset=adj(ang(.833,18/24));o.maghrib=o.sunset;
 o.isha=M[2]==='90'?o.maghrib+1.5:adj(ang(+M[2],18/24));
 const r={};Object.keys(o).forEach(k=>{r[k]=isFinite(o[k])?Math.round(fh(o[k])*60)%1440:null});return r}
function rdPray(ds){const s=rdS(),c=rdCity(),t=rdTimes(ds,c,s.pm,s.asr),o={};Object.keys(t).forEach(k=>{if(t[k]!=null)o[k]=rdAt(ds,t[k],c.tz)});return o}
/* ---- الطقس: مزوّد قابل للاستبدال + تخزين مؤقت بوقت التحديث ---- */
const WXP={fn:null,async get(c){if(WXP.fn)return WXP.fn(c);
 const u='https://api.open-meteo.com/v1/forecast?latitude='+c.lat+'&longitude='+c.lon+'&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m,uv_index&daily=sunrise,sunset&timezone='+encodeURIComponent(c.tz)+'&forecast_days=3&wind_speed_unit=kmh';
 const r=await fetch(u);if(!r.ok)throw new Error('http '+r.status);const j=await r.json(),H=j.hourly||{},n=(H.time||[]).length,v=(a,i)=>a&&a[i]!=null&&isFinite(a[i])?+a[i]:null,hrs=[];
 for(let i=0;i<n;i++){const p=H.time[i].split('T');hrs.push({t:rdAt(p[0],rdHM(p[1]),c.tz),temp:v(H.temperature_2m,i),feels:v(H.apparent_temperature,i),hum:v(H.relative_humidity_2m,i),pop:v(H.precipitation_probability,i),code:v(H.weather_code,i),wind:v(H.wind_speed_10m,i),gust:v(H.wind_gusts_10m,i),uv:v(H.uv_index,i)})}
 return{src:'Open-Meteo',hours:hrs}}};
const WXA={fn:null,async get(c){return WXA.fn?WXA.fn(c):null}};/* التحذيرات الرسمية: لا مزوّد في هذا البناء */
const RDW={busy:{},err:{},perm:''};
const rdKey=c=>c.id+'|'+c.lat+'|'+c.lon+'|'+c.tz;
function rdWxM(){const o=SJ();if(!o.wxm||typeof o.wxm!=='object'||Array.isArray(o.wxm))o.wxm={};return o.wxm}
function rdWx(c){c=c||rdCity();const w=rdWxM()[rdKey(c)];return w&&Array.isArray(w.hours)?w:null}
function rdWxAge(){const w=rdWx();return w?rdNow()-w.at:null}
/* كل طلب يحمل مفتاح مدينته؛ الرد يُحفظ تحت ذلك المفتاح فقط ولا يُطبَّق على مدينة أخرى. يجوز بدء طلب مدينة جديدة والأول قيد التنفيذ. */
async function rdFetch(force,c0){const s=rdS();if(!s.wxOn)return;const c=c0||rdCity(),key=rdKey(c),w=rdWx(c);if(RDW.busy[key])return;if(!force&&w&&rdNow()-w.at<36e5)return;
 RDW.busy[key]=1;RDW.err[key]='';
 try{const r=await WXP.get(c),al=await WXA.get(c).catch(()=>null),m=rdWxM();m[key]={at:rdNow(),key:key,cn:c.n,tz:c.tz,src:r.src||'—',hours:(r.hours||[]).slice(0,96),alert:al||null};
  const ks=Object.keys(m);if(ks.length>4)ks.sort((a,b)=>m[a].at-m[b].at).slice(0,ks.length-4).forEach(k=>delete m[k]);save()}
 catch(e){RDW.err[key]=(e&&e.message)||'تعذّر التحديث'}
 RDW.busy[key]=0;if(rdKey(rdCity())===key)render();rdNtSoon()}
function rdStale(){const a=rdWxAge();return a==null?'none':a>864e5?'expired':a>108e5?'stale':'fresh'}
function rdHour(ms){const w=rdWx();return w?w.hours.find(h=>ms>=h.t&&ms<h.t+36e5)||null:null}
const rdCode=c=>c==null?'—':c===0?'صافٍ':c<=3?'غائم جزئيًا':c<=48?'ضباب':c<=57?'رذاذ':c<=67?'مطر':c<=77?'ثلج':c<=82?'زخات مطر':c>=95?'عواصف رعدية':'متقلّب';
const rdT=v=>v==null?'—':(rdS().units.t==='f'?F(v*9/5+32):F(v))+'°';
/* ---- قواعد النصائح الموثّقة: المصدر والشرط ونوع الحصة والإجراء ---- */
const RDR=[
 {id:'official',src:'تنبيه رسمي من المزوّد',types:'*',out:1,sev:5,when:x=>!!x.alert,text:x=>'تنبيه رسمي: '+x.alert.t+(x.alert.from?' · من '+x.alert.from:'')+(x.alert.to?' إلى '+x.alert.to:'')+' · المصدر: '+(x.alert.src||'—')+'. اتبع تعليمات الجهة المختصة.',act:'alt'},
 {id:'lightning',src:'NWS: البرق والأنشطة الرياضية',url:'https://www.weather.gov/safety/lightning-sports',types:'*',out:1,sev:4,when:x=>x.thunder,text:x=>x.k==='swim'?'توقّع عواصف رعدية: اخرج من الماء فورًا عند سماع الرعد، ولا تسبح في الخارج خلال الحصة. هذا توقع وليس تحذيرًا رسميًا.':'توقّع عواصف رعدية خلال الحصة. انقلها إلى الداخل أو أجّلها. هذا توقع وليس تحذيرًا رسميًا.',act:'alt'},
 {id:'swim-nowarn',src:'غياب مصدر تحذيرات المياه',types:['swim'],out:1,sev:2,when:x=>x.k==='swim'&&x.out&&!x.alert,text:()=>'لا يتوفر في هذا البناء مصدر لتحذيرات البحر أو البرق الرسمية. راجع إرشادات الجهة المختصة ومنقذ الموقع قبل السباحة.'},
 {id:'heat-high',src:'CDC: التمرين في الحر',url:'https://www.cdc.gov/extreme-heat/risk-factors/extreme-heat-and-athletes.html',types:'*',out:1,sev:3,when:x=>x.maxFeels!=null&&x.maxFeels>=38,text:x=>'الحرارة المحسوسة تبلغ '+rdT(x.maxFeels)+'. خفّف الشدة، خذ فواصل ظل وشرب، أو اختر وقتًا أبرد.',act:'move'},
 {id:'heat-mid',src:'CDC: التمرين في الحر',url:'https://www.cdc.gov/extreme-heat/risk-factors/extreme-heat-and-athletes.html',types:'*',out:1,sev:2,when:x=>x.maxFeels!=null&&x.maxFeels>=32&&x.maxFeels<38,text:x=>'الحرارة المحسوسة '+rdT(x.maxFeels)+': ملابس خفيفة فاتحة، وفواصل شرب منتظمة.'},
 {id:'cold',src:'قاعدة عامة (لا مصدر رسمي)',types:'*',out:1,sev:2,when:x=>x.minFeels!=null&&x.minFeels<=10,text:x=>'الحرارة المحسوسة '+rdT(x.minFeels)+': ارتدِ طبقة إضافية يمكن خلعها بعد الإحماء.'},
 {id:'uv',src:'WHO: مؤشر الأشعة فوق البنفسجية',url:'https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index',types:'*',out:1,sev:2,when:x=>x.maxUv!=null&&x.maxUv>=6,text:x=>'مؤشر الأشعة '+F(x.maxUv,1)+': اطلب الظل، وارتدِ ملابس واقية وقبعة، وضع واقيًا من الشمس.'},
 {id:'dark',src:'قاعدة عامة (لا مصدر رسمي)',types:['run','fn','cali'],out:1,sev:2,when:x=>x.dark,text:()=>'الحصة تمتد إلى ما بعد الغروب أو قبل الشروق: ارتدِ عناصر عاكسة وأضئ طريقك.'},
 {id:'rain',src:'قاعدة عامة (لا مصدر رسمي)',types:'*',out:1,sev:2,when:x=>x.maxPop!=null&&x.maxPop>=50&&!x.thunder,text:x=>'احتمال المطر '+F(x.maxPop)+'%: خذ طبقة مقاومة للماء أو بدّل بحصة داخلية.',act:'alt'},
 {id:'wind',src:'قاعدة عامة (لا مصدر رسمي)',types:['run','swim','fn'],out:1,sev:2,when:x=>x.maxGust!=null&&x.maxGust>=45,text:x=>'هبّات رياح حتى '+F(x.maxGust)+' كم/س: تجنّب الأماكن المكشوفة.'},
 {id:'air',src:'غياب بيانات جودة الهواء',types:'*',out:1,sev:1,when:x=>true,text:()=>'جودة الهواء والغبار والرؤية: لا تتوفر بيانات موثوقة في هذا البناء.',min:1},
 {id:'water',src:'CDC: التمرين في الحر',url:'https://www.cdc.gov/extreme-heat/risk-factors/extreme-heat-and-athletes.html',types:'*',out:null,sev:1,when:x=>true,text:x=>x.maxFeels!=null&&x.maxFeels>=32?'جهّز ماءً واشرب على فترات منتظمة، وأكثر من الفواصل مع هذه الحرارة.':x.out?'جهّز ماءً واشرب عند الحاجة. الكمية تختلف من شخص لآخر.':'ماء قريب منك وفواصل شرب قصيرة بين المجموعات.',water:1}
];
function rdCtx(k,start,end,out){const w=rdWx(),c=rdCity(),a=[];if(w&&rdStale()!=='expired')w.hours.forEach(h=>{if(h.t+36e5>start&&h.t<end)a.push(h)});
 const mx=f=>{const v=a.map(h=>h[f]).filter(v=>v!=null);return v.length?Math.max.apply(null,v):null},mn=f=>{const v=a.map(h=>h[f]).filter(v=>v!=null);return v.length?Math.min.apply(null,v):null};
 const sd=rdSun(start,c),dark=out&&((sd.sunset!=null&&end>sd.sunset)||(sd.sunrise!=null&&start<sd.sunrise));
 return{k:k,out:out,start:start,end:end,hrs:a,has:!!a.length,maxFeels:mx('feels'),minFeels:mn('feels'),maxUv:out&&sd.sunrise!=null&&start>=sd.sunrise&&start<sd.sunset?mx('uv'):(out&&(mx('uv')||0)>=6&&dark?null:mx('uv')),maxPop:mx('pop'),maxGust:mx('gust'),thunder:a.some(h=>h.code!=null&&h.code>=95),dark:dark,alert:rdAlert(start,end),sun:sd}}
function rdAlert(s,e){const w=rdWx();if(!w||!w.alert)return null;const a=w.alert;if(a.to&&a.to<s)return null;if(a.from&&a.from>e)return null;return a}
function rdSun(ms,c){const ds=rdP(ms,c.tz).d,t=rdPray(ds);return{sunrise:t.sunrise||null,sunset:t.sunset||null,ds:ds}}
function rdAdvice(x){const out=[];RDR.forEach(r=>{if(r.types!=='*'&&r.types.indexOf(x.k)<0)return;if(r.out===1&&!x.out)return;if(r.min&&x.has)return;if(r.id==='air'&&x.has&&false)return;try{if(r.when(x))out.push({id:r.id,sev:r.sev,t:r.text(x),src:r.src,url:r.url||'',act:r.act||'',water:!!r.water})}catch(e){}});return out.sort((a,b)=>b.sev-a.sev)}
function rdPrayHit(start,end){const s=rdS(),c=rdCity();if(!s.prOn)return[];const ds=rdP(start,c.tz).d,t=Object.assign({},rdPray(ds)),n=rdPray(rdAddD(ds,1)),h=[];
 RDPK.forEach(k=>{[[t[k],0],[n[k],1]].forEach(p=>{if(p[0]==null)return;const a=p[0],b=a+25*6e4;if(s.pa[k]&&a<end&&b>start)h.push({k:k,at:a,end:b,before:Math.round((a-start)/6e4),left:Math.max(0,Math.round((b-Math.max(start,a))/6e4))})})});return h.sort((a,b)=>a.at-b.at)}
/* ---- مقارنة أوقات التمرين ---- */
function rdWindows(k,durMin,out,from){const w=rdWx(),c=rdCity();if(!w||rdStale()==='expired'||!out)return[];const dur=durMin*6e4,res=[];
 w.hours.forEach(h=>{const st=h.t;if(st<from||st>from+36*36e5)return;const x=rdCtx(k,st,st+dur,out);if(!x.has)return;if(x.thunder||x.alert)return;if(rdPrayHit(st,st+dur).length)return;if(x.dark&&k!=='fn')return;
  let sc=0,why=[];const f=x.maxFeels;if(f!=null){sc+=Math.abs(f-22);if(f<=30)why.push('الحرارة المحسوسة '+rdT(f))}if(x.maxUv!=null){sc+=x.maxUv*1.5;if(x.maxUv<4)why.push('أشعة منخفضة')}if(x.maxPop!=null)sc+=x.maxPop/10;if(!x.dark)why.push('ضوء النهار متوفر');why.push('لا يتقاطع مع فاصل الصلاة');
  res.push({at:st,sc:sc,why:why,f:f})});
 res.sort((a,b)=>a.sc-b.sc);const o=[];res.forEach(r=>{if(o.length<3&&!o.some(q=>Math.abs(q.at-r.at)<2*36e5))o.push(r)});return o.sort((a,b)=>a.at-b.at)}
function rdNextOcc(k){const c=rdCity(),d0=rdP(rdNow(),c.tz).d;for(let i=0;i<8;i++){const ds=rdAddD(d0,i),e=tkOcc(ds).find(x=>x.k===k);if(e)return{e:e,ds:ds}}return null}
/* ---- بطاقة «جهّز تمرينك» ---- */
function rdPlanState(k){const s=rdS();let r=s.rd[k];if(!r)r=s.rd[k]={dur:RDDUR[k]||45,io:k==='iron'?'in':(s.pref.io||'out'),at:'',ret:''};if(!r.dur)r.dur=RDDUR[k]||45;return r}
function rdSlot(k,e,eds){const r=rdPlanState(k),c=rdCity(),now=rdNow(),p=rdP(now,c.tz);
 if(e&&e.at&&eds){const m0=rdHM(e.at);if(m0!=null){const st0=rdAt(eds,m0,c.tz);return{st:st0,end:st0+r.dur*6e4,r:r,ds:eds,e:e}}}
 let m=rdHM(r.at);if(m==null)m=(p.h*60+p.m)+60-((p.h*60+p.m)%60);let ds=p.d;if(m>=1440){m-=1440;ds=rdAddD(ds,1)}let st=rdAt(ds,m,c.tz);if(st+r.dur*6e4<now)st=rdAt(rdAddD(ds,1),m,c.tz);return{st:st,end:st+r.dur*6e4+(rdHM(r.ret)!=null?0:0),r:r}}
function rdSummary(k,e,ds){const o=rdSlot(k,e,ds),r=o.r,out=r.io==='out',x=rdCtx(k,o.st,o.end,out),adv=rdAdvice(x),pr=rdPrayHit(o.st,o.end),c=rdCity();return{o:o,x:x,adv:adv,pr:pr,c:c,out:out}}
function rdReady(k,e,ds){const s=rdS(),sm=rdSummary(k,e,ds),r=sm.o.r,c=sm.c,id='rd-'+k,open=UI.rdo===k;
 const top=sm.adv.filter(a=>!a.water&&a.id!=='air')[0],head=!sm.out?'حصة داخلية · '+F(r.dur)+' د · '+rdF(sm.o.st,c.tz):(rdWx()&&sm.x.has?rdCode(sm.x.hrs[0].code)+' · محسوسة '+rdT(sm.x.maxFeels)+' · '+rdF(sm.o.st,c.tz):'لا يتوفر توقع للفترة');
 let h='<div class="card sjrd" id="'+id+'"><div class="row" style="gap:8px"><b>'+ic('sun')+' جهّز تمرينك</b><span class="sp"></span><button class="chip" data-a="rdopen" data-v="'+k+'" aria-expanded="'+open+'">'+(open?'إخفاء':'التفاصيل')+'</button></div><div class="mu" style="margin:6px 0">'+esc(head)+'</div>';
 if(sm.adv[0]&&sm.adv[0].sev>=3)h+='<div class="sjwarn">'+esc(sm.adv[0].t)+'</div>';
 sm.pr.forEach(p=>{h+='<div class="sjpr">⏱ تتقاطع مع '+RDPN[p.k]+' '+rdF(p.at,c.tz)+(p.before>0?' (بعد '+F(p.before)+' د من البدء)':' (تبدأ الحصة أثناء وقتها)')+(k==='run'||k==='swim'?' · اختر نقطة توقف مناسبة قبل البدء':'')+'</div>'});
 if(open){h+='<div class="g3" style="margin-top:8px"><label class="f">وقت الحصة<input type="time" data-rd="rd.'+k+'.at" value="'+esc(r.at)+'"></label><label class="f">المدة (د)<input type="number" inputmode="numeric" data-rd="rd.'+k+'.dur" value="'+F(r.dur)+'"></label><label class="f">العودة (اختياري)<input type="time" data-rd="rd.'+k+'.ret" value="'+esc(r.ret)+'"></label></div><div class="row" style="gap:8px;margin:8px 0">'+[['out','خارجية'],['in','داخلية']].map(x=>'<button class="chip'+(r.io===x[0]?' on':'')+'" data-a="rdio" data-k="'+k+'" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'<span class="mu">المكان: '+esc(c.n)+'</span></div>';
  if(!sm.out)h+='<div class="mu">في الحصة الداخلية: انتبه لوقت الذهاب والعودة'+(rdHM(r.ret)!=null?' (عودة '+esc(r.ret)+')':'')+'، وللتنبيهات المرتبطة بالصلاة.</div>';
  const st=rdStale();if(sm.out&&st!=='fresh')h+='<div class="sjwarn">'+(st==='none'?'لا يتوفر توقع محفوظ. حدّث من بطاقة الطقس عند الاتصال.':st==='stale'?'التوقع قديم (آخر تحديث '+rdF(rdWx().at,c.tz)+').':'انتهت صلاحية التوقع المحفوظ.')+'</div>';
  h+=sm.adv.map(a=>'<div class="sjadv s'+a.sev+'">'+esc(a.t)+'<small class="mu"> · '+esc(a.src)+(a.url?' <a href="'+a.url+'" target="_blank" rel="noopener">رابط</a>':'')+'</small></div>').join('');
  h+='<div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn sm ghost" data-a="rdcmp" data-v="'+k+'">قارن أوقات التمرين</button><button class="btn sm ghost" data-a="sub" data-v="nc">ضبط التنبيهات</button></div>';
  {const ek=rdKey(c);if(RDW.err[ek]&&sm.out)h+='<div class="sjwarn">تعذّر تحديث طقس '+esc(c.n)+(rdWx()?' · المعروض آخر توقع محفوظ لهذه المدينة':' · لا توصيات مبنية على الطقس الآن')+'.</div>'}
 if(UI.rdc===k){const ws=rdWindows(k,r.dur,sm.out,rdNow());h+=ws.length?ws.map(w=>'<div class="sjwin"><b>'+rdF(w.at,c.tz)+'</b> <span class="mu">'+esc(w.why.join(' · '))+'</span><button class="btn sm" data-a="rdmove" data-k="'+k+'" data-at="'+w.at+'" data-id="'+esc(e?e.id:'')+'" data-ds="'+(ds||'')+'">'+(e?'غيّر وقت الحصة':'جدول الحصة هنا')+'</button></div>').join(''):'<div class="mu">'+(sm.out?'لا توجد نافذة مناسبة ضمن التوقع المتاح.':'المقارنة للحصص الخارجية فقط.')+'</div>'}}
 h+=rdMvPanel(k,e,ds,c);const res=UI.rdres&&UI.rdres.k===k?UI.rdres:null;if(res)h+='<div class="'+(res.fail?'sjwarn':'mu')+'" style="margin-top:8px">'+esc(res.msg)+(res.fail?' <button class="btn sm" data-a="rdretry">أعد المحاولة</button>':'')+'</div>';
 return h+'</div>'}
function rdMvPanel(k,e,ds,c){const m=UI.rdmv;if(!m||m.k!==k||(m.id||'')!==(e?e.id:''))return '';const p=rdP(m.at,c.tz),nm=rdP(rdNow(),c.tz).d,day=p.d===nm?'اليوم':p.d===rdAddD(nm,1)?'غدًا':p.d,rec=e&&!e.once&&tkEntry(e.id)&&tkEntry(e.id).wd!==undefined;
 return '<div class="card sjmv"><b>تأكيد نقل الحصة</b><div class="mu" style="margin:6px 0">'+(e?esc(RDK[k]+' · '+tkTplName(k,e.t)):'حصة '+esc(RDK[k])+' جديدة')+'<br>'+day+' '+p.d+' · '+rdF(m.at,c.tz)+'<br>المدينة: '+esc(c.n)+' · '+esc(c.tz)+'</div>'+(rec?'<div class="row" style="gap:6px">'+[["once","هذه المرة فقط"],["all","كل أسبوع"]].map(x=>rdChip("rdmvs",x[0],m.scope===x[0],x[1])).join('')+'</div><div class="mu">'+(m.scope==='all'?'تنتقل الحصة المتكررة إلى هذا اليوم من كل أسبوع.':'تُنقل هذه المرة وحدها ويبقى جدولك المتكرر كما هو.')+'</div>':'')+'<div class="row" style="gap:8px;margin-top:8px"><button class="btn sm" data-a="rdmvok">احفظ النقل</button><button class="btn sm ghost" data-a="rdmvx">إلغاء</button></div></div>'}
/* ---- بطاقة اليوم: الوقت والطقس والصلاة ---- */
function rdTodayCard(){const s=rdS();if(!s.wxOn&&!s.prOn)return '';const c=rdCity(),now=rdNow(),w=rdWx(),cur=rdHour(now),st=rdStale(),dev=Intl.DateTimeFormat().resolvedOptions().timeZone;
 if(UI._rdf===undefined&&s.wxOn){UI._rdf=1;setTimeout(()=>{try{if(navigator.onLine!==false)rdFetch(0)}catch(e){}},50)}
 let h='<div class="card sjwx"><div class="row" style="gap:8px"><b>'+ic('pin')+' '+esc(c.n)+'</b><span class="sp"></span><span class="num" data-rdclk>'+rdF(now,c.tz)+'</span></div>';
 if(dev&&dev!==c.tz)h+='<div class="mu">توقيت '+esc(c.n)+' يختلف عن توقيت الجهاز</div>';
 if(s.wxOn){if(cur&&st!=='expired')h+='<div class="row" style="gap:12px;margin:8px 0"><b class="num" style="font-size:36px">'+rdT(cur.temp)+'</b><div><div>'+rdCode(cur.code)+'</div><div class="mu">محسوسة '+rdT(cur.feels)+'</div></div></div>';else h+='<div class="mu" style="margin:8px 0">'+(st==='expired'?'انتهت صلاحية التوقع المحفوظ.':'لا يتوفر توقع محفوظ.')+(RDW.err[rdKey(c)]?' · تعذّر التحديث لهذه المدينة':'')+'</div>';
  if(st==='stale')h+='<div class="sjwarn">التوقع قديم · آخر تحديث '+rdF(w.at,c.tz)+'</div>';
  const sd=rdSun(now,c);if(s.sunOn&&sd.sunrise!=null)h+='<div class="row" style="gap:12px"><span>الشروق <b class="num">'+rdF(sd.sunrise,c.tz)+'</b></span><span>الغروب <b class="num">'+rdF(sd.sunset,c.tz)+'</b></span></div>'}
 h+='<details class="sjmore" id="rd-more"'+(UI.rdm?' open':'')+'><summary>التفاصيل</summary>';
 if(s.wxOn){if(cur){h+='<div class="sjkv" style="margin:8px 0"><div><small>الرطوبة</small><b class="num">'+(cur.hum==null?'—':F(cur.hum)+'%')+'</b></div><div><small>الرياح / الهبّات</small><b class="num">'+(cur.wind==null?'—':F(cur.wind))+' / '+(cur.gust==null?'—':F(cur.gust))+' كم/س</b></div><div><small>احتمال المطر</small><b class="num">'+(cur.pop==null?'—':F(cur.pop)+'%')+'</b></div><div><small>الأشعة فوق البنفسجية</small><b class="num">'+(cur.uv==null?'—':F(cur.uv,1))+'</b></div><div><small>جودة الهواء</small><b>غير متاحة</b></div></div>';
   const nx=w.hours.filter(x=>x.t>=now-36e5).slice(0,8);h+='<div class="sjhrs">'+nx.map(x=>'<div><small class="num">'+rdF(x.t,c.tz).replace(':00','')+'</small><b class="num">'+rdT(x.temp)+'</b></div>').join('')+'</div>'}
  h+='<div class="mu">'+(w?'المصدر: '+esc(w.src)+' · آخر تحديث '+rdF(w.at,c.tz)+(w.alert?'':' · لا يوجد تنبيه رسمي متاح من المزوّد'):'لم يُحدَّث بعد')+'</div><div class="mu">توقّع جوي، وليس تنبيهًا رسميًا. التنبيهات الرسمية تأتي من الجهة المختصة فقط.</div><button class="btn sm ghost" data-a="rdwx">'+(RDW.busy[rdKey(c)]?'جارٍ التحديث…':'حدّث الآن')+'</button>'}
 if(s.prOn){const t=rdPray(rdP(now,c.tz).d),nxt=RDPK.find(k=>t[k]>now);h+='<h3 style="margin:12px 0 4px">مواقيت الصلاة <small class="mu">(مواقيت محسوبة · '+RDM[s.pm][0]+(s.asr==='h'?' · عصر حنفي':'')+' · '+esc(c.n)+')</small></h3>';
  ['fajr','sunrise','dhuhr','asr','maghrib','isha'].forEach(k=>{if(t[k]!=null)h+='<div class="row sjpt'+(k===nxt?' nx':'')+(k==='sunrise'?' sr':'')+'"><span>'+RDPN[k]+'</span><span class="sp"></span><b class="num">'+rdF(t[k],c.tz)+'</b></div>'})}
 return h+'</details></div>'}
/* ---- الإشعارات: خطة بمعرّفات ثابتة + مجدول قابل للاستبدال ---- */
const NTS={impl:null};
function rdHash(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return 1000+Math.abs(h)%2000000000}
function rdQuiet(ms,c){const q=rdS().nt.quiet;if(!q||!q.on)return false;const p=rdP(ms,c.tz),m=p.h*60+p.m,a=rdHM(q.from),b=rdHM(q.to);if(a==null||b==null||a===b)return false;return a<b?(m>=a&&m<b):(m>=a||m<b)}
function rdNtPlan(now){const s=rdS(),n=s.nt,c=rdCity(),out=[];if(!n.on)return out;
 const add=(cat,ref,at,title,body,page)=>{if(at<=now||at>now+3*864e5)return;if(rdQuiet(at,c))return;out.push({id:rdHash(cat+'|'+ref),cat:cat,ref:ref,at:at,title:title,body:body,page:page||''})};
 const ds=rdP(now,c.tz).d;
 [0,1].forEach(dd=>{const day=rdAddD(ds,dd);tkOcc(day).forEach(e=>{if(!e.at)return;const m=rdHM(e.at);if(m==null)return;const st=rdAt(day,m,c.tz),dur=rdPlanState(e.k).dur,io=rdPlanState(e.k).io==='out';
   const nm=RDK[e.k]+' · '+tkTplName(e.k,e.t);let body='حان وقت حصتك.';let cat='wo';
   const lead=(n.prep&&io?n.wlead:15)*6e4;
   if(n.prep&&io&&rdWx()){const x=rdCtx(e.k,st,st+dur*6e4,io),adv=rdAdvice(x).filter(a=>a.sev>=2||a.water).slice(0,3);if(adv.length){body=adv.map(a=>a.t).join(' ');cat='prep'}}
   const pr=rdPrayHit(st,st+dur*6e4)[0];if(pr&&n.prayer)body+=' تتقاطع مع '+RDPN[pr.k]+' '+rdF(pr.at,c.tz)+'.';
   if(cat==='prep'&&!n.prep)cat='wo';if(cat==='wo'&&!n.wo)return;
   add(cat,e.id+'|'+day,st-lead,nm,body,'train')})});
 if(n.prayer&&s.prOn)[0,1].forEach(dd=>{const day=rdAddD(ds,dd),t=rdPray(day);RDPK.forEach(k=>{if(s.pa[k]&&t[k]!=null)add('prayer',k+'|'+day,t[k]-s.lead*6e4,'تنبيه '+RDPN[k],'بعد '+F(s.lead)+' دقيقة · '+esc(c.n),'')});if(n.sun&&t.maghrib!=null)add('prayer','sun|'+day,t.maghrib-30*6e4,'اقترب الغروب','الغروب '+rdF(t.maghrib,c.tz),'')});
 if(n.hydr&&n.wl){const wd=(new Date(ds+'T12:00:00Z').getUTCDay()+1)%7;[0,1].forEach(dd=>{const day=rdAddD(ds,dd),w2=(wd+dd)%7;if((n.wld||[]).indexOf(w2)>=0)add('hydr','w|'+day,rdAt(day,rdHM(n.wlt)||540,c.tz),'سجّل وزنك','افتح «اليوم» لتسجيل الوزن','dash')})}
 if(n.hydr&&s.pref.water){const a=rdHM(n.hyF),b=rdHM(n.hyT),k=Math.max(1,+n.hyN||3);if(a!=null&&b!=null&&b>a)[0,1].forEach(dd=>{const day=rdAddD(ds,dd);for(let i=0;i<k;i++){const m=Math.round(a+(b-a)*i/Math.max(1,k-1));add('hydr','h'+i+'|'+day,rdAt(day,m,c.tz),'وقت الماء','اشرب وسجّل في «اليوم»','dash')}})}
 /* دمج المتقاربة: تنبيهان من الفئة نفسها خلال 10 دقائق يصبحان تنبيهًا واحدًا */
 out.sort((a,b)=>a.at-b.at);const m=[];out.forEach(x=>{const p=m[m.length-1];if(p&&p.cat===x.cat&&x.at-p.at<6e5&&x.cat!=='prayer'){p.body+=' · '+x.title;p.merged=(p.merged||0)+1}else m.push(x)});return m}
let RDQ=Promise.resolve();
function rdNsLoad(){try{const j=JSON.parse(localStorage.getItem('sijil_ntst')||'{}');return{conf:j.conf&&typeof j.conf==='object'?j.conf:{},state:j.state||'idle',err:j.err||'',at:j.at||0}}catch(e){return{conf:{},state:'idle',err:'',at:0}}}
function rdNsSave(x){try{localStorage.setItem('sijil_ntst',JSON.stringify(x))}catch(e){}}
function rdNativeImpl(){const L=NAT&&NP('LocalNotifications');if(!L)return null;return{async perm(ask){let p=(await L.checkPermissions()).display;if(p!=='granted'&&ask&&p!=='denied')p=(await L.requestPermissions()).display;return p},async cancel(ids){if(ids.length)await L.cancel({notifications:ids.map(id=>({id:+id}))})},async schedule(list){const q=rdS().nt.silent;try{await L.createChannel({id:q?'sijil-silent':'sijil-rd',name:q?'تنبيهات SIJIL الصامتة':'تنبيهات SIJIL',importance:q?2:4,visibility:1})}catch(e){}
  if(list.length)await L.schedule({notifications:list.map(x=>({id:x.id,title:x.title,body:x.body,channelId:q?'sijil-silent':'sijil-rd',schedule:{at:new Date(x.at),allowWhileIdle:true}}))})}}}
const rdSig=x=>x.at+'|'+x.title+'|'+x.body;
/* الخطة المطلوبة تُحسب من الإعدادات؛ المؤكَّد هو ما قبله النظام فعلًا (conf). عمليات الجدولة تُسلسَل فلا تتعارض عند التغيير السريع. */
function rdNtSync(force,ask){const run=async()=>{const plan=rdNtPlan(rdNow()),st=rdNsLoad(),impl=NTS.impl||rdNativeImpl();st.at=rdNow();const want={};plan.forEach(x=>want[x.id]=rdSig(x));
  if(!impl){st.state='noimpl';st.err='';rdNsSave(st);return plan}
  let perm='granted';try{if(impl.perm)perm=await impl.perm(!!ask)}catch(e){perm='denied'}
  if(perm!=='granted'){st.state=(plan.length||Object.keys(st.conf).length)?'perm':'idle';st.err=perm;rdNsSave(st);return plan}
  let fail=0,err='';const toCancel=Object.keys(st.conf).filter(id=>!(id in want)||st.conf[id]!==want[id]).map(Number);
  if(toCancel.length){try{await impl.cancel(toCancel);toCancel.forEach(id=>delete st.conf[id])}catch(e){fail++;err=String((e&&e.message)||e)}}
  const toSched=plan.filter(x=>!(x.id in st.conf));
  if(toSched.length){try{await impl.schedule(toSched);toSched.forEach(x=>{st.conf[x.id]=want[x.id]})}catch(e){fail++;err=String((e&&e.message)||e)}}
  st.state=fail?'fail':(plan.length?'ok':'idle');st.err=err;rdNsSave(st);return plan};
 RDQ=RDQ.then(run,run);return RDQ}
function rdNtStatus(){const st=rdNsLoad(),n=Object.keys(st.conf).length;return({ok:'مجدول · '+F(n)+' تنبيهًا مؤكَّدًا من النظام',idle:'لا تنبيهات مطلوبة الآن',perm:'إذن النظام محجوب',fail:'تعذّرت الجدولة — أعد المحاولة',noimpl:'الجدولة غير متاحة في المتصفح · التنبيهات تصل إلى «الوارد» فقط'})[st.state]||'—'}
let rdNtT=0;function rdNtSoon(){clearTimeout(rdNtT);rdNtT=setTimeout(()=>{rdNtSync(0).catch(lg)},1200)}
/* وارد التطبيق: تنبيهات حان وقتها تُسجَّل في «الوارد» مرة واحدة بمعرّف ثابت، منفصلة عن حالة التفعيل */
function rdDue(){const s=rdS(),now=rdNow();if(!s.nt.on)return;if(!Array.isArray(S.nf))S.nf=[];const have=new Set(S.nf.map(x=>x.id)),add=[];
 rdNtPlanAll(now).forEach(x=>{if(x.at<=now&&x.at>now-864e5){const id='nt'+x.id+'_'+Math.floor(x.at/6e4);if(!have.has(id)&&nsOn(x.cat==='wo'?'workout':x.cat))add.push({id:id,ty:x.cat==='wo'?'workout':x.cat,t:x.title,b:x.body,ts:x.at,r:0})}});
 if(add.length){S.nf=add.concat(S.nf).slice(0,80);try{save()}catch(e){}}}
function rdNtPlanAll(now){const keep=rdNow;const o=[];[0,-1].forEach(k=>{});return rdNtPlan(now-864e5).concat(rdNtPlan(now))}
/* ---- شاشة الجلسة: فاصل الصلاة ---- */
function rdSesBanner(s){const set=rdS();if(!set.nt.prayer&&!set.prOn)return'';const c=rdCity(),now=rdNow(),h=rdPrayHit(now-5*6e4,now+30*6e4)[0];if(!h||s.k==='run'||s.k==='swim')return'';
 const inside=h.at<=now,left=inside?Math.max(0,Math.round((h.end-now)/6e4)):Math.round((h.at-now)/6e4);
 return '<div class="card sjwarn"><b>'+RDPN[h.k]+' '+rdF(h.at,c.tz)+'</b> · '+(inside?'متبقٍ نحو '+F(left)+' د':'بعد '+F(left)+' د')+'<div class="row" style="gap:8px;margin-top:8px"><button class="btn sm" data-a="tkpause" data-id="'+s.id+'">أوقف مؤقتًا</button><button class="btn sm ghost" data-a="rdrem" data-id="'+s.id+'">'+(s.rem?'سأذكّرك بعد هذه المجموعة ✓':'ذكّرني بعد هذه المجموعة')+'</button></div><div class="mu">القرار لك. المجموعات المسجّلة محفوظة في الحالتين.</div></div>'}
/* ---- الإعدادات المجمّعة ---- */
const rdOn=v=>v?'مفعّل':'متوقف';
function rdRow(id,ic2,col,t,val,body){const o=(UI.sgo||{})[id];return '<details class="sjgrp" data-g="'+id+'"'+(o?' open':'')+'><summary><span class="fi" style="--c:'+col+'">'+ic(ic2)+'</span><b>'+t+'</b><span class="sp"></span><span class="mu v">'+val+'</span>'+ic('next')+'</summary><div class="sjgb">'+body+'</div></details>'}
const rdChip=(a,v,on,l,x)=>'<button class="chip'+(on?' on':'')+'" data-a="'+a+'" data-v="'+v+'" aria-pressed="'+!!on+'"'+(x||'')+'>'+l+'</button>';
function rdSet(){const s=rdS(),P=S.prof,c=rdCity(),n=s.nt,H=[];const th=(THEMES.find(t=>t[0]===TH)||[0,'—'])[1],fn=(()=>{try{return localStorage.getItem('fit_font')||'a'}catch(e){return'a'}})();
 const lang=({1:'عربي + English',0:'عربي فقط'})[(S.prof.lang!=null?S.prof.lang:1)]||'—';
 let h=back()+'<h1>الإعدادات</h1>';
 const sp=(s.fav.length?s.fav.map(k=>RDK[k]).join('، '):'لم تختر رياضات بعد');
 h+='<div class="card sjpc"><div class="row" style="gap:12px"><span class="avbig">'+(P.av?'<img alt="" src="'+P.av+'">':esc((P.name||'ض').charAt(0)))+'</span><div class="sp"><b style="font-size:18px">'+(esc(P.name)||'ضيف')+'</b><div class="mu">'+esc(sp)+'</div></div><button class="btn sm" data-a="sub" data-v="pf">ملفي الشخصي</button></div><div class="mu" style="margin-top:8px">'+(SYNC.token?'بياناتك على هذا الجهاز ومتزامنة برمزك.':'بياناتك محفوظة على هذا الجهاز فقط. الإعدادات والتمارين تعمل بلا حساب.')+(CFG.sbUrl?' <button class="chip" data-a="fxin">تسجيل الدخول</button>':'')+'</div></div>';
 /* 1 المظهر واللغة */
 h+=rdRow('ap','sun','#F6CF64','المظهر واللغة',esc(th)+' · '+(P.h24?'24':'12')+' س',sjThemeCard()+'<div class="card"><div class="mu">اللغة: '+lang+' · خط التطبيق يتبع الإعداد أدناه وحجم نص النظام.</div><div class="seg">'+[['a','المراعي'],['c','Cairo'],['q','قمرة'],['s','النظام']].map(x=>'<button class="'+(fn===x[0]?'on':'')+'" data-a="fontset" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div><div class="row" style="margin-top:10px"><b>نظام 24 ساعة</b><span class="sp"></span><button class="chip'+(P.h24?' on':'')+'" data-a="h24">'+rdOn(P.h24)+'</button></div><div class="mu">الأرقام 0–9 تظهر كما هي في كل اللغات.</div></div>'+(S.prof.oh!==undefined?'':''));
 /* 2 التدريب والوحدات */
 const un=s.units;
 h+=rdRow('tr','dumbbell','#FF8659','التدريب والوحدات',s.fav.length?F(s.fav.length)+' مسارات':'—',
  '<div class="mu">المسارات المفضّلة</div><div class="row" style="gap:6px;flex-wrap:wrap">'+TK.map(t=>rdChip('rdfav',t[0],s.fav.indexOf(t[0])>=0,t[1])).join('')+'</div>'+
  '<div class="mu" style="margin-top:10px">مكان التدريب المعتاد</div><div class="row" style="gap:6px">'+[['gym','صالة'],['home','المنزل'],['out','خارجي']].map(x=>rdChip('rdplace',x[0],s.place===x[0],x[1])).join('')+'</div>'+
  '<div class="mu" style="margin-top:10px">أيام التمرين</div><div class="row" style="gap:6px;flex-wrap:wrap">'+DAYS.map((d,i)=>rdChip('rdday',i,s.days.indexOf(i)>=0,d)).join('')+'</div>'+
  '<div class="mu" style="margin-top:10px">الوحدات</div><div class="row" style="gap:6px;flex-wrap:wrap">'+rdChip('rdun','t:c',un.t==='c','°م')+rdChip('rdun','t:f',un.t==='f','°ف')+rdChip('rdun','d:km',un.d==='km','كم')+rdChip('rdun','d:mi',un.d==='mi','ميل')+rdChip('rdun','f:ml',un.f==='ml','مل')+rdChip('rdun','f:oz',un.f==='oz','أونصة')+'</div><div class="mu">وحدة الوزن من «مراقبة الوزن». وحدة المسافة تسري على الإعدادات الجديدة وبطاقة الطقس؛ شاشات الجري الحالية تعرض الكيلومتر.</div>'+
  '<label class="f" style="margin-top:10px">مؤقت الراحة (ث)<input type="number" inputmode="numeric" data-rd="rest" value="'+F(s.rest)+'"></label>');
 /* 3 الوقت والطقس */
 h+=rdRow('wx','cloud','#38bdf8','الوقت والطقس',esc(c.n),'<label class="f">المدينة<select data-rd="city">'+RDC.map(x=>'<option value="'+x[0]+'"'+(!s.cus&&s.city===x[0]?' selected':'')+'>'+(document.body.classList.contains('en1')?x[2]:x[1])+'</option>').join('')+'</select></label>'+
  '<div class="row" style="gap:6px;flex-wrap:wrap;margin:8px 0">'+rdChip('rdtog','wxOn',s.wxOn,'الطقس '+rdOn(s.wxOn))+rdChip('rdtog','sunOn',s.sunOn,'الشروق والغروب '+rdOn(s.sunOn))+'</div>'+
  '<div class="mu">مدينة مخصصة (خط العرض، الطول، المنطقة الزمنية)</div><div class="g3"><input data-tf="cLat" inputmode="decimal" placeholder="24.47" aria-label="خط العرض"><input data-tf="cLon" inputmode="decimal" placeholder="39.61" aria-label="خط الطول"><input data-tf="cTz" placeholder="Asia/Riyadh" dir="ltr" aria-label="المنطقة"></div><button class="btn sm ghost" data-a="rdcus" style="margin-top:6px">استخدم المدينة المخصصة</button>'+
  (NAT?'<div class="mu" style="margin-top:10px">«استخدم موقعي» غير مفعّل في تطبيق Android في هذه النسخة، ولا يطلب التطبيق إذن الموقع. اختر مدينتك يدويًا.</div>':  '<div class="row" style="margin-top:10px"><div class="t"><b>استخدم موقعي</b><div class="mu">يطلب الموقع التقريبي لمرة واحدة فقط لتحديد المدينة. يُرسَل إلى مزوّد الطقس (Open-Meteo) خطّا العرض والطول فقط دون هويتك. ولا علاقة له بتتبع GPS للجري.</div></div><span class="sp"></span><button class="chip" data-a="rdgeo">استخدم موقعي</button></div>')+
  (s.cus||s.geo?'<button class="chip" data-a="rdgeoclr" style="margin-top:6px">فصل الموقع والعودة لمدينة محفوظة</button>':'')+
  '<div class="mu" style="margin-top:8px">المنطقة الزمنية المستخدمة: '+esc(c.tz)+'. الساعة المحلية: '+rdF(rdNow(),c.tz)+'.</div>');
 /* 4 الصلاة */
 const pm=RDM[s.pm][0];
 h+=rdRow('pr','moon','#F6CF64','مواقيت الصلاة',s.prOn?esc(c.n)+' · '+pm:'متوقفة','<div class="row" style="gap:6px;flex-wrap:wrap">'+rdChip('rdtog','prOn',s.prOn,'إظهار المواقيت '+rdOn(s.prOn))+'</div><div class="mu" style="margin:8px 0">مواقيت محسوبة محليًا للمدينة: '+esc(c.n)+'. الطريقة: '+pm+'.</div>'+
  '<div class="mu">تنبيه قبل الصلاة أثناء التمرين</div><div class="row" style="gap:6px;flex-wrap:wrap">'+RDPK.map(k=>rdChip('rdpa',k,s.pa[k],RDPN[k])).join('')+'</div>'+
  '<details class="sjmore"><summary>إعدادات متقدّمة</summary><div class="mu">طريقة الحساب</div><div class="row" style="gap:6px;flex-wrap:wrap">'+Object.keys(RDM).map(k=>rdChip('rdpm',k,s.pm===k,RDM[k][0])).join('')+'</div><div class="mu" style="margin-top:6px">أم القرى: لم تُطابَق بعد بجدول محلي موثوق، فراجع الجدول الرسمي قبل الاعتماد عليها. الافتراضي رابطة العالم الإسلامي.</div><div class="mu" style="margin-top:8px">حساب العصر</div><div class="row" style="gap:6px">'+rdChip('rdasr','s',s.asr==='s','جمهور')+rdChip('rdasr','h',s.asr==='h','حنفي')+'</div><label class="f" style="margin-top:8px">التنبيه قبل الصلاة (د)<input type="number" inputmode="numeric" data-rd="lead" value="'+F(s.lead)+'"></label></details>');
 /* 5 الإشعارات */
 const cnt=['wo','prep','prayer','hydr'].filter(k=>n[k]).length;
 h+=rdRow('nt','bell','#FF8659','الإشعارات',n.on?F(cnt)+' قواعد مفعّلة':'متوقفة','<div class="mu">حالة الجدولة: <b>'+esc(rdNtStatus())+'</b></div><div class="mu">حالة إذن النظام: <b>'+esc(UI.ntperm||'اضغط للفحص')+'</b></div><div class="row" style="gap:8px;flex-wrap:wrap;margin:8px 0"><button class="btn sm" data-a="sub" data-v="nc">فتح مركز الإشعارات</button><button class="chip" data-a="rdperm">فحص الإذن</button>'+(NAT?'<button class="chip" data-a="rdandset">إعدادات Android</button>':'')+'</div>');
 /* 6 بياناتي والخصوصية */
 h+=rdRow('dt','info','#8EAECE','بياناتي والخصوصية','على الجهاز','<div class="mu">الطقس يُخزَّن مؤقتًا على جهازك (المدينة وخطوط الإحداثيات فقط تُرسل للمزوّد). الموقع التقريبي لا يُحفظ إلا إن اخترت.</div><button class="chip" data-a="rdclr">مسح الأماكن المحفوظة وتوقع الطقس</button>'+['النسخ الاحتياطي والاستيراد (Hevy وStrong)','الحساب والمزامنة والربط الصحي','موافقة الذكاء الاصطناعي'].map(t=>'<button class="lnk" data-a="rdgoold"><span class="t">'+t+'</span>'+ic('next')+'</button>').join('')+'<div class="mu" style="margin:6px 0">تجدها في «إعدادات سابقة» أسفل الصفحة؛ يفتح الزر القسم لك.</div><a class="lnk" href="privacy.html">'+ic('info')+'<span class="t">سياسة الخصوصية</span>'+ic('next')+'</a><div class="row"><span>الإصدار</span><span class="sp"></span><b class="num" dir="ltr">'+APPV+'</b></div>');
 /* الإعدادات السابقة كاملة */
 h+='<details class="sjmore" id="set-old"'+(UI.sgo&&UI.sgo.old?' open':'')+' data-g="old"><summary>إعدادات سابقة: الهدف، الاستيراد، النسخ، الحساب، المزامنة</summary>'+rdOld()+'</details>';
 return h}
function rdOld(){const f=rdOldSet;const x=f();return x.replace(/^[\s\S]*?<\/h1>/,'').replace(sjThemeCard(),'')}
/* ---- الملف الشخصي ---- */
function rdProf(){const s=rdS(),P=S.prof,w=curW(),wd=Object.keys(S.bw||{}).sort().pop();
 let h=back()+'<h1>ملفي الشخصي</h1><div class="card"><div class="row" style="gap:12px"><label class="avbig" title="تغيير الصورة">'+(P.av?'<img alt="" src="'+P.av+'">':esc((P.name||'ض').charAt(0)))+'<input id="av-in" type="file" accept="image/*" hidden></label><div class="sp"><label class="f">اسم العرض<input type="text" data-c="pt:name" value="'+esc(P.name)+'" placeholder="ضيف"></label></div></div><div class="mu">الملف محفوظ على جهازك ولا يحتاج حسابًا.</div></div>';
 h+='<div class="card"><h2>الرياضات والأهداف</h2>'+TK.map(t=>{const on=s.fav.indexOf(t[0])>=0,g=s.goals[t[0]]||'';const ph={run:'مثلًا 20 كم أسبوعيًا',swim:'مثلًا 1000 م للحصة',cali:'مثلًا عقلة 10 تكرارات',fn:'مثلًا 3 حصص أسبوعيًا',iron:'مثلًا ديدلفت 140'}[t[0]];
  return '<div style="margin-bottom:10px"><div class="row">'+rdChip('rdfav',t[0],on,t[1])+'</div>'+(on?'<input data-rd="goals.'+t[0]+'" value="'+esc(g)+'" placeholder="'+ph+'" aria-label="هدف '+t[1]+'">':'')+'</div>'}).join('')+'</div>';
 h+='<div class="card"><h2>الجدول الأسبوعي</h2>'+S.plan.map((p,d)=>'<div class="row"><span>'+DAYS[d]+'</span><span class="sp"></span><b>'+(p.ex.length?esc(p.t):'راحة')+'</b></div>').join('')+'<button class="btn sm ghost" data-a="sub" data-v="plan" style="margin-top:8px">تعديل خطة الحديد</button><div class="mu" style="margin-top:6px">حصص المسارات الأخرى تُضاف من صفحة كل مسار («أضف إلى أسبوعي»).</div></div>';
 h+='<div class="card"><h2>أماكن التدريب المحفوظة</h2>'+(s.places.length?s.places.map((p,i)=>'<div class="row sjli"><span style="flex:1"><b>'+esc(p.n)+'</b> <span class="mu">'+esc((RDC.find(c=>c[0]===p.c)||[0,p.c])[1])+' · '+(p.io==='in'?'داخلي':'خارجي')+'</span></span><button class="x" data-a="rdplx" data-i="'+i+'">حذف</button></div>').join(''):'<div class="mu">لا أماكن محفوظة.</div>')+
  '<div class="g3" style="margin-top:8px"><input data-tf="plN" placeholder="اسم المكان" aria-label="اسم المكان"><select data-tf="plC">'+RDC.map(c=>'<option value="'+c[0]+'">'+c[1]+'</option>').join('')+'</select><select data-tf="plI"><option value="out">خارجي</option><option value="in">داخلي</option></select></div><button class="btn sm" data-a="rdpladd" style="margin-top:6px">حفظ المكان</button></div>';
 h+='<div class="card"><h2>القياسات</h2><div class="row"><span>الوزن الحالي</span><span class="sp"></span><b class="num">'+(w?F(toU(w),1)+' '+uL():'—')+'</b></div><div class="mu">'+(wd?'آخر تسجيل: '+wd:'لا تسجيل بعد')+'</div><div class="row"><span>الطول</span><span class="sp"></span><b class="num">'+(P.ht?F(P.ht)+' سم':'—')+'</b></div><button class="btn sm ghost" data-a="sub" data-v="wgt" style="margin-top:8px">سجل الوزن</button></div>';
 h+='<div class="card"><h2>الربط الصحي</h2><div class="mu">'+(NAT?'يُدار من «إعدادات سابقة» في الإعدادات.':'الربط الصحي متاح في تطبيق Android فقط.')+'</div></div>';
 const pf=s.pref;h+='<div class="card"><h2>تفضيلات قبل التمرين</h2><div class="row" style="gap:6px">'+[['in','داخل الصالة'],['out','في الخارج']].map(x=>rdChip('rdpio',x[0],pf.io===x[0],x[1])).join('')+'</div><label class="f" style="margin-top:8px">وقت الحصة المفضّل<input type="time" data-rd="pref.time" value="'+esc(pf.time)+'"></label><div class="row" style="gap:6px;margin-top:8px">'+rdChip('rdptog','water',pf.water,'تذكير بالماء '+rdOn(pf.water))+rdChip('rdptog','prayer',pf.prayer,'فاصل الصلاة '+rdOn(pf.prayer))+'</div></div>';
 return h}
/* ---- مركز الإشعارات ---- */
const RDNC=[['workout','التمرين','dumbbell','#FF8659'],['prep','الطقس والاستعداد','cloud','#38bdf8'],['prayer','الصلاة وضوء النهار','moon','#F6CF64'],['hydr','التروية والقياسات','drop','#42B9FF']];
function rdNc(){const s=rdS(),n=s.nt,t=UI.nct||'in';let h=back()+'<h1>مركز الإشعارات</h1>'+'<div class="sjtabs">'+[['in','الوارد'],['ct','التحكّم']].map(x=>'<button class="'+(t===x[0]?'on':'')+'" data-a="nctab" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
 if(t==='in'){const f=ncFeed();h+='<div class="row" style="margin:6px 0 10px"><b>الأحدث</b><span class="sp"></span><button class="chip" data-a="ncread">تعليم الكل كمقروء</button></div>';
  if(!f.length)h+='<div class="card mu" style="text-align:center;padding:26px">لا توجد إشعارات بعد.</div>';
  f.forEach(x=>{const ty=NTY[x.ty]||NTY.comm;h+='<div class="ncr'+(x.r?'':' un')+'"><span class="fi" style="--c:'+ty[1]+'">'+ic(ty[0])+'</span><div class="t"><b>'+esc(x.t)+'</b>'+(x.b?'<div class="mu">'+esc(x.b)+'</div>':'')+'<small class="mu">'+ago(x.ts)+' · '+fmtTm(x.ts)+'</small></div></div>'});return h}
 h+='<div class="card"><div class="row"><b>'+ic('bell')+' تفعيل الإشعارات</b><span class="sp"></span><button class="chip'+(n.on?' on':'')+'" data-a="rdnt" data-v="on">'+rdOn(n.on)+'</button></div><div class="mu">إيقافه يوقف جدولة التنبيهات فقط؛ الوارد يبقى.</div></div>';
 const cat=(k,t2,ic2,col,body)=>{const o=(UI.sgo||{})['n'+k];return '<details class="sjgrp" data-g="n'+k+'"'+(o?' open':'')+'><summary><span class="fi" style="--c:'+col+'">'+ic(ic2)+'</span><b>'+t2+'</b><span class="sp"></span><span class="mu v">'+rdOn(n[k])+'</span>'+ic('next')+'</summary><div class="sjgb"><div class="row">'+rdChip('rdnt',k,n[k],rdOn(n[k]))+'</div>'+body+'</div></details>'};
 h+=cat('wo','التمرين','dumbbell','#FF8659','<div class="mu">تنبيه قبل الحصة المجدولة بوقت. تعيين الوقت من «غيّر وقت الحصة».</div><div class="row" style="margin-top:6px">'+rdChip('rdnt','resume',n.resume,'استكمال الجلسة الجزئية')+rdChip('rdnt','wk',n.wk,'تذكير أسبوعي')+'</div>'+(n.wk?'<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">'+DAYS.map((d,i)=>rdChip('rdntd',i,n.wkd===i,d)).join('')+'</div><label class="f">الوقت<input type="time" data-rd="nt.wkt" value="'+esc(n.wkt)+'"></label>':''));
 h+=cat('prep','الطقس والاستعداد','cloud','#38bdf8','<div class="mu">ملخص واحد قبل الحصة الخارجية يجمع الطقس واللباس والماء والأشعة والغروب. يُعاد حسابه عند تغيّر الحصة أو المدينة.</div><label class="f">قبل الحصة بـ (د)<input type="number" inputmode="numeric" data-rd="nt.wlead" value="'+F(n.wlead)+'"></label>');
 h+=cat('prayer','الصلاة وضوء النهار','moon','#F6CF64','<div class="mu">الصلوات المفعّلة تُضبط من «مواقيت الصلاة» في الإعدادات.</div><div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">'+RDPK.map(k=>rdChip('rdpa',k,s.pa[k],RDPN[k])).join('')+'</div><div class="row" style="margin-top:6px">'+rdChip('rdnt','sun',n.sun,'تنبيه قبل الغروب')+'</div>');
 h+=cat('hydr','التروية والقياسات','drop','#42B9FF','<div class="row" style="gap:6px">'+rdChip('rdptog','water',s.pref.water,'تذكير الماء '+rdOn(s.pref.water))+rdChip('rdnt','wl',n.wl,'تذكير الوزن '+rdOn(n.wl))+'</div>'+(s.pref.water?'<div class="g3"><label class="f">من<input type="time" data-rd="nt.hyF" value="'+esc(n.hyF)+'"></label><label class="f">إلى<input type="time" data-rd="nt.hyT" value="'+esc(n.hyT)+'"></label><label class="f">عدد المرات<input type="number" inputmode="numeric" data-rd="nt.hyN" value="'+F(n.hyN)+'"></label></div>':'')+(n.wl?'<label class="f">وقت الوزن<input type="time" data-rd="nt.wlt" value="'+esc(n.wlt)+'"></label><div class="row" style="gap:6px;flex-wrap:wrap">'+DAYS.map((d,i)=>rdChip('rdwld',i,(n.wld||[]).indexOf(i)>=0,d)).join('')+'</div>':''));
 const q=n.quiet;h+='<div class="card"><h2>ساعات الهدوء والصوت</h2><div class="row" style="gap:6px">'+rdChip('rdq','on',q.on,'ساعات الهدوء '+rdOn(q.on))+rdChip('rdnt','silent',n.silent,'تنبيه صامت '+rdOn(n.silent))+'</div>'+(q.on?'<div class="g3" style="margin-top:6px"><label class="f">من<input type="time" data-rd="nt.quiet.from" value="'+esc(q.from)+'"></label><label class="f">إلى<input type="time" data-rd="nt.quiet.to" value="'+esc(q.to)+'"></label></div>':'')+'<div class="mu">التنبيه الصامت يعتمد على دعم النظام لقنوات الإشعارات.</div></div>';
 h+='<div class="card"><h2>الفئات القديمة</h2><div class="rail tight">'+NCAT.filter(c=>['nutrition','streak','weight'].indexOf(c[0])>=0).map(c=>'<button class="chip'+((S.ns||{})[c[0]]!==0?' on':'')+'" data-a="nstog" data-v="'+c[0]+'">'+c[1]+'</button>').join('')+'</div></div>';
 h+='<details class="sjgrp" data-g="nhelp"'+((UI.sgo||{}).nhelp?' open':'')+'><summary><span class="fi" style="--c:#8EAECE">'+ic('info')+'</span><b>لدي مشكلة</b><span class="sp"></span>'+ic('next')+'</summary><div class="sjgb"><div class="'+(rdNsLoad().state==='fail'||rdNsLoad().state==='perm'?'sjwarn':'mu')+'" id="rd-nst"><b>حالة الجدولة:</b> '+esc(rdNtStatus())+'<div class="mu">المطلوب '+F(rdNtPlan(rdNow()).length)+' · المؤكَّد من النظام '+F(Object.keys(rdNsLoad().conf).length)+(rdNsLoad().at?' · آخر محاولة '+rdF(rdNsLoad().at,rdCity().tz):'')+'</div><button class="btn sm" data-a="rdretry" style="margin-top:6px">أعد المحاولة</button></div><div class="mu">حالة الإذن: <b>'+esc(UI.ntperm||'لم تُفحص')+'</b></div><div class="row" style="gap:8px;flex-wrap:wrap;margin:8px 0"><button class="btn sm" data-a="rdtest">إرسال إشعار تجريبي</button><button class="chip" data-a="rdperm">فحص الإذن</button>'+(NAT?'<button class="chip" data-a="rdandset">إعدادات Android</button>':'')+'</div><div class="mu">إن حُجبت إشعارات النظام تبقى المعلومات متاحة في «الوارد». التنبيهات الدقيقة والتحديث في الخلفية تعتمد على المنصة وتوفير الطاقة والاتصال، وقد تتأخر على بعض الأجهزة.</div></div></details>';
 return h}
const RDT0={run:'ez',swim:'tech',cali:'b0',fn:'a12'};
function rdMove(m){const c=rdCity(),p=rdP(m.at,c.tz),hm=String(p.h).padStart(2,'0')+':'+String(p.m).padStart(2,'0'),ds=p.d,o=SJ(),en=m.id?tkEntry(m.id):null;
 if(en){const e=en.e;if(en.one){e.date=ds;e.at=hm}
  else if(m.scope==='all'){en.arr.splice(en.arr.indexOf(e),1);delete e.skip;e.at=hm;const wd=tkWd(ds);(o.tw[wd]=o.tw[wd]||[]).push(e)}
  else{const od=m.ds||ds;e.skip=e.skip||[];if(e.skip.indexOf(od)<0)e.skip.push(od);o.one.push({id:'o'+tkWid(),src:e.id,k:e.k,t:e.t,at:hm,date:ds})}}
 else o.one.push({id:'o'+tkWid(),k:m.k,t:RDT0[m.k]||'',at:hm,date:ds});
 UI.rdmv=null;UI.rdc=null;return ds+' '+hm}
/* ---- الأوامر ---- */
const rdTog=(a,v)=>{const i=a.indexOf(v);i>=0?a.splice(i,1):a.push(v)};
function rdSetPath(path,v){const s=rdS();if(path==='prof.name'){S.prof.name=v;return}const p=path.split('.');let o=s;for(let i=0;i<p.length-1;i++){if(!o[p[i]]||typeof o[p[i]]!=='object')o[p[i]]={};o=o[p[i]]}const k=p[p.length-1];
 o[k]=(['dur','lead','rest','hyN','wlead'].indexOf(k)>=0)?(+n2(v)||0):v;if(path==='city'){s.cus=null;s.geo=0;UI._rdf=undefined}}
Object.assign(ACT,{
 rdfav:b=>{rdTog(rdS().fav,b.dataset.v)},rdplace:b=>{rdS().place=b.dataset.v},rdday:b=>{rdTog(rdS().days,+b.dataset.v)},
 rdun:b=>{const a=b.dataset.v.split(':');rdS().units[a[0]]=a[1]},
 rdtog:b=>{const s=rdS();s[b.dataset.v]=s[b.dataset.v]?0:1},
 rdpa:b=>{const s=rdS();s.pa[b.dataset.v]=s.pa[b.dataset.v]?0:1;rdNtSoon()},rdpm:b=>{rdS().pm=b.dataset.v},rdasr:b=>{rdS().asr=b.dataset.v},
 rdpio:b=>{rdS().pref.io=b.dataset.v},rdptog:b=>{const p=rdS().pref;p[b.dataset.v]=p[b.dataset.v]?0:1;rdNtSoon()},
 rdnt:b=>{const n=rdS().nt,k=b.dataset.v;n[k]=n[k]?0:1;rdNtSoon()},rdntd:b=>{rdS().nt.wkd=+b.dataset.v},rdwld:b=>{rdTog(rdS().nt.wld,+b.dataset.v)},rdq:b=>{const q=rdS().nt.quiet;q.on=q.on?0:1;rdNtSoon()},
 nctab:b=>{UI.nct=b.dataset.v},
 rdopen:b=>{UI.rdo=UI.rdo===b.dataset.v?null:b.dataset.v;if(!UI.rdo)UI.rdc=null},rdcmp:b=>{UI.rdc=UI.rdc===b.dataset.v?null:b.dataset.v},
 rdio:b=>{rdPlanState(b.dataset.k).io=b.dataset.v;rdNtSoon()},
 rdmove:b=>{const e=b.dataset.id?tkEntry(b.dataset.id):null;UI.rdmv={k:b.dataset.k,at:+b.dataset.at,id:b.dataset.id||'',ds:b.dataset.ds||'',scope:e&&e.wd!==undefined?'once':'all'};UI.rdres=null},
 rdmvs:b=>{if(UI.rdmv)UI.rdmv.scope=b.dataset.v},rdmvx:()=>{UI.rdmv=null},
 rdmvok:()=>{const m=UI.rdmv;if(!m)return false;const when=rdMove(m);save();UI.rdres={k:m.k,msg:'نُقلت الحصة إلى '+when+'. جارٍ تأكيد التنبيه…'};
  rdNtSync(1).then(()=>{const st=rdNsLoad().state,ok=st==='ok'||st==='idle'||st==='noimpl';UI.rdres={k:m.k,fail:!ok,msg:'نُقلت الحصة إلى '+when+'. '+(ok?(st==='noimpl'?'لا مجدول إشعارات في هذا المتصفح.':'التنبيه الجديد مؤكَّد من النظام.'):(st==='perm'?'لكن إذن الإشعارات محجوب فلم يُجدول التنبيه.':'لكن تعذّرت جدولة التنبيه.'))};render()}).catch(lg)},
 rdretry:()=>{rdNtSync(1,true).then(()=>{UI.rdres=null;render()});return false},
 rdwx:()=>{rdFetch(1);return false},
 rdcus:()=>{const la=tkNum(tkF('cLat')),lo=tkNum(tkF('cLon')),tz=(tkF('cTz')||'').trim();if(la==null||lo==null||Math.abs(la)>90||Math.abs(lo)>180||!rdTzOk(tz)){toast('أدخل خط العرض والطول ومنطقة زمنية صحيحة');return false}const s=rdS();s.cus={n:'مدينة مخصصة',lat:la,lon:lo,tz:tz};UI._rdf=undefined;rdNtSoon()},
 rdgeo:()=>{if(!navigator.geolocation){toast('الموقع غير متاح على هذا الجهاز');return false}
  navigator.geolocation.getCurrentPosition(p=>{const s=rdS(),tz=Intl.DateTimeFormat().resolvedOptions().timeZone;s.cus={n:'موقعي التقريبي',lat:+p.coords.latitude.toFixed(1),lon:+p.coords.longitude.toFixed(1),tz:tz};s.geo=1;UI._rdf=undefined;save();render()},()=>{toast('رُفض إذن الموقع. اختر مدينة يدويًا.')},{maximumAge:36e5,timeout:8000,enableHighAccuracy:false});return false},
 rdgeoclr:()=>{const s=rdS();s.cus=null;s.geo=0;UI._rdf=undefined},
 rdclr:()=>{const s=rdS();s.places=[];s.cus=null;s.geo=0;SJ().wxm={};toast('تم المسح')},
 rdpladd:()=>{const n=(tkF('plN')||'').trim();if(!n){toast('اكتب اسم المكان');return false}rdS().places.push({n:n,c:tkF('plC')||'madinah',io:tkF('plI')||'out'});UI.tf.plN=''},rdplx:b=>{rdS().places.splice(+b.dataset.i,1)},
 rdrem:b=>{const s=tkFind(b.dataset.id);if(s)s.rem=s.rem?0:1},
 rdperm:()=>{rdCheckPerm();return false},rdandset:()=>{try{const A=NP('App');A&&A.openSettings&&A.openSettings()}catch(e){}return false},
 rdtest:()=>{const now=rdNow();if(!Array.isArray(S.nf))S.nf=[];S.nf.unshift({id:'ntest'+now,ty:'prep',t:'إشعار تجريبي',b:'إن وصلك هذا فالتنبيهات تعمل.',ts:now,r:0});const im=NTS.impl||rdNativeImpl();
  if(!im){UI.rdtst='لا مجدول إشعارات في المتصفح: أُضيفت التجربة إلى الوارد فقط.';return}
  UI.rdtst='جارٍ طلب الجدولة…';(async()=>{try{const p=im.perm?await im.perm(true):'granted';if(p!=='granted'){UI.rdtst='إذن النظام محجوب: لم تُجدول التجربة.'}else{await im.schedule([{id:rdHash('test|'+now),title:'إشعار تجريبي من SIJIL',body:'إن وصلك هذا فالتنبيهات تعمل.',at:now+3000}]);UI.rdtst='قبل النظام جدولة التجربة. هذا لا يثبت وصول الإشعار: انتظر ثوانٍ، فإن لم يصل فراجع إذن الإشعارات وتوفير الطاقة.'}}catch(e){UI.rdtst='تعذّرت الجدولة: '+String((e&&e.message)||e)}render()})()},
 rdgoold:()=>{UI.sgo=UI.sgo||{};UI.sgo.old=true;UI.sgs='set-old'}
});
async function rdCheckPerm(){let v='غير معروفة';try{const im=NTS.impl||rdNativeImpl();if(im&&im.perm)v=({granted:'مسموح',denied:'محجوب',prompt:'لم تُطلب',['prompt-with-rationale']:'لم تُطلب'})[await im.perm()]||'غير معروفة';else if(window.Notification)v=({granted:'مسموح',denied:'محجوب',default:'لم تُطلب'})[Notification.permission]||v}catch(e){}UI.ntperm=v;render()}
document.addEventListener('change',ev=>{const t=ev.target,k=t&&t.dataset&&t.dataset.rd;if(!k)return;rdSetPath(k,t.value);save();rdNtSoon();if(k==='city'||k==='lead')render()});
document.addEventListener('toggle',ev=>{const d=ev.target;if(d&&d.dataset&&d.dataset.g!==undefined){UI.sgo=UI.sgo||{};UI.sgo[d.dataset.g]=d.open}if(d&&d.id==='rd-more')UI.rdm=d.open},true);
/* ---- ربط بالتطبيق ---- */
const rdOldSet=vSet;
(()=>{document.querySelector('symbol#i-drop').parentNode.insertAdjacentHTML('beforeend','<symbol id="i-cloud" viewBox="0 0 24 24"><path d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 8.5a4.5 4.5 0 0 1 0 9.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></symbol><symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>');
 Object.assign(NTY,{prep:['cloud','#38bdf8'],prayer:['moon','#F6CF64'],hydr:['drop','#42B9FF']});NCAT.push(['prep','الطقس والاستعداد'],['prayer','الصلاة وضوء النهار'],['hydr','التروية والقياسات']);
 vSet=function(){return rdSet()};vNc=function(){return rdNc()};
 const V=view;view=function(){if(S.sub==='pf'&&S.prof.ob)return rdProf();return V.apply(this,arguments)};
 const T=vToday;vToday=function(){const h=T.apply(this,arguments),m='<details class="sjmore" id="td-more"',i=h.indexOf(m),b=rdTodayCard();return i<0?h+b:h.slice(0,i)+b+h.slice(i)};
 const TV=tkView;tkView=function(k){const h=TV.apply(this,arguments);if(UI.ses||UI.sum||k==='dl'||UI.ttab==='lg')return h;const i=h.indexOf('<div class="sjtabs"'),j=h.indexOf('</div>',i);const nx=rdNextOcc(k);return i<0?h:h.slice(0,j+6)+rdReady(k,nx?nx.e:null,nx?nx.ds:null)+h.slice(j+6)};
 const VS=vSes;vSes=function(){const h=VS.apply(this,arguments),s=tkFind(UI.ses);if(!s)return h;const i=h.indexOf('<div class="sjclock'),b=rdSesBanner(s);return i<0||!b?h:h.slice(0,i)+b+h.slice(i)};
 const IR=tkTodayBlock;tkTodayBlock=function(){let h=IR.apply(this,arguments);const pl=tkOcc(TD())[0];return pl?h+rdReady(pl.k,pl,TD()):h};
 const G=ncGen;ncGen=function(){const r=G.apply(this,arguments);try{rdDue()}catch(e){lg(e)}return r};
 const sv=save;save=function(){const r=sv.apply(this,arguments);try{rdNtSoon()}catch(e){}return r};
 const NS=natSched;natSched=async function(){try{await NS.apply(this,arguments)}catch(e){lg(e)}try{const st=rdNsLoad();st.conf={};rdNsSave(st)}catch(e){}await rdNtSync(1)};
 /* تذكير «بعد هذه المجموعة» */
 ['calog','swdone','fnnext','fnround','fnemom'].forEach(a=>{const o=ACT[a];ACT[a]=function(){const r=o.apply(this,arguments);const s=tkFind(UI.ses);if(s&&s.rem){s.rem=0;toast('انتهت المجموعة. حان وقت الصلاة، أوقف الحصة إن أردت.')}return r}});
 setInterval(()=>{try{const e=document.querySelector('[data-rdclk]');if(e)e.textContent=rdF(rdNow(),rdCity().tz)}catch(e){}},15000);
})();
Object.assign(ENT,{"جهّز تمرينك":"Get ready","ملفي الشخصي":"My profile","المظهر واللغة":"Appearance & language","التدريب والوحدات":"Training & units","الوقت والطقس":"Time & weather","مواقيت الصلاة":"Prayer times","الإشعارات":"Notifications","بياناتي والخصوصية":"My data & privacy","الوارد":"Inbox","التحكّم":"Controls","قارن أوقات التمرين":"Compare workout times","غيّر وقت الحصة":"Change session time","ضيف":"Guest","لدي مشكلة":"I have a problem","إرسال إشعار تجريبي":"Send test notification","مواقيت محسوبة":"Calculated times"});
/* ---- الإنجليزية: نصوص الجولة الثانية (الأرقام قوالب بـ #) ---- */
Object.assign(ENT,{"غير متاح":"Unavailable","غير متاحة":"Unavailable","جري سهل":"Easy run","التفاصيل":"Details","عواصف رعدية":"Thunderstorms","الشروق":"Sunrise","الغروب":"Sunset","الرطوبة":"Humidity","الرياح / الهبّات":"Wind / gusts","احتمال المطر":"Chance of rain","الأشعة فوق البنفسجية":"UV index","جودة الهواء":"Air quality","حدّث الآن":"Refresh now","الفجر":"Fajr","العصر":"Asr","المغرب":"Maghrib","العشاء":"Isha","تراجع":"Undo",
"توقّع عواصف رعدية خلال الحصة. انقلها إلى الداخل أو أجّلها. هذا توقع وليس تحذيرًا رسميًا.":"Thunderstorms are forecast during your session. Move it indoors or postpone it. This is a forecast, not an official warning.",
"توقّع جوي، وليس تنبيهًا رسميًا. التنبيهات الرسمية تأتي من الجهة المختصة فقط.":"A weather forecast, not an official alert. Official alerts come only from the authority concerned.",
"لم تختر رياضات بعد":"No sports chosen yet","بياناتك محفوظة على هذا الجهاز فقط. الإعدادات والتمارين تعمل بلا حساب.":"Your data stays on this device only. Settings and workouts work without an account.","المراعي":"Almarai","الأرقام 0–9 تظهر كما هي في كل اللغات.":"Digits 0–9 appear the same in every language.","المسارات المفضّلة":"Favorite tracks","مكان التدريب المعتاد":"Usual training place","صالة":"Gym","المنزل":"Home","خارجي":"Outdoor","الوحدات":"Units","°م":"°C","°ف":"°F","ميل":"mi","مل":"ml","أونصة":"fl oz",
"وحدة الوزن من «مراقبة الوزن». وحدة المسافة تسري على الإعدادات الجديدة وبطاقة الطقس؛ شاشات الجري الحالية تعرض الكيلومتر.":"Weight unit comes from “Weight monitor”. The distance unit applies to the new settings and the weather card; the current run screens show kilometers.","مؤقت الراحة (ث)":"Rest timer (s)",
"المدينة المنورة":"Madinah","مكة المكرمة":"Makkah","الرياض":"Riyadh","جدة":"Jeddah","الدمام":"Dammam","تبوك":"Tabuk","أبها":"Abha","القاهرة":"Cairo","دبي":"Dubai","عمّان":"Amman","دمشق":"Damascus","إسطنبول":"Istanbul","لندن":"London","نيويورك":"New York",
"الشروق والغروب مفعّل":"Sunrise and sunset on","مدينة مخصصة (خط العرض، الطول، المنطقة الزمنية)":"Custom city (latitude, longitude, time zone)","استخدم المدينة المخصصة":"Use custom city","استخدم موقعي":"Use my location",
"يطلب الموقع التقريبي لمرة واحدة فقط لتحديد المدينة. يُرسَل إلى مزوّد الطقس (Open-Meteo) خطّا العرض والطول فقط دون هويتك. ولا علاقة له بتتبع GPS للجري.":"Requests your approximate location once, only to pick a city. Only latitude and longitude are sent to the weather provider (Open-Meteo), never your identity. It is unrelated to GPS run tracking.",
"إظهار المواقيت مفعّل":"Show prayer times on","تنبيه قبل الصلاة أثناء التمرين":"Alert before prayer during a workout","إعدادات متقدّمة":"Advanced settings","طريقة الحساب":"Calculation method","رابطة العالم الإسلامي":"Muslim World League","أم القرى":"Umm al-Qura","أمريكا الشمالية":"North America","الهيئة المصرية":"Egyptian General Authority","كراتشي":"Karachi",
"أم القرى: لم تُطابَق بعد بجدول محلي موثوق، فراجع الجدول الرسمي قبل الاعتماد عليها. الافتراضي رابطة العالم الإسلامي.":"Umm al-Qura has not yet been checked against a trusted local table; verify against the official table before relying on it. The default is Muslim World League.",
"حساب العصر":"Asr calculation","جمهور":"Standard","حنفي":"Hanafi","التنبيه قبل الصلاة (د)":"Alert before prayer (min)","حالة الجدولة:":"Scheduling status:","لا تنبيهات مطلوبة الآن":"No notifications needed now","حالة إذن النظام:":"System permission:","اضغط للفحص":"Tap to check","فتح مركز الإشعارات":"Open notification center","فحص الإذن":"Check permission","على الجهاز":"On device",
"الطقس يُخزَّن مؤقتًا على جهازك (المدينة وخطوط الإحداثيات فقط تُرسل للمزوّد). الموقع التقريبي لا يُحفظ إلا إن اخترت.":"Weather is cached on your device (only the city coordinates are sent to the provider). Approximate location is saved only if you choose.","مسح الأماكن المحفوظة وتوقع الطقس":"Clear saved places and weather forecast","النسخ الاحتياطي والاستيراد (Hevy وStrong)":"Backup and import (Hevy and Strong)","الحساب والمزامنة والربط الصحي":"Account, sync and health link","موافقة الذكاء الاصطناعي":"AI consent","تجدها في «إعدادات سابقة» أسفل الصفحة؛ يفتح الزر القسم لك.":"Find it under “Earlier settings” at the bottom; the button opens that section for you.","سياسة الخصوصية":"Privacy policy","إعدادات سابقة: الهدف، الاستيراد، النسخ، الحساب، المزامنة":"Earlier settings: goal, import, backup, account, sync","عربي + English":"Arabic + English","عربي فقط":"Arabic only",
"إيقافه يوقف جدولة التنبيهات فقط؛ الوارد يبقى.":"Turning it off stops scheduling only; the inbox stays.","تنبيه قبل الحصة المجدولة بوقت. تعيين الوقت من «غيّر وقت الحصة».":"A reminder ahead of the scheduled session. Set the time from “Change session time”.","استكمال الجلسة الجزئية":"Resume a partial session","تذكير أسبوعي":"Weekly reminder","الطقس والاستعداد":"Weather and preparation",
"ملخص واحد قبل الحصة الخارجية يجمع الطقس واللباس والماء والأشعة والغروب. يُعاد حسابه عند تغيّر الحصة أو المدينة.":"One summary before an outdoor session covering weather, clothing, water, UV and sunset. It is recomputed when the session or city changes.","قبل الحصة بـ (د)":"Before the session (min)","الصلاة وضوء النهار":"Prayer and daylight","الصلوات المفعّلة تُضبط من «مواقيت الصلاة» في الإعدادات.":"Enabled prayers are set from “Prayer times” in Settings.","تنبيه قبل الغروب":"Alert before sunset","التروية والقياسات":"Hydration and measurements","تذكير الماء متوقف":"Water reminder off","تذكير الوزن متوقف":"Weight reminder off","ساعات الهدوء والصوت":"Quiet hours and sound","ساعات الهدوء متوقف":"Quiet hours off","تنبيه صامت متوقف":"Silent alert off","التنبيه الصامت يعتمد على دعم النظام لقنوات الإشعارات.":"Silent alerts depend on system support for notification channels.","الفئات القديمة":"Earlier categories",
"تعذّرت الجدولة — أعد المحاولة":"Scheduling failed — retry","أعد المحاولة":"Retry","حالة الإذن:":"Permission status:","لم تُفحص":"Not checked","مجدول":"Scheduled","إذن النظام محجوب":"System permission blocked","حالة الجدولة":"Scheduling status","الجدولة غير متاحة في المتصفح · التنبيهات تصل إلى «الوارد» فقط":"Scheduling is unavailable in the browser · notifications reach the inbox only",
"إن حُجبت إشعارات النظام تبقى المعلومات متاحة في «الوارد». التنبيهات الدقيقة والتحديث في الخلفية تعتمد على المنصة وتوفير الطاقة والاتصال، وقد تتأخر على بعض الأجهزة.":"If system notifications are blocked, the information stays in the inbox. Exact alerts and background refresh depend on the platform, battery saver and connectivity, and may be delayed on some devices.",
"إخفاء":"Hide","وقت الحصة":"Session time","المدة (د)":"Duration (min)","العودة (اختياري)":"Return (optional)","خارجية":"Outdoor","داخلية":"Indoor","رابط":"Link",
"الحرارة المحسوسة تبلغ #°. خفّف الشدة، خذ فواصل ظل وشرب، أو اختر وقتًا أبرد.":"Feels-like temperature reaches #°. Ease the intensity, take shade and water breaks, or pick a cooler time.","مؤشر الأشعة #: اطلب الظل، وارتدِ ملابس واقية وقبعة، وضع واقيًا من الشمس.":"UV index #: seek shade, wear protective clothing and a hat, and apply sunscreen.","هبّات رياح حتى # كم/س: تجنّب الأماكن المكشوفة.":"Gusts up to # km/h: avoid exposed places.","جهّز ماءً واشرب على فترات منتظمة، وأكثر من الفواصل مع هذه الحرارة.":"Bring water and drink at regular intervals; take more breaks in this heat.",
"ضبط التنبيهات":"Set alerts","يدوي: الزمن والمسافة بلا GPS":"Manual: time and distance, no GPS","مشي":"Walk","نشاط هادئ":"Easy activity","جلسة حرة":"Free session","بلا قالب":"No template","الجلسة التالية في خطة # كم":"Next session in the # km plan","أضف إلى أسبوعي":"Add to my week","سجّل جولة سابقة":"Log an earlier run","حفظ في السجل":"Save to log","حصصي هذا الأسبوع":"My sessions this week","النشاط والخطوات":"Activity and steps","الكارديو اليومي والمؤشرات":"Daily cardio and indicators"});
/* قوالب فيها ساعات أو مدن: تُترجم بدوال لأن الوقت يُعرض بعزل اتجاه */
(function(){const cn=n=>{const c=RDC.find(x=>x[1]===n);return c?c[2]:n},WC={'عواصف رعدية':'Thunderstorms'};
 ENP.push([/^(.+?) · محسوسة (\d+)° · (⁦.+⁩)$/,(m,a,b,c)=>(ENT[a]||WC[a]||a)+' · feels like '+b+'° · '+c]);
 ENP.push([/^المنطقة الزمنية المستخدمة: (.+?)\. الساعة المحلية: (⁦.+⁩)\.$/,(m,a,b)=>'Time zone in use: '+a+'. Local time: '+b+'.']);
 ENP.push([/^المصدر: (.+?) · آخر تحديث (⁦.+⁩)(?: · لا يوجد تنبيه رسمي متاح من المزوّد)?$/,(m,a,b)=>'Source: '+a+' · last updated '+b+(/لا يوجد/.test(m)?' · no official alert available from the provider':'')]);
 ENP.push([/^\(مواقيت محسوبة · (.+?) · (.+?)\)$/,(m,a,b)=>'(Calculated times · '+(ENT[a]||a)+' · '+cn(b)+')']);
 ENP.push([/^(.+?) · (رابطة العالم الإسلامي|أم القرى|أمريكا الشمالية|الهيئة المصرية|كراتشي)$/,(m,a,b)=>cn(a)+' · '+(ENT[b]||b)]);
 ENP.push([/^مواقيت محسوبة محليًا للمدينة: (.+?)\. الطريقة: (.+?)\.$/,(m,a,b)=>'Times calculated locally for '+cn(a)+'. Method: '+(ENT[b]||b)+'.']);
 ENP.push([/^(.+?) متوقف$/,(m,a)=>(ENT[a+' متوقف']||ENT[a])?(ENT[a+' متوقف']||ENT[a]+' off'):m]);
})();
Object.assign(ENT,{"صافٍ":"Clear","غائم جزئيًا":"Partly cloudy","ضباب":"Fog","رذاذ":"Drizzle","مطر":"Rain","ثلج":"Snow","زخات مطر":"Showers","متقلّب":"Unsettled","الطقس مفعّل":"Weather on","# قواعد مفعّلة":"# rules on","مجدول · # تنبيهًا مؤكَّدًا من النظام":"Scheduled · # confirmed by the system","جهّز ماءً واشرب عند الحاجة. الكمية تختلف من شخص لآخر.":"Bring water and drink as needed. The amount varies from person to person.","أسبوع # من # · # د":"Week # of # · # min",
"CDC: التمرين في الحر":"CDC: exercising in heat","WHO: مؤشر الأشعة فوق البنفسجية":"WHO: UV index","NWS: البرق والأنشطة الرياضية":"NWS: lightning and sports","قاعدة عامة (لا مصدر رسمي)":"General rule (no official source)","غياب مصدر تحذيرات المياه":"No water-warning source","تنبيه رسمي من المزوّد":"Official alert from provider","الأسود":"Black","الأبيض":"White","الأزرق":"Blue","الزمردي":"Emerald","الزيتوني":"Olive","البنفسجي":"Purple","ذكر":"Male","أنثى":"Female","عرض الأوقات بنظام 24 ساعة بدل 12 ساعة":"Show times in 24-hour format instead of 12-hour","SIJIL مجاني بلا إعلانات ولا اشتراكات. تقييمك في المتجر هو كل ما نحتاجه.":"SIJIL is free with no ads or subscriptions. Your store rating is all we need.","الخصوصية والبيانات":"Privacy and data","حذف الحساب والبيانات":"Delete account and data","لا مجدول إشعارات في هذا المتصفح.":"This browser cannot schedule notifications."});
(function(){const T=n=>ENT[n]||n;
 ENP.push([/^(.+?) · (\d+) س$/,(m,a,b)=>T(a)+' · '+b+' h']);
 ENP.push([/^اللغة: (.+?) · خط التطبيق يتبع الإعداد أدناه وحجم نص النظام\.$/,(m,a)=>'Language: '+(a==='عربي + English'?'Arabic + English':T(a))+' · the app font follows the setting below and the system text size.']);
 ENP.push([/^المطلوب (\d+) · المؤكَّد من النظام (\d+)(?: · آخر محاولة (⁦.+⁩))?$/,(m,a,b,c)=>'Requested '+a+' · confirmed by the system '+b+(c?' · last attempt '+c:'')]);
 ENP.push([/^المكان: (.+)$/,(m,a)=>{const c=RDC.find(x=>x[1]===a);return 'Place: '+(c?c[2]:a)}]);
 ENP.push([/^· (.+)$/,(m,a)=>ENT[a]?'· '+ENT[a]:m]);
 ENP.push([/^نُقلت الحصة إلى (\S+ \S+)\. (.+)$/,(m,a,b)=>'Session moved to '+a+'. '+({'التنبيه الجديد مؤكَّد من النظام.':'The new reminder is confirmed by the system.','جارٍ تأكيد التنبيه…':'Confirming the reminder…','لا مجدول إشعارات في هذا المتصفح.':'This browser cannot schedule notifications.','لكن إذن الإشعارات محجوب فلم يُجدول التنبيه.':'But notification permission is blocked, so the reminder was not scheduled.','لكن تعذّرت جدولة التنبيه.':'But scheduling the reminder failed.'}[b]||b)]);
})();
