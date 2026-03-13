# callouts.rb - Transforms > [!TYPE] blockquotes into callout divs at :site, :post_render.
# See docs/PLUGINS.md for syntax, ARIA model, and WCAG contrast ratios.

module Callouts

  TYPES = %w[NOTE TIP IMPORTANT WARNING CAUTION].freeze

  BQ_OPEN_RE  = /<blockquote(?:\s[^>]*)?>/.freeze
  BQ_CLOSE    = '</blockquote>'.freeze
  BQ_CLOSE_RE = /<\/blockquote>/i.freeze

  TYPE_RE = /\A\s*<p>\[!(#{TYPES.join('|')})\][ \t]*([\s\S]*?)<\/p>/i.freeze

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

  def self.transform(html)
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

        rest = transform(rest) if rest.match?(BQ_OPEN_RE)

        content_parts = []
        content_parts << "<p>#{inline}</p>" unless inline.empty?
        content_parts << rest               unless rest.empty?
        content_html  = content_parts.join("\n")

        result << <<~HTML.strip
          <div class="callout callout--#{slug}" role="region" aria-label="#{type.capitalize} callout">
            <div class="callout__title" aria-hidden="true">#{type}</div>
            <div class="callout__content">#{content_html}</div>
          </div>
        HTML
      else
        result << open_tag << transform(inner) << BQ_CLOSE
      end

      pos = bq_end
    end

    result << html[pos..] if pos < html.length
    result
  end

end

Jekyll::Hooks.register :site, :post_render do |site|
  (site.documents + site.pages).each do |doc|
    next unless doc.output.is_a?(String) && !doc.output.empty?
    next unless doc.output.include?('[!')

    doc.output = doc.output.encode('UTF-8', invalid: :replace, undef: :replace)
    doc.output = Callouts.transform(doc.output)
  end
end
