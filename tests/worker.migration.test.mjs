// node tests/worker.migration.test.mjs — قبول ترحيل المزامنة القديمة: قراءة النسخة القديمة، التجميد، رفض الكتابة والذكاء بالرمز القديم، LEGACY_SYNC=0. وسيط حقيقي + KV وSupabase وهميان. بيانات اصطناعية.
import W from '../worker/ai-proxy.js';
import crypto from 'node:crypto';
let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'  ok   ':'  FAIL ')+m)};
const kv=()=>{const m=new Map();return{get:async(k,t)=>{const v=m.get(k);return v==null?null:(t==='json'?JSON.parse(v):v)},put:async(k,v)=>m.set(k,String(v)),delete:async k=>{m.delete(k)}}};
const SB='https://proj.supabase.test',UID='aaaaaaaa-0000-4000-8000-000000000001',UID2='aaaaaaaa-0000-4000-8000-000000000002';
const SID1='11111111-1111-4111-8111-000000000001',SID2='11111111-1111-4111-8111-000000000002';
const b64=o=>Buffer.from(typeof o==='string'?o:JSON.stringify(o)).toString('base64url');
const {publicKey,privateKey}=crypto.generateKeyPairSync('ec',{namedCurve:'P-256'});const other=crypto.generateKeyPairSync('ec',{namedCurve:'P-256'});
const jwk={...publicKey.export({format:'jwk'}),kid:'k1',alg:'ES256',use:'sig'};
const sign=(claims,{key=privateKey,kid='k1',alg='ES256'}={})=>{const h=b64({alg,kid,typ:'JWT'}),p=b64(claims),d=h+'.'+p;return d+'.'+crypto.sign('sha256',Buffer.from(d),{key,dsaEncoding:'ieee-p1363'}).toString('base64url')};
const now=()=>Math.floor(Date.now()/1000);
const claims=(o={})=>({sub:UID,aud:'authenticated',role:'authenticated',iss:SB+'/auth/v1',exp:now()+3600,session_id:SID1,...o});
// Supabase وهمي: JWKS + consume_quota ذرّي بعدّاد في الذاكرة + إبطال جلسات + عطل اختياري
const S={cfg:{user:3,global:100},seen:[],cnt:{},glob:0,revoked:new Set(),down:false,calls:0,hs:null};
globalThis.fetch=async(url,o={})=>{url=String(url);
 if(url.endsWith('/.well-known/jwks.json'))return new Response(JSON.stringify({keys:[jwk]}));
 if(url.includes('/rest/v1/rpc/consume_quota_trusted')){S.calls++;S.seen.push({url,h:o.headers,body:o.body});if(S.down)throw new Error('down');
  if((o.headers.Authorization||'')!=='Bearer svc-key'||o.headers.apikey!=='svc-key')return new Response(JSON.stringify({message:'permission denied'}),{status:403});
  const b=JSON.parse(o.body);if(S.revoked.has(b.p_sid))return new Response(JSON.stringify({message:'session revoked'}),{status:403});
  const n=S.cnt[b.p_uid]||0;if(n>=S.cfg.user||S.glob>=S.cfg.global)return new Response('false');
  S.cnt[b.p_uid]=n+1;S.glob++;return new Response('true')}
 if(url.includes('/rpc/consume_quota'))return new Response(JSON.stringify({message:'function not found'}),{status:404});
 return new Response(JSON.stringify({content:[{text:'مرحبا'}]}))};
const env=(o={})=>({STATE:kv(),ANTHROPIC_API_KEY:'k',ALLOW_ORIGIN:'https://app.example',SUPABASE_URL:SB,SUPABASE_ANON_KEY:'anon',SUPABASE_SERVICE_KEY:'svc-key',...o});
const call=(e,path,{method='GET',body,tok,origin='https://app.example',ip='1.1.1.1'}={})=>W.fetch(new Request('https://w.test'+path,{method,headers:{Origin:origin,'CF-Connecting-IP':ip,...(tok?{Authorization:'Bearer '+tok}:{})},body:body?JSON.stringify(body):undefined}),e);
const ai=(e,tok)=>call(e,'/api/ai',{method:'POST',tok,body:{prompt:'x'}});

const jwt=()=>sign(claims());
// 1) نشر قديم (transition): مستخدم قديم يسجّل ويرفع لقطة
const kvs=kv();const old=env({AUTH_MODE:'transition',STATE:kvs});
let r=await call(old,'/api/register',{method:'POST',body:{email:'legacy@test.co',password:'longenough1'}});const LT=(await r.json()).token;
r=await call(old,'/api/state',{method:'PUT',tok:LT,body:{plan:[1],ts:5,bw:{'2026-09-09':80}}});ok(r.status===200,'تجهيز: لقطة قديمة مرفوعة بوضع transition');
r=await call(old,'/api/ai',{method:'POST',tok:LT,body:{prompt:'x'}});ok(r.status===200,'تجهيز: transition يسمح بالذكاء بالرمز القديم (هذا ما نغلقه بالنشر الموصى به)');
// 2) النشر الموصى به: AUTH_MODE=supabase (الافتراضي) مع بقاء مسارات الترحيل، ونفس KV
const sbm=env({STATE:kvs});
r=await call(sbm,'/api/state',{tok:LT});const snap=r.status===200?await r.json():null;ok(r.status===200&&snap&&snap.bw&&snap.bw['2026-09-09']===80,'(supabase) قراءة النسخة القديمة للترحيل تعمل ببياناتها');
r=await call(sbm,'/api/login',{method:'POST',body:{email:'legacy@test.co',password:'longenough1'},ip:'3.3.3.3'});ok(r.status===200&&(await r.json()).token===LT,'(supabase) صاحب الحساب القديم يسترجع رمزه بالبريد وكلمة المرور ليرحّل نسخته');
r=await call(sbm,'/api/register',{method:'POST',body:{email:'new@test.co',password:'longenough1'},ip:'4.4.4.4'});ok(r.status===403,'(supabase) لا إنشاء حسابات قديمة جديدة (403 registration_closed)');
// 3) الترحيل إلى حساب موثّق: الذكاء يعمل بالهوية الجديدة، ولا يعمل بالرمز القديم
r=await ai(sbm,jwt());ok(r.status===200,'(supabase) الحساب الموثّق (JWT) يستعمل الذكاء');
r=await ai(sbm,LT);ok(r.status===401,'(supabase) الذكاء بالرمز القديم مرفوض 401');
r=await call(sbm,'/api/state',{method:'PUT',tok:LT,body:{plan:[1],ts:6}});ok(r.status===403,'(supabase) كتابة قديمة قبل التجميد مرفوضة 403 legacy_readonly');
// 4) تأكيد التجميد
r=await call(sbm,'/api/migrated',{method:'POST',tok:LT});ok(r.status===200,'(supabase) تأكيد التجميد بعد الترحيل');
r=await call(sbm,'/api/state',{method:'PUT',tok:LT,body:{plan:[1],ts:7}});ok(r.status===410,'(supabase) كتابة بعد التجميد = 410');
r=await call(sbm,'/api/state',{tok:LT});ok(r.status===200,'(supabase) القراءة تبقى متاحة بعد التجميد (للتراجع)');
r=await ai(sbm,LT);ok(r.status===401,'(supabase) الذكاء بالرمز المجمَّد مرفوض');
// 5) حذف النسخة القديمة يعمل في وضع supabase
r=await call(sbm,'/api/account/delete',{method:'POST',tok:LT,body:{email:'legacy@test.co',password:'longenough1'}});ok(r.status===200,'(supabase) حذف الحساب القديم ونسخته');
r=await call(sbm,'/api/state',{tok:LT});ok(r.status===410,'(supabase) بعد الحذف: 410');
// 6) AUTH_MODE غير محدد مع SUPABASE_URL = supabase (الافتراضي آمن)
{const e2=env({STATE:kv()});r=await ai(e2,'abcdefghij0123456789abcdefghij012345');ok(r.status===401,'الافتراضي مع SUPABASE_URL: الرمز القديم للذكاء مرفوض')}
// 7) إيقاف المسارات القديمة LEGACY_SYNC=0
{const k2=kv();const o2=env({AUTH_MODE:'transition',STATE:k2});r=await call(o2,'/api/register',{method:'POST',body:{email:'z@test.co',password:'longenough1'},ip:'5.5.5.5'});const ZT=(await r.json()).token;await call(o2,'/api/state',{method:'PUT',tok:ZT,body:{plan:[1],ts:1}});
 const off=env({STATE:k2,LEGACY_SYNC:'0'});
 r=await call(off,'/api/state',{tok:ZT});ok(r.status===410,'(LEGACY_SYNC=0) قراءة النسخة القديمة 410 legacy_disabled');
 r=await call(off,'/api/state',{method:'PUT',tok:ZT,body:{plan:[1],ts:2}});ok(r.status===410,'(LEGACY_SYNC=0) الكتابة القديمة 410');
 r=await call(off,'/api/migrated',{method:'POST',tok:ZT});ok(r.status===410,'(LEGACY_SYNC=0) التجميد 410');
 r=await ai(off,ZT);ok(r.status===410,'(LEGACY_SYNC=0) الذكاء بالرمز القديم 410');
 r=await call(off,'/api/login',{method:'POST',body:{email:'z@test.co',password:'longenough1'},ip:'6.6.6.6'});ok(r.status===410,'(LEGACY_SYNC=0) الدخول القديم 410');
 r=await call(off,'/api/register',{method:'POST',body:{email:'y@test.co',password:'longenough1'},ip:'7.7.7.7'});ok(r.status===410,'(LEGACY_SYNC=0) التسجيل القديم 410');
 r=await ai(off,jwt());ok(r.status===200,'(LEGACY_SYNC=0) الحسابات الموثّقة لا تتأثر');
 // حتى مع transition: LEGACY_SYNC=0 يغلق الذكاء بالرمز القديم
 const offT=env({STATE:k2,LEGACY_SYNC:'0',AUTH_MODE:'transition'});r=await ai(offT,ZT);ok(r.status===410,'(transition + LEGACY_SYNC=0) الذكاء بالرمز القديم مغلق أيضًا');
 const back=env({STATE:k2});r=await call(back,'/api/state',{tok:ZT});ok(r.status===200,'إعادة LEGACY_SYNC للوضع الافتراضي تعيد القراءة (البيانات لم تُحذف)')}
console.log('\n'+pass+' ناجح، '+fail+' فاشل');process.exit(fail?1:0);
