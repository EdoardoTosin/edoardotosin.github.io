// katex-init.js - KaTeX renderMathInElement init. Runs after katex.min.js and auto-render.min.js (defer order).
(function () {
  'use strict';
  if (typeof renderMathInElement !== 'function') { return; }
  renderMathInElement(document.body, {
    delimiters: [
      { left: '$$', right: '$$', display: true  },
      { left: '$',  right: '$',  display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true  }
    ],
    throwOnError: false,
    trust: false
  });
}());
