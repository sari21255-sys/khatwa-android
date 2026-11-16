/* لوحة «اختصاراتي» الجانبية: مقبض يسار، سحب متدرّج، فتح/إغلاق، تعديل (حذف، إضافة، ترتيب). بيانات اصطناعية. */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let fail=0,pass=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
const X=p=>p.evaluate(()=>+getComputedStyle(document.querySelector('.sjdw')).getPropertyValue('--x'));
(async()=>{const b=await chromium.launch();const p=await(await b.newContext({viewport:{width:390,height:844}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
 await p.goto('file://'+file);await p.waitForTimeout(400);await p.evaluate(()=>{S.prof.ob=1;S.prof.name='م';save();render()});await p.waitForTimeout(200);
 const h=await p.evaluate(()=>{const r=document.querySelector('.sjdh').getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2,r.x]});
 ok(h[2]<=1&&await X(p)===0,'المقبض ظاهر على الحافة اليسرى واللوحة مغلقة');
 await p.mouse.move(h[0],h[1]);await p.mouse.down();await p.mouse.move(h[0]+60,h[1]);await p.mouse.move(h[0]+110,h[1]);
 const mid=await X(p);ok(mid>60&&mid<200,'اللوحة تتبع الإصبع أثناء السحب',mid);
 await p.mouse.up();await p.waitForTimeout(700);const op=await X(p);ok(op>250,'تُكمل الفتح عند تجاوز منتصف المسافة',op);
 await p.click('.sjdw [data-a=dwed]');await p.click('.sjdw [data-a=scdel]');const n1=await p.evaluate(()=>scList().length);ok(n1===5,'حذف اختصار',n1);
 await p.click('.sjdw [data-a=dwpick]');await p.click('.sjdw [data-a=dwadd]');ok(await p.evaluate(()=>scList().length)===6,'إضافة اختصار');
 const f=await p.evaluate(()=>scList()[0]);await p.click('.sjdw [data-a=scmv][data-d="1"]');ok(await p.evaluate(()=>scList()[1])===f,'تغيير الترتيب');
 await p.click('.sjdw [data-a=dwed]');await p.click('.sjdw .dt');await p.waitForTimeout(700);ok(await X(p)===0,'اختيار اختصار يغلق اللوحة وينتقل');
 await p.mouse.move(h[0],h[1]);await p.mouse.down();await p.mouse.move(h[0]+30,h[1]);await p.waitForTimeout(120);await p.mouse.move(h[0]+40,h[1]);await p.waitForTimeout(120);await p.mouse.up();await p.waitForTimeout(700);ok(await X(p)===0,'سحب قصير يعيد اللوحة مغلقة');
 ok(er.length===0,'لا أخطاء سكربت',er.join('|'));
 await b.close();console.log(pass+' ناجح، '+fail+' فاشل');process.exit(fail?1:0)})();
