# Configuration

All settings live in `_config.yml`.

## Identity

```yaml
title: 'Your Name'
short_name: 'You'
description: 'What this site is about.'
keywords: 'tag one, tag two, tag three'
url: 'https://yourdomain.com'
baseurl: ''
lang: 'en'
og_locale: 'en_US'
timezone: 'Europe/Rome'
repository: 'https://github.com/you/repo'
logo: '/assets/icons/favicon.png'
```

- `short_name`: used as the PWA app name on home screens and the iOS `apple-mobile-web-app-title`. Keep it under 12 characters for best display on Android launchers. Defaults to `title` if omitted.
- `keywords`: comma-separated string, emitted as `<meta name="keywords">` on pages that have no post-level `keywords` set.
- `lang`: BCP 47 language code set as the `lang` attribute on `<html>` and used by jekyll-feed. Defaults to `en`.
- `og_locale`: Open Graph locale (`og:locale`). Format: `language_TERRITORY` (e.g. `en_US`).
- `timezone`: Ruby timezone name used by Jekyll for date parsing and display (e.g. `Europe/Rome`, `America/New_York`).
- `repository`: full GitHub repository URL. Rendered as a "Source Code" link in the footer copyright bar. Omit to hide the link.
- `logo`: path to the site icon (PNG). Used in the header, footer, SEO tags, and the web app manifest. Place icon files in `assets/icons/`.

## Author

```yaml
author:
  slug: 'your-slug'
  url: '/about/'
  name: 'Your Name'
  bio: 'One-line bio.'
  tagline: 'Role / Interest'
  hero_title: "Hi, I'm You"
  hero_subtitle: ''
  hero_description: 'Longer homepage intro paragraph.'
  avatar: '/images/avatar.webp'
  email: 'you@yourdomain.com'
  twitter: 'yourhandle'
```

- `slug`: must match the key used in post front matter (`author:`). Required for multi-author support.
- `url`: author profile URL, used in the Schema.org JSON-LD for posts.
- `tagline`: shown in the site footer; falls back to `description` if left blank.
- `hero_title`, `hero_subtitle`, `hero_description`: only used when `homepage.show_hero` is enabled (see below). `hero_subtitle` can be left blank if `tagline` already covers the same content - the element is hidden when empty.

All other fields are optional. Blank fields are omitted from the rendered page.

### Co-authors

Additional authors are defined in `_data/authors.yml`, keyed by slug. The primary author does not need an entry there.

```yaml
john-doe:
  name: 'John Doe'
  tagline: 'Technical Writer'
  bio: 'Short bio.'
  avatar: '/images/avatar.webp'
  url: 'https://johndoe.com'
  twitter: 'johndoe'
```

Required fields: `name`, `avatar`. `avatar` accepts a local path (`/images/avatar.webp`) or an external URL (`https://avatars.githubusercontent.com/u/…`). All other fields are optional and omitted from output when blank.

## Navigation

Header and footer menus are configured independently. Header items with a `groups` list become a dropdown. How a group renders depends on how many groups the dropdown has:

- **One group**: a bare list of items on both desktop and mobile.
- **Two or more groups**: each gets a labeled section (with a divider) in the desktop menu, and its own collapsible `<details>` accordion in the mobile drawer.

```yaml
header_nav:
  - title: 'Archive'
    url: '/archive/'
  - title: 'More'
    groups:
      - group: 'Content'
        items:
          - title: 'About'
            url: '/about/'
      - group: 'Connect'
        items:
          - title: 'GitHub'
            url: 'https://github.com/you'
            external: true

footer_nav:
  - group: 'Menu'
    items:
      - title: 'Archive'
        url: '/archive/'
  - group: 'Pages'
    items:
      - title: 'About'
        url: '/about/'
```

The example above has two groups, so it gets labels and accordions; drop the second `group:` entry and merge its `items` into the first to get the flat single-group behavior instead.

Add `external: true` to any item that links outside the site.

## Copyright

```yaml
copyright:
  year: 2022
  msg: Contents under CC BY 4.0
  url: 'https://creativecommons.org/licenses/by/4.0/'
```

Shown in the site footer. `year` is the founding year (a range like `2022-26` is displayed automatically when the current year differs, using a 2-digit end year). `msg` and `url` must both be set to render the license link - omitting either hides it entirely.

## Social

```yaml
social:
  mastodon: 'https://fosstodon.org/@you'
  bluesky: 'https://bsky.app/profile/you.bsky.social'
  github: 'https://github.com/you'
  instagram: 'https://instagram.com/you'
  youtube: 'https://youtube.com/@you'
  linkedin: 'https://linkedin.com/in/you'
```

All fields are optional. Setting `mastodon` adds a `<link rel="me">` tag for Mastodon profile verification. To verify additional accounts without showing them in the footer:

```yaml
social:
  mastodon: 'https://fosstodon.org/@you'
  mastodon_also:
    - 'https://infosec.exchange/@you'
```

## Homepage Sections

```yaml
homepage:
  show_hero: false
  enable_blog_toggle: true
  sticky_sidebar: true
  recent_limit: 6

  pinned_source: 'front_matter'
  pinned_limit: 3

  topics_limit: 6

  show_topic_clusters: true

  video_source: 'front_matter'
  videos_limit: 3

  gallery_source: 'front_matter'
  gallery_limit: 5

  merge_media_section: true
```

- `show_hero`: set to `true` to show a name/intro section above the blog feed, using the `hero_*` fields under `author:`. Off by default.
- `enable_blog_toggle`: show the grid/list view switch on the blog feed
- `sticky_sidebar`: keep the `/blog/` sidebar fixed while scrolling
- `recent_limit`: number of recent posts shown on the homepage
- `pinned_source`: how pinned posts are selected. `front_matter` uses posts with `pinned: true` in their front matter.
- `pinned_limit`: max posts shown in the homepage's pinned row and the `/blog/` sidebar's Pinned widget
- `topics_limit`: max topics shown in the `/blog/` sidebar's Topics widget
- `show_topic_clusters`: set to `false` to hide the Topics section
- `video_source`: how video posts are selected. `front_matter` uses posts with `video: true` in their front matter.
- `videos_limit`: max video posts shown in the homepage's Media/Videos section
- `gallery_source`: how gallery posts are selected. `front_matter` uses posts with `gallery: true` in their front matter.
- `gallery_limit`: max gallery posts shown in the homepage's Media/Gallery section
- `merge_media_section`: when `true` (default), Videos and Gallery render together under one heading that adapts its label ("Media"/"Videos"/"Gallery") to whichever content actually exists. Set to `false` to render them as two separate sections instead, each with its own "View all" link.

The Topics section selects topics automatically, ordered by the number of pinned posts then total posts per topic. Up to four topics are shown, one per grid column.

## Topic Colors

Topic badge colors come from `_data/topics.yml`. Only `name` and `color` are required:

```yaml
- name: programming
  color: '#6366f1'

- name: linux
  color: '#f97316'
```

All contrast variants (`subtle`, `text_light`, `text_dark`) are derived automatically using WCAG math. You can override any of them manually; manual values are never overwritten:

```yaml
- name: programming
  color: '#6366f1'
  text_dark: '#a5b4fc'
```

Topics used in posts but missing from `_data/topics.yml` are added automatically during build with a neutral grey color (`#64748b`). Check `git diff` after building to see them.

## Achievements

Entries for `/achievements/` come from `_data/achievements.yml`, sorted by date, most recent first.

```yaml
- title: 'Example Certification'
  issuer: 'Example Institute'
  date: 2025-01-15
  description: 'Short description of what was earned.'
  url: 'https://example.com'
  url_label: 'Verify'
  images:
    - src: '/images/pages/achievements/example/front.webp'
      alt: 'Description of the image'
```

Required fields: `title`, `issuer`, `date`, `description`. `url` and `images` are optional; `url_label` defaults to "Reference" when omitted. One image renders as a wide banner, two or more render in a grid.

## PGP / GPG Keys

```yaml
crypto_keys:
  pgp_key_id: '0xABCD1234'
  pgp_fingerprint: '...'
  pgp_keyserver: 'https://keys.openpgp.org/search?q=...'

  gpg_key_id: '0xEFGH5678'
  gpg_fingerprint: '...'
  gpg_keyserver: 'https://keys.openpgp.org/search?q=...'
```

Shown on the `/contact/` page, and the PGP keyserver link is shown on `/security-policy/`. Remove the block entirely to hide both.

## Short URL for Sharing

Enable short URLs by setting `url_shortener` in `_config.yml` and `short_url` in a post's front matter. Otherwise, the full page URL is used.

### Configuration

```yaml
url_shortener: '/s' # or a subdomain prefix like "go"
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
short_url: 'my-post'
```

**Notes**

- Whitespace is ignored; short URLs are URL-encoded automatically
- Empty or missing values fall back to the full page URL

## Integrations

```yaml
disqus:
  enabled: false
  shortname: 'your-shortname'

google_analytics: ''

site_verification:
  google: '' # Google Search Console verification token
  bing: '' # Bing Webmaster Tools verification token

newsletter:
  enabled: false
  action_url: 'https://your-mailchimp-url'
  title: 'Stay in touch'
  description: 'Get the latest posts.'
  button_text: 'Subscribe'

webmentions:
  enabled: false
  domain: 'yourdomain.com'
```

All integrations are off by default. Set `enabled: true` and fill in the required fields to activate.

- `google_analytics`: Google Analytics measurement ID (e.g. `G-XXXXXXXXXX`). Leave blank to disable.
- `site_verification`: paste only the `content=` token value from the meta tag provided by the respective webmaster tool, not the full tag.

### Webmentions

[Webmention](https://www.w3.org/TR/webmention/) is an open web standard for cross-site reactions (likes, reposts, replies). This site uses [webmention.io](https://webmention.io) as a receiver.

To enable:

1. Sign in at [webmention.io](https://webmention.io) with your domain using IndieAuth or a rel-me link.
2. Set `webmentions.enabled: true` and `webmentions.domain` to your bare domain (no `https://`):

```yaml
webmentions:
  enabled: true
  domain: 'yourdomain.com'
```

When enabled, the `<link rel="webmention">` and `<link rel="pingback">` discovery tags are added to every page, and a Webmentions section (likes, reposts, and replies) appears at the bottom of each post.

No build-time API calls are made. Webmentions are fetched client-side when a visitor loads a post page.

## RSS Feed

```yaml
feed:
  path: feed.xml
  posts_limit: 50
  icon: /images/avatar.webp
  logo: /images/social-preview.png
```

- `path`: URL path of the feed file. Defaults to `feed.xml`. Referenced in templates to build the feed link.
- `posts_limit`, `icon`, `logo`: consumed directly by the `jekyll-feed` gem. `posts_limit` caps the number of entries; `icon` is a small square image shown by feed readers; `logo` is a wide banner image.

## PWA Manifest

```yaml
manifest:
  shortcuts:
    - name: 'Archive'
      short_name: 'Archive'
      description: 'Browse all posts'
      url: '/archive/'
    - name: 'Search'
      short_name: 'Search'
      description: 'Search posts'
      url: '/?q='
```

Controls `manifest.json`, the web app manifest used when the site is installed as a PWA. `name`, `short_name`, `description`, and `lang` come from the top-level site settings above and aren't repeated here. `theme_color` and `background_color` are fixed to the site's brand colors and aren't configurable here.

- `shortcuts`: right-click/long-press jump links on the installed app icon. Each entry needs `name` and `url`; `short_name` falls back to `name`, and all shortcuts reuse `logo` as their icon. Set to an empty list to omit shortcuts entirely.

## Reading Time

```yaml
reading_time:
  words_per_minute: 200
  minute_label: 'min'
  second_label: 'sec'
  read_text: 'read'
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
