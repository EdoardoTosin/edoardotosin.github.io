// analytics.js - GA4 init. Reads measurement ID from data-ga-id (set by Jekyll from site.google_analytics).
(function () {
  'use strict';
  var script = document.querySelector('[data-ga-id]');
  var id = script && script.getAttribute('data-ga-id');
  if (!id) { return; }
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id);
}());
