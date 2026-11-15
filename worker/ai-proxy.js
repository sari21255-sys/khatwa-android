/* Cloudflare Worker: بوابة الذكاء الاصطناعي + مسارات ترحيل/حذف الحسابات القديمة.
   الهوية: JWT من Supabase Auth (HS256 بسرّ SUPABASE_JWT_SECRET أو ES256/RS256 عبر JWKS). الحصص ذرّية في Postgres عبر الدالة consume_quota_trusted التي لا ينفذها إلا مفتاح الخدمة SUPABASE_SERVICE_KEY (Secret)؛ حدود المستخدم والحد الكلي في جدول quota_settings على الخادم لا في هذا الملف، والدالة تتحقق من أن الجلسة قائمة.
   المزامنة صارت مباشرة بين التطبيق وSupabase (الدالة sync_exchange)؛ مسارات /api/state هنا للترحيل من النسخ القديمة فقط.
   المتغيرات: ANTHROPIC_API_KEY (Secret)، STATE (KV)، ALLOW_ORIGIN (قائمة نطاقات مفصولة بفاصلة)، SUPABASE_URL، SUPABASE_ANON_KEY (المفتاح العام)، SUPABASE_SERVICE_KEY (Secret، مفتاح service_role: للحصص فقط، لا يوضع في الواجهة ولا المستودع)، SUPABASE_JWT_SECRET (اختياري، للمشاريع ذات HS256)،
   AUTH_MODE: 'supabase' (الافتراضي حين يُضبط SUPABASE_URL: يُرفض رمز الوسيط القديم للذكاء والكتابة) أو 'transition' (الافتراضي بلا SUPABASE_URL: يُقبل الرمز القديم)، LEGACY_SYNC='0' (يغلق كل مسارات الرمز القديم برد 410 legacy_disabled)، AI_DAILY_CAP (سقف يومي كلي لوضع الانتقال فقط، افتراضي 500؛ في وضع supabase الحدود من quota_settings)، LEGACY_SYNC='0' يعطّل مسارات الحسابات القديمة.
   ملاحظة: حدود المعدل على KV تقريبية (القراءة ثم الكتابة غير ذرّية)؛ السقف اليومي الكلي هو الحماية الفعلية للتكلفة. PBKDF2 مثبّت على 100,000 دورة لأنه الحد الأقصى في Workers. */
const MODELS={default:'claude-sonnet-5-5',fast:'claude-haiku-5-5'};
const hex=b=>[...new Uint8Array(b)].map(x=>('0'+x.toString(16)).slice(-2)).join('');
const rnd=n=>hex(crypto.getRandomValues(new Uint8Array(n)));
async function pbk(pw,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:100000},k,256))}
const b64u=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(s.length/4)*4,'=')),c=>c.charCodeAt(0));
let JWKS={t:0,k:null,u:''};
async function jwks(env){const u=env.SUPABASE_URL.replace(/\/$/,'')+'/auth/v1/.well-known/jwks.json';if(JWKS.k&&JWKS.u===u&&Date.now()-JWKS.t<300000)return JWKS.k;const r=await fetch(u);if(!r.ok)throw new Error('jwks');JWKS={t:Date.now(),k:(await r.json()).keys||[],u};return JWKS.k}
/* يتحقق من توقيع الرمز وانتهاءه والمُصدِر والجمهور؛ يعيد {kind:'sb',uid,jwt} أو null. لا يقبل alg=none ولا HS256 بلا سرّ مضبوط. */
async function verifyJwt(t,env){try{const[a,b,c]=t.split('.');const H=JSON.parse(new TextDecoder().decode(b64u(a))),P=JSON.parse(new TextDecoder().decode(b64u(b)));const data=new TextEncoder().encode(a+'.'+b),sig=b64u(c);let ok=false;
 if(H.alg==='HS256'&&env.SUPABASE_JWT_SECRET){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.SUPABASE_JWT_SECRET),{name:'HMAC',hash:'SHA-256'},false,['verify']);ok=await crypto.subtle.verify('HMAC',k,sig,data)}
 else if((H.alg==='ES256'||H.alg==='RS256')&&env.SUPABASE_URL&&H.kid){const jk=(await jwks(env)).find(x=>x.kid===H.kid&&(!x.alg||x.alg===H.alg));if(!jk)return null;
  const es=H.alg==='ES256',k=await crypto.subtle.importKey('jwk',jk,es?{name:'ECDSA',namedCurve:'P-256'}:{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);ok=await crypto.subtle.verify(es?{name:'ECDSA',hash:'SHA-256'}:'RSASSA-PKCS1-v1_5',k,sig,data)}
 if(!ok)return null;const now=Math.floor(Date.now()/1000);
 if(!(P.exp>now)||(P.nbf&&P.nbf>now+30))return null;
 if(!(P.aud==='authenticated'||(Array.isArray(P.aud)&&P.aud.indexOf('authenticated')>=0)))return null;
 if(env.SUPABASE_URL&&P.iss!==env.SUPABASE_URL.replace(/\/$/,'')+'/auth/v1')return null;
 if(!/^[0-9a-f-]{36}$/i.test(P.sub||'')||(P.role&&P.role!=='authenticated'))return null;
 return{kind:'sb',uid:P.sub,sid:P.session_id,jwt:t}}catch(e){return null}}
/* حصة ذرّية في Postgres. true/false، أو 'auth' (جلسة مُبطلة/حساب محذوف)، أو null (الخدمة غير متاحة: نرفض لحماية التكلفة). */
/* المسار الموثوق الوحيد لتعديل العدّادات: دالة consume_quota_trusted بمفتاح الخدمة (سرّ Worker، لا يوجد في الواجهة ولا المستودع).
   الحدود لا تُمرَّر من هنا: تُقرأ من جدول quota_settings في قاعدة البيانات. تعذّر التحقق (لا مفتاح، عطل، ردّ غير مفهوم) = null = 503. */
async function sbQuota(env,id){try{if(!env.SUPABASE_SERVICE_KEY||!/^[0-9a-f-]{36}$/i.test(String(id.uid))||!/^[0-9a-f-]{36}$/i.test(String(id.sid||'')))return id.sid?null:'auth';
 const r=await fetch(env.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/rpc/consume_quota_trusted',{method:'POST',headers:{'content-type':'application/json',apikey:env.SUPABASE_SERVICE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_KEY},body:JSON.stringify({p_uid:id.uid,p_sid:id.sid,p_bucket:'ai'})});
 if(!r.ok){let m='';try{m=(await r.json()).message||''}catch(e){}return/session revoked|not signed in/.test(m)?'auth':null}
 const j=await r.json();return j===true?true:j===false?false:null}catch(e){return null}}
export default{async fetch(req,env){
 const og=req.headers.get('Origin')||'',al=String(env.ALLOW_ORIGIN||'').split(',').map(x=>x.trim()).filter(Boolean),ok=!!og&&al.indexOf(og)>=0,H={'Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,OPTIONS','Content-Type':'application/json','Vary':'Origin','X-Content-Type-Options':'nosniff'};
 if(ok)H['Access-Control-Allow-Origin']=og;
 const ip=req.headers.get('CF-Connecting-IP')||'0';
 const hit=async(k,max,ttl)=>{const n=+(await env.STATE.get(k)||0);if(n>=max)return false;await env.STATE.put(k,String(n+1),{expirationTtl:ttl});return true};
 const hr=new Date().toISOString().slice(0,13),day=new Date().toISOString().slice(0,10);
 const J=(b,s=200)=>new Response(JSON.stringify(b),{status:s,headers:H});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:H});
 if(og&&!ok)return J({error:'origin'},403);

 const p0=new URL(req.url).pathname;
 const mode=env.AUTH_MODE||(env.SUPABASE_URL?'supabase':'transition'),legacyOn=env.LEGACY_SYNC!=='0';
 if((p0==='/api/register'||p0==='/api/login')&&req.method==='POST'){
  /* الحسابات القديمة: لا إنشاء جديد خارج وضع transition، ولا دخول قديم إطلاقًا عند LEGACY_SYNC=0 (الدخول يبقى متاحًا في وضع supabase ليستعيد صاحب الحساب القديم رمزه وينقل نسخته) */
  if(!legacyOn)return J({error:'legacy_disabled'},410);
  if(p0==='/api/register'&&mode!=='transition')return J({error:'registration_closed'},403);
  let b;try{b=await req.json()}catch(e){return J({error:'bad_json'},400)}
  const em=String(b.email||'').trim().toLowerCase(),pw=String(b.password||'');
  if(!/^\S+@\S+\.\S+$/.test(em)||em.length>120)return J({error:'bad_email'},400);
  if(pw.length<8||pw.length>200)return J({error:'weak_pw'},400);
  if(!(await hit('a:'+em+':'+hr,10,7200))||!(await hit('au:'+ip+':'+hr,p0==='/api/register'?5:20,7200)))return J({error:'rate'},429);
  const uk='u:'+em,u=await env.STATE.get(uk,'json');
  if(p0==='/api/register'){if(u)return J({error:'exists'},409);
   const salt=rnd(16),token=rnd(20);await env.STATE.put(uk,JSON.stringify({salt:salt,hash:await pbk(pw,salt),token:token}));await env.STATE.put('t:'+token,em);return J({token:token})}
  if(!u||(await pbk(pw,u.salt))!==u.hash)return J({error:'bad_creds'},401);
  await env.STATE.put('t:'+u.token,em);return J({token:u.token})}
 const bearer=(req.headers.get('Authorization')||'').replace(/^Bearer\s+/i,'');
 let id=null;if(bearer.split('.').length===3)id=await verifyJwt(bearer,env);else if(/^[a-z0-9]{20,64}$/i.test(bearer))id={kind:'legacy',tok:bearer};
 if(!id)return J({error:'bad_token'},401);
 if(id.kind==='legacy'&&!legacyOn)return J({error:'legacy_disabled'},410);
 const tok=id.tok||'',p=new URL(req.url).pathname;
 /* مسارات الحسابات القديمة: قراءة اللقطة للترحيل، تجميدها بعد الترحيل، حذفها. الكتابة العادية مسموحة فقط في وضع transition. */
 if(id.kind==='legacy'&&legacyOn&&(p==='/api/state'||p==='/api/migrated'||p==='/api/account/delete')){
  const k='s:'+tok,gone=await env.STATE.get('d:'+tok),frozen=await env.STATE.get('m:'+tok);
  if(p==='/api/account/delete'&&req.method==='POST'){
   let b;try{b=await req.json()}catch(e){return J({error:'bad_json'},400)}
   const em=String(b.email||'').trim().toLowerCase(),u=await env.STATE.get('u:'+em,'json');
   if(!(await hit('a:'+em+':'+hr,10,7200)))return J({error:'rate'},429);
   if(!u||u.token!==tok||(await pbk(String(b.password||''),u.salt))!==u.hash)return J({error:'bad_creds'},401);
   await env.STATE.delete('u:'+em);await env.STATE.delete(k);await env.STATE.delete('t:'+tok);await env.STATE.put('d:'+tok,String(Date.now()));return J({ok:1,deleted:['account','state']})}
  if(p==='/api/migrated'&&req.method==='POST'){if(gone)return J({error:'deleted'},410);await env.STATE.put('m:'+tok,String(Date.now()));return J({ok:1})}
  if(p==='/api/state'){
   if(req.method==='DELETE'){await env.STATE.delete(k);await env.STATE.put('d:'+tok,String(Date.now()));return J({ok:1,deleted:['state']})}
   if(gone)return J({error:'deleted'},410);
   if(req.method==='GET'){const v=await env.STATE.get(k);return v?new Response(v,{headers:H}):J({error:'none'},404)}
   if(req.method==='PUT'){if(frozen)return J({error:'migrated'},410);if(mode!=='transition')return J({error:'legacy_readonly'},403);
    const t=await req.text();if(t.length>900000)return J({error:'too_big'},413);let j;try{j=JSON.parse(t)}catch(e){return J({error:'bad_json'},400)}if(!j||!Array.isArray(j.plan))return J({error:'bad_state'},400);await env.STATE.put(k,t);return J({ok:1})}}}
 if(p==='/api/ai'&&req.method==='POST'){
  let b;try{b=await req.json()}catch(e){return J({error:'bad_json'},400)}
  if(b.image&&String(b.image).length>2000000)return J({error:'too_big'},413);
  if(id.kind==='sb'){const q=await sbQuota(env,id);if(q==='auth')return J({error:'session'},401);if(q===null)return J({error:'unavailable'},503);if(!q)return J({error:'rate'},429)}
  else{if(mode!=='transition')return J({error:'login_required'},401);
   /* وضع الانتقال (رموز قديمة بلا هوية): حدود تقريبية على KV وغير ذرّية؛ السقف اليومي الكلي هو الحماية الفعلية */
   if(!(await hit('r:'+tok+':'+hr,60,7200))||!(await hit('rip:'+ip+':'+hr,40,7200))||!(await hit('cap:'+day,+env.AI_DAILY_CAP||500,90000)))return J({error:'rate'},429)}
  const c=[];if(b.image)c.push({type:'image',source:{type:'base64',media_type:'image/jpeg',data:b.image}});
  c.push({type:'text',text:String(b.prompt||'').slice(0,8000)});
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:MODELS[b.tier]||MODELS.default,max_tokens:1500,messages:[{role:'user',content:c}]})});
  if(!r.ok)return J({error:'upstream'},502);
  const j=await r.json();return J({text:(j.content||[]).map(x=>x.text||'').join('')})}
 return J({error:'not_found'},404)}};
