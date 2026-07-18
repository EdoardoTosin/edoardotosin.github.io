// command-palette.js - Cmd/Ctrl+K command palette. Self-contained IIFE.
(function () {
  'use strict';

  const palette = document.getElementById('cmd-palette');
  const input = document.getElementById('cmd-input');
  const results = document.getElementById('cmd-results');
  if (!palette || !input || !results) return;
  if (!palette.showModal) return;

  const rawBase = (palette.getAttribute('data-base-url') || '').replace(/\/$/, '');
  const BASE = rawBase === '' || /^https?:\/\//i.test(rawBase) ? rawBase : '';

  const PAGES = [
    { label: 'Home', url: BASE + '/', icon: 'home' },
    { label: 'Blog', url: BASE + '/blog/', icon: 'blog' },
    { label: 'Topics', url: BASE + '/topics/', icon: 'topic' },
    { label: 'Projects', url: BASE + '/projects/', icon: 'project' },
    { label: 'About', url: BASE + '/about/', icon: 'about' },
    { label: 'Archive', url: BASE + '/archive/', icon: 'archive' },
    { label: 'Now', url: BASE + '/now/', icon: 'now' },
    { label: 'Gallery', url: BASE + '/gallery/', icon: 'gallery' },
    { label: 'Contact', url: BASE + '/contact/', icon: 'contact' },
  ];

  const ACTIONS = [
    { label: 'Toggle theme', id: 'toggle-theme', icon: 'theme' },
    { label: 'Toggle high contrast', id: 'toggle-contrast', icon: 'contrast' },
    { label: 'Toggle reduced motion', id: 'toggle-motion', icon: 'motion' },
  ];

  let posts = null;
  let isOpen = false;
  let activeIdx = -1;
  let lastFocused = null;

  function getFocusable() {
    return Array.from(palette.querySelectorAll('input,button,[tabindex]:not([tabindex="-1"])')).filter(function (el) {
      return !el.disabled;
    });
  }

  function open() {
    // One modal at a time; clicking the close button runs search.js cleanup that a bare close() would skip
    const searchOverlay = document.getElementById('search-overlay');
    if (searchOverlay && searchOverlay.open) {
      const searchClose = document.getElementById('search-close');
      if (searchClose) searchClose.click();
      else searchOverlay.close();
    }
    isOpen = true;
    lastFocused = document.activeElement;
    palette.showModal();
    document.body.style.overflow = 'hidden';
    input.value = '';
    input.focus();
    render('');
    if (posts === null) loadPosts();
  }

  function close() {
    isOpen = false;
    palette.close();
    document.body.style.overflow = '';
    activeIdx = -1;
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function loadPosts() {
    fetch(BASE + '/search.json')
      .then(function (r) {
        return r.ok ? r.json() : [];
      })
      .then(function (data) {
        posts = Array.isArray(data) ? data : [];
        if (isOpen) render(input.value);
      })
      .catch(function () {
        posts = [];
      });
  }

  function filterPosts(q) {
    if (!posts || !q) return [];
    const lq = q.toLowerCase();
    const scored = [];
    posts.forEach(function (p) {
      let s = 0;
      if ((p.title || '').toLowerCase().includes(lq)) s += 10;
      if ((p.topic || '').toLowerCase().includes(lq)) s += 6;
      if ((p.description || '').toLowerCase().includes(lq)) s += 3;
      if (
        (p.tags || []).some(function (t) {
          return t.toLowerCase().includes(lq);
        })
      )
        s += 4;
      if (s > 0) scored.push({ p: p, s: s });
    });
    scored.sort(function (a, b) {
      return b.s - a.s;
    });
    return scored.slice(0, 6).map(function (x) {
      return x.p;
    });
  }

  const ICONS = {
    home: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    blog: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>',
    topic:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>',
    project:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>',
    about:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    archive:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',
    now: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    gallery:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    contact:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>',
    theme:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    post: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
    contrast:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 0 0 0-12v12z"/></svg>',
    motion:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  };

  function esc(s) {
    return String(s).replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function render(q) {
    q = (q || '').trim();
    const lq = q.toLowerCase();
    const matchedActions = q
      ? ACTIONS.filter(function (a) {
          return a.label.toLowerCase().includes(lq);
        })
      : ACTIONS;
    const matchedPages = q
      ? PAGES.filter(function (p) {
          return p.label.toLowerCase().includes(lq);
        })
      : PAGES;
    const matchedPosts = filterPosts(q);
    let html = '';

    if (matchedActions.length) {
      html +=
        '<div class="cmd-palette__group" role="group" aria-label="Actions"><p class="cmd-palette__group-label" aria-hidden="true">Actions</p>';
      matchedActions.forEach(function (a) {
        html +=
          '<button class="cmd-palette__item" type="button" data-action="' +
          esc(a.id) +
          '" role="option" aria-selected="false">' +
          '<span class="cmd-palette__item-icon" aria-hidden="true">' +
          (ICONS[a.icon] || '') +
          '</span>' +
          '<span class="cmd-palette__item-label">' +
          esc(a.label) +
          '</span>' +
          '</button>';
      });
      html += '</div>';
    }

    if (matchedPages.length) {
      html +=
        '<div class="cmd-palette__group" role="group" aria-label="Navigate"><p class="cmd-palette__group-label" aria-hidden="true">Navigate</p>';
      matchedPages.forEach(function (p) {
        html +=
          '<button class="cmd-palette__item" type="button" data-url="' +
          esc(p.url) +
          '" role="option" aria-selected="false">' +
          '<span class="cmd-palette__item-icon" aria-hidden="true">' +
          (ICONS[p.icon] || '') +
          '</span>' +
          '<span class="cmd-palette__item-label">' +
          esc(p.label) +
          '</span>' +
          '</button>';
      });
      html += '</div>';
    }

    if (q) {
      if (posts === null) {
        html +=
          '<div class="cmd-palette__group"><p class="cmd-palette__group-label" aria-hidden="true">Posts</p><p class="cmd-palette__empty">Loading…</p></div>';
      } else if (matchedPosts.length) {
        html +=
          '<div class="cmd-palette__group" role="group" aria-label="Posts"><p class="cmd-palette__group-label" aria-hidden="true">Posts</p>';
        matchedPosts.forEach(function (p) {
          const topic = p.topic
            ? '<span class="cmd-palette__item-tag" data-topic="' + esc(p.topic) + '">' + esc(p.topic) + '</span>'
            : '';
          const date = p.date ? '<span class="cmd-palette__item-date">' + esc(p.date) + '</span>' : '';
          html +=
            '<button class="cmd-palette__item cmd-palette__item--post" type="button" data-url="' +
            esc(p.url || '') +
            '" role="option" aria-selected="false">' +
            '<span class="cmd-palette__item-icon" aria-hidden="true">' +
            ICONS.post +
            '</span>' +
            '<span class="cmd-palette__item-body">' +
            '<span class="cmd-palette__item-label">' +
            esc(p.title || '') +
            '</span>' +
            '<span class="cmd-palette__item-meta">' +
            topic +
            date +
            '</span>' +
            '</span>' +
            '</button>';
        });
        html += '</div>';
      } else if (!matchedPages.length && !matchedActions.length) {
        html = '<p class="cmd-palette__empty">No results for “' + esc(q) + '”</p>';
      }
    }

    results.innerHTML = html;
    activeIdx = -1;
  }

  function itemList() {
    return Array.from(results.querySelectorAll('.cmd-palette__item'));
  }

  function setActive(i) {
    const items = itemList();
    if (!items.length) return;
    activeIdx = Math.max(-1, Math.min(i, items.length - 1));
    items.forEach(function (el, j) {
      const on = j === activeIdx;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) el.scrollIntoView({ block: 'nearest' });
    });
  }

  function activate(el) {
    if (!el) return;
    const action = el.dataset.action;
    const url = el.dataset.url;
    if (action === 'toggle-theme') {
      close();
      const btn = document.querySelector('.theme-toggle');
      if (btn) btn.click();
    } else if (action === 'toggle-contrast') {
      close();
      if (window.a11y) window.a11y.toggleContrast();
    } else if (action === 'toggle-motion') {
      close();
      if (window.a11y) window.a11y.toggleMotion();
    } else if (url && /^(https?:\/\/|\/|#)/i.test(url)) {
      close();
      window.location.href = url;
    }
  }

  document.addEventListener('keydown', function (e) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key === 'k') {
      e.preventDefault();
      if (typeof window.openSearch === 'function') {
        if (isOpen) close();
        // search.js Ctrl+K handler manages the search overlay toggle
        return;
      }
      isOpen ? close() : open();
      return;
    }
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Tab') {
      const f = getFocusable();
      if (!f.length) return;
      if (e.shiftKey) {
        if (document.activeElement === f[0]) {
          e.preventDefault();
          f[f.length - 1].focus();
        }
      } else {
        if (document.activeElement === f[f.length - 1]) {
          e.preventDefault();
          f[0].focus();
        }
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(activeIdx + 1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(activeIdx - 1);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      activate(itemList()[activeIdx]);
      return;
    }
  });

  input.addEventListener('input', function () {
    render(input.value);
  });

  results.addEventListener('click', function (e) {
    const el = e.target.closest('.cmd-palette__item');
    if (el) activate(el);
  });

  results.addEventListener('mousemove', function (e) {
    const el = e.target.closest('.cmd-palette__item');
    if (el) setActive(itemList().indexOf(el));
  });

  palette.addEventListener('cancel', function (e) {
    e.preventDefault();
    close();
  });

  palette.addEventListener('click', function (e) {
    if (e.target === palette) close();
  });

  // Expose for external triggers
  window.openCmdPalette = open;
})();
