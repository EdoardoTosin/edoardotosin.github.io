// offline-save.js - Save post for offline reading via Cache API.
(function () {
  'use strict';

  var SAVED_KEY = 'jekyll-saved-posts'; // localStorage: array of {url,title,date,savedAt}
  var SAVED_CACHE = 'jekyll-saved-articles'; // named cache (persistent across SW revisions)

  // Bail if no service worker or Cache API support
  if (!('serviceWorker' in navigator) || !('caches' in window)) return;

  var btn = document.getElementById('save-offline-btn');
  var pageUrl = window.location.pathname + window.location.search;

  function getSaved() {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function setSaved(arr) {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(arr));
    } catch (e) {}
  }

  function isSaved() {
    return getSaved().some(function (p) {
      return p.url === pageUrl;
    });
  }

  function updateBtn(saving) {
    if (!btn) return;
    var saved = isSaved();
    var labelEl = btn.querySelector('.save-offline-btn__label');
    if (labelEl) {
      labelEl.textContent = saving ? 'Saving\u2026' : saved ? 'Saved offline' : 'Save for offline';
    }
    btn.classList.toggle('is-saved', saved && !saving);
    btn.disabled = !!saving;
    btn.setAttribute('aria-pressed', saved ? 'true' : 'false');
  }

  function savePost() {
    updateBtn(true);

    // Collect post images (same-origin only)
    var imgs = Array.from(document.querySelectorAll('.post-content img, .post-hero__img'))
      .map(function (img) {
        return img.src;
      })
      .filter(function (src) {
        return src && src.startsWith(window.location.origin);
      });

    var urls = [window.location.href].concat(imgs);

    caches
      .open(SAVED_CACHE)
      .then(function (cache) {
        return Promise.all(
          urls.map(function (url) {
            return fetch(url)
              .then(function (res) {
                if (res.ok) return cache.put(url, res);
              })
              .catch(function () {
                /* non-critical: image failed */
              });
          }),
        );
      })
      .then(function () {
        var title = document.title.replace(/\s*[\u2014\-]\s*[^\u2014\-]+$/, '').trim();
        var dateEl = document.querySelector('[itemprop="datePublished"]');
        var date = dateEl ? (dateEl.getAttribute('datetime') || dateEl.textContent).slice(0, 10) : '';
        var saved = getSaved().filter(function (p) {
          return p.url !== pageUrl;
        });
        saved.unshift({ url: pageUrl, title: title, date: date, savedAt: Date.now() });
        setSaved(saved.slice(0, 30));
        updateBtn(false);
      })
      .catch(function () {
        updateBtn(false);
      });
  }

  function removePost() {
    caches.open(SAVED_CACHE).then(function (cache) {
      cache.delete(window.location.href);
    });
    setSaved(
      getSaved().filter(function (p) {
        return p.url !== pageUrl;
      }),
    );
    updateBtn(false);
  }

  if (btn) {
    // Reveal button (hidden by default for no-SW browsers)
    btn.removeAttribute('hidden');
    updateBtn(false);
    btn.addEventListener('click', function () {
      if (isSaved()) removePost();
      else savePost();
    });
  }

  // Expose for offline.html saved-posts list
  window.JekyllSaved = { getSaved: getSaved, remove: removePost };
})();
