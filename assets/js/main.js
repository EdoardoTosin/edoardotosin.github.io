// main.js - Site runtime. Single IIFE; each feature is an independent init function.
(function () {
  'use strict';

  function qs(sel, root)  { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return (root || document).querySelectorAll(sel); }

  function writeClipboard(text, onDone) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      onDone();
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(onDone).catch(fallback);
    } else { fallback(); }
  }

  // Scroll to top
  function initScrollTop() {
    var btn = qs('#scroll-top');
    if (!btn) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          btn.classList.toggle('is-visible', window.scrollY > 500);
          ticking = false;
        });
        ticking = true;
      }
    }, {passive: true});
    btn.addEventListener('click', function () {
      window.scrollTo({top: 0, behavior: 'smooth'});
    });
  }

  // Mobile navigation
  function initMobileNav() {
    var toggle = qs('#nav-toggle');
    var nav    = qs('#mobile-nav');
    if (!toggle || !nav) return;
    var open = false;

    function openNav() {
      open = true;
      toggle.classList.add('is-open');
      nav.classList.add('is-open');
      nav.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeNav() {
      open = false;
      toggle.classList.remove('is-open');
      nav.classList.remove('is-open');
      nav.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function () { open ? closeNav() : openNav(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) closeNav(); });
    document.addEventListener('click', function (e) {
      if (open && !nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
    });
  }

  // Lazy images (.loaded drives CSS opacity fade)
  function initLazyImages() {
    qsa('img[loading="lazy"]').forEach(function (img) {
      if (img.complete) img.classList.add('loaded');
      else img.addEventListener('load', function () { img.classList.add('loaded'); }, { once: true });
    });
  }
  // Image zoom (native <dialog>, fit-to-viewport, with prev/next navigation)
  function initImageZoom() {
    const dialog   = qs('#img-zoom');
    const fig      = dialog?.querySelector('.img-zoom__fig');
    const img      = dialog?.querySelector('img');
    const caption  = dialog?.querySelector('.img-zoom__caption');
    const closeBtn = dialog?.querySelector('.img-zoom__close');
    const prevBtn  = dialog?.querySelector('.img-zoom__prev');
    const nextBtn  = dialog?.querySelector('.img-zoom__next');
    const content  = qs('.post-content');
    if (!dialog || !fig || !img || !caption || !closeBtn || !content) return;

    // Build ordered list of zoomable images in the post
    var zoomImgs = [];
    qsa('img', content).forEach(function(srcImg) {
      if (!srcImg.hasAttribute('data-no-zoom')) zoomImgs.push(srcImg);
    });

    var currentIdx = 0;

    let dragStart = null;
    let dragging  = false;
    let lastPointerEvent = null;

    const TAP_THRESH  = 8;
    const SWIPE_Y     = 72;
    const SWIPE_RATIO = 2.5;

    function updateNavButtons() {
      if (prevBtn) {
        prevBtn.disabled = currentIdx <= 0;
        prevBtn.style.visibility = zoomImgs.length > 1 ? '' : 'hidden';
      }
      if (nextBtn) {
        nextBtn.disabled = currentIdx >= zoomImgs.length - 1;
        nextBtn.style.visibility = zoomImgs.length > 1 ? '' : 'hidden';
      }
    }

    function loadImage(srcImg) {
      img.src    = srcImg.dataset.zoom || srcImg.currentSrc || srcImg.src;
      img.srcset = srcImg.dataset.zoom ? '' : (srcImg.getAttribute('srcset') || '');
      img.sizes  = img.srcset ? '92vw' : '';
      img.alt    = srcImg.alt || '';
      caption.textContent = srcImg.alt || '';
      fig.style.transition = '';
      fig.style.transform  = '';
      fig.style.opacity    = '';
    }

    function open(idx) {
      currentIdx = idx;
      loadImage(zoomImgs[currentIdx]);
      updateNavButtons();
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      closeBtn.focus({ preventScroll: true });
    }

    function close() {
      dialog.close();
      document.body.style.overflow = '';
      setTimeout(function() {
        img.src = ''; img.srcset = ''; img.sizes = '';
        fig.style.transform = ''; fig.style.opacity = '';
      }, 260);
    }

    function showPrev() {
      if (currentIdx <= 0) return;
      currentIdx--;
      loadImage(zoomImgs[currentIdx]);
      updateNavButtons();
    }

    function showNext() {
      if (currentIdx >= zoomImgs.length - 1) return;
      currentIdx++;
      loadImage(zoomImgs[currentIdx]);
      updateNavButtons();
    }

    closeBtn.addEventListener('click', close);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);
    if (nextBtn) nextBtn.addEventListener('click', showNext);

    dialog.addEventListener('click', function(e) {
      if (e.target === dialog) close();
    });

    dialog.addEventListener('pointerdown', function(e) {
      if (!e.isPrimary) return;
      lastPointerEvent = e;
    });

    dialog.addEventListener('cancel', function(e) {
      if (lastPointerEvent && lastPointerEvent.button === 2) {
        e.preventDefault();
        return;
      }
      close();
    });

    // Arrow-key navigation inside the dialog
    dialog.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); showPrev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); showNext(); }
    });

    fig.addEventListener('pointerdown', function(e) {
      if (!e.isPrimary) return;
      dragStart = { x: e.clientX, y: e.clientY };
      dragging  = false;
      fig.setPointerCapture(e.pointerId);
    });

    fig.addEventListener('pointermove', function(e) {
      if (!e.isPrimary || !dragStart) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      const adx = Math.abs(dx), ady = Math.abs(dy);

      if (!dragging && adx > TAP_THRESH && adx > ady) {
        dragStart = null;
        return;
      }

      if (ady > TAP_THRESH || dragging) {
        dragging = true;
        dialog.classList.add('is-dragging');
        const progress = Math.min(1, ady / 200);
        fig.style.transform = `translateY(${dy}px) scale(${1 - progress * 0.06})`;
        fig.style.opacity   = String(1 - progress * 0.5);
      }
    });

    fig.addEventListener('pointerup', function(e) {
      if (!e.isPrimary) return;
      dialog.classList.remove('is-dragging');
      if (!dragStart) return;

      const dx  = e.clientX - dragStart.x;
      const dy  = e.clientY - dragStart.y;
      const adx = Math.abs(dx), ady = Math.abs(dy);
      dragStart = null;

      if (!dragging) {
        if (adx < TAP_THRESH && ady < TAP_THRESH) close();
        return;
      }
      dragging = false;

      if (dy > SWIPE_Y && dy > adx * SWIPE_RATIO) {
        fig.style.transition = 'transform .22s ease, opacity .22s ease';
        fig.style.transform  = 'translateY(110%)';
        fig.style.opacity    = '0';
        setTimeout(close, 220);
      } else {
        fig.style.transition = 'transform .22s ease, opacity .22s ease';
        fig.style.transform  = '';
        fig.style.opacity    = '';
      }
    });

    fig.addEventListener('pointercancel', function() {
      dialog.classList.remove('is-dragging');
      dragging  = false;
      dragStart = null;
      fig.style.transform = '';
      fig.style.opacity   = '';
    });

    img.setAttribute('tabindex', '0');
    img.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); close(); }
    });

    zoomImgs.forEach(function(srcImg, idx) {
      srcImg.style.cursor = 'zoom-in';
      srcImg.addEventListener('click', function() { open(idx); });
    });
  }

  // Load more posts
  function initLoadMore() {
    var btn  = qs('#load-more');
    var grid = qs('#posts-grid');
    if (!btn || !grid) return;

    var page   = 1;
    var total  = parseInt(btn.dataset.totalPages || '1', 10);
    var buffer = [];

    function getBatchSize() {
      var view = grid.dataset.view || 'grid';
      if (view === 'grid') {
        var cards = grid.querySelectorAll('.post-card');
        if (!cards.length) return 1;
        var firstTop = cards[0].offsetTop;
        var count = 0;
        for (var i = 0; i < cards.length; i++) {
          if (cards[i].offsetTop !== firstTop) break;
          count++;
        }
        return count || 1;
      }
      if (view === 'list') return 5;
      return 1;
    }

    function appendCards(cards) {
      cards.forEach(function (card, idx) {
        var imgs = card.querySelectorAll('img');
        var srcs = [];
        imgs.forEach(function (img, i) {
          img.loading = 'eager';
          srcs[i] = img.getAttribute('src');
          img.removeAttribute('src');
        });

        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        grid.appendChild(card);

        imgs.forEach(function (img, i) {
          if (srcs[i]) img.setAttribute('src', srcs[i]);
        });

        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            setTimeout(function () {
              card.style.transition = 'opacity .4s ease, transform .4s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, idx * 60);
          });
        });
      });
    }

    btn.addEventListener('click', function () {
      var batchSize = getBatchSize();

      if (buffer.length >= batchSize) {
        appendCards(buffer.splice(0, batchSize));
        if (buffer.length === 0 && page >= total) btn.closest('.load-more-wrap').style.display = 'none';
        return;
      }

      if (page >= total) {
        if (buffer.length > 0) {
          appendCards(buffer.splice(0));
        }
        btn.closest('.load-more-wrap').style.display = 'none';
        return;
      }
      page++;
      btn.textContent = 'Loading\u2026';
      btn.disabled = true;

      fetch('/blog/page/' + page + '/index.html')
        .then(function(r) { return r.text(); })
        .then(function(html) {
          var doc   = new DOMParser().parseFromString(html, 'text/html');
          var cards = Array.from(doc.querySelectorAll('.post-card'));
          buffer = buffer.concat(cards);

          appendCards(page >= total ? buffer.splice(0) : buffer.splice(0, batchSize));

          btn.textContent = 'Load More';
          btn.disabled = false;

          if (buffer.length === 0 && page >= total) btn.closest('.load-more-wrap').style.display = 'none';
        })
        .catch(function() {
          btn.textContent = 'Load More';
          btn.disabled = false;
        });
    });
  }

  // Blog toggle (grid / list)
  function initBlogToggle() {
    var STORE_KEY = 'jekyll-blog-view';
    var grid      = qs('#posts-grid');
    var btns      = qsa('.view-toggle__btn');
    if (!grid || !btns.length) return;

    function applyView(view, persist) {
      grid.setAttribute('data-view', view);
      btns.forEach(function (btn) {
        var isActive = btn.dataset.view === view;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });
      if (persist) {
        try { localStorage.setItem(STORE_KEY, view); } catch (e) {}
      }
    }

    var saved = 'grid';
    try { saved = localStorage.getItem(STORE_KEY) || 'grid'; } catch (e) {}
    if (saved !== 'list') saved = 'grid';
    applyView(saved, false);

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () { applyView(btn.dataset.view, true); });
    });
  }

  // Share copy-link
  function initShareCopy() {
    qsa('[data-share="copy"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var label = btn.querySelector('.share-btn__label');
        var url = btn.dataset.shareUrl || window.location.href;
        writeClipboard(url, function () {
          btn.setAttribute('aria-label', 'Link copied!');
          if (label) { label.textContent = 'Copied!'; }
          setTimeout(function () {
            btn.setAttribute('aria-label', 'Copy link');
            if (label) { label.textContent = 'Copy link'; }
          }, 2000);
        });
      });
    });
  }
  function initNewsletterBtns() {
    qsa('[data-newsletter-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-newsletter-open');
        if (url) { window.open(url, '_blank', 'noopener,noreferrer'); }
      });
    });
  }
  // Heading copy-link (DOM injected by heading_anchors.rb)
  function initHeadingCopy() {
    var content = qs('.post-content');
    if (!content) return;
    qsa('.heading-anchor', content).forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        var id  = anchor.getAttribute('href').slice(1);
        var url = window.location.origin + window.location.pathname + '#' + id;
        writeClipboard(url, function () {
          anchor.classList.add('is-copied');
          setTimeout(function () { anchor.classList.remove('is-copied'); }, 1500);
        });
      });
    });
  }
  // Reading progress bar - JS-driven, anchored to .post-content bounds.
  function initReadingProgress() {
    var bar     = qs('#reading-progress');
    var content = qs('.post-content');
    if (!bar || !content) return;

    var contentTop = 0;
    var contentH   = 0;

    function measure() {
      var rect   = content.getBoundingClientRect();
      contentTop = rect.top + window.scrollY;
      contentH   = content.offsetHeight;
    }

    function update() {
      var viewH     = window.innerHeight;
      var endScroll = contentTop + contentH - viewH;
      var pct;
      if (endScroll <= 0) {
        pct = 100;
      } else {
        pct = Math.min(100, Math.max(0, (window.scrollY / endScroll) * 100));
      }
      bar.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', Math.round(pct));
    }

    measure();
    window.addEventListener('resize', function () { measure(); update(); }, { passive: true });

    var rafId = null;
    window.addEventListener('scroll', function () {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(function () { rafId = null; update(); });
    }, { passive: true });

    update();
  }

  // Table of Contents (DOM built by toc_builder.rb plugin)
  function initToC() {
    var content         = qs('.post-content');
    var tocWidget       = qs('#toc-widget');
    var tocWidgetInline = qs('#toc-widget-inline');
    if (!content) return;

    var links = [];
    qsa('.toc-link', document).forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var h  = qs('[id="' + id + '"]', content);
      if (h) links.push({ el: h, link: a });
    });
    if (!links.length) return;

    // Match the CSS scroll-margin-top: calc(var(--header-h) + 16px) + small buffer.
    var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10);
    if (isNaN(headerH)) headerH = 70;
    var TRIGGER = headerH + 20;

    links.forEach(function (item) {
      item.link.addEventListener('click', function (e) {
        e.preventDefault();
        var targetY = item.el.getBoundingClientRect().top + window.scrollY - TRIGGER;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
        history.replaceState(null, '', '#' + item.el.id);
        setActive(item);
      });
    });

    var active = null;
    function setActive(item) {
      if (active === item) return;
      if (active) active.link.classList.remove('is-active');
      active = item;
      if (!active) return;
      active.link.classList.add('is-active');
      if (tocWidget) {
        var tocNav = tocWidget.querySelector('nav');
        if (tocNav) {
          var li   = active.link.parentElement;
          var navH = tocNav.clientHeight;
          var liTop = li.offsetTop;
          if (liTop < tocNav.scrollTop + 16 || liTop + li.offsetHeight > tocNav.scrollTop + navH - 16) {
            tocNav.scrollTo({ top: Math.max(0, liTop - Math.round(navH / 3)), behavior: 'smooth' });
          }
        }
      }
    }

    var rafId = null;
    function findActive() {
      var current = null;
      for (var i = links.length - 1; i >= 0; i--) {
        if (links[i].el.getBoundingClientRect().top <= TRIGGER) {
          current = links[i];
          break;
        }
      }
      // Only default to first item once the first heading is near the viewport.
      if (!current) {
        var firstRect = links[0].el.getBoundingClientRect();
        if (firstRect.top < window.innerHeight) current = links[0];
      }
      setActive(current);
    }
    window.addEventListener('scroll', function () {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(findActive);
    }, { passive: true });
    findActive();
  }
  // Archive: expand / collapse all
  function initArchive() {
    var container = qs('.archive-years');
    var controls  = qs('#archive-controls');
    if (!container || !controls) return;
    controls.hidden = false;

    var allDetails = Array.prototype.slice.call(container.querySelectorAll('details'));

    var TARGET_POSTS = Math.max(8, Math.floor((window.innerHeight - 320) / 36));
    var opened = 0;
    allDetails.forEach(function(d) {
      if (opened <= TARGET_POSTS) {
        d.open = true;
        opened += parseInt(d.getAttribute('data-posts') || '0', 10);
      }
    });

    function syncButtons() {
      var anyOpen    = allDetails.some(function(d) { return d.open; });
      var allOpen    = allDetails.every(function(d) { return d.open; });
      var expandBtn  = qs('#archive-expand-all');
      var collapseBtn = qs('#archive-collapse-all');
      if (expandBtn)    expandBtn.disabled  = allOpen;
      if (collapseBtn)  collapseBtn.disabled = !anyOpen;
    }

    var expandBtn   = qs('#archive-expand-all');
    var collapseBtn = qs('#archive-collapse-all');
    if (expandBtn) {
      expandBtn.addEventListener('click', function() {
        allDetails.forEach(function(d) { d.open = true; });
        syncButtons();
      });
    }
    if (collapseBtn) {
      collapseBtn.addEventListener('click', function() {
        allDetails.forEach(function(d) { d.open = false; });
        syncButtons();
      });
    }

    allDetails.forEach(function(d) { d.addEventListener('toggle', syncButtons); });
    syncButtons();
  }

  // Filter page (tags + topics)
  function initFilterPage(cfg) {
    var buttons     = qsa('.filter-page__btn[' + cfg.attr + ']');
    var posts       = qsa(cfg.itemSel);
    var filterInput = qs('#' + cfg.param + '-filter-input');
    var meta        = qs('#' + cfg.param + '-results-meta');
    var emptyEl     = qs('#' + cfg.param + '-empty');
    var emptyMsg    = qs('#' + cfg.param + '-empty-msg');
    if (!buttons.length) return;

    var total   = posts.length;
    var current = 'all';

    function setActive(btn) {
      buttons.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
    }

    function filterPosts(val) {
      var visible = 0;
      posts.forEach(function (post) {
        var show = val === 'all' || cfg.match(post, val);
        post.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (meta) {
        if (val === 'all' && visible === total) {
          meta.textContent = '';
        } else {
          meta.textContent = '';
          var strong = document.createElement('strong');
          strong.textContent = String(visible);
          meta.appendChild(document.createTextNode('Showing '));
          meta.appendChild(strong);
          meta.appendChild(document.createTextNode(
            ' post' + (visible === 1 ? '' : 's') +
            (val !== 'all' ? cfg.suffix(val) : '')
          ));
        }
      }
      if (emptyEl) emptyEl.classList.toggle('is-visible', visible === 0);
      if (visible === 0 && emptyMsg) {
        emptyMsg.textContent = val === 'all' ? 'No posts yet.' : cfg.emptyMsg(val);
      }
    }

    function updateURL(val) {
      var url = new URL(window.location.href);
      if (val === 'all') url.searchParams.delete(cfg.param);
      else url.searchParams.set(cfg.param, val);
      history.replaceState(null, '', url.toString());
    }

    if (filterInput) {
      filterInput.addEventListener('input', function () {
        var q = filterInput.value.trim().toLowerCase();
        buttons.forEach(function (btn) {
          if (btn.getAttribute(cfg.attr) === 'all') return;
          var label = (btn.dataset.label || btn.getAttribute(cfg.attr) || '').toLowerCase();
          btn.classList.toggle('is-hidden', q !== '' && label.indexOf(q) === -1);
        });
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        current = btn.getAttribute(cfg.attr);
        setActive(btn);
        filterPosts(current);
        updateURL(current);
      });
    });

    var param = new URLSearchParams(window.location.search).get(cfg.param);
    if (param) {
      var slug   = param.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      var target = qs('[' + cfg.attr + '="' + slug + '"]');
      if (target) {
        current = slug;
        setActive(target);
        filterPosts(slug);
        target.scrollIntoView({ block: 'nearest' });
      }
    }
  }


  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function (reg) {
          if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        })
        .catch(function () {});
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initScrollTop();
    initMobileNav();
    initLazyImages();
    initImageZoom();
    initReadingProgress();
    initLoadMore();
    initBlogToggle();
    initShareCopy();
    initNewsletterBtns();
    initHeadingCopy();
    initToC();
    initArchive();
    initFilterPage({
      attr: 'data-tag', itemSel: '.tag-item', param: 'tag',
      match: function (p, v) { return p.dataset.tags.trim().split(/\s+/).indexOf(v) !== -1; },
      suffix: function (v) { return ' tagged "' + v + '"'; },
      emptyMsg: function (v) { return 'No posts tagged "' + v + '".'; }
    });
    initFilterPage({
      attr: 'data-topic', itemSel: '.topic-item', param: 'topic',
      match: function (p, v) { return p.dataset.topic === v; },
      suffix: function (v) { return ' in topic "' + v + '"'; },
      emptyMsg: function (v) { return 'No posts in topic "' + v + '".'; }
    });
  });

}());
