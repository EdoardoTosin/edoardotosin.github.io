// mermaid-init.js - Initialize Mermaid diagrams and handle theme/print re-rendering.
function initMermaid() {
  // The print * rule overrides Mermaid's own inline max-width; only inline !important outranks a stylesheet !important.
  function pinNaturalWidths() {
    document.querySelectorAll('.mermaid[data-processed]:not(.js-mermaid-print) svg').forEach(function (svg) {
      const w = svg.style.maxWidth;
      if (w) svg.style.setProperty('max-width', w, 'important');
    });
  }

  function addMermaidZoom() {
    document.querySelectorAll('.mermaid[data-processed]:not(.js-mermaid-print)').forEach(function (el) {
      if (el.dataset.zoomBound) return;
      el.dataset.zoomBound = '1';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', 'Open diagram full size');
      function openZoom() {
        // Print copy is always light-theme; legible on the dark dialog backdrop.
        const printEl = el.nextElementSibling;
        const printSvg =
          printEl && printEl.classList.contains('js-mermaid-print') ? printEl.querySelector('svg') : null;
        const svg = printSvg || el.querySelector('svg');
        if (!svg) return;
        const clone = svg.cloneNode(true);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        // Oversized so CSS max-width/max-height fills the dialog.
        const vb = clone.getAttribute('viewBox');
        if (vb) {
          const p = vb.trim().split(/[\s,]+/);
          const vbW = parseFloat(p[2]);
          const vbH = parseFloat(p[3]);
          if (vbW > 0 && vbH > 0) {
            clone.setAttribute('width', 4000);
            clone.setAttribute('height', Math.round((4000 * vbH) / vbW));
          }
        }
        clone.style.removeProperty('max-width');
        const serialized = new XMLSerializer().serializeToString(clone);
        const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(serialized)));
        document.dispatchEvent(new CustomEvent('zoom:open', { detail: { src: dataUrl, alt: '', mermaid: true } }));
      }
      el.addEventListener('click', openZoom);
      el.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        openZoom();
      });
    });
  }

  const printNodes = [];

  // Kramdown renders ```mermaid as <pre><code class="language-mermaid">
  document.querySelectorAll('pre code.language-mermaid').forEach(function (code) {
    const pre = code.parentElement;
    const src = code.textContent;

    const div = document.createElement('div');
    div.className = 'mermaid';
    div.setAttribute('data-src', src);
    div.textContent = src;
    pre.replaceWith(div);

    // Pre-rendered hidden light copy so the SVG is already in the DOM when the print dialog opens.
    const copy = document.createElement('div');
    copy.className = 'mermaid js-mermaid-print';
    copy.setAttribute('data-src', src);
    copy.textContent = src;
    div.after(copy);
    printNodes.push(copy);
  });

  // Opens any <details> containing Mermaid nodes before rendering so the layout engine can size diagrams; closed after all passes complete.
  const openedForRender = [];
  document.querySelectorAll('.mermaid').forEach(function (m) {
    const d = m.closest ? m.closest('details') : null;
    if (d && !d.open && openedForRender.indexOf(d) < 0) {
      d.open = true;
      openedForRender.push(d);
    }
  });

  // Render print copies in light theme first; each gets data-processed so the mermaid.run() call below skips them.
  mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'strict' });
  const p1 = printNodes.length ? mermaid.run({ nodes: printNodes }) : Promise.resolve();
  const p1done = p1 && typeof p1.then === 'function' ? p1 : Promise.resolve();

  p1done.then(function () {
    const screenTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';
    if (screenTheme !== 'default') {
      mermaid.initialize({ startOnLoad: false, theme: screenTheme, securityLevel: 'strict' });
    }
    const screenNodes = Array.from(document.querySelectorAll('.mermaid:not(.js-mermaid-print)'));
    const p2 = screenNodes.length ? mermaid.run({ nodes: screenNodes }) : null;
    if (p2 && typeof p2.then === 'function') {
      p2.then(function () {
        pinNaturalWidths();
        addMermaidZoom();
        openedForRender.forEach(function (d) {
          d.open = false;
        });
      });
    } else {
      requestAnimationFrame(function () {
        pinNaturalWidths();
        addMermaidZoom();
        openedForRender.forEach(function (d) {
          d.open = false;
        });
      });
    }
  });

  // Firefox print fix: pre-rendered print SVGs serialized to <img> data URLs so Firefox prints them reliably.
  var _mermaidPrintImgs = [];

  function buildMermaidPrintImgs() {
    document.querySelectorAll('.mermaid.js-mermaid-print[data-processed]').forEach(function (el) {
      var svg = el.querySelector('svg');
      if (!svg) return;
      try {
        var clone = svg.cloneNode(true);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        // Element is display:none on screen so getBoundingClientRect() gives 0; use viewBox instead.
        var vb = clone.getAttribute('viewBox');
        if (vb) {
          var p = vb.trim().split(/[\s,]+/);
          var w = parseFloat(p[2]);
          var h = parseFloat(p[3]);
          if (w > 0) {
            clone.setAttribute('width', w);
            clone.setAttribute('height', h > 0 ? h : w);
          }
        }
        var serialized = new XMLSerializer().serializeToString(clone);
        var dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(serialized);
        var img = document.createElement('img');
        img.src = dataUrl;
        img.style.cssText = 'max-width:100%;display:block;';
        // Screen copy is always the element immediately before the print copy.
        var screen = el.previousElementSibling;
        var isScreen = screen && screen.classList.contains('mermaid') && !screen.classList.contains('js-mermaid-print');
        var anchor = isScreen ? screen : el;
        anchor.after(img);
        if (isScreen) screen.style.setProperty('display', 'none', 'important');
        el.style.setProperty('display', 'none', 'important');
        _mermaidPrintImgs.push({ screen: isScreen ? screen : null, printEl: el, img: img });
      } catch (e) {}
    });
  }

  function removeMermaidPrintImgs() {
    _mermaidPrintImgs.forEach(function (r) {
      if (r.img.parentNode) r.img.parentNode.removeChild(r.img);
      if (r.screen) r.screen.style.removeProperty('display');
      if (r.printEl) r.printEl.style.removeProperty('display');
    });
    _mermaidPrintImgs = [];
  }

  window.addEventListener('beforeprint', buildMermaidPrintImgs);
  window.addEventListener('afterprint', removeMermaidPrintImgs);

  // Theme toggle: re-render only screen diagrams, leave print copies intact.
  document.addEventListener('theme-changed', function (e) {
    const newTheme = e.detail === 'dark' ? 'dark' : 'default';
    document.querySelectorAll('.mermaid[data-processed]:not(.js-mermaid-print)').forEach(function (el) {
      el.removeAttribute('data-processed');
      el.textContent = el.getAttribute('data-src') || '';
    });
    mermaid.initialize({ startOnLoad: false, theme: newTheme, securityLevel: 'strict' });
    const screenNodes = Array.from(document.querySelectorAll('.mermaid:not(.js-mermaid-print)'));
    const p = screenNodes.length ? mermaid.run({ nodes: screenNodes }) : null;
    if (p && typeof p.then === 'function') {
      p.then(function () {
        pinNaturalWidths();
        addMermaidZoom();
      });
    } else {
      requestAnimationFrame(function () {
        pinNaturalWidths();
        addMermaidZoom();
      });
    }
  });
}

// Loaded dynamically by mermaid-lazy.js, usually after DOMContentLoaded already fired.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMermaid);
} else {
  initMermaid();
}
