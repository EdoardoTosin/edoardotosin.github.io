---
layout: page
title: 'Credits'
description: 'Open-source tools, libraries, fonts, and resources used to build this website, including Jekyll, IBM Plex Sans, Outfit, JetBrains Mono, and more.'
permalink: /credits/
---

This site is built with Jekyll and the following open-source tools and resources.

## License

**Code** - Released under the [MIT License](https://opensource.org/licenses/MIT).

**Content** - Blog posts are published under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). You can reuse or adapt them with attribution. Posts with a different license say so at the top.

---

## Platform

- **[Jekyll](https://jekyllrb.com/)** - Static site generator
- **[GitHub Pages](https://pages.github.com/)** - Hosting and deployment
- **[Cloudflare](https://www.cloudflare.com/)** - CDN, DNS, and edge caching
- **[Ruby](https://www.ruby-lang.org/) & [Bundler](https://bundler.io/)** - Dependency management

---

## Languages & Tooling

- **[Liquid](https://shopify.github.io/liquid/)** - Templating language
- **[Sass / SCSS](https://sass-lang.com/)** - Styles, compiled via `jekyll-sass-converter`
- **[Kramdown](https://kramdown.gettalong.org/)** - Markdown parser
- **[Nokogiri](https://nokogiri.org/)** - HTML parser used by build-time plugins

---

## Jekyll Plugins

- **[Rouge](https://github.com/rouge-ruby/rouge)** - Syntax highlighting for code blocks
- **[jekyll-feed](https://github.com/jekyll/jekyll-feed)** - RSS feed at `/feed.xml`
- **[jekyll-sitemap](https://github.com/jekyll/jekyll-sitemap)** - `sitemap.xml` for search engines
- **[jekyll-paginate-v2](https://github.com/sverrirs/jekyll-paginate-v2)** - Blog pagination

---

## Typography

- **[IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans)** - Body font
- **[Outfit](https://fonts.google.com/specimen/Outfit)** - Heading font
- **[JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)** - Monospace font for code, with ligatures

All fonts are self-hosted as WOFF2 files - no external requests.

---

## Icons

- **[Lucide](https://lucide.dev/)** - UI icons, MIT licensed
- **[Simple Icons](https://simpleicons.org/)** - Brand icons, CC0 licensed

---

## Search

- **Custom engine** - Client-side full-text search with no external library. Runs entirely in the browser against a static index.

---

## Progressive Web App

- **[Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)** - Offline support
- **[Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)** - Installable on mobile

---

## Diagrams

- **[Mermaid](https://mermaid.js.org/)** - Diagrams from fenced code blocks, loaded only on posts that need it. Respects the site's dark/light theme.

---

## Math

- **[KaTeX](https://katex.org/)** - LaTeX math rendering, loaded only on posts that need it

---

## Specifications & Standards

- **[Schema.org](https://schema.org/)** - Structured data vocabulary, used via JSON-LD on every page (`BlogPosting`, `Person`, `BreadcrumbList`, etc.)
- **[Open Graph Protocol](https://ogp.me/)** - Metadata standard for social sharing previews (`og:title`, `og:image`, etc.)
- **[Webmention](https://www.w3.org/TR/webmention/)** - W3C Recommendation for cross-site interactions, used for reactions and replies
- **[JSON Feed](https://jsonfeed.org/)** - Feed format specification, used for `/feed.json`
- **[Microformats2](https://microformats.org/wiki/microformats2)** - Semantic HTML vocabulary (`h-card`, `h-entry`) for structured data
- **[OpenSearch](https://github.com/dewitt/opensearch)** - Browser search integration specification, used for address bar search
- **[security.txt (RFC 9116)](https://www.rfc-editor.org/rfc/rfc9116)** - Standard for responsible vulnerability disclosure, served at `/.well-known/security.txt`

---

## Acknowledgements

Thanks to everyone who builds and maintains the open-source tools that make this possible.
