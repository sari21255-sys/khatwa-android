// node tests/worker.test.mjs  — اختبار الوسيط بذاكرة KV وهمية وAnthropic وهمي
import W from '../worker/ai-proxy.js';
let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'  ok   ':'  FAIL ')+m)};
const kv=()=>{const m=new Map();return{get:async(k,t)=>{const v=m.get(k);return v==null?null:(t==='json'?JSON.parse(v):v)},put:async(k,v)=>m.set(k,String(v))}};
const env=(o={})=>({STATE:kv(),ANTHROPIC_API_KEY:'k',ALLOW_ORIGIN:'https://app.example',AI_DAILY_CAP:'3',...o});
globalThis.fetch=async()=>new Response(JSON.stringify({content:[{text:'مرحبا'}]}),{status:200});
const call=(e,path,{method='GET',body,tok,origin='https://app.example',ip='1.1.1.1'}={})=>W.fetch(new Request('https://w.test'+path,{method,headers:{'Origin':origin,'CF-Connecting-IP':ip,...(tok?{Authorization:'Bearer '+tok}:{}),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}),e);
const T='abcdefghij0123456789abcdefghij012345';
let e=env();
let r=await call(e,'/api/state',{method:'GET'});ok(r.status===401,'بلا رمز = 401');
r=await call(e,'/api/state',{tok:'short'});ok(r.status===401,'رمز قصير = 401');
r=await call(e,'/api/state',{tok:T});ok(r.status===404,'حالة غير موجودة = 404');
r=await call(e,'/api/state',{method:'PUT',tok:T,body:{x:1}});ok(r.status===400,'حالة بلا خطة تُرفض');
r=await call(e,'/api/state',{method:'PUT',tok:T,body:{plan:[1]}});ok(r.status===200,'حالة صالحة تُحفظ');
r=await call(e,'/api/state',{tok:'z'+T.slice(1)});ok(r.status===404,'رمز آخر لا يرى حالتي');
r=await call(e,'/api/state',{tok:T,origin:'https://evil.example'});ok(r.status===403,'نطاق غير مسموح = 403');
r=await call(e,'/api/state',{tok:T});ok(r.headers.get('Access-Control-Allow-Origin')==='https://app.example','ترويسة CORS للنطاق المسموح فقط');
r=await call(e,'/api/register',{method:'POST',body:{email:'a@b.co',password:'short'}});ok(r.status===400,'كلمة مرور ضعيفة تُرفض');
r=await call(e,'/api/register',{method:'POST',body:{email:'a@b.co',password:'longenough1'}});const reg=await r.json();ok(r.status===200&&reg.token,'تسجيل ناجح');
r=await call(e,'/api/register',{method:'POST',body:{email:'a@b.co',password:'longenough1'},ip:'9.9.9.9'});ok(r.status===409,'بريد مكرر = 409');
r=await call(e,'/api/login',{method:'POST',body:{email:'a@b.co',password:'wrongpass12'}});ok(r.status===401,'كلمة مرور خاطئة = 401');
r=await call(e,'/api/login',{method:'POST',body:{email:'a@b.co',password:'longenough1'}});ok((await r.json()).token===reg.token,'دخول صحيح');
let blocked=0;for(let i=0;i<8;i++){const x=await call(e,'/api/register',{method:'POST',body:{email:'u'+i+'@b.co',password:'longenough1'},ip:'7.7.7.7'});if(x.status===429)blocked++}
ok(blocked>=3,'حد التسجيل لكل IP (حُجب '+blocked+' من 8)');
// AI: سقف يومي كلي = 3 ولو بأرقام IP ورموز مختلفة
e=env();let codes=[];for(let i=0;i<6;i++){const x=await call(e,'/api/ai',{method:'POST',tok:'t'+String(i).padStart(2,'0')+T.slice(3),ip:'10.0.0.'+i,body:{prompt:'hi'}});codes.push(x.status)}
ok(codes.filter(c=>c===200).length===3&&codes.filter(c=>c===429).length===3,'السقف اليومي الكلي يوقف الاستهلاك بعد 3 رغم تغيّر الرمز وIP ('+codes+')');
e=env({AI_DAILY_CAP:'1000'});codes=[];for(let i=0;i<45;i++){const x=await call(e,'/api/ai',{method:'POST',tok:'q'+String(i).padStart(2,'0')+T.slice(3),ip:'5.5.5.5',body:{prompt:'hi'}});codes.push(x.status)}
ok(codes.filter(c=>c===200).length===40,'حد لكل IP يعمل ('+codes.filter(c=>c===200).length+' نجح)');
r=await call(env(),'/api/ai',{method:'POST',tok:T,body:{prompt:'x',image:'a'.repeat(2100000)}});ok(r.status===413,'صورة أكبر من الحد = 413');
console.log('\n'+pass+' ناجح، '+fail+' فاشل');process.exit(fail?1:0);
