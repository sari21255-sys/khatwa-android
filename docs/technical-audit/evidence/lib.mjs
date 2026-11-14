// بنية الاختبار: خادم ثابت للتطبيق + الوسيط الحقيقي بذاكرة KV + Anthropic وهمي قابل للتحكم
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
import W from '../../../worker/ai-proxy.js';
const require=createRequire(import.meta.url);
export const {chromium}=require(process.env.NODE_PATH?path.join(process.env.NODE_PATH,'playwright'):'playwright');
export const SITE=process.env.SITE||'/tmp/aud/site';
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.css':'text/css'};
export function staticServer(port){return new Promise(r=>{const s=http.createServer((q,res)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(SITE,p);if(!f.startsWith(SITE)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('nf')}res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(res)});s.listen(port,'127.0.0.1',()=>r(s))})}
export const MODE={ai:'ok',calls:[]};
const kv=()=>{const m=new Map();return{m,get:async(k,t)=>{const v=m.get(k);return v==null?null:(t==='json'?JSON.parse(v):v)},put:async(k,v)=>m.set(k,String(v))}};
export const KV=kv();
const realFetch=globalThis.fetch;
globalThis.fetch=async(u,o)=>{if(String(u).includes('api.anthropic.com')){const b=JSON.parse(o.body);const txt=JSON.stringify(b);MODE.calls.push(txt.slice(0,400));
 if(MODE.ai==='500')return new Response('boom',{status:500});
 const prompt=(b.messages&&b.messages[0]&&JSON.stringify(b.messages[0].content))||txt;
 let out;
 if(MODE.ai==='badjson')out='هذا ليس JSON إطلاقًا';
 else if(/ابنِ خطة تدريب/.test(prompt)){const m=prompt.match(/بنصها الحرفي: ([^.]*?)\./);const names=(m?m[1]:'').split('، ').filter(Boolean);const pick=MODE.ai==='unknown'?['تمرين وهمي 1','تمرين وهمي 2']:names.slice(0,5);out=JSON.stringify({name:'خطة اختبار',notes:'ملاحظات',days:[{day:0,title:'يوم اختبار',ex:pick.map(n=>({n,s:3,r:10}))},{day:2,title:'يوم ثان',ex:pick.slice(0,3).map(n=>({n,s:4,r:8}))}]})}
 else if(/اختر من قائمة التمارين/.test(prompt)){out=JSON.stringify({names:['سكوات']})}
 else out=JSON.stringify({ok:1});
 return new Response(JSON.stringify({content:[{type:'text',text:out}]}),{status:200})}
 return realFetch(u,o)};
export function workerServer(port,origin){const env={STATE:KV,ANTHROPIC_API_KEY:'k',ALLOW_ORIGIN:origin,AI_DAILY_CAP:'1000'};
 return new Promise(r=>{const s=http.createServer(async(q,res)=>{const ch=[];q.on('data',c=>ch.push(c));q.on('end',async()=>{try{const req=new Request('http://w'+q.url,{method:q.method,headers:q.headers,body:['GET','HEAD'].includes(q.method)?undefined:Buffer.concat(ch)});const rr=await W.fetch(req,env);const h={};rr.headers.forEach((v,k)=>h[k]=v);res.writeHead(rr.status,h);res.end(Buffer.from(await rr.arrayBuffer()))}catch(e){res.writeHead(500);res.end(String(e))}})});s.listen(port,'127.0.0.1',()=>r(s))})}
export const results=[];
export const rec=(id,name,ok,evidence,sev)=>{results.push({id,name,result:ok===null?'NOT RUN':ok?'PASS':'FAIL',evidence,severity:ok?'':sev||'P2'});console.log((ok===null?'SKIP ':ok?'PASS ':'FAIL ')+id+' '+name+' — '+evidence)};
