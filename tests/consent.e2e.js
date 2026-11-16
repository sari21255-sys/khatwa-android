/* موافقة الذكاء الاصطناعي: لا إرسال قبل الموافقة، الرفض لا يعطّل التطبيق، الموافقة تُحفظ، وتُسحب من الإعدادات. بيانات اصطناعية.
   تشغيل: NODE_PATH=$(npm root -g) node tests/consent.e2e.js [مسار index.html] */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let pass=0,fail=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const calls=[];await p.route('http://ai.test/**',async r=>{calls.push({auth:r.request().headers().authorization,body:r.request().postData()});await r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({text:'{"ok":1}'})})});
 await p.goto('file://'+file);await p.waitForTimeout(600);
 await p.evaluate(()=>{CFG.aiUrl='http://ai.test/api/ai';if(!SM){SM=proxySample();SMI=true}S.prof.ob=1;S.prof.name='مختبر';S.prof.goalType='lose';S.prof.startW=80;S.bw[TD()]=80;save();render()});
 ok(await p.evaluate(()=>typeof SM!=='undefined'&&!!SM),'الذكاء الاصطناعي مُعدّ (aiUrl) لكن لا موافقة محفوظة');
 ok(!await p.evaluate(()=>aiOk()),'لا موافقة قبل أول استخدام');
 /* 1) أول طلب: تظهر الموافقة ولا يخرج أي طلب */
 await p.evaluate(()=>{window.R1=aiJson('اقترح وجبة. وزني 80 كغ وهدفي خسارة وزن').then(v=>({v}),e=>({e:e&&e.code}))});await p.waitForTimeout(300);
 ok(!!await p.$('#ai-consent'),'تظهر شاشة الموافقة قبل الإرسال');
 const t=await p.evaluate(()=>document.querySelector('#ai-consent').innerText);
 ok(/Anthropic/.test(t)&&/اقترح وجبة/.test(t)&&/وزني 80/.test(t),'تبيّن الجهة وتعرض النص الذي سيُرسل بحرفه');
 ok(!!await p.$('#ai-consent a[href="privacy.html"]'),'رابط سياسة الخصوصية');
 ok(calls.length===0,'لم يخرج أي طلب قبل الموافقة');
 /* 2) الرفض */
 await p.click('#ai-no');await p.waitForTimeout(200);
 const r1=await p.evaluate(()=>window.R1);ok(r1.e==='consent_declined','الرفض يُرجع consent_declined');
 ok(calls.length===0&&!await p.$('#ai-consent'),'بعد الرفض: لا طلب ولا نافذة');
 ok(await p.evaluate(()=>aiErr({code:'consent_declined'}).includes('تستطيع مواصلة استخدام التطبيق')),'رسالة الرفض تقول إن التطبيق يستمر');
 await p.evaluate(()=>{S.tab='food';S.sub=null;render();S.tab='train';render();S.tab='dash';render()});
 ok(await p.evaluate(()=>!!document.querySelector('#nav'))&&errs.length===0,'التطبيق يعمل بعد الرفض (تنقّل بين التبويبات بلا أخطاء)');
 ok(!await p.evaluate(()=>aiOk()),'الرفض لا يحفظ موافقة');
 /* 3) الموافقة */
 await p.evaluate(()=>{window.R2=aiJson('ملخص أسبوعي').then(v=>({v}),e=>({e:e&&e.code}))});await p.waitForTimeout(300);
 await p.click('#ai-yes');await p.waitForTimeout(400);
 const r2=await p.evaluate(()=>window.R2);ok(r2.v&&r2.v.ok===1,'بعد الموافقة يُرسل الطلب ويصل الرد');
 ok(calls.length===1&&/ملخص أسبوعي/.test(calls[0].body||''),'طلب واحد فقط يحمل النص',JSON.stringify(calls).slice(0,300));
 ok(await p.evaluate(()=>aiOk()),'الموافقة محفوظة');
 await p.evaluate(()=>{window.R3=aiJson('سؤال ثانٍ').then(v=>({v}),e=>({e:e&&e.code}))});await p.waitForTimeout(300);
 ok(!await p.$('#ai-consent')&&calls.length===2,'الطلب التالي لا يسأل مجددًا');
 /* 4) سحب الموافقة من الإعدادات */
 await p.evaluate(()=>{S.tab='me';S.sub='set';UI.sgo={acc:true,dat:true};render()});await p.waitForTimeout(200);
await p.evaluate(()=>{UI.sgo=Object.assign({},UI.sgo,{dat:true});render()});
 ok(!!await p.$('#ai-row [data-a=aiwd]'),'صف «الذكاء الاصطناعي» في الإعدادات مع «سحب الموافقة»');
 await p.click('#ai-row [data-a=aiwd]');await p.waitForTimeout(200);
 ok(!await p.evaluate(()=>aiOk()),'سُحبت الموافقة');
 await p.evaluate(()=>{window.R4=aiJson('بعد السحب').then(v=>({v}),e=>({e:e&&e.code}))});await p.waitForTimeout(300);
 ok(!!await p.$('#ai-consent')&&calls.length===2,'بعد السحب تعود الموافقة ولا يُرسل شيء');
 await p.screenshot({path:path.join(__dirname,'../docs/ux/evidence/impl/ai-consent-390.png')});
 await p.click('#ai-no');
 /* 5) الصورة */
 await p.evaluate(()=>{window.R5=SM.json('حلّل صورة وجبتي',{images:['data:image/png;base64,AAAA']}).then(v=>({v}),e=>({e:e&&e.code}))});await p.waitForTimeout(300);
 ok(/مع الصورة/.test(await p.evaluate(()=>(document.querySelector('#ai-consent')||{innerText:''}).innerText)),'عند وجود صورة تُذكر صراحةً');
 await p.click('#ai-no');
 ok(errs.length===0,'لا أخطاء صفحة',errs.join('|'));
 await b.close();console.log(`\n${pass} ناجح، ${fail} فاشل`);process.exit(fail?1:0)})();
