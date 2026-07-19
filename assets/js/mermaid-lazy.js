// mermaid-lazy.js - Defers loading the Mermaid library until a diagram nears the viewport.
(function () {
  'use strict';

  var nodes = document.querySelectorAll('pre code.language-mermaid');
  if (!nodes.length) return;

  var script = document.currentScript;
  var libSrc = script.dataset.mermaidSrc;
  var initSrc = script.dataset.mermaidInitSrc;

  function loadMermaid() {
    var lib = document.createElement('script');
    lib.src = libSrc;
    lib.onload = function () {
      var init = document.createElement('script');
      init.src = initSrc;
      document.head.appendChild(init);
    };
    document.head.appendChild(lib);
  }

  if (!('IntersectionObserver' in window)) {
    loadMermaid();
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      var near = entries.some(function (entry) {
        return entry.isIntersecting;
      });
      if (!near) return;
      observer.disconnect();
      loadMermaid();
    },
    { rootMargin: '800px 0px' },
  );

  nodes.forEach(function (node) {
    observer.observe(node);
  });
})();
