// mermaid-init.js - Initialize Mermaid diagrams and handle theme/print re-rendering.
document.addEventListener('DOMContentLoaded', function () {
  // The print * rule overrides Mermaid's own inline max-width; only inline !important outranks a stylesheet !important.
  function pinNaturalWidths() {
    document.querySelectorAll('.mermaid[data-processed]:not(.js-mermaid-print) svg').forEach(function (svg) {
      const w = svg.style.maxWidth;
      if (w) svg.style.setProperty('max-width', w, 'important');
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

  // Render print copies in light theme first; each gets data-processed so the mermaid.run() call below skips them.
  mermaid.initialize({ startOnLoad: false, theme: 'default' });
  const p1 = printNodes.length ? mermaid.run({ nodes: printNodes }) : Promise.resolve();
  const p1done = p1 && typeof p1.then === 'function' ? p1 : Promise.resolve();

  p1done.then(function () {
    const screenTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';
    if (screenTheme !== 'default') {
      mermaid.initialize({ startOnLoad: false, theme: screenTheme });
    }
    const p2 = mermaid.run();
    if (p2 && typeof p2.then === 'function') {
      p2.then(pinNaturalWidths);
    } else {
      requestAnimationFrame(pinNaturalWidths);
    }
  });

  // Theme toggle: re-render only screen diagrams, leave print copies intact.
  document.addEventListener('theme-changed', function (e) {
    const newTheme = e.detail === 'dark' ? 'dark' : 'default';
    document.querySelectorAll('.mermaid[data-processed]:not(.js-mermaid-print)').forEach(function (el) {
      el.removeAttribute('data-processed');
      el.textContent = el.getAttribute('data-src') || '';
    });
    mermaid.initialize({ startOnLoad: false, theme: newTheme });
    const p = mermaid.run();
    if (p && typeof p.then === 'function') {
      p.then(pinNaturalWidths);
    } else {
      requestAnimationFrame(pinNaturalWidths);
    }
  });
});
