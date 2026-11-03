/* Cloudflare Worker: وسيط للذكاء الاصطناعي + مزامنة الحالة + حسابات (تسجيل/دخول).
   المتغيرات: ANTHROPIC_API_KEY (Secret)، STATE (KV)، ALLOW_ORIGIN (قائمة نطاقات مفصولة بفاصلة)، AI_DAILY_CAP (سقف طلبات الذكاء اليومي الكلي، الافتراضي 500).
   ملاحظة: حدود المعدل على KV تقريبية (القراءة ثم الكتابة غير ذرّية)؛ السقف اليومي الكلي هو الحماية الفعلية للتكلفة. PBKDF2 مثبّت على 100,000 دورة لأنه الحد الأقصى في Workers. */
const MODELS={default:'claude-sonnet-5-5',fast:'claude-haiku-5-5'};
const hex=b=>[...new Uint8Array(b)].map(x=>('0'+x.toString(16)).slice(-2)).join('');
const rnd=n=>hex(crypto.getRandomValues(new Uint8Array(n)));
async function pbk(pw,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:100000},k,256))}
export default{async fetch(req,env){
 const og=req.headers.get('Origin')||'',al=String(env.ALLOW_ORIGIN||'').split(',').map(x=>x.trim()).filter(Boolean),ok=al.indexOf('*')>=0||al.indexOf(og)>=0,H={'Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,PUT,POST,OPTIONS','Content-Type':'application/json','Vary':'Origin','X-Content-Type-Options':'nosniff'};
 if(ok)H['Access-Control-Allow-Origin']=al.indexOf('*')>=0?'*':og;
 const ip=req.headers.get('CF-Connecting-IP')||'0';
 const hit=async(k,max,ttl)=>{const n=+(await env.STATE.get(k)||0);if(n>=max)return false;await env.STATE.put(k,String(n+1),{expirationTtl:ttl});return true};
 const hr=new Date().toISOString().slice(0,13),day=new Date().toISOString().slice(0,10);
 const J=(b,s=200)=>new Response(JSON.stringify(b),{status:s,headers:H});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:H});
 if(og&&!ok)return J({error:'origin'},403);

 const p0=new URL(req.url).pathname;
 if((p0==='/api/register'||p0==='/api/login')&&req.method==='POST'){
  let b;try{b=await req.json()}catch(e){return J({error:'bad_json'},400)}
  const em=String(b.email||'').trim().toLowerCase(),pw=String(b.password||'');
  if(!/^\S+@\S+\.\S+$/.test(em)||em.length>120)return J({error:'bad_email'},400);
  if(pw.length<8||pw.length>200)return J({error:'weak_pw'},400);
  if(!(await hit('a:'+em+':'+hr,10,7200))||!(await hit('au:'+ip+':'+hr,p0==='/api/register'?5:20,7200)))return J({error:'rate'},429);
  const uk='u:'+em,u=await env.STATE.get(uk,'json');
  if(p0==='/api/register'){if(u)return J({error:'exists'},409);
   const salt=rnd(16),token=rnd(20);await env.STATE.put(uk,JSON.stringify({salt:salt,hash:await pbk(pw,salt),token:token}));return J({token:token})}
  if(!u||(await pbk(pw,u.salt))!==u.hash)return J({error:'bad_creds'},401);
  return J({token:u.token})}
 const tok=(req.headers.get('Authorization')||'').replace(/^Bearer\s+/i,'');
 if(!/^[a-z0-9]{20,64}$/i.test(tok))return J({error:'bad_token'},401);
 const p=new URL(req.url).pathname;
 if(p==='/api/state'){const k='s:'+tok;
  if(req.method==='GET'){const v=await env.STATE.get(k);return v?new Response(v,{headers:H}):J({error:'none'},404)}
  if(req.method==='PUT'){const t=await req.text();if(t.length>900000)return J({error:'too_big'},413);let j;try{j=JSON.parse(t)}catch(e){return J({error:'bad_json'},400)}if(!j||!Array.isArray(j.plan))return J({error:'bad_state'},400);await env.STATE.put(k,t);return J({ok:1})}}
 if(p==='/api/ai'&&req.method==='POST'){
  let b;try{b=await req.json()}catch(e){return J({error:'bad_json'},400)}
  if(b.image&&String(b.image).length>2000000)return J({error:'too_big'},413);
  if(!(await hit('r:'+tok+':'+hr,60,7200))||!(await hit('rip:'+ip+':'+hr,40,7200))||!(await hit('cap:'+day,+env.AI_DAILY_CAP||500,90000)))return J({error:'rate'},429);
  const c=[];if(b.image)c.push({type:'image',source:{type:'base64',media_type:'image/jpeg',data:b.image}});
  c.push({type:'text',text:String(b.prompt||'').slice(0,8000)});
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:MODELS[b.tier]||MODELS.default,max_tokens:1500,messages:[{role:'user',content:c}]})});
  if(!r.ok)return J({error:'upstream'},502);
  const j=await r.json();return J({text:(j.content||[]).map(x=>x.text||'').join('')})}
 return J({error:'not_found'},404)}};
