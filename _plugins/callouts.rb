# callouts.rb - Transforms > [!TYPE] blockquotes into callout divs at :site, :post_render.
# See docs/PLUGINS.md for syntax, ARIA model, and WCAG contrast ratios.

module Callouts

  TYPES = %w[NOTE TIP IMPORTANT WARNING CAUTION SPOILER].freeze

  BQ_OPEN_RE  = /<blockquote(?:\s[^>]*)?>/.freeze
  BQ_CLOSE    = '</blockquote>'.freeze
  BQ_CLOSE_RE = /<\/blockquote>/i.freeze

  TYPE_RE = /\A\s*<p>\[!(#{TYPES.join('|')})\][ \t]*([\s\S]*?)<\/p>/i.freeze

  # Lucide "eye" icon (16×16, stroke-width 2).
  EYE_ICON = '<svg class="callout__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>'.freeze

  # Lucide "chevron-down" icon (16×16, stroke-width 2.5).
  CHEVRON_ICON = '<svg class="callout__chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>'.freeze

  # Returns end pos after matching </blockquote>, or nil if malformed.
  def self.find_matching_close(html, start)
    depth = 1
    pos   = start

    while pos < html.length
      next_open  = BQ_OPEN_RE.match(html, pos)
      next_close = BQ_CLOSE_RE.match(html, pos)

      return nil if next_close.nil?

      if next_open && next_open.begin(0) < next_close.begin(0)
        depth += 1
        pos = next_open.end(0)
      else
        depth -= 1
        pos = next_close.end(0)
        return pos if depth.zero?
      end
    end

    nil
  end

  def self.transform(html, spoiler_label = 'Spoiler')
    return html unless html.include?('[!')

    result = +''.encode('UTF-8')
    pos    = 0

    while pos < html.length
      m = BQ_OPEN_RE.match(html, pos)
      break unless m

      result << html[pos...m.begin(0)]

      open_tag    = m[0]
      inner_start = m.end(0)
      bq_end      = find_matching_close(html, inner_start)

      if bq_end.nil?
        result << open_tag
        pos = inner_start
        next
      end

      inner = html[inner_start...(bq_end - BQ_CLOSE.length)]
      tm    = TYPE_RE.match(inner)

      if tm
        raw_type = tm[1].upcase
        type = TYPES.include?(raw_type) ? raw_type : 'NOTE'
        slug = type.downcase

        inline_raw = tm[2].to_s.strip
        inline     = inline_raw.sub(/\A<br\s*\/?>[ \t]*/i, '').strip

        rest = inner[tm.end(0)..].to_s.strip

        rest = transform(rest, spoiler_label) if rest.match?(BQ_OPEN_RE)

        content_parts = []
        content_parts << "<p>#{inline}</p>" unless inline.empty?
        content_parts << rest               unless rest.empty?
        content_html  = content_parts.join("\n")

        if type == 'SPOILER'
          result << <<~HTML.strip
            <details class="callout callout--spoiler">
              <summary class="callout__title">#{EYE_ICON}#{spoiler_label}#{CHEVRON_ICON}</summary>
              <div class="callout__content">#{content_html}</div>
            </details>
          HTML
        else
          result << <<~HTML.strip
            <div class="callout callout--#{slug}" role="region" aria-label="#{type.capitalize} callout">
              <div class="callout__title" aria-hidden="true">#{type}</div>
              <div class="callout__content">#{content_html}</div>
            </div>
          HTML
        end
      else
        result << open_tag << transform(inner, spoiler_label) << BQ_CLOSE
      end

      pos = bq_end
    end

    result << html[pos..] if pos < html.length
    result
  end

end

Jekyll::Hooks.register :site, :post_render do |site|
  i18n      = site.data['i18n'] || {}
  site_lang = site.config['lang'] || 'en'

  (site.documents + site.pages).each do |doc|
    next unless doc.output.is_a?(String) && !doc.output.empty?
    next unless doc.output.include?('[!')

    lang          = doc.data['lang'] || site_lang
    strings       = i18n[lang] || i18n['en'] || {}
    spoiler_label = strings['spoiler_label'] || (i18n['en'] || {})['spoiler_label'] || 'Spoiler'

    doc.output = doc.output.encode('UTF-8', invalid: :replace, undef: :replace)
    doc.output = Callouts.transform(doc.output, spoiler_label)
  end
end
