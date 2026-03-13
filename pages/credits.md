---
layout: page
title: "Credits"
description: "Tools, libraries, and resources used to build this site."
permalink: /credits/
---

This site is a personal blog and portfolio built with Jekyll. The following open-source tools, libraries, and services make it possible.

## License

**Code** - All theme source files are released under the [MIT License](https://opensource.org/licenses/MIT). Feel free to fork, adapt, and build on this work.

**Content** - Blog posts and written content are published under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). You may reuse or adapt the content with attribution.

---

## Platform

- **[Jekyll](https://jekyllrb.com/)** - Static site generator. Markdown and Liquid templates compiled to flat HTML.
- **[Cloudflare Pages](https://pages.cloudflare.com/)** - Hosting and continuous deployment via `git push`.
- **[Ruby](https://www.ruby-lang.org/) & [Bundler](https://bundler.io/)** - Dependency management for Jekyll plugins.

---

## Languages & Tooling

- **[Liquid](https://shopify.github.io/liquid/)** - Templating language embedded in layouts and includes.
- **[Sass / SCSS](https://sass-lang.com/)** - Compiled by [Dart Sass](https://sass-lang.com/dart-sass/) via `jekyll-sass-converter`. BEM methodology, no external CSS framework.
- **[Kramdown](https://kramdown.gettalong.org/)** - Markdown parser configured with GFM input mode.
- **[Nokogiri](https://nokogiri.org/)** - HTML parser used by build-time plugins for external link and heading anchor injection.

---

## Jekyll Plugins

- **[jekyll-feed](https://github.com/jekyll/jekyll-feed)** - Atom RSS feed at `/feed.xml`
- **[jekyll-sitemap](https://github.com/jekyll/jekyll-sitemap)** - `sitemap.xml` for search engines
- **[jekyll-paginate-v2](https://github.com/sverrirs/jekyll-paginate-v2)** - Blog feed pagination with AJAX load-more

### Custom Build Plugins

- **`_plugins/callouts.rb`** - Converts GitHub-style `[!NOTE]` / `[!TIP]` / `[!WARNING]` blockquotes into semantic HTML callout components at build time.
- **`_plugins/external_links.rb`** - Adds `target="_blank"`, `rel="noopener noreferrer"`, `data-ext` attribute, and `aria-label` to all external links inside post content at build time (zero runtime JavaScript).
- **`_plugins/heading_anchors.rb`** - Injects `.heading-anchor` links into every `h2`/`h3`/`h4` inside post content at build time. JavaScript only handles clipboard copy on click.
- **`_plugins/markdown_lint.rb`** - Warns about common Markdown authoring issues during `jekyll build`.

---

## Typography

- **[IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans)** - Body typeface. IBM's open-source sans-serif designed for technical documentation and product interfaces.
- **[Outfit](https://fonts.google.com/specimen/Outfit)** - Heading typeface. Clean geometric grotesque with a strong weight range (400-800).
- **[Cascadia Code](https://github.com/microsoft/cascadia-code)** - Monospaced typeface for all code blocks and inline code. Microsoft open-source, excellent ligature support (`=>`, `!=`, `===`).

All fonts are self-hosted as WOFF2 files with `font-display: swap` - no Google Fonts network requests.

---

## Math Rendering

- **[KaTeX](https://katex.org/)** - Fast client-side LaTeX math rendering via `auto-render`. Resources only load on posts with `math: true` in front matter.

---

## Search

- **Custom BM25 engine** - Client-side full-text search built without any external library. Implements BM25 ranking, Porter-style stemming, phrase matching, boolean operators (`AND`/`OR`/`-`), and advanced filters (`topic:`, `tag:`, `after:`, `before:`, `is:featured`, `words:>N`, `time:>N`, `intitle:`, `inurl:`). The entire index is loaded from a static `search.json` at runtime; no server is involved.

---

## Progressive Web App

- **[Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)** - Custom `sw.js` caches pages and assets for offline reading, using a stale-while-revalidate strategy.
- **[Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)** - `manifest.json` enables "Add to Home Screen" on Android/iOS with a standalone display mode.

---

## Acknowledgements

Thanks to the open-source community and everyone who builds and maintains the tools that make projects like this possible.
