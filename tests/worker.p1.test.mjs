// node tests/worker.p1.test.mjs — هوية Supabase في الوسيط: توقيعات JWT، الحصص الذرّية، الترحيل والحذف للحسابات القديمة. كل البيانات اصطناعية.
import W from '../worker/ai-proxy.js';
import crypto from 'node:crypto';
let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'  ok   ':'  FAIL ')+m)};
const kv=()=>{const m=new Map();return{get:async(k,t)=>{const v=m.get(k);return v==null?null:(t==='json'?JSON.parse(v):v)},put:async(k,v)=>m.set(k,String(v)),delete:async k=>{m.delete(k)}}};
const SB='https://proj.supabase.test',UID='aaaaaaaa-0000-4000-8000-000000000001',UID2='aaaaaaaa-0000-4000-8000-000000000002';
const b64=o=>Buffer.from(typeof o==='string'?o:JSON.stringify(o)).toString('base64url');
const {publicKey,privateKey}=crypto.generateKeyPairSync('ec',{namedCurve:'P-256'});const other=crypto.generateKeyPairSync('ec',{namedCurve:'P-256'});
const jwk={...publicKey.export({format:'jwk'}),kid:'k1',alg:'ES256',use:'sig'};
const sign=(claims,{key=privateKey,kid='k1',alg='ES256'}={})=>{const h=b64({alg,kid,typ:'JWT'}),p=b64(claims),d=h+'.'+p;return d+'.'+crypto.sign('sha256',Buffer.from(d),{key,dsaEncoding:'ieee-p1363'}).toString('base64url')};
const now=()=>Math.floor(Date.now()/1000);
const claims=(o={})=>({sub:UID,aud:'authenticated',role:'authenticated',iss:SB+'/auth/v1',exp:now()+3600,session_id:'s1',...o});
// Supabase وهمي: JWKS + consume_quota ذرّي بعدّاد في الذاكرة + إبطال جلسات + عطل اختياري
const S={cnt:{},glob:0,revoked:new Set(),down:false,calls:0,hs:null};
globalThis.fetch=async(url,o={})=>{url=String(url);
 if(url.endsWith('/.well-known/jwks.json'))return new Response(JSON.stringify({keys:[jwk]}));
 if(url.includes('/rest/v1/rpc/consume_quota')){S.calls++;if(S.down)throw new Error('down');
  const tok=(o.headers.Authorization||'').slice(7),pl=JSON.parse(Buffer.from(tok.split('.')[1],'base64url').toString());
  if(S.revoked.has(pl.session_id))return new Response(JSON.stringify({message:'session revoked'}),{status:403});
  const b=JSON.parse(o.body);const n=S.cnt[pl.sub]||0;if(n>=b.p_max)return new Response('false');if(b.p_global_max&&S.glob>=b.p_global_max)return new Response('false');
  S.cnt[pl.sub]=n+1;S.glob++;return new Response('true')}
 return new Response(JSON.stringify({content:[{text:'مرحبا'}]}))};
const env=(o={})=>({STATE:kv(),ANTHROPIC_API_KEY:'k',ALLOW_ORIGIN:'https://app.example',SUPABASE_URL:SB,SUPABASE_ANON_KEY:'anon',AI_USER_DAILY:'3',AI_DAILY_CAP:'100',...o});
const call=(e,path,{method='GET',body,tok,origin='https://app.example',ip='1.1.1.1'}={})=>W.fetch(new Request('https://w.test'+path,{method,headers:{Origin:origin,'CF-Connecting-IP':ip,...(tok?{Authorization:'Bearer '+tok}:{})},body:body?JSON.stringify(body):undefined}),e);
const ai=(e,tok)=>call(e,'/api/ai',{method:'POST',tok,body:{prompt:'x'}});
let e=env(),r;
// توقيعات وادّعاءات
r=await ai(e,sign(claims()));ok(r.status===200,'JWT صالح (ES256 عبر JWKS) يُقبل');
r=await ai(e,sign(claims({exp:now()-10})));ok(r.status===401,'JWT منتهي = 401');
r=await ai(e,sign(claims(),{key:other.privateKey}));ok(r.status===401,'JWT موقّع بمفتاح آخر = 401');
r=await ai(e,sign(claims({iss:'https://evil.test/auth/v1'})));ok(r.status===401,'مُصدِر مختلف = 401');
r=await ai(e,sign(claims({aud:'other'})));ok(r.status===401,'جمهور مختلف = 401');
r=await ai(e,sign(claims({role:'anon'})));ok(r.status===401,'دور anon = 401');
r=await ai(e,sign(claims({sub:'not-a-uuid'})));ok(r.status===401,'sub غير صالح = 401');
{const h=b64({alg:'none',typ:'JWT'}),p=b64(claims());r=await ai(e,h+'.'+p+'.');ok(r.status===401,'alg=none = 401')}
{const h=b64({alg:'HS256',kid:'k1'}),p=b64(claims()),d=h+'.'+p;const sig=crypto.createHmac('sha256',JSON.stringify(jwk)).update(d).digest('base64url');r=await ai(e,d+'.'+sig);ok(r.status===401,'هجوم خلط الخوارزمية (HS256 بالمفتاح العام) = 401')}
r=await ai(e,sign(claims(),{kid:'unknown'}));ok(r.status===401,'kid غير معروف = 401');
{const e2=env({SUPABASE_JWT_SECRET:'s3cret-for-test'});const mk=(sec,c)=>{const h=b64({alg:'HS256',typ:'JWT'}),p=b64(c),d=h+'.'+p;return d+'.'+crypto.createHmac('sha256',sec).update(d).digest('base64url')};
 r=await ai(e2,mk('s3cret-for-test',claims()));ok(r.status===200,'HS256 بالسرّ المضبوط يُقبل');r=await ai(e2,mk('wrong',claims()));ok(r.status===401,'HS256 بسرّ خاطئ = 401')}
// رمز الوسيط القديم لا يعطي هوية في وضع supabase
r=await ai(e,'abcdefghij0123456789abcdefghij012345');ok(r.status===401,'رمز قديم بلا هوية لا يُقبل للذكاء في وضع supabase');
r=await call(e,'/api/state',{method:'PUT',tok:'abcdefghij0123456789abcdefghij012345',body:{plan:[1]}});ok(r.status===403,'الكتابة بالرمز القديم محظورة في وضع supabase (للقراءة والترحيل فقط)');
// حصص: حد المستخدم 3، مستخدم آخر لا يتأثر، جلسة مُبطلة، عطل الخدمة = إغلاق عند الفشل
S.cnt={};S.glob=0;const t1=sign(claims()),t2=sign(claims({sub:UID2,session_id:'s2'}));
const c1=[];for(let i=0;i<5;i++)c1.push((await ai(e,t1)).status);ok(c1.join()==='200,200,200,429,429','حد المستخدم اليومي 3 ثم 429 ('+c1+')');
r=await ai(e,t2);ok(r.status===200,'مستخدم آخر لا يتأثر بحد الأول');
S.revoked.add('s1');r=await ai(e,sign(claims({exp:now()+7200})));ok(r.status===401,'جلسة مُبطلة (تسجيل خروج/حذف حساب) = 401 رغم صلاحية التوقيع');
S.down=true;r=await ai(e,t2);ok(r.status===503,'تعذّر الوصول لـSupabase = 503 (إغلاق عند الفشل، لا استهلاك مجاني)');S.down=false;
// طلبات متزامنة: الوسيط لا يضيف عدًّا غير ذرّي فوق الحد الذرّي (الحد الفعلي في Postgres)
S.cnt={};S.glob=0;{const res=await Promise.all(Array.from({length:30},()=>ai(e,sign(claims({sub:UID2,session_id:'s2'})))));ok(res.filter(x=>x.status===200).length===3&&res.filter(x=>x.status===429).length===27,'30 طلبًا متزامنًا: 3 مقبولة فقط')}
// الحد الكلي
S.cnt={};S.glob=0;{const e3=env({AI_DAILY_CAP:'2',AI_USER_DAILY:'50'});const cs=[];for(const u of [UID,UID2,'aaaaaaaa-0000-4000-8000-000000000003'])cs.push((await ai(e3,sign(claims({sub:u,session_id:'s'+u})))).status);ok(cs.join()==='200,200,429','السقف الكلي (2) يوقف المستخدم الثالث ('+cs+')')}
// وضع الانتقال بلا Supabase: الرمز القديم يعمل كما كان
{const e4={STATE:kv(),ANTHROPIC_API_KEY:'k',ALLOW_ORIGIN:'https://app.example'};r=await ai(e4,'abcdefghij0123456789abcdefghij012345');ok(r.status===200,'بلا SUPABASE_URL: وضع الانتقال يقبل الرمز القديم (توافق خلفي)')}
// الحسابات القديمة: ترحيل، تجميد، حذف، منع إعادة رفع القديمة
const L='legacytokenlegacytoken12345678';const e5=env({AUTH_MODE:'transition'});
r=await call(e5,'/api/register',{method:'POST',body:{email:'old@test.co',password:'longenough1'}});const reg=await r.json();const LT=reg.token;
r=await call(e5,'/api/state',{method:'PUT',tok:LT,body:{plan:[1],ts:5}});ok(r.status===200,'(انتقال) رفع لقطة قديمة');
r=await call(e5,'/api/migrated',{method:'POST',tok:LT});ok(r.status===200,'تجميد اللقطة بعد الترحيل');
r=await call(e5,'/api/state',{method:'PUT',tok:LT,body:{plan:[1],ts:9}});ok(r.status===410,'جهاز قديم لا يستطيع الكتابة بعد الترحيل = 410');
r=await call(e5,'/api/state',{tok:LT});ok(r.status===200,'القراءة تبقى متاحة بعد التجميد (للتراجع)');
r=await call(e5,'/api/account/delete',{method:'POST',tok:LT,body:{email:'old@test.co',password:'wrongpass12'}});ok(r.status===401,'حذف الحساب القديم بكلمة مرور خاطئة = 401');
r=await call(e5,'/api/account/delete',{method:'POST',tok:LT,body:{email:'other@test.co',password:'longenough1'}});ok(r.status===401,'حذف حساب بريد آخر برمزي = 401');
r=await call(e5,'/api/account/delete',{method:'POST',tok:LT,body:{email:'old@test.co',password:'longenough1'}});ok(r.status===200,'حذف الحساب القديم ونسخته بالبريد وكلمة المرور');
r=await call(e5,'/api/account/delete',{method:'POST',tok:LT,body:{email:'old@test.co',password:'longenough1'}});ok(r.status===410||r.status===401,'إعادة طلب الحذف آمنة (لا خطأ خادم): '+r.status);
r=await call(e5,'/api/state',{tok:LT});ok(r.status===410,'بعد الحذف: القراءة 410');
r=await call(e5,'/api/state',{method:'PUT',tok:LT,body:{plan:[1],ts:99}});ok(r.status===410,'جهاز قديم لا يعيد رفع النسخة المحذوفة = 410');
r=await call(e5,'/api/login',{method:'POST',body:{email:'old@test.co',password:'longenough1'}});ok(r.status===401,'الحساب المحذوف لا يدخل');
// حذف اللقطة وحدها (الحساب يبقى) ثم إعادة الطلب
r=await call(e5,'/api/register',{method:'POST',body:{email:'two@test.co',password:'longenough1'},ip:'2.2.2.2'});const T2=(await r.json()).token;
await call(e5,'/api/state',{method:'PUT',tok:T2,body:{plan:[1],ts:1}});
r=await call(e5,'/api/state',{method:'DELETE',tok:T2});ok(r.status===200,'DELETE /api/state يحذف اللقطة');
r=await call(e5,'/api/state',{method:'DELETE',tok:T2});ok(r.status===200,'تكرار DELETE آمن');
r=await call(e5,'/api/state',{method:'PUT',tok:T2,body:{plan:[1],ts:2}});ok(r.status===410,'لا إعادة رفع بعد حذف اللقطة');
r=await call(e5,'/api/state',{tok:'zzzzzzzzzz0123456789zzzzzzzzzz'});ok(r.status===404,'رمز آخر لا يرى لقطة غيره');
console.log('\n'+pass+' ناجح، '+fail+' فاشل');process.exit(fail?1:0);
