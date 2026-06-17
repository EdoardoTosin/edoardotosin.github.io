---
layout: page
title: 'About'
description: 'Background in software development and security research, with interests in Linux, open-source, and astrophotography. Contact details included.'
permalink: /about/
---

<div class="about-avatar h-card">
  <div class="about-avatar__img">
    <img src="{{ site.author.avatar | default: '/images/avatar.webp' | relative_url }}"
         alt="{{ site.author.name }}"
         class="u-photo"
         loading="eager"
         data-no-zoom>
  </div>
  <a class="p-name u-url" href="{{ site.url }}{{ site.author.url | default: '/about/' }}" hidden>{{ site.author.name }}</a>
  <span class="p-note" hidden>{{ site.author.bio }}</span>
  {%- if site.author.email and site.author.email != '' -%}
  <a class="u-email" href="mailto:{{ site.author.email }}" hidden>{{ site.author.email }}</a>
  {%- endif -%}
  {%- if site.social.mastodon and site.social.mastodon != '' -%}
  <a class="u-url" href="{{ site.social.mastodon }}" rel="me" hidden>{{ site.social.mastodon }}</a>
  {%- endif -%}
</div>

## {{ site.author.name }}

{{ site.author.hero_description }}

---

## What I Write About

Some of the things I cover here:

- **Software & Security Exploration** - Documenting experiments, practical analysis, and lessons from hands-on software and security work
- **Self-Hosting** - Designing and operating personal services, including DNS servers and software-level network controls on Linux
- **Linux & Open Source** - Tools, workflows, and software commonly used in development and security contexts
- **Programming** - Problem-solving, implementation details, and projects built through continuous practice
- **Astrophotography** - Solar imaging and deep-sky observations with amateur equipment

---

## Get In Touch

Questions, ideas, or just want to say hi - feel free to get in touch.

<p style="display:flex;justify-content:center;">
  <a href="/contact/" class="btn btn--primary" style="margin-top:1rem;">
    Contact Me
  </a>
</p>
