/* يملأ صفحتي الخصوصية وحذف الحساب من إعدادات التطبيق الفعلية (config.js) فلا تقول الصفحة إلا ما هو مفعّل.
   عناصر data-need="sb|sync|ai|mail" تظهر عند ضبط الخدمة؛ عناصر data-miss="..." تظهر عند عدم ضبطها. */
(function(){
 var c=window.APP_CONFIG||{},has={sb:!!(c.sbUrl&&c.sbKey),sync:!!c.syncUrl,ai:!!c.aiUrl,mail:/^\S+@\S+\.\S+$/.test(c.supportEmail||'')};
 [].forEach.call(document.querySelectorAll('[data-need]'),function(e){if(!has[e.getAttribute('data-need')])e.hidden=true});
 [].forEach.call(document.querySelectorAll('[data-miss]'),function(e){if(has[e.getAttribute('data-miss')])e.hidden=true});
 [].forEach.call(document.querySelectorAll('.em'),function(a){if(has.mail){a.textContent=c.supportEmail;a.href='mailto:'+c.supportEmail}else{a.hidden=true}});
 [].forEach.call(document.querySelectorAll('.nomail'),function(e){if(has.mail)e.hidden=true});
})();
