// Supabase وهمي للاختبار: مصادقة بسيطة + PostgREST rpc يمرّ إلى دوال Postgres الحقيقية (supabase/migrations/p1_sync.sql) عبر psql.
// المتغير PSQL: أمر psql كامل، مثل:  psql -h localhost -U postgres -d t1 -q -At   (يجب أن تكون القاعدة محمّلة بـ00_mock_supabase.sql وmigrations/p1_sync.sql)
import http from 'node:http';import cp from 'node:child_process';import crypto from 'node:crypto';
const PSQL=process.env.PSQL;if(!PSQL)throw new Error('PSQL env required');
const sh=(sql)=>cp.spawnSync('bash',['-c',PSQL],{input:'\\set ON_ERROR_STOP on\n'+sql,encoding:'utf8',maxBuffer:50e6});
const lit=v=>v===null||v===undefined?'NULL':typeof v==='number'?String(v):typeof v==='boolean'?String(v):typeof v==='string'?"'"+v.replace(/'/g,"''")+"'":'$q$'+JSON.stringify(v)+'$q$::jsonb';
export const dbq=sql=>{const r=sh(sql);if(r.status)throw new Error(r.stderr);return r.stdout.trim()};
export function startMock(port){
 const users=new Map(),toks=new Map(),refs=new Map();let fail=null,log=[],confirmMode=false;const sent=[];
 const issue=(u,sid)=>{const a='at.'+crypto.randomBytes(12).toString('hex'),rf='rt.'+crypto.randomBytes(12).toString('hex');toks.set(a,{uid:u.id,sid});refs.set(rf,{uid:u.id,sid});return{access_token:a,refresh_token:rf,expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user:{id:u.id,email:u.email}}};
 const newSession=u=>{const sid=crypto.randomUUID();dbq(`insert into auth.sessions(id,user_id) values('${sid}','${u.id}')`);return issue(u,sid)};
 const srv=http.createServer((q,res)=>{const ch=[];q.on('data',c=>ch.push(c));q.on('end',()=>{try{
  const H={'Content-Type':'application/json','Access-Control-Allow-Origin':q.headers.origin||'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'*'};
  const J=(b,s=200)=>{res.writeHead(s,H);res.end(JSON.stringify(b))};
  if(q.method==='OPTIONS'){res.writeHead(204,H);return res.end()}
  let b={};try{b=JSON.parse(Buffer.concat(ch).toString()||'{}')}catch(e){}
  const u=new URL(q.url,'http://x'),p=u.pathname;log.push(q.method+' '+p);
  if(fail&&p.startsWith('/rest/')){if(fail==='drop'){return q.destroy()}return J({message:'down'},fail==='503'?503:500)}
  if(p==='/auth/v1/signup'){const em=String(b.email||'').toLowerCase();if(users.has(em))return J({msg:'User already registered'},400);const id=crypto.randomUUID();dbq(`insert into auth.users(id) values('${id}')`);const us={id,email:em,pw:b.password,ok:!confirmMode};users.set(em,us);if(confirmMode){sent.push({t:'signup',email:em,rd:u.searchParams.get('redirect_to')});return J({id,email:em,confirmation_sent_at:new Date().toISOString()})}return J(newSession(us))}
  if(p==='/auth/v1/token'){const g=u.searchParams.get('grant_type');
   if(g==='password'){const us=users.get(String(b.email||'').toLowerCase());if(!us||us.pw!==b.password)return J({msg:'Invalid login credentials'},400);if(us.ok===false)return J({msg:'Email not confirmed'},400);return J(newSession(us))}
   if(g==='refresh_token'){const r=refs.get(b.refresh_token);if(!r)return J({msg:'Invalid Refresh Token'},400);const ex=dbq(`select count(*) from auth.sessions where id='${r.sid}'`);if(ex==='0')return J({msg:'Invalid Refresh Token: Session Expired'},400);return J(issue({id:r.uid,email:[...users.values()].find(x=>x.id===r.uid)?.email},r.sid))}}
  if(p==='/auth/v1/recover'){sent.push({t:'recover',email:String(b.email||'').toLowerCase(),rd:u.searchParams.get('redirect_to')});return J({})}
  if(p==='/auth/v1/resend'){sent.push({t:'resend',email:String(b.email||'').toLowerCase(),rd:u.searchParams.get('redirect_to')});return J({})}
  if(p==='/auth/v1/user'){const t=toks.get((q.headers.authorization||'').slice(7));if(!t)return J({msg:'invalid JWT'},401);const us=[...users.values()].find(x=>x.id===t.uid);
   if(q.method==='PUT'){if(b.password){if(String(b.password).length<6)return J({msg:'Password should be at least 6 characters'},422);us.pw=b.password}return J({id:us.id,email:us.email})}
   return J({id:us.id,email:us.email,email_confirmed_at:us.ok===false?null:'2026-01-01T00:00:00Z'})}
  if(p==='/auth/v1/logout'){const t=toks.get((q.headers.authorization||'').slice(7));if(t)dbq(`delete from auth.sessions where id='${t.sid}'`);return J({})}
  if(p.startsWith('/rest/v1/rpc/')){const fn=p.split('/').pop(),t=toks.get((q.headers.authorization||'').slice(7));
   if(!t)return J({message:'JWT invalid'},401);
   if(!/^[a-z_]+$/.test(fn))return J({message:'bad fn'},404);
   const args=Object.entries(b).map(([k,v])=>`${k} => ${lit(v)}`).join(', ');
   const claims=JSON.stringify({sub:t.uid,session_id:t.sid}).replace(/'/g,"''");
   const sql=`set role authenticated;\nselect set_config('request.uid','${t.uid}',false),set_config('request.jwt.claims','${claims}',false) \\g /dev/null\nselect public.${fn}(${args});`;
   const r=sh(sql);
   if(r.status){const m=(r.stderr.match(/ERROR:\s+(.*)/)||[])[1]||'error';return J({message:m},/session revoked|not signed in|permission denied/.test(m)?403:400)}
   const out=r.stdout.trim().split('\n').filter(Boolean).pop()||'null';
   try{return J(JSON.parse(out==='t'?'true':out==='f'?'false':out))}catch(e){return res.writeHead(200,H),res.end('null')}}
  J({message:'not found'},404)}catch(e){res.writeHead(500,{'content-type':'application/json'});res.end(JSON.stringify({message:String(e.message||e).slice(0,300)}))}})});
 const link=(email,type)=>{const us=users.get(email.toLowerCase());const s=newSession(us);return 'access_token='+s.access_token+'&refresh_token='+s.refresh_token+'&expires_in=3600&expires_at='+s.expires_at+'&token_type=bearer&type='+type};
 return new Promise(r=>srv.listen(port,'127.0.0.1',()=>r({url:'http://127.0.0.1:'+port,close:()=>srv.close(),setFail:m=>{fail=m},setConfirm:v=>{confirmMode=v},confirmUser:em=>{users.get(em.toLowerCase()).ok=true},link,sent,log,users,toks})))}
