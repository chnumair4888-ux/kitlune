(() => {
  'use strict';
  const root = document.documentElement;
  const key = 'kitlune-theme';
  const button = document.getElementById('theme-toggle');
  const meta = document.querySelector('meta[name="theme-color"]');
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  function saved() { try { const v = localStorage.getItem(key); return v === 'dark' || v === 'light' ? v : null; } catch (_) { return null; } }
  function setTheme(value) {
    const theme = value === 'dark' ? 'dark' : 'light';
    root.dataset.theme = theme;
    if (meta) meta.content = theme === 'dark' ? '#0F0F10' : '#FAFAF8';
    if (button) { const next = theme === 'dark' ? 'light' : 'dark'; button.setAttribute('aria-label', `Switch to ${next} mode`); button.title = `Switch to ${next} mode`; }
  }
  setTheme(saved() || (media.matches ? 'dark' : 'light'));
  if (button) button.addEventListener('click', () => { const next = root.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(next); try { localStorage.setItem(key, next); } catch (_) {} });
  if (media.addEventListener) media.addEventListener('change', e => { if (!saved()) setTheme(e.matches ? 'dark' : 'light'); });
})();
