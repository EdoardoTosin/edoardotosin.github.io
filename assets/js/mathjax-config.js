window.MathJax = {
  tex: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
    processEscapes: true,
  },
  options: {
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
    menuOptions: {
      settings: {
        enrich: false,
        speech: false,
        braille: false,
      },
    },
  },
  startup: {
    typeset: true,
  },
};

// MathJax 4 bug: .mjx-dialog has top:-4% which clips above the viewport; inline style beats the CSS class without breaking drag.
document.addEventListener('DOMContentLoaded', () => {
  const obs = new MutationObserver((mutations) => {
    for (const { addedNodes } of mutations) {
      for (const node of addedNodes) {
        if (node.nodeType === 1 && node.classList.contains('mjx-dialog')) {
          requestAnimationFrame(() => {
            const rect = node.getBoundingClientRect();
            if (rect.top < 0) {
              const computed = parseFloat(getComputedStyle(node).top);
              node.style.top = computed - rect.top + 'px';
            }
          });
        }
      }
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
});
