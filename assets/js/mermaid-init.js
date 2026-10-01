// mermaid-init.js - Initialize Mermaid diagrams and handle theme/print re-rendering.
function initMermaid() {
  if (typeof mermaid === 'undefined') return;

  // Mermaid 12 defaults to the ELK layout and neo look, which re-lays out existing diagrams.
  function mermaidConfig(theme) {
    return { startOnLoad: false, theme: theme, look: 'classic', layout: 'dagre', securityLevel: 'strict' };
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';
  }

  // initialize() is global, so overlapping passes would mix themes.
  let chain = Promise.resolve();
  function enqueue(task) {
    chain = chain.then(task).catch(function (e) {
      console.warn('[Mermaid]', e);
    });
  }

  // Opens any <details> containing Mermaid nodes so the layout engine can size diagrams.
  function withOpenDetails(task) {
    const opened = [];
    document.querySelectorAll('.mermaid').forEach(function (m) {
      const d = m.closest('details');
      if (d && !d.open && opened.indexOf(d) < 0) {
        d.open = true;
        opened.push(d);
      }
    });
    return task().finally(function () {
      opened.forEach(function (d) {
        d.open = false;
      });
    });
  }

  // A syntax error otherwise aborts every remaining diagram in the pass.
  function runNodes(nodes, theme) {
    if (!nodes.length) return Promise.resolve();
    mermaid.initialize(mermaidConfig(theme));
    return mermaid.run({ nodes: nodes, suppressErrors: true });
  }

  // The print * rule overrides Mermaid's own inline max-width; only inline !important outranks a stylesheet !important.
  function pinNaturalWidths() {
    document.querySelectorAll('.mermaid[data-processed]:not(.js-mermaid-print) svg').forEach(function (svg) {
      const w = svg.style.maxWidth;
      if (w) svg.style.setProperty('max-width', w, 'important');
    });
  }

  function svgDataUrl(svg, width) {
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const p = (clone.getAttribute('viewBox') || '').trim().split(/[\s,]+/);
    const vbW = parseFloat(p[2]);
    const vbH = parseFloat(p[3]);
    if (vbW > 0 && vbH > 0) {
      const w = width || vbW;
      clone.setAttribute('width', w);
      clone.setAttribute('height', Math.round((w * vbH) / vbW));
    }
    clone.style.removeProperty('max-width');
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
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
        // Oversized so CSS max-width/max-height fills the dialog.
        document.dispatchEvent(
          new CustomEvent('zoom:open', { detail: { src: svgDataUrl(svg, 4000), alt: '', mermaid: true } }),
        );
      }
      el.addEventListener('click', openZoom);
      el.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        openZoom();
      });
    });
  }

  function renderScreen(theme) {
    const nodes = Array.from(document.querySelectorAll('.mermaid:not(.js-mermaid-print)'));
    return runNodes(nodes, theme).then(function () {
      pinNaturalWidths();
      addMermaidZoom();
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

  // Print copies render first in light theme; each gets data-processed so the screen pass skips them.
  enqueue(function () {
    return withOpenDetails(function () {
      return runNodes(printNodes, 'default').then(function () {
        return renderScreen(currentTheme());
      });
    });
  });

  // Firefox print fix: pre-rendered print SVGs serialized to <img> data URLs so Firefox prints them reliably.
  let printImgs = [];

  function buildPrintImgs() {
    if (printImgs.length) return;
    document.querySelectorAll('.mermaid.js-mermaid-print[data-processed]').forEach(function (el) {
      const svg = el.querySelector('svg');
      if (!svg) return;
      try {
        const img = document.createElement('img');
        // Element is display:none on screen so getBoundingClientRect() gives 0; use viewBox instead.
        img.src = svgDataUrl(svg);
        img.style.cssText = 'max-width:100%;display:block;';
        // Screen copy is always the element immediately before the print copy.
        const screen = el.previousElementSibling;
        const isScreen =
          screen && screen.classList.contains('mermaid') && !screen.classList.contains('js-mermaid-print');
        (isScreen ? screen : el).after(img);
        if (isScreen) screen.style.setProperty('display', 'none', 'important');
        el.style.setProperty('display', 'none', 'important');
        printImgs.push({ screen: isScreen ? screen : null, printEl: el, img: img });
      } catch (e) {}
    });
  }

  function removePrintImgs() {
    printImgs.forEach(function (r) {
      if (r.img.parentNode) r.img.parentNode.removeChild(r.img);
      if (r.screen) r.screen.style.removeProperty('display');
      if (r.printEl) r.printEl.style.removeProperty('display');
    });
    printImgs = [];
  }

  window.addEventListener('beforeprint', buildPrintImgs);
  window.addEventListener('afterprint', removePrintImgs);

  // Theme toggle: re-render only screen diagrams, leave print copies intact.
  document.addEventListener('theme-changed', function (e) {
    const theme = e.detail === 'dark' ? 'dark' : 'default';
    enqueue(function () {
      return withOpenDetails(function () {
        document.querySelectorAll('.mermaid[data-processed]:not(.js-mermaid-print)').forEach(function (el) {
          el.removeAttribute('data-processed');
          el.textContent = el.getAttribute('data-src') || '';
        });
        return renderScreen(theme);
      });
    });
  });
}

// Loaded dynamically by mermaid-lazy.js, usually after DOMContentLoaded already fired.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMermaid);
} else {
  initMermaid();
}
