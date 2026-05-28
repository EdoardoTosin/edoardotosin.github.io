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

  mermaid.run();

  document.addEventListener('theme-changed', function (e) {
    const newTheme = e.detail === 'dark' ? 'dark' : 'default';
    document.querySelectorAll('.mermaid[data-processed]').forEach(function (el) {
      el.removeAttribute('data-processed');
      el.textContent = el.getAttribute('data-src') || '';
    });
    mermaid.initialize({ startOnLoad: false, theme: newTheme });
    mermaid.run();
  });
});
