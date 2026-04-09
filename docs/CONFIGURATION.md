# Configuration

All settings live in `_config.yml`.

## Identity

```yaml
title:       "Your Name"
description: "What this site is about."
url:         "https://yourdomain.com"
baseurl:     ""
lang:        "en"
og_locale:   "en_US"
timezone:    "Europe/Rome"
repository:  "https://github.com/you/repo"
logo:        "favicon.png"
```

## Author

```yaml
author:
  name:             "Your Name"
  bio:              "One-line bio."
  tagline:          "Role / Interest"
  hero_title:       "Hi, I'm You"
  hero_subtitle:    "What you do"
  hero_description: "Longer homepage intro paragraph."
  avatar:           "/images/avatar.jpg"
  email:            "you@yourdomain.com"
  twitter:          "yourhandle"
```

All fields are optional. Blank fields are omitted from the rendered page.

## Navigation

Header and footer menus are configured independently. Header items with a `children` list become dropdowns.

```yaml
header_nav:
  - title: "Home"
    url:   "/"
  - title: "Archive"
    url:   "/archive/"
  - title: "More"
    children:
      - title: "About"
        url:   "/about/"
      - title: "GitHub"
        url:   "https://github.com/you"
        external: true

footer_nav:
  - group: "Menu"
    items:
      - title: "Home"
        url:   "/"
      - title: "Archive"
        url:   "/archive/"
  - group: "Pages"
    items:
      - title: "About"
        url:   "/about/"
```

Add `external: true` to any item that links outside the site.

## Social

```yaml
social:
  mastodon:   "https://fosstodon.org/@you"
  bluesky:    "https://bsky.app/profile/you.bsky.social"
  github:     "https://github.com/you"
  instagram:  "https://instagram.com/you"
  youtube:    "https://youtube.com/@you"
  linkedin:   "https://linkedin.com/in/you"
```

All fields are optional. Setting `mastodon` adds a `<link rel="me">` tag for Mastodon profile verification. To verify additional accounts without showing them in the footer:

```yaml
social:
  mastodon: "https://fosstodon.org/@you"
  mastodon_also:
    - "https://infosec.exchange/@you"
```

## Homepage Sections

```yaml
homepage:
  enable_blog_toggle: true
  sticky_sidebar:     true
  posts_per_page:     4

  featured_source: "front_matter"
  featured_limit:  3

  topics_limit: 6

  show_topic_clusters: true

  video_source:  "front_matter"
  videos_limit:  3

  gallery_source: "front_matter"
  gallery_limit:  5
```

- `enable_blog_toggle` - show the grid/list view switch on the blog feed
- `sticky_sidebar` - keep the sidebar fixed while scrolling
- `posts_per_page` - number of posts shown initially on the homepage (mobile always shows at most 3)
- `featured_limit` - max posts shown in the Featured Posts sidebar widget
- `topics_limit` - max topics shown in the Topics sidebar widget
- `show_topic_clusters` - set to `false` to hide the Featured Topics section

The Featured Topics section selects topics automatically, ordered by the number of featured posts then total posts per topic. Up to four topics are shown, one per grid column.

## Topic Colors

Topic badge colors come from `_data/topics.yml`. Only `name` and `color` are required:

```yaml
- name: programming
  color: "#6366f1"

- name: linux
  color: "#f97316"
```

All contrast variants (`subtle`, `text_light`, `text_dark`) are derived automatically using WCAG math. You can override any of them manually; manual values are never overwritten:

```yaml
- name: programming
  color: "#6366f1"
  text_dark: "#a5b4fc"
```

Topics used in posts but missing from `_data/topics.yml` are added automatically during build with a neutral grey color (`#64748b`). Check `git diff` after building to see them.

## PGP / GPG Keys

```yaml
crypto_keys:
  pgp_key_id:      "0xABCD1234"
  pgp_fingerprint: "..."
  pgp_keyserver:   "https://keys.openpgp.org/search?q=..."

  gpg_key_id:      "0xEFGH5678"
  gpg_fingerprint: "..."
  gpg_keyserver:   "https://keys.openpgp.org/search?q=..."
```

Shown on the `/contact/` page. Remove the block entirely to hide the section.

## Short URL for Sharing

Enable short URLs by setting `url_shortener` in `_config.yml` and `short_url` in a post's front matter. Otherwise, the full page URL is used.

### Configuration

```yaml
url_shortener: "/s"  # or a subdomain prefix like "go"
```

### Usage

**Subpath mode** (value starts with `/`):

```
site.url + url_shortener + "/" + short_url
```
Example:
```
https://example.com/s/my-post
```

**Subdomain mode** (value does not start with `/`):

```
<protocol>://<url_shortener>.<domain>/<short_url>
```
Example:
```
https://go.example.com/my-post
```
Protocol is taken from `site.url`.

### Per-post front matter

```yaml
short_url: "my-post"
```

**Notes**

- Whitespace is ignored; short URLs are URL-encoded automatically
- Empty or missing values fall back to the full page URL

## Integrations

```yaml
disqus:
  enabled:   false
  shortname: "your-shortname"

google_analytics: ""

newsletter:
  enabled:     false
  action_url:  "https://your-mailchimp-url"
  title:       "Stay in touch"
  description: "Get the latest posts."
  button_text: "Subscribe"

webmentions:
  enabled: false
  domain:  "yourdomain.com"
```

All integrations are off by default. Set `enabled: true` and fill in the required fields to activate.

### Webmentions

[Webmention](https://www.w3.org/TR/webmention/) is an open web standard for cross-site reactions (likes, reposts, replies). This site uses [webmention.io](https://webmention.io) as a receiver.

To enable:

1. Sign in at [webmention.io](https://webmention.io) with your domain using IndieAuth or a rel-me link.
2. Set `webmentions.enabled: true` and `webmentions.domain` to your bare domain (no `https://`):

```yaml
webmentions:
  enabled: true
  domain:  "yourdomain.com"
```

When enabled, the `<link rel="webmention">` and `<link rel="pingback">` discovery tags are added to every page, and a Webmentions section (likes, reposts, and replies) appears at the bottom of each post.

No build-time API calls are made. Webmentions are fetched client-side when a visitor loads a post page.

## Reading Time

```yaml
reading_time:
  words_per_minute: 200
  minute_label:     "min"
  second_label:     "sec"
  read_text:        "read"
```

## Wikilinks

Wikilink processing is enabled by default. To disable globally:

```yaml
obsidian_wikilinks:
  enabled: false
```

## Deployment

**Cloudflare Pages:** connect the GitHub repository in the dashboard. Set build command to `bundle exec jekyll build`, output directory to `_site`, and add `JEKYLL_ENV=production` under Settings > Environment Variables.

**GitHub Pages:** set build command to `bundle exec jekyll build`, publish from `_site/`.
