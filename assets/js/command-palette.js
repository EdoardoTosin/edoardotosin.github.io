// command-palette.js - Cmd/Ctrl+K command palette. Self-contained IIFE.
(function () {
  'use strict';

  var palette = document.getElementById('cmd-palette');
  var input = document.getElementById('cmd-input');
  var results = document.getElementById('cmd-results');
  if (!palette || !input || !results) return;

  var BASE = (palette.getAttribute('data-base-url') || '').replace(/\/$/, '');

  var PAGES = [
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

  var ACTIONS = [{ label: 'Toggle theme', id: 'toggle-theme', icon: 'theme' }];

  var posts = null;
  var isOpen = false;
  var activeIdx = -1;

  function open() {
    isOpen = true;
    palette.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      palette.classList.add('is-open');
      input.value = '';
      input.focus();
      render('');
    });
    if (posts === null) loadPosts();
  }

  function close() {
    isOpen = false;
    palette.classList.remove('is-open');
    document.body.style.overflow = '';
    activeIdx = -1;
    setTimeout(function () {
      if (!isOpen) palette.setAttribute('hidden', '');
    }, 200);
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
    var lq = q.toLowerCase();
    var scored = [];
    posts.forEach(function (p) {
      var s = 0;
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

  var ICONS = {
    home: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    blog: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    topic:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>',
    project:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    about:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    archive:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',
    now: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    gallery:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    contact:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    theme:
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    post: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
  };

  function esc(s) {
    return String(s).replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function render(q) {
    q = (q || '').trim();
    var lq = q.toLowerCase();
    var matchedActions = q
      ? ACTIONS.filter(function (a) {
          return a.label.toLowerCase().includes(lq);
        })
      : ACTIONS;
    var matchedPages = q
      ? PAGES.filter(function (p) {
          return p.label.toLowerCase().includes(lq);
        })
      : PAGES;
    var matchedPosts = filterPosts(q);
    var html = '';

    if (matchedActions.length) {
      html +=
        '<div class="cmd-group" role="group" aria-label="Actions"><p class="cmd-group__label" aria-hidden="true">Actions</p>';
      matchedActions.forEach(function (a) {
        html +=
          '<button class="cmd-item" type="button" data-action="' +
          esc(a.id) +
          '" role="option" aria-selected="false">' +
          '<span class="cmd-item__icon" aria-hidden="true">' +
          (ICONS[a.icon] || '') +
          '</span>' +
          '<span class="cmd-item__label">' +
          esc(a.label) +
          '</span>' +
          '</button>';
      });
      html += '</div>';
    }

    if (matchedPages.length) {
      html +=
        '<div class="cmd-group" role="group" aria-label="Navigate"><p class="cmd-group__label" aria-hidden="true">Navigate</p>';
      matchedPages.forEach(function (p) {
        html +=
          '<button class="cmd-item" type="button" data-url="' +
          esc(p.url) +
          '" role="option" aria-selected="false">' +
          '<span class="cmd-item__icon" aria-hidden="true">' +
          (ICONS[p.icon] || '') +
          '</span>' +
          '<span class="cmd-item__label">' +
          esc(p.label) +
          '</span>' +
          '</button>';
      });
      html += '</div>';
    }

    if (q) {
      if (posts === null) {
        html +=
          '<div class="cmd-group"><p class="cmd-group__label" aria-hidden="true">Posts</p><p class="cmd-empty">Loading&hellip;</p></div>';
      } else if (matchedPosts.length) {
        html +=
          '<div class="cmd-group" role="group" aria-label="Posts"><p class="cmd-group__label" aria-hidden="true">Posts</p>';
        matchedPosts.forEach(function (p) {
          var topic = p.topic
            ? '<span class="cmd-item__tag" data-topic="' + esc(p.topic) + '">' + esc(p.topic) + '</span>'
            : '';
          var date = p.date ? '<span class="cmd-item__date">' + esc(p.date) + '</span>' : '';
          html +=
            '<button class="cmd-item cmd-item--post" type="button" data-url="' +
            esc(p.url || '') +
            '" role="option" aria-selected="false">' +
            '<span class="cmd-item__icon" aria-hidden="true">' +
            ICONS.post +
            '</span>' +
            '<span class="cmd-item__body">' +
            '<span class="cmd-item__label">' +
            esc(p.title || '') +
            '</span>' +
            '<span class="cmd-item__meta">' +
            topic +
            date +
            '</span>' +
            '</span>' +
            '</button>';
        });
        html += '</div>';
      } else if (!matchedPages.length && !matchedActions.length) {
        html = '<p class="cmd-empty">No results for &ldquo;' + esc(q) + '&rdquo;</p>';
      }
    }

    results.innerHTML = html;
    activeIdx = -1;
  }

  function itemList() {
    return Array.from(results.querySelectorAll('.cmd-item'));
  }

  function setActive(i) {
    var items = itemList();
    if (!items.length) return;
    activeIdx = Math.max(-1, Math.min(i, items.length - 1));
    items.forEach(function (el, j) {
      var on = j === activeIdx;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) el.scrollIntoView({ block: 'nearest' });
    });
  }

  function activate(el) {
    if (!el) return;
    var action = el.dataset.action;
    var url = el.dataset.url;
    if (action === 'toggle-theme') {
      close();
      var btn = document.querySelector('.theme-toggle');
      if (btn) btn.click();
    } else if (url) {
      close();
      window.location.href = url;
    }
  }

  document.addEventListener('keydown', function (e) {
    var mod = e.metaKey || e.ctrlKey;
    if (mod && e.key === 'k') {
      e.preventDefault();
      isOpen ? close() : open();
      return;
    }
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
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
    var el = e.target.closest('.cmd-item');
    if (el) activate(el);
  });

  results.addEventListener('mousemove', function (e) {
    var el = e.target.closest('.cmd-item');
    if (el) setActive(itemList().indexOf(el));
  });

  palette.addEventListener('click', function (e) {
    if (e.target === palette || e.target.classList.contains('cmd-palette__backdrop')) close();
  });

  // Expose for external triggers
  window.openCmdPalette = open;
})();
