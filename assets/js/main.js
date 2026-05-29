// main.js - Site runtime. Single IIFE; each feature is an independent init function.
(function () {
  'use strict';

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root) {
    return (root || document).querySelectorAll(sel);
  }
  function scrollBehavior() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  }

  function writeClipboard(text, onDone) {
    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch (e) {}
      document.body.removeChild(ta);
      onDone();
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(onDone).catch(fallback);
    } else {
      fallback();
    }
  }

  // Scroll to top
  function initScrollTop() {
    const btn = qs('#scroll-top');
    if (!btn) return;
    let ticking = false;
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          requestAnimationFrame(function () {
            btn.classList.toggle('is-visible', window.scrollY > 500);
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true },
    );
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
    });
  }

  // Mobile navigation
  function initMobileNav() {
    const toggle = qs('#nav-toggle');
    const nav = qs('#mobile-nav');
    if (!toggle || !nav) return;
    let open = false;
    let lastFocused = null;

    function getFocusableNav() {
      return Array.prototype.slice
        .call(nav.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])'))
        .filter(function (el) {
          return !el.disabled;
        });
    }

    function trapFocus(e) {
      if (e.key !== 'Tab') return;
      const f = getFocusableNav();
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
    }

    function openNav() {
      open = true;
      lastFocused = document.activeElement;
      toggle.classList.add('is-open');
      nav.classList.add('is-open');
      nav.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', trapFocus);
      const f = getFocusableNav();
      if (f.length) {
        setTimeout(function () {
          f[0].focus();
        }, 60);
      }
    }
    function closeNav() {
      open = false;
      toggle.classList.remove('is-open');
      nav.classList.remove('is-open');
      nav.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', trapFocus);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    toggle.addEventListener('click', function () {
      open ? closeNav() : openNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) closeNav();
    });
    document.addEventListener('click', function (e) {
      if (open && !nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
    });
  }

  // Lazy images
  function initLazyImages() {
    qsa('img[loading="lazy"]').forEach(function (img) {
      if (img.complete) img.classList.add('loaded');
      else
        img.addEventListener(
          'load',
          function () {
            img.classList.add('loaded');
          },
          { once: true },
        );
    });
  }

  // Image zoom
  function initImageZoom() {
    const dialog = qs('#img-zoom');
    const fig = dialog && dialog.querySelector('.img-zoom__fig');
    const img = dialog && dialog.querySelector('img');
    const caption = dialog && dialog.querySelector('.img-zoom__caption');
    const closeBtn = dialog && dialog.querySelector('.img-zoom__close');
    if (!dialog || !fig || !img || !caption || !closeBtn) return;

    fig.style.touchAction = 'none';

    const zoomImgs = [];
    const content = qs('.post-content');
    if (content) {
      qsa('img', content).forEach(function (srcImg) {
        if (!srcImg.hasAttribute('data-no-zoom')) zoomImgs.push(srcImg);
      });
    }
    qsa('.gallery-item__thumb img:not([data-no-zoom])').forEach(function (srcImg) {
      zoomImgs.push(srcImg);
    });
    if (!zoomImgs.length) return;

    let currentIdx = 0;
    let lastPointerEvent = null;

    let scale = 1;
    let panX = 0;
    let panY = 0;
    const ZOOM_MIN = 1;
    const ZOOM_MAX = 8;
    const ZOOM_CLICK = 2.5;

    let naturalCx = 0;
    let naturalCy = 0;
    function cacheNaturalCentre() {
      // Call BEFORE any zoom transform is applied (scale===1, pan===0).
      const r = img.getBoundingClientRect();
      naturalCx = r.left + r.width / 2;
      naturalCy = r.top + r.height / 2;
    }

    function clampPan() {
      if (scale <= ZOOM_MIN) {
        panX = 0;
        panY = 0;
        return;
      }
      // img.offsetWidth/Height = layout size, unaffected by CSS transform.
      const maxX = Math.max(0, (img.offsetWidth * scale - window.innerWidth) / 2);
      const maxY = Math.max(0, (img.offsetHeight * scale - window.innerHeight) / 2);
      panX = Math.max(-maxX, Math.min(maxX, panX));
      panY = Math.max(-maxY, Math.min(maxY, panY));
    }

    function applyZoom(animated, grabbing) {
      img.style.transition = animated ? 'transform .22s cubic-bezier(.34,1.4,.64,1)' : 'none';
      img.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + scale + ')';
      img.style.cursor = scale > ZOOM_MIN ? (grabbing ? 'grabbing' : 'grab') : 'zoom-in';
    }

    function resetZoom(animated) {
      scale = ZOOM_MIN;
      panX = 0;
      panY = 0;
      applyZoom(animated, false);
    }

    function zoomAt(cx, cy, newScale) {
      newScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newScale));
      const ratio = newScale / scale;
      panX = panX * ratio + (cx - naturalCx) * (1 - ratio);
      panY = panY * ratio + (cy - naturalCy) * (1 - ratio);
      scale = newScale;
      clampPan();
    }

    function toggleZoom(cx, cy) {
      if (scale > ZOOM_MIN) {
        resetZoom(true);
      } else {
        zoomAt(cx, cy, ZOOM_CLICK);
        applyZoom(true, false);
      }
    }

    function loadImage(srcImg) {
      stopInertia();
      lastTapTime = 0;
      img.src = srcImg.dataset.zoom || srcImg.currentSrc || srcImg.src;
      img.srcset = srcImg.dataset.zoom ? '' : srcImg.getAttribute('srcset') || '';
      img.sizes = img.srcset ? '92vw' : '';
      img.alt = srcImg.alt || '';
      caption.textContent = srcImg.alt || '';
      fig.style.transition = '';
      fig.style.transform = '';
      fig.style.opacity = '';
      naturalCx = 0;
      naturalCy = 0;
      resetZoom(false);
    }

    function open(idx) {
      currentIdx = idx;
      loadImage(zoomImgs[currentIdx]);
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      closeBtn.focus({ preventScroll: true });
      // Measure natural centre after layout stabilises.
      requestAnimationFrame(cacheNaturalCentre);
    }

    function close() {
      stopInertia();
      resetZoom(false);
      dialog.close();
      document.body.style.overflow = '';
      setTimeout(function () {
        img.src = '';
        img.srcset = '';
        img.sizes = '';
        fig.style.transform = '';
        fig.style.opacity = '';
      }, 260);
    }

    function showPrev() {
      if (currentIdx > 0) {
        currentIdx--;
        loadImage(zoomImgs[currentIdx]);
      }
    }
    function showNext() {
      if (currentIdx < zoomImgs.length - 1) {
        currentIdx++;
        loadImage(zoomImgs[currentIdx]);
      }
    }

    closeBtn.addEventListener('click', close);

    dialog.addEventListener('click', function (e) {
      if (mSuppress) {
        mSuppress = false;
        return;
      }
      if (e.target === dialog) close();
    });

    dialog.addEventListener('pointerdown', function (e) {
      if (e.isPrimary) lastPointerEvent = e;
    });
    dialog.addEventListener('cancel', function (e) {
      if (lastPointerEvent && lastPointerEvent.button === 2) {
        e.preventDefault();
        return;
      }
      close();
    });

    dialog.addEventListener(
      'wheel',
      function (e) {
        e.preventDefault();
        if (!naturalCx) cacheNaturalCentre();
        const raw = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 800 : 1);
        const factor = Math.exp(-raw / 500);
        const ns = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, scale * factor));
        if (ns === scale) return;
        zoomAt(e.clientX, e.clientY, ns);
        applyZoom(false, false);
      },
      { passive: false },
    );

    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (scale > ZOOM_MIN) {
          panX -= 80;
          clampPan();
          applyZoom(true, false);
        } else showPrev();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (scale > ZOOM_MIN) {
          panX += 80;
          clampPan();
          applyZoom(true, false);
        } else showNext();
      }
      if (e.key === 'ArrowUp' && scale > ZOOM_MIN) {
        e.preventDefault();
        panY -= 80;
        clampPan();
        applyZoom(true, false);
      }
      if (e.key === 'ArrowDown' && scale > ZOOM_MIN) {
        e.preventDefault();
        panY += 80;
        clampPan();
        applyZoom(true, false);
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomAt(window.innerWidth / 2, window.innerHeight / 2, scale * 1.4);
        applyZoom(true, false);
      }
      if (e.key === '-') {
        e.preventDefault();
        const ns = scale / 1.4;
        if (ns <= ZOOM_MIN) resetZoom(true);
        else {
          zoomAt(window.innerWidth / 2, window.innerHeight / 2, ns);
          applyZoom(true, false);
        }
      }
      if (e.key === '0') {
        e.preventDefault();
        resetZoom(true);
      }
    });

    let mDown = false;
    let mMoved = false;
    let mSuppress = false; // suppress backdrop-click after a drag ends outside the fig
    let mStartX = 0;
    let mStartY = 0;
    let mLastX = 0;
    let mLastY = 0;

    const TAP_THRESH = 8;
    const SWIPE_X = 60;
    const SWIPE_Y = 72;
    const SWIPE_RATIO = 2.5;

    fig.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      mDown = true;
      mMoved = false;
      mSuppress = false;
      mStartX = mLastX = e.clientX;
      mStartY = mLastY = e.clientY;
      if (scale > ZOOM_MIN) img.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', function (e) {
      if (!mDown) return;
      if (Math.abs(e.clientX - mStartX) > TAP_THRESH || Math.abs(e.clientY - mStartY) > TAP_THRESH) mMoved = true;
      if (scale > ZOOM_MIN) {
        panX += e.clientX - mLastX;
        panY += e.clientY - mLastY;
        clampPan();
        applyZoom(false, true);
      }
      mLastX = e.clientX;
      mLastY = e.clientY;
    });

    window.addEventListener('mouseup', function (e) {
      if (e.button !== 0 || !mDown) return;
      mDown = false;
      if (mMoved) {
        mSuppress = true;
        if (scale > ZOOM_MIN) applyZoom(false, false);
      } else {
        if (!naturalCx) cacheNaturalCentre();
        toggleZoom(e.clientX, e.clientY);
      }
    });

    const ptrs = new Map(); // pointerId → {x, y}
    let mode = 'idle'; // 'idle' | 'pan' | 'swipe-h' | 'swipe-v' | 'pinch'

    let tId = -1;
    let tStartX = 0,
      tStartY = 0;
    let tLastX = 0,
      tLastY = 0;
    let tMoved = false;

    let lastTapTime = 0,
      lastTapX = 0,
      lastTapY = 0;

    let pinchDist = 0,
      pinchMidX = 0,
      pinchMidY = 0;

    let inertiaRaf = null;
    let velX = 0,
      velY = 0,
      velTs = 0;

    const INERTIA_DECAY = 0.94; // velocity fraction retained per ms at 60 fps
    const INERTIA_MIN = 0.05; // px/ms - stop below this speed

    function stopInertia() {
      if (inertiaRaf) {
        cancelAnimationFrame(inertiaRaf);
        inertiaRaf = null;
      }
    }

    function startInertia() {
      stopInertia();
      if (scale <= ZOOM_MIN) return;
      if (Math.abs(velX) < INERTIA_MIN && Math.abs(velY) < INERTIA_MIN) return;
      let last = performance.now();
      function tick(ts) {
        const dt = Math.min(ts - last, 64);
        last = ts;
        const k = Math.pow(INERTIA_DECAY, dt);
        velX *= k;
        velY *= k;
        panX += velX * dt;
        panY += velY * dt;
        clampPan();
        applyZoom(false, false);
        if (Math.abs(velX) > INERTIA_MIN || Math.abs(velY) > INERTIA_MIN) {
          inertiaRaf = requestAnimationFrame(tick);
        } else {
          inertiaRaf = null;
        }
      }
      inertiaRaf = requestAnimationFrame(tick);
    }

    function abortSwipe() {
      dialog.classList.remove('is-dragging');
      fig.style.transition = 'transform .22s ease, opacity .22s ease';
      fig.style.transform = '';
      fig.style.opacity = '';
    }

    function touchReset() {
      stopInertia();
      mode = 'idle';
      pinchDist = 0;
      ptrs.clear();
      tId = -1;
      tMoved = false;
      velX = velY = 0;
      dialog.classList.remove('is-dragging');
      fig.style.transition = '';
      fig.style.transform = '';
      fig.style.opacity = '';
      applyZoom(false, false);
    }

    function beginPinch() {
      const vals = Array.from(ptrs.values());
      pinchDist = Math.hypot(vals[1].x - vals[0].x, vals[1].y - vals[0].y);
      pinchMidX = (vals[0].x + vals[1].x) / 2;
      pinchMidY = (vals[0].y + vals[1].y) / 2;
      if (!naturalCx) cacheNaturalCentre();
    }

    function endPinch() {
      pinchDist = 0;
      if (ptrs.size === 1) {
        const entry = Array.from(ptrs.entries())[0];
        tId = entry[0];
        tStartX = tLastX = entry[1].x;
        tStartY = tLastY = entry[1].y;
        tMoved = true; // came from pinch - prevent lift registering as a tap
        velX = velY = 0;
        velTs = performance.now();
        mode = scale > ZOOM_MIN ? 'pan' : 'idle';
      } else {
        mode = 'idle';
        tId = -1;
      }
    }

    fig.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      e.preventDefault();
      stopInertia();
      fig.setPointerCapture(e.pointerId);
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (ptrs.size >= 2) {
        if (mode === 'swipe-h' || mode === 'swipe-v') abortSwipe();
        mode = 'pinch';
        tId = -1;
        beginPinch();
        return;
      }

      mode = 'idle';
      tId = e.pointerId;
      tMoved = false;
      velX = velY = 0;
      velTs = performance.now();
      tStartX = tLastX = e.clientX;
      tStartY = tLastY = e.clientY;
    });

    fig.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse') return;
      e.preventDefault();

      if (mode === 'pinch') {
        if (!ptrs.has(e.pointerId)) return;
        ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const vals = Array.from(ptrs.values());
        if (vals.length < 2 || pinchDist === 0) return;
        const dist = Math.hypot(vals[1].x - vals[0].x, vals[1].y - vals[0].y);
        const midX = (vals[0].x + vals[1].x) / 2;
        const midY = (vals[0].y + vals[1].y) / 2;
        zoomAt(pinchMidX, pinchMidY, scale * (dist / pinchDist));
        panX += midX - pinchMidX;
        panY += midY - pinchMidY;
        clampPan();
        applyZoom(false, false);
        pinchDist = dist;
        pinchMidX = midX;
        pinchMidY = midY;
        return;
      }

      if (e.pointerId !== tId) return;

      const now = performance.now();
      const elapsed = now - velTs;
      if (elapsed > 0 && elapsed < 100) {
        velX = (e.clientX - tLastX) / elapsed;
        velY = (e.clientY - tLastY) / elapsed;
      }
      velTs = now;

      const dx = e.clientX - tStartX;
      const dy = e.clientY - tStartY;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      if (!tMoved && (adx > TAP_THRESH || ady > TAP_THRESH)) tMoved = true;

      if (mode === 'idle' && tMoved) {
        mode = scale > ZOOM_MIN ? 'pan' : adx >= ady ? 'swipe-h' : 'swipe-v';
      }

      if (mode === 'pan') {
        panX += e.clientX - tLastX;
        panY += e.clientY - tLastY;
        clampPan();
        applyZoom(false, false);
      } else if (mode === 'swipe-h') {
        dialog.classList.add('is-dragging');
        fig.style.transition = 'none';
        fig.style.transform = 'translateX(' + dx + 'px)';
        fig.style.opacity = String(Math.max(0, 1 - (adx / 200) * 0.3));
      } else if (mode === 'swipe-v') {
        dialog.classList.add('is-dragging');
        fig.style.transition = 'none';
        const progress = Math.min(1, ady / 200);
        fig.style.transform = 'translateY(' + dy + 'px) scale(' + (1 - progress * 0.06) + ')';
        fig.style.opacity = String(1 - progress * 0.5);
      }

      tLastX = e.clientX;
      tLastY = e.clientY;
    });

    fig.addEventListener('pointerup', function (e) {
      if (e.pointerType === 'mouse') return;

      if (mode === 'pinch' && ptrs.has(e.pointerId)) {
        ptrs.delete(e.pointerId);
        if (ptrs.size >= 2) {
          beginPinch();
        } else {
          endPinch();
        }
        return;
      }

      if (e.pointerId !== tId) {
        ptrs.delete(e.pointerId);
        return;
      }
      ptrs.delete(e.pointerId);
      tId = -1;

      const dx = e.clientX - tStartX;
      const dy = e.clientY - tStartY;
      const adx = Math.abs(dx);

      if (mode === 'swipe-h') {
        dialog.classList.remove('is-dragging');
        if (adx >= SWIPE_X) {
          const dir = dx < 0 ? 1 : -1;
          fig.style.transition = 'transform .18s ease, opacity .18s ease';
          fig.style.transform = 'translateX(' + dir * 110 + '%)';
          fig.style.opacity = '0';
          setTimeout(function () {
            if (dx < 0) showNext();
            else showPrev();
          }, 180);
        } else {
          abortSwipe();
        }
        mode = 'idle';
        return;
      }

      if (mode === 'swipe-v') {
        dialog.classList.remove('is-dragging');
        if (dy > SWIPE_Y && dy > adx * SWIPE_RATIO) {
          fig.style.transition = 'transform .22s ease, opacity .22s ease';
          fig.style.transform = 'translateY(110%)';
          fig.style.opacity = '0';
          setTimeout(close, 220);
        } else {
          abortSwipe();
        }
        mode = 'idle';
        return;
      }

      if (mode === 'pan') {
        mode = 'idle';
        startInertia();
        return;
      }

      // mode === 'idle': no movement - check for double-tap to toggle zoom
      if (!tMoved) {
        const tapNow = performance.now();
        const tapDdist = Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY);
        if (tapNow - lastTapTime < 300 && tapDdist < 40) {
          if (!naturalCx) cacheNaturalCentre();
          if (scale > ZOOM_MIN) {
            resetZoom(true);
          } else {
            zoomAt(e.clientX, e.clientY, ZOOM_CLICK);
            applyZoom(true, false);
          }
          lastTapTime = 0;
        } else {
          lastTapTime = tapNow;
          lastTapX = e.clientX;
          lastTapY = e.clientY;
        }
      }

      mode = 'idle';
    });

    fig.addEventListener('pointercancel', function (e) {
      if (e.pointerType === 'mouse') return;
      if (!ptrs.has(e.pointerId) && e.pointerId !== tId) return;
      if (mode === 'swipe-h' || mode === 'swipe-v') abortSwipe();
      ptrs.delete(e.pointerId);
      if (ptrs.size === 0) {
        touchReset();
      } else if (mode === 'pinch' && ptrs.size < 2) {
        endPinch();
      }
    });

    img.setAttribute('tabindex', '0');
    img.setAttribute('draggable', 'false');
    img.addEventListener('dragstart', function (e) {
      e.preventDefault();
    });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (scale > ZOOM_MIN) resetZoom(true);
        else {
          zoomAt(window.innerWidth / 2, window.innerHeight / 2, ZOOM_CLICK);
          applyZoom(true, false);
        }
      }
    });

    zoomImgs.forEach(function (srcImg, idx) {
      srcImg.style.cursor = 'zoom-in';
      srcImg.setAttribute('tabindex', '0');
      srcImg.setAttribute('role', 'button');
      if (!srcImg.getAttribute('alt')) srcImg.setAttribute('aria-label', 'Open full size');
      srcImg.addEventListener('click', function () {
        open(idx);
      });
      srcImg.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(idx);
        }
      });
    });
  }

  // Load more posts
  function initLoadMore() {
    const btn = qs('#load-more');
    const grid = qs('#posts-grid');
    if (!btn || !grid) return;

    let page = 1;
    const total = parseInt(btn.dataset.totalPages || '1', 10);
    let buffer = [];

    function getBatchSize() {
      const view = grid.dataset.view || 'grid';
      if (view === 'grid') {
        const cards = grid.querySelectorAll('.post-card');
        if (!cards.length) return 1;
        const firstTop = cards[0].offsetTop;
        let count = 0;
        for (let i = 0; i < cards.length; i++) {
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
        const imgs = card.querySelectorAll('img');
        const srcs = [];
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
      const batchSize = getBatchSize();

      if (buffer.length >= batchSize) {
        appendCards(buffer.splice(0, batchSize));
        if (buffer.length === 0 && page >= total) btn.closest('.load-more-wrap').style.display = 'none';
        return;
      }

      if (page >= total) {
        if (buffer.length > 0) appendCards(buffer.splice(0));
        btn.closest('.load-more-wrap').style.display = 'none';
        return;
      }
      page++;
      btn.textContent = 'Loading\u2026';
      btn.disabled = true;

      fetch('/_pagination/homepage/' + page + '/index.html')
        .then(function (r) {
          return r.text();
        })
        .then(function (html) {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const cards = Array.from(doc.querySelectorAll('.post-card'));
          buffer = buffer.concat(cards);

          appendCards(page >= total ? buffer.splice(0) : buffer.splice(0, batchSize));

          btn.textContent = 'Load More';
          btn.disabled = false;

          if (buffer.length === 0 && page >= total) btn.closest('.load-more-wrap').style.display = 'none';
        })
        .catch(function () {
          btn.textContent = 'Load More';
          btn.disabled = false;
        });
    });
  }

  // Blog toggle (grid / list)
  function initBlogToggle() {
    const STORE_KEY = 'jekyll-blog-view';
    const grid = qs('#posts-grid');
    const btns = qsa('.view-toggle__btn');
    if (!grid || !btns.length) return;

    function applyView(view, persist) {
      grid.setAttribute('data-view', view);
      document.documentElement.setAttribute('data-blog-view', view);
      btns.forEach(function (btn) {
        const isActive = btn.dataset.view === view;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });
      if (persist) {
        try {
          localStorage.setItem(STORE_KEY, view);
        } catch (e) {}
      }
    }

    let saved = 'grid';
    try {
      saved = localStorage.getItem(STORE_KEY) || 'grid';
    } catch (e) {}
    if (saved !== 'list') saved = 'grid';
    applyView(saved, false);

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyView(btn.dataset.view, true);
      });
    });
  }

  // Share copy-link
  function initShareCopy() {
    qsa('[data-share="copy"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const label = btn.querySelector('.share-btn__label');
        const url = btn.dataset.shareUrl || window.location.href;
        writeClipboard(url, function () {
          btn.setAttribute('aria-label', 'Link copied!');
          if (label) {
            label.textContent = 'Copied!';
          }
          setTimeout(function () {
            btn.setAttribute('aria-label', 'Copy link');
            if (label) {
              label.textContent = 'Copy link';
            }
          }, 2000);
        });
      });
    });
  }

  function initNewsletterBtns() {
    qsa('[data-newsletter-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const url = btn.getAttribute('data-newsletter-open');
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      });
    });
  }

  // Heading copy-link (DOM injected by heading_anchors.rb)
  function initHeadingCopy() {
    const content = qs('.post-content');
    if (!content) return;
    qsa('.heading-anchor', content).forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const id = anchor.getAttribute('href').slice(1);
        const url = window.location.origin + window.location.pathname + '#' + id;
        writeClipboard(url, function () {
          anchor.classList.add('is-copied');
          setTimeout(function () {
            anchor.classList.remove('is-copied');
          }, 1500);
        });
      });
    });
  }

  // Print image wrapping (break-inside: avoid is only reliable on block containers, not on img itself)
  function initPrintImageWrap() {
    let wrapped = [];

    function wrapAll() {
      const content = qs('.post-content');
      if (!content) return;
      qsa('img', content).forEach(function (img) {
        if (img.closest('figure')) return;
        const div = document.createElement('div');
        div.className = 'js-print-img';
        img.parentNode.insertBefore(div, img);
        div.appendChild(img);
        wrapped.push(div);
      });
    }

    function unwrapAll() {
      wrapped.forEach(function (div) {
        const img = div.querySelector('img');
        if (img && div.parentNode) {
          div.parentNode.insertBefore(img, div);
          div.parentNode.removeChild(div);
        }
      });
      wrapped = [];
    }

    window.addEventListener('beforeprint', wrapAll);
    window.addEventListener('afterprint', unwrapAll);
  }

  // Gallery print (lazy thumbnails may be unfetched if gallery was never scrolled; force eager on idle and beforeprint)
  function initGalleryPrintFix() {
    const galleryImgs = qsa('.gallery-item__thumb img');
    if (!galleryImgs.length) return;

    function forceEager() {
      galleryImgs.forEach(function (img) {
        if (img.complete && img.naturalWidth > 0) return;
        img.loading = 'eager';
      });
    }

    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(forceEager, { timeout: 2000 });
    } else {
      setTimeout(forceEager, 800);
    }

    window.addEventListener('beforeprint', forceEager);
  }

  // Reading progress
  function initReadingProgress() {
    const bar = qs('#reading-progress');
    const content = qs('.post-content');
    if (!bar || !content) return;

    function update() {
      const mid = window.innerHeight / 2;
      const rect = content.getBoundingClientRect();
      const contentBottom = window.scrollY + rect.top + content.offsetHeight;
      const end = contentBottom - mid;
      const pct = end > 0 ? Math.min(100, Math.max(0, (window.scrollY / end) * 100)) : 100;
      bar.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', Math.round(pct));
    }

    window.addEventListener('resize', update, { passive: true });

    let rafId = null;
    window.addEventListener(
      'scroll',
      function () {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(function () {
          rafId = null;
          update();
        });
      },
      { passive: true },
    );

    update();
  }

  // Table of Contents
  function initToC() {
    const content = qs('.post-content');
    const tocWidget = qs('#toc-widget');
    if (!content) return;

    const links = [];
    qsa('.toc-link', document).forEach(function (a) {
      const id = a.getAttribute('href').slice(1);
      const h = qs('[id="' + id + '"]', content);
      if (h) links.push({ el: h, link: a });
    });
    if (!links.length) return;

    let headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10);
    if (isNaN(headerH)) headerH = 70;
    const TRIGGER = headerH + 20;

    links.forEach(function (item) {
      item.link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetY = item.el.getBoundingClientRect().top + window.scrollY - TRIGGER;
        window.scrollTo({ top: Math.max(0, targetY), behavior: scrollBehavior() });
        history.replaceState(null, '', '#' + item.el.id);
        setActive(item);
      });
    });

    let active = null;
    function setActive(item) {
      if (active === item) return;
      if (active) active.link.classList.remove('is-active');
      active = item;
      if (!active) return;
      active.link.classList.add('is-active');
      if (tocWidget) {
        const tocNav = tocWidget.querySelector('nav');
        if (tocNav) {
          const li = active.link.parentElement;
          const navH = tocNav.clientHeight;
          const liTop = li.offsetTop;
          if (liTop < tocNav.scrollTop + 16 || liTop + li.offsetHeight > tocNav.scrollTop + navH - 16) {
            tocNav.scrollTo({ top: Math.max(0, liTop - Math.round(navH / 3)), behavior: scrollBehavior() });
          }
        }
      }
    }

    let rafId = null;
    function findActive() {
      let current = null;
      for (let i = links.length - 1; i >= 0; i--) {
        if (links[i].el.getBoundingClientRect().top <= TRIGGER) {
          current = links[i];
          break;
        }
      }
      if (!current) {
        const firstRect = links[0].el.getBoundingClientRect();
        if (firstRect.top < window.innerHeight) current = links[0];
      }
      setActive(current);
    }
    window.addEventListener(
      'scroll',
      function () {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(findActive);
      },
      { passive: true },
    );
    findActive();
  }

  // Archive
  function initArchive() {
    const container = qs('.archive-years');
    const controls = qs('#archive-controls');
    if (!container || !controls) return;
    controls.hidden = false;

    const allDetails = Array.prototype.slice.call(container.querySelectorAll('details'));
    const TARGET_POSTS = Math.max(8, Math.floor((window.innerHeight - 320) / 36));
    let opened = 0;
    allDetails.forEach(function (d) {
      if (opened <= TARGET_POSTS) {
        d.open = true;
        opened += parseInt(d.getAttribute('data-posts') || '0', 10);
      }
    });

    function syncButtons() {
      const anyOpen = allDetails.some(function (d) {
        return d.open;
      });
      const allOpen = allDetails.every(function (d) {
        return d.open;
      });
      const expandBtn = qs('#archive-expand-all');
      const collapseBtn = qs('#archive-collapse-all');
      if (expandBtn) expandBtn.disabled = allOpen;
      if (collapseBtn) collapseBtn.disabled = !anyOpen;
    }

    const expandBtn = qs('#archive-expand-all');
    const collapseBtn = qs('#archive-collapse-all');
    if (expandBtn) {
      expandBtn.addEventListener('click', function () {
        allDetails.forEach(function (d) {
          d.open = true;
        });
        syncButtons();
      });
    }
    if (collapseBtn) {
      collapseBtn.addEventListener('click', function () {
        allDetails.forEach(function (d) {
          d.open = false;
        });
        syncButtons();
      });
    }

    allDetails.forEach(function (d) {
      d.addEventListener('toggle', syncButtons);
    });
    syncButtons();
  }

  // Filter page (tags + topics)
  function initFilterPage(cfg) {
    const buttons = qsa('.filter-page__btn[' + cfg.attr + ']');
    const posts = qsa(cfg.itemSel);
    const filterInput = qs('#' + cfg.param + '-filter-input');
    const meta = qs('#' + cfg.param + '-results-meta');
    const emptyEl = qs('#' + cfg.param + '-empty');
    const emptyMsg = qs('#' + cfg.param + '-empty-msg');
    if (!buttons.length) return;

    const total = posts.length;
    let current = 'all';

    function setActive(btn) {
      buttons.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
    }

    function filterPosts(val) {
      let visible = 0;
      posts.forEach(function (post) {
        const show = val === 'all' || cfg.match(post, val);
        post.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (meta) {
        if (val === 'all' && visible === total) {
          meta.textContent = '';
        } else {
          meta.textContent = '';
          const strong = document.createElement('strong');
          strong.textContent = String(visible);
          meta.appendChild(document.createTextNode('Showing '));
          meta.appendChild(strong);
          meta.appendChild(
            document.createTextNode(' post' + (visible === 1 ? '' : 's') + (val !== 'all' ? cfg.suffix(val) : '')),
          );
        }
      }
      if (emptyEl) emptyEl.classList.toggle('is-visible', visible === 0);
      if (visible === 0 && emptyMsg) {
        emptyMsg.textContent = val === 'all' ? 'No posts yet.' : cfg.emptyMsg(val);
      }
    }

    function updateURL(val) {
      const url = new URL(window.location.href);
      if (val === 'all') url.searchParams.delete(cfg.param);
      else url.searchParams.set(cfg.param, val);
      history.replaceState(null, '', url.toString());
    }

    if (filterInput) {
      filterInput.addEventListener('input', function () {
        const q = filterInput.value.trim().toLowerCase();
        buttons.forEach(function (btn) {
          if (btn.getAttribute(cfg.attr) === 'all') return;
          const label = (btn.dataset.label || btn.getAttribute(cfg.attr) || '').toLowerCase();
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
        if (cfg.onFilter) cfg.onFilter(current);
      });
    });

    const param = new URLSearchParams(window.location.search).get(cfg.param);
    if (param) {
      const slug = param.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const target = qs('[' + cfg.attr + '="' + slug + '"]');
      if (target) {
        current = slug;
        setActive(target);
        filterPosts(slug);
        if (cfg.onFilter) cfg.onFilter(slug);
        target.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  // Year sidebar sync
  function syncYearSidebarLinks(val) {
    qsa('[data-year-link]').forEach(function (link) {
      link.classList.toggle('is-active', link.dataset.yearLink === val);
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(function (reg) {
          if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        })
        .catch(function () {});
    });
  }

  // Blur after pointer click to clear :active/:focus; e.detail===0 skips keyboard
  document.addEventListener('click', function (e) {
    if (!e.detail) return;
    const el = e.target.closest('a[href], button');
    if (el && document.activeElement === el) el.blur();
  });

  document.addEventListener('DOMContentLoaded', function () {
    initScrollTop();
    initMobileNav();
    initLazyImages();
    initImageZoom();
    initPrintImageWrap();
    initGalleryPrintFix();
    initReadingProgress();
    initLoadMore();
    initBlogToggle();
    initShareCopy();
    initNewsletterBtns();
    initHeadingCopy();
    initToC();
    initArchive();
    initFilterPage({
      attr: 'data-tag',
      itemSel: '.tag-item',
      param: 'tag',
      match: function (p, v) {
        return p.dataset.tags.trim().split(/\s+/).indexOf(v) !== -1;
      },
      suffix: function (v) {
        return ' tagged "' + v + '"';
      },
      emptyMsg: function (v) {
        return 'No posts tagged "' + v + '".';
      },
    });
    initFilterPage({
      attr: 'data-topic',
      itemSel: '.topic-item',
      param: 'topic',
      match: function (p, v) {
        return p.dataset.topic === v;
      },
      suffix: function (v) {
        return ' in topic "' + v + '"';
      },
      emptyMsg: function (v) {
        return 'No posts in topic "' + v + '".';
      },
    });
    initFilterPage({
      attr: 'data-year',
      itemSel: '.blog-post-item',
      param: 'year',
      match: function (p, v) {
        return p.dataset.year === v;
      },
      suffix: function (v) {
        return ' from ' + v;
      },
      emptyMsg: function (v) {
        return 'No posts from ' + v + '.';
      },
      onFilter: function (v) {
        syncYearSidebarLinks(v);
      },
    });
    syncYearSidebarLinks(new URLSearchParams(window.location.search).get('year') || 'all');
  });
})();
