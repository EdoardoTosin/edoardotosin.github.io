# Writing Posts

A reference for writing posts and pages in this Jekyll theme.

## Front Matter Reference

Every post in `_posts/` supports these front matter fields:

```yaml
---
layout: post
title: 'Post Title'
description: '160-character description, used as SEO meta, post card preview, and social share.'
date: 2025-01-15 12:00:00 +0000
image: /images/posts/my-post.jpg

topic: programming
tags: [javascript, tooling]
keywords: [webpack, vite]

featured: false
video: false
gallery: false

math: false
mermaid: false

robots: 'noindex'
last_modified_at: 2025-02-01

short_url: 'my-post'

comments: true
share: true

cited_by:
  - '[Article Title - Site Name](https://example.com/article)'

discussions:
  - '[Hacker News](https://news.ycombinator.com/item?id=XXXXXXXX)'
  - '[r/topic](https://reddit.com/r/topic/comments/xxxxx/post_title)'
---
```

The `date` field follows Jekyll front matter format: `YYYY-MM-DD HH:MM:SS +/-HHMM`. See [jekyllrb.com/docs/front-matter](https://jekyllrb.com/docs/front-matter/).

## Taxonomy

The theme uses three distinct taxonomy fields.

### topic

```yaml
topic: linux
```

- Single value only.
- Drives the `/topics/` page and all homepage topic widgets.
- Displayed as the category pill on post cards and in the post hero.
- Used as the primary signal for related-post matching.

### tags

```yaml
tags: [linux, ubuntu, terminal]
```

- Multiple values allowed.
- Drives the `/tags/` filtering page.
- Displayed in the post footer.
- Keep tags lowercase.

### keywords

```yaml
keywords: [arch linux, pacman, AUR]
```

- Never displayed in the UI.
- Emitted as `<meta name="keywords">` and included in the search index.
- Use for terms more specific than your tags: product names, acronyms, jargon.

### description

```yaml
description: 'A practical guide to setting up Arch Linux from scratch.'
```

- Used as: SEO meta description, Open Graph, Twitter Card, post card text, search snippet.
- Aim for 120-160 characters.

## Callout Blocks

Callouts render from pure Markdown using GitHub-style blockquote syntax.

```markdown
> [!NOTE]
> This is a note.

> [!TIP]
> A helpful suggestion.

> [!IMPORTANT]
> Critical information.

> [!WARNING]
> Something that could cause problems.

> [!CAUTION]
> A dangerous or destructive action.
```

Both inline and multi-paragraph variants work:

```markdown
> [!NOTE]
> Single paragraph on the next line.

> [!WARNING]
>
> Multiple paragraphs - blank `>` line between them.
>
> Second paragraph continues here.
```

**Visual hierarchy:**

| Type        | Color           | Intent                           |
| ----------- | --------------- | -------------------------------- |
| `NOTE`      | Neutral / slate | Informational                    |
| `TIP`       | Green           | Helpful suggestion               |
| `IMPORTANT` | Purple          | Must-read information            |
| `WARNING`   | Orange          | Potential issue                  |
| `CAUTION`   | Red             | Dangerous or irreversible action |

## Defanged Indicators

Write defanged URLs, IPs, and domains directly in the post body. The build
detects recognised patterns and wraps them in an amber monospaced style,
visually separating them from regular links and text.

| Notation                   | Example                                       |
| -------------------------- | --------------------------------------------- |
| Defanged HTTP/HTTPS scheme | `hXXp://evil.com`, `hxxps[://]c2.example.net` |
| Defanged domain (`[.]`)    | `evil[.]com`, `cdn[.]malware[.]io`            |
| Defanged domain (`[dot]`)  | `evil[dot]com`, `cdn[dot]badactor[dot]ru`     |
| Defanged IPv4              | `192.168[.]1.1`, `10[.]0[.]0[.]254`           |
| Mixed scheme and IP        | `hXXp://192.168[.]1.1/shell.elf`              |

Defanging is applied to the post body only. The post header (title, date, and
other metadata) is never processed.

The following contexts are left untouched:

- Fenced and indented code blocks
- Inline `` `code` `` spans
- Hyperlink text and targets

Write the notation as plain text in prose; no special markup is required:

```markdown
The implant beaconed to hXXps://c2[.]attacker[.]net/check-in
and fetched a second stage from 203.0[.]113.42/payload.bin.
```

In Obsidian and on GitHub the notation renders as plain text. On the built site
and in the RSS feed, each matched token is wrapped in an amber span.

## Supported Markdown

| Element         | Syntax                   | Notes                                   |
| --------------- | ------------------------ | --------------------------------------- |
| Headings        | `## H2`, `### H3`        | H1 is the post title - do not repeat it |
| Bold / Italic   | `**bold**`, `*italic*`   |                                         |
| Inline code     | `` `code` ``             | Highlighted with accent color           |
| Code block      | ` ```javascript `        | Always include language tag             |
| Blockquote      | `> text`                 | Standard blockquotes are untouched      |
| Link            | `[text](url)`            |                                         |
| Image           | `![alt](url)`            | Auto-zoom on click, lazy-loaded         |
| Table           | `\| col \| col \|`       | Scrollable on small screens             |
| Task list       | `- [ ] item`             | GFM checklist                           |
| Footnote        | `text[^1]` `[^1]: note`  | Rendered at bottom of post              |
| `<kbd>`         | `<kbd>Ctrl</kbd>`        | Keyboard shortcut styling               |
| `<mark>`        | `<mark>text</mark>`      | Accent highlight                        |
| Math (inline)   | `$E = mc^2$`             | Requires `math: true`                   |
| Math (block)    | `$$\nabla \cdot E = 0$$` | Requires `math: true`                   |
| Diagram         | ` ```mermaid `           | Requires `mermaid: true`                |
| Details/summary | `<details><summary>`     | Native HTML collapsible                 |

## Code Blocks

Always declare a language:

````markdown
```javascript
const msg = 'Hello, world!';
console.log(msg);
```
````

Supported language aliases: `js`, `ts`, `py`, `rb`, `sh`/`bash`, `yml`/`yaml`, `html`, `css`, `scss`, `json`, `sql`, `go`, `rust`, `cpp`, `java`.

## Images

Place post images in `images/posts/`. Reference with a relative path:

```markdown
![Descriptive alt text](/images/posts/my-post.jpg)
```

Images are lazy-loaded and zoom on click. Always provide alt text.

The post hero image is set in front matter (`image:`), not inline Markdown.

## Math (KaTeX)

Enable KaTeX on a per-post basis:

```yaml
math: true
```

Then use standard LaTeX delimiters:

```markdown
Inline: $E = mc^2$

Display:

$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

## Diagrams (Mermaid)

Enable Mermaid on a per-post basis:

```yaml
mermaid: true
```

Then use a fenced code block with the `mermaid` language tag:

````markdown
```mermaid
graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Done]
  B -->|No| D[Skip]
```
````

Diagrams adapt to the site's dark/light theme automatically. Mermaid is loaded from jsDelivr only on posts that enable it.

## Series Navigation

Link related posts into an ordered series:

```yaml
series: 'Linux Mastery'
series_order: 2
```

Posts with matching `series` values are linked with Prev/Next navigation in reading order.

## Cross-references

### backlinks (automatic)

When a post contains a `[[wikilink]]` pointing to another post, that target post automatically shows a "Referenced in" section listing all posts that link to it. No front matter is needed because the plugin scans content at build time.

To create a backlink from post A to post B, add a wikilink anywhere in post A's content:

```markdown
[[post-b-slug]] or [[Post B Title]]
```

Post B will then show post A in its "Referenced in" section.

### discussions

Link to external threads where the post has been shared and discussed. Renders as a "Discussion" section directly below the post footer, visible in both web and print views. Omit the field entirely when there are no external threads.

Each entry is a Markdown link: `'[Label](url)'`. The label you write is shown as-is and also determines the platform icon and brand colour.

```yaml
discussions:
  - '[Hacker News](https://news.ycombinator.com/item?id=XXXXXXXX)'
  - '[r/linux](https://reddit.com/r/linux/comments/xxxxx/post_title)'
  - '[Lobsters](https://lobste.rs/s/xxxxx/post_title)'
  - '[Mastodon](https://fosstodon.org/@user/109876543210)'
  - '[Bluesky](https://bsky.app/profile/user.bsky.social/post/xxxxx)'
  - '[DEV Community](https://dev.to/user/post-title)'
```

**Platform detection** (matched from the label, case-insensitive):

| Label                             | Icon          | Brand color |
| --------------------------------- | ------------- | ----------- |
| `Hacker News`, `HN`, `HackerNews` | Hacker News   | #ff6600     |
| starts with `r/`                  | Reddit        | #ff4500     |
| `Lobsters`, `Lobste.rs`           | Lobsters      | #ac130d     |
| `Mastodon`                        | Mastodon      | #6364ff     |
| `Bluesky`                         | Bluesky       | #0085ff     |
| `DEV Community`, `DEV`, `DEV.to`  | DEV Community | #3d3d3d     |
| contains `Twitter`, or `X`        | X / Twitter   | #1da1f2     |
| `LinkedIn`                        | LinkedIn      | #0077b5     |
| _(anything else)_                 | label text    | neutral     |

**Rules:**

- Each entry must be a Markdown link string `'[Label](https://…)'`. Entries without a valid `https://` or `http://` URL are silently skipped.
- The section is not rendered at all when `discussions` is absent or every entry is invalid.
- In print/PDF, discussions render as a bulleted list with the label and full URL shown, so readers can look up the thread.

### cited_by

List external pages (articles, blogs, papers, news) that reference the current post. Rendered as a "Cited by" section at the bottom of the post, visible in print/PDF.

```yaml
cited_by:
  - '[Article Title | Site Name](https://example.com/article)'
  - '[Another Reference](https://other.com/post)'
```

**Supported entry formats:**

| Format        | Example                   | Behaviour                        |
| ------------- | ------------------------- | -------------------------------- |
| Markdown link | `'[Title](https://…)'`    | Renders with custom display text |
| Bare URL      | `'https://example.com'`   | Renders with URL as display text |
| Null / empty  | _(omitted or blank line)_ | Silently skipped                 |

**Rules:**

- Each entry **must** be a YAML string inside a list. The field type in Obsidian Properties must be **List**.
- Only `https://` and `http://` URLs are rendered; entries with other schemes (e.g. `javascript:`, `data:`) are silently dropped.
- If every entry in the list is blank or invalid, the "Cited by" section is not rendered at all.
- Title text is HTML-escaped automatically; no manual escaping needed.
- Obsidian always writes list properties as YAML arrays, so single-item lists are safe:
  ```yaml
  cited_by:
    - '[Only one reference](https://example.com)'
  ```

## Wikilinks

Use Obsidian-style `[[wikilink]]` syntax to create internal links without writing full paths:

```markdown
[[my-post]] links to the page with slug or title "my-post"
[[my-post|Display Text]] custom link text
[[my-post#section-heading]] link with anchor
[[my-post#heading|Label]] anchor with custom text
[[#heading]] same-page anchor link
```

**Resolution:** the plugin looks up pages by filename slug first (e.g. `2025-01-15-my-post.md` -> `my-post`), then by front matter `title` (slugified, case-insensitive). The first match wins.

**Broken links** render as `<span class="wikilink-broken">text</span>`, styled with a red dotted underline and `not-allowed` cursor.

Wikilinks inside fenced code blocks and inline `code` are left untouched.

## Content Checks

The theme checks posts at build time. The build fails if a post is missing:

- `title`
- `date`
- `topic`

Warnings are shown for:

- Missing or over-length `description`
- `topic` set to an array (must be a single string)
- Code blocks without a language specifier
- Images with empty or missing alt text
- Non-descriptive link text ("click here", "read more")
- Heading levels that skip (e.g. H2 to H4)
- Duplicate permalink
