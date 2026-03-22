document.addEventListener('DOMContentLoaded', function () {
  var theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';

  mermaid.initialize({ startOnLoad: false, theme: theme });

  // Kramdown renders ```mermaid as <pre><code class="language-mermaid">
  document.querySelectorAll('pre code.language-mermaid').forEach(function (code) {
    var pre = code.parentElement;
    var div = document.createElement('div');
    div.className = 'mermaid';
    div.textContent = code.textContent;
    pre.replaceWith(div);
  });

  mermaid.run();

  // Re-render on theme toggle
  document.addEventListener('theme-changed', function (e) {
    document.querySelectorAll('.mermaid[data-processed]').forEach(function (el) {
      el.removeAttribute('data-processed');
      el.innerHTML = el.getAttribute('data-src') || el.textContent;
    });
    mermaid.initialize({ startOnLoad: false, theme: e.detail === 'dark' ? 'dark' : 'default' });
    mermaid.run();
  });
});
