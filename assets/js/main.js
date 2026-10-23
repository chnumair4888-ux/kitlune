(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const cards = Array.from(document.querySelectorAll('.tool-card[data-category]'));
  const input = $('#tool-search'), form = $('#tool-search-form'), tabs = Array.from(document.querySelectorAll('.filter[data-filter]')), empty = $('#empty-state'), status = $('#search-status');
  let category = 'all';
  function filter(){if(!input)return;const q=input.value.trim().toLocaleLowerCase();let count=0;cards.forEach(card=>{const text=`${card.dataset.search||''} ${card.textContent||''}`.toLocaleLowerCase();const show=(category==='all'||card.dataset.category===category)&&(!q||text.includes(q));card.hidden=!show;if(show)count++});if(empty)empty.hidden=count!==0;if(status)status.textContent=q||category!=='all'?`${count} ${count===1?'tool':'tools'} found`:''}
  function setCategory(value){category=value;tabs.forEach(tab=>{const active=tab.dataset.filter===value;tab.classList.toggle('active',active);tab.setAttribute('aria-pressed',String(active))});filter()}
  if(input){input.addEventListener('input',filter);const initial=new URLSearchParams(location.search).get('q');if(initial)input.value=initial.slice(0,150)}
  if(form)form.addEventListener('submit',event=>{event.preventDefault();const url=new URL(location.href),q=input.value.trim();if(q)url.searchParams.set('q',q);else url.searchParams.delete('q');history.replaceState({},'',url);filter();$('#tools')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});
  tabs.forEach(tab=>tab.addEventListener('click',()=>setCategory(tab.dataset.filter||'all')));document.querySelectorAll('[data-filter-link]').forEach(link=>link.addEventListener('click',()=>setCategory(link.dataset.filterLink||'all')));const initialCategory=new URLSearchParams(location.search).get('category');if(initialCategory==='file'||initialCategory==='finance')setCategory(initialCategory);$('#reset-search')?.addEventListener('click',()=>{if(input)input.value='';const url=new URL(location.href);url.searchParams.delete('q');history.replaceState({},'',url);setCategory('all');input?.focus()});

  const nav=$('#nav')||document.querySelector('.header .nav');
  if(nav&&!nav.id)nav.id='nav';
  if(nav&&!nav.querySelector('a[href="/blog/"]')){const guideLink=document.createElement('a');guideLink.href='/blog/';guideLink.textContent='Guides';const about=nav.querySelector('a[href="/about/"]');nav.insertBefore(guideLink,about||nav.firstChild)}
  document.querySelectorAll('.footer-col').forEach(col=>{if(/explore/i.test(col.querySelector('h2')?.textContent||'')&&!col.querySelector('a[href="/blog/"]')){const link=document.createElement('a');link.href='/blog/';link.textContent='Guides';col.append(link)}});
  const guideMap={
    '/image-compressor/':[['/blog/compress-image-to-100kb-on-phone/','Compress an image to about 100 KB on your phone'],['/blog/jpg-vs-png-vs-webp/','JPG vs PNG vs WebP: which format to use']],
    '/word-counter/':[['/blog/word-count-reading-time-essays/','Count words and estimate reading time for essays'],['/blog/check-word-limits-essays-applications/','Check word limits for essays and applications']],
    '/jpg-to-pdf/':[['/blog/jpg-photos-to-one-pdf/','Turn JPG photos into one PDF'],['/blog/scan-documents-phone-clean-pdf/','Scan documents with your phone and make a clean PDF']],
    '/merge-pdf/':[['/blog/merge-pdf-on-phone/','Merge PDF files on your phone']],
    '/loan-calculator/':[['/blog/how-emi-is-calculated/','How EMI is calculated with a worked example'],['/blog/longer-loan-term-total-interest/','How a longer loan term changes total interest']],
    '/compound-interest/':[['/blog/compound-interest-explained/','Compound interest explained with numbers'],['/blog/rule-of-72-explained/','The Rule of 72 explained and its limits']],
    '/savings-goal/':[['/blog/plan-savings-goal-monthly-deposits/','Plan a savings goal with monthly deposits'],['/blog/compound-interest-explained/','Understand compound growth with numbers']]
  };
  const mappedGuides=guideMap[location.pathname],prose=document.querySelector('.tool-guide .prose');
  if(mappedGuides&&prose)mappedGuides.forEach(([href,label])=>{if(!prose.querySelector(`a[href="${href}"]`)){const p=document.createElement('p');p.className='tool-related-guide';const strong=document.createElement('strong');strong.textContent='Helpful guide: ';const link=document.createElement('a');link.href=href;link.textContent=label;p.append(strong,link);prose.append(p)}});

  const article=document.querySelector('.article-shell');
  const articleTools={
    '/blog/compress-image-to-100kb-on-phone/':['/image-compressor/','Image Compressor'],
    '/blog/merge-pdf-on-phone/':['/merge-pdf/','Merge PDF'],
    '/blog/how-emi-is-calculated/':['/loan-calculator/','Loan / EMI Calculator'],
    '/blog/compound-interest-explained/':['/compound-interest/','Compound Interest Calculator'],
    '/blog/word-count-reading-time-essays/':['/word-counter/','Word Counter'],
    '/blog/jpg-photos-to-one-pdf/':['/jpg-to-pdf/','JPG to PDF'],
    '/blog/jpg-vs-png-vs-webp/':['/image-compressor/','Image Compressor'],
    '/blog/scan-documents-phone-clean-pdf/':['/jpg-to-pdf/','JPG to PDF'],
    '/blog/longer-loan-term-total-interest/':['/loan-calculator/','Loan / EMI Calculator'],
    '/blog/plan-savings-goal-monthly-deposits/':['/savings-goal/','Savings Goal Calculator'],
    '/blog/rule-of-72-explained/':['/compound-interest/','Compound Interest Calculator'],
    '/blog/check-word-limits-essays-applications/':['/word-counter/','Word Counter']
  };
  const articleTool=articleTools[location.pathname];
  if(article&&nav){let menuButton=$('#menu-toggle');if(!menuButton){menuButton=document.createElement('button');menuButton.className='icon-btn menu-toggle';menuButton.id='menu-toggle';menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-controls','nav');menuButton.setAttribute('aria-label','Open navigation');menuButton.textContent='☰';nav.parentNode.insertBefore(menuButton,nav)}
    if(!article.querySelector('.breadcrumbs')){const title=article.querySelector('h1')?.textContent||'Guide';const crumb=document.createElement('nav');crumb.className='breadcrumbs';crumb.setAttribute('aria-label','Breadcrumb');crumb.innerHTML='<a href="/">Home</a><span>›</span><a href="/blog/">Guides</a><span>›</span><span aria-current="page"></span>';crumb.lastElementChild.textContent=title;article.insertBefore(crumb,article.firstChild)}
    if(articleTool&&!article.querySelector('.related-tool')){const [href,label]=articleTool;const box=document.createElement('aside');box.className='related-tool';const copy=document.createElement('div');copy.innerHTML='<strong>Related tool</strong><p>Use the matching Kitlune tool for this task.</p>';const link=document.createElement('a');link.className='btn primary';link.href=href;link.textContent=`Open ${label}`;box.append(copy,link);const meta=article.querySelector('.article-meta');meta?.after(box)}
    const cta=article.querySelector('.article-cta');if(cta&&articleTool&&!cta.querySelector('.btn')){const [href,label]=articleTool;const old=cta.querySelector(`a[href="${href}"]`);if(old)old.closest('p')?.remove();const p=document.createElement('p');p.textContent='Use the matching Kitlune tool when you are ready.';const btn=document.createElement('a');btn.className='btn primary';btn.href=href;btn.textContent=`Open ${label}`;cta.append(p,btn)}
  }
  const menuButton=$('#menu-toggle');function closeMenu(){nav?.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');menuButton?.setAttribute('aria-label','Open navigation')}
  if(menuButton&&nav){menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();menuButton.focus()}});document.addEventListener('click',e=>{if(!nav.contains(e.target)&&!menuButton.contains(e.target))closeMenu()});window.addEventListener('resize',()=>{if(innerWidth>760)closeMenu()})}
  const year=$('#current-year');if(year)year.textContent=String(new Date().getFullYear());const notice=$('#cookie-notice'),dismiss=$('#cookie-dismiss'),cookieSettings=$('#cookie-settings');if(notice&&dismiss){dismiss.addEventListener('click',()=>{notice.hidden=true});cookieSettings?.addEventListener('click',()=>{notice.hidden=false;dismiss.focus()})}const copyEmail=$('#copy-email'),copyEmailStatus=$('#copy-email-status');if(copyEmail&&copyEmailStatus)copyEmail.addEventListener('click',async()=>{const email='contact@kitlune.site';try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(email);else{const temporary=document.createElement('textarea');temporary.value=email;temporary.setAttribute('readonly','');temporary.style.position='fixed';temporary.style.opacity='0';document.body.append(temporary);temporary.select();const copied=document.execCommand('copy');temporary.remove();if(!copied)throw new Error('Copy unavailable')}copyEmailStatus.textContent='Email address copied.'}catch(_){copyEmailStatus.textContent='Copy was blocked by your browser. You can select the email address and copy it manually.'}});filter();
})();