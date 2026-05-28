document.addEventListener('DOMContentLoaded', function () {
  const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';

  mermaid.initialize({ startOnLoad: false, theme: theme });

  // Kramdown renders ```mermaid as <pre><code class="language-mermaid">
  document.querySelectorAll('pre code.language-mermaid').forEach(function (code) {
    const pre = code.parentElement;
    const div = document.createElement('div');
    div.className = 'mermaid';
    div.setAttribute('data-src', code.textContent);
    div.textContent = code.textContent;
    pre.replaceWith(div);
  });

  // The print * rule overrides Mermaid's own inline max-width; only inline !important outranks a stylesheet !important.
  function pinNaturalWidths() {
    document.querySelectorAll('.mermaid[data-processed] svg').forEach(function (svg) {
      const w = svg.style.maxWidth;
      if (w) svg.style.setProperty('max-width', w, 'important');
    });
  }

  const p = mermaid.run();
  if (p && typeof p.then === 'function') {
    p.then(pinNaturalWidths);
  } else {
    requestAnimationFrame(pinNaturalWidths);
  }

  document.addEventListener('theme-changed', function (e) {
    const newTheme = e.detail === 'dark' ? 'dark' : 'default';
    document.querySelectorAll('.mermaid[data-processed]').forEach(function (el) {
      el.removeAttribute('data-processed');
      el.textContent = el.getAttribute('data-src') || '';
    });
    mermaid.initialize({ startOnLoad: false, theme: newTheme });
    const p2 = mermaid.run();
    if (p2 && typeof p2.then === 'function') {
      p2.then(pinNaturalWidths);
    } else {
      requestAnimationFrame(pinNaturalWidths);
    }
  });
});
