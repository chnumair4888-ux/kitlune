(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const cards = Array.from(document.querySelectorAll('.tool-card[data-category]'));
  const input = $('#tool-search');
  const form = $('#tool-search-form');
  const tabs = Array.from(document.querySelectorAll('.filter[data-filter]'));
  const empty = $('#empty-state');
  const status = $('#search-status');
  let category = 'all';
  function filter() {
    if (!input) return;
    const q = input.value.trim().toLocaleLowerCase(); let count = 0;
    cards.forEach(card => {
      const text = `${card.dataset.search || ''} ${card.textContent || ''}`.toLocaleLowerCase();
      const show = (category === 'all' || card.dataset.category === category) && (!q || text.includes(q));
      card.hidden = !show; if (show) count++;
    });
    if (empty) empty.hidden = count !== 0;
    if (status) status.textContent = q || category !== 'all' ? `${count} ${count === 1 ? 'tool' : 'tools'} found` : '';
  }
  function setCategory(value) { category = value; tabs.forEach(tab => { const active = tab.dataset.filter === value; tab.classList.toggle('active', active); tab.setAttribute('aria-pressed', String(active)); }); filter(); }
  if (input) {
    input.addEventListener('input', filter);
    const initial = new URLSearchParams(location.search).get('q'); if (initial) input.value = initial.slice(0, 150);
  }
  if (form) form.addEventListener('submit', event => { event.preventDefault(); const url = new URL(location.href); const q = input.value.trim(); if (q) url.searchParams.set('q', q); else url.searchParams.delete('q'); history.replaceState({}, '', url); filter(); $('#tools')?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); });
  tabs.forEach(tab => tab.addEventListener('click', () => setCategory(tab.dataset.filter || 'all')));
  document.querySelectorAll('[data-filter-link]').forEach(link => link.addEventListener('click', () => { setCategory(link.dataset.filterLink || 'all'); }));
  const initialCategory = new URLSearchParams(location.search).get('category');
  if (initialCategory === 'file' || initialCategory === 'finance') setCategory(initialCategory);
  $('#reset-search')?.addEventListener('click', () => { if (input) input.value = ''; const url = new URL(location.href); url.searchParams.delete('q'); history.replaceState({}, '', url); setCategory('all'); input?.focus(); });

  // Keep Guides discoverable across existing pages without changing tool behavior.
  const nav = $('#nav');
  if (nav && !nav.querySelector('a[href="/blog/"]')) {
    const guideLink = document.createElement('a');
    guideLink.href = '/blog/'; guideLink.textContent = 'Guides';
    const about = nav.querySelector('a[href="/about/"]');
    nav.insertBefore(guideLink, about || nav.firstChild);
  }
  document.querySelectorAll('.footer-col').forEach(col => {
    if (/explore/i.test(col.querySelector('h2')?.textContent || '') && !col.querySelector('a[href="/blog/"]')) {
      const link = document.createElement('a'); link.href = '/blog/'; link.textContent = 'Guides'; col.append(link);
    }
  });
  const guideMap = {
    '/image-compressor/': ['/blog/compress-image-to-100kb-on-phone/', 'Guide: compress an image to about 100 KB on your phone'],
    '/word-counter/': ['/blog/word-count-reading-time-essays/', 'Guide: count words and estimate reading time for essays'],
    '/jpg-to-pdf/': ['/blog/jpg-photos-to-one-pdf/', 'Guide: turn JPG photos into one PDF'],
    '/merge-pdf/': ['/blog/merge-pdf-on-phone/', 'Guide: merge PDF files on your phone'],
    '/loan-calculator/': ['/blog/how-emi-is-calculated/', 'Guide: how EMI is calculated with a worked example'],
    '/compound-interest/': ['/blog/compound-interest-explained/', 'Guide: compound interest explained with numbers'],
    '/savings-goal/': ['/blog/compound-interest-explained/', 'Guide: understand compound growth before planning a savings goal']
  };
  const mappedGuide = guideMap[location.pathname];
  const prose = document.querySelector('.tool-guide .prose');
  if (mappedGuide && prose && !prose.querySelector(`a[href="${mappedGuide[0]}"]`)) {
    const p = document.createElement('p');
    p.className = 'tool-related-guide';
    const strong = document.createElement('strong'); strong.textContent = 'Helpful guide: ';
    const link = document.createElement('a'); link.href = mappedGuide[0]; link.textContent = mappedGuide[1].replace(/^Guide: /, '');
    p.append(strong, link); prose.append(p);
  }

  const menuButton = $('#menu-toggle');
  function closeMenu() { nav?.classList.remove('open'); menuButton?.setAttribute('aria-expanded', 'false'); menuButton?.setAttribute('aria-label', 'Open navigation'); }
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => { const open = nav.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); menuButton.focus(); } });
    document.addEventListener('click', e => { if (!nav.contains(e.target) && !menuButton.contains(e.target)) closeMenu(); });
    window.addEventListener('resize', () => { if (innerWidth > 760) closeMenu(); });
  }
  const year = $('#current-year'); if (year) year.textContent = String(new Date().getFullYear());
  const notice = $('#cookie-notice'); const dismiss = $('#cookie-dismiss'); const cookieSettings = $('#cookie-settings');
  if (notice && dismiss) { dismiss.addEventListener('click', () => { notice.hidden = true; }); cookieSettings?.addEventListener('click', () => { notice.hidden = false; dismiss.focus(); }); }
  const copyEmail = $('#copy-email');
  const copyEmailStatus = $('#copy-email-status');
  if (copyEmail && copyEmailStatus) copyEmail.addEventListener('click', async () => {
    const email = 'contact@kitlune.site';
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(email);
      else {
        const temporary = document.createElement('textarea');
        temporary.value = email; temporary.setAttribute('readonly', '');
        temporary.style.position = 'fixed'; temporary.style.opacity = '0';
        document.body.append(temporary); temporary.select();
        const copied = document.execCommand('copy'); temporary.remove();
        if (!copied) throw new Error('Copy unavailable');
      }
      copyEmailStatus.textContent = 'Email address copied.';
    } catch (_) {
      copyEmailStatus.textContent = 'Copy was blocked by your browser. You can select the email address and copy it manually.';
    }
  });
  filter();
})();
