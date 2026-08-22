---
permalink: /achievements/
layout: default
title: Achievements
description: 'A few milestones and recognitions worth keeping track of.'
---

<div class="page-hero">
  <div class="container">
    <h1 class="page-hero__title">{{ page.title }}</h1>
    <p class="page-hero__desc">{{ page.description }}</p>
  </div>
</div>

<div class="container">
  {%- assign items = site.data.achievements | sort: 'date' | reverse -%}
  {%- if items.size > 0 -%}
    <div class="achievement-grid">
      {%- for item in items -%}
        <article class="achievement-card">
          {%- if item.images.size > 1 -%}
            <div class="achievement-card__images">
              {%- for img in item.images -%}
                <img src="{{ img.src | relative_url }}" alt="{{ img.alt }}" loading="lazy" decoding="async">
              {%- endfor -%}
            </div>
          {%- elsif item.images.size == 1 -%}
            <div class="achievement-card__img">
              <img src="{{ item.images[0].src | relative_url }}" alt="{{ item.images[0].alt }}" loading="lazy" decoding="async">
            </div>
          {%- endif -%}
          <div class="achievement-card__body">
            <h2 class="achievement-card__title">{{ item.title }}</h2>
            <p class="achievement-card__meta">
              {{ item.issuer }} &middot; <time datetime="{{ item.date }}">{{ item.date | date: "%b %Y" }}</time>
            </p>
            <p class="achievement-card__description">{{ item.description }}</p>
            {%- if item.url -%}
              <a class="btn btn--outline btn--sm achievement-card__link" href="{{ item.url }}" target="_blank" rel="noopener noreferrer external">{{ item.url_label | default: 'Reference' }}</a>
            {%- endif -%}
          </div>
        </article>
      {%- endfor -%}
    </div>
  {%- else -%}
    <p class="page-empty">No achievements recorded yet.</p>
  {%- endif -%}
</div>
