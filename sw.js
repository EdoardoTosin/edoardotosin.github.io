---
layout: null
permalink: /sw.js
---
// sw.js - Cache-first for assets; network-first for pages; offline fallback.

'use strict';

const CACHE_REVISION = '{{ site.time | date: "%Y%m%d%H%M%S" }}';
const STATIC_CACHE = `jekyll-static-${CACHE_REVISION}`;
const PAGE_CACHE   = `jekyll-pages-${CACHE_REVISION}`;
const IMAGE_CACHE  = `jekyll-images-${CACHE_REVISION}`;

var PRECACHE_ASSETS = [
  '{{ "/" | relative_url }}',
  '{{ "/assets/css/main.css" | relative_url }}',
  '{{ "/assets/css/fonts.css" | relative_url }}',
  '{{ "/assets/css/katex.min.css" | relative_url }}',
  '{{ "/assets/js/main.js" | relative_url }}',
  '{{ "/assets/js/theme.js" | relative_url }}',
  '{{ "/assets/js/copy-code.js" | relative_url }}',
  '{{ "/assets/js/katex.min.js" | relative_url }}',
  '{{ "/assets/js/auto-render.min.js" | relative_url }}',
  '{{ "/assets/js/katex-init.js" | relative_url }}',
  '{{ "/assets/js/analytics.js" | relative_url }}',
  '{{ "/manifest.json" | relative_url }}',
  '{{ "/favicon.png" | relative_url }}',
  '{{ "/offline.html" | relative_url }}'
];

var MAX_PAGES  = 60;
var MAX_IMAGES = 80;

// Install: precache shell assets
self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return cache.addAll(PRECACHE_ASSETS.filter(Boolean));
    })
  );
});

// Activate: prune old caches
self.addEventListener('activate', function (event) {
  var keepCaches = [STATIC_CACHE, PAGE_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) { return keepCaches.indexOf(k) === -1; })
          .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

// Fetch router
self.addEventListener('fetch', function (event) {
  var req = event.request;
  var url = new URL(req.url);

  // Only intercept same-origin GET requests
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  var dest = req.destination;

  if (dest === 'image') {
    event.respondWith(cacheFirst(req, IMAGE_CACHE, MAX_IMAGES));
    return;
  }

  if (dest === 'style' || dest === 'script' || dest === 'font') {
    event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
    return;
  }

  if (dest === 'document') {
    event.respondWith(networkFirst(req, PAGE_CACHE, MAX_PAGES));
    return;
  }

  // Everything else: network with static cache fallback
  event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
});

// Strategies

// Cache-first: serve from cache; fetch & cache if missing.
function cacheFirst(req, cacheName, maxItems) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (res.ok) {
          trimCache(cache, maxItems);
          cache.put(req, res.clone());
        }
        return res;
      }).catch(function () { return new Response('', { status: 503 }); });
    });
  });
}

// Stale-while-revalidate: serve cached immediately, update in background.
function staleWhileRevalidate(req, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(req).then(function (cached) {
      var fetchPromise = fetch(req).then(function (res) {
        if (res.ok) cache.put(req, res.clone());
        return res;
      });
      return cached || fetchPromise;
    });
  });
}

// Network-first: try network; fall back to cache, then /offline.html.
function networkFirst(req, cacheName, maxItems) {
  return fetch(req).then(function (res) {
    if (res.ok) {
      caches.open(cacheName).then(function (cache) {
        trimCache(cache, maxItems);
        cache.put(req, res.clone());
      });
    }
    return res;
  }).catch(function () {
    return caches.open(cacheName).then(function (cache) {
      return cache.match(req).then(function (cached) {
        return cached || caches.match('/offline.html');
      });
    });
  });
}

// Keep caches from growing unbounded: evict oldest entries beyond maxItems.
function trimCache(cache, maxItems) {
  cache.keys().then(function (keys) {
    if (keys.length > maxItems) {
      cache.delete(keys[0]).then(function () { trimCache(cache, maxItems); });
    }
  });
}
