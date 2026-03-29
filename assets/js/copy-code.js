// copy-code.js - Copy button handler for .code-block elements built by code_wrapper.rb.
(function () {
  'use strict';

  function copyCode(el, btn) {
    const code = el.querySelector('code') || el.querySelector('pre') || el;
    const text = code.innerText || code.textContent || '';
    const span = btn.querySelector('span');

    function done() {
      btn.classList.add('copied');
      span.textContent = 'Copied!';
      btn.setAttribute('aria-label', 'Copied!');
      setTimeout(function () {
        btn.classList.remove('copied');
        span.textContent = 'Copy';
        btn.setAttribute('aria-label', 'Copy code to clipboard');
      }, 2000);
    }

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
      done();
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.code-block__copy').forEach(function (btn) {
      const block = btn.closest('.code-block');
      if (!block) return;
      const highlight = block.querySelector('.highlight') || block.querySelector('pre');
      if (highlight)
        btn.addEventListener('click', function () {
          copyCode(highlight, btn);
        });
    });
  });
})();
