// theme.js - dark/light mode; inline script in head.html handles initial apply.
(function () {
  'use strict';

  const STORAGE_KEY = 'jekyll-theme';
  const DARK = 'dark';
  const LIGHT = 'light';
  const ATTR = 'data-theme';

  function applyTheme(theme) {
    if (theme !== DARK && theme !== LIGHT) return;
    document.documentElement.setAttribute(ATTR, theme);
    const metaColor = document.getElementById('meta-theme-color');
    if (metaColor) metaColor.setAttribute('content', theme === DARK ? '#0f1117' : '#f8fafc');
    document.dispatchEvent(new CustomEvent('theme-changed', { detail: theme }));
  }

  function updateButtons(theme) {
    const isDark = theme === DARK;
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-checked', String(isDark));
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute(ATTR) || LIGHT;
    const next = current === DARK ? LIGHT : DARK;
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {}
    updateButtons(next);
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateButtons(document.documentElement.getAttribute(ATTR) || LIGHT);

    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      if (btn.dataset.themeBound) return;
      btn.dataset.themeBound = '1';
      btn.addEventListener('click', toggleTheme);
    });

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        var stored;
        try {
          stored = localStorage.getItem(STORAGE_KEY);
        } catch (e2) {}
        if (!stored) {
          const theme = e.matches ? DARK : LIGHT;
          applyTheme(theme);
          updateButtons(theme);
        }
      });
    }
  });
})();
