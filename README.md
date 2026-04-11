# Personal Site

Custom Jekyll theme for a personal blog and portfolio. Dark-mode-first, responsive, accessible (WCAG AA), no CSS framework.

## Quick Start

```bash
bundle install
bundle exec jekyll serve --livereload
```

Open `http://localhost:4000`. Build for production:

```bash
JEKYLL_ENV=production bundle exec jekyll build
```

## Pages

| Route        | Description                                             |
| ------------ | ------------------------------------------------------- |
| `/`          | Homepage                                                |
| `/blog/`     | All posts with thumbnails, year filter, and view toggle |
| `/archive/`  | Compact text index of all posts by year                 |
| `/topics/`   | Posts filtered by topic                                 |
| `/tags/`     | Posts filtered by tag                                   |
| `/projects/` | Projects                                                |
| `/gallery/`  | Posts with `gallery: true`                              |
| `/videos/`   | Posts with `video: true`                                |
| `/now/`      | Now page                                                |
| `/about/`    | About                                                   |
| `/contact/`  | Contact and PGP/GPG keys                                |
| `/credits/`  | Attributions                                            |

## Documentation

- [Configuration](docs/CONFIGURATION.md) - `_config.yml` settings, navigation, social, topics, deployment
- [Writing Posts](docs/AUTHORING.md) - front matter, Markdown features, callouts, wikilinks

## License

Code: [MIT](https://opensource.org/licenses/MIT)

Content: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
