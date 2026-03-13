require 'nokogiri'
require 'uri'

# external_links.rb - Tags external <a> with data-ext/target/rel (regex pass), then adds
# aria-label on post-content links via Nokogiri. See docs/PLUGINS.md.

module ExternalLinks

  A_TAG_RE = /<a(\s[^>]+)>/i.freeze

  HREF_RE = /\bhref=(?:"(https?:\/\/[^"]+)"|'(https?:\/\/[^']+)')/i.freeze

  HREF_PROTO_RE = /\bhref=(?:"(\/\/[^"]+)"|'(\/\/[^']+)')/i.freeze

  def self.site_host(config)
    raw = config['url'].to_s
    return nil if raw.empty?
    URI.parse(raw).host
  rescue URI::InvalidURIError, URI::BadURIError, ArgumentError
    nil
  end

  def self.extract_host(href)
    URI.parse(href).host
  rescue URI::InvalidURIError, URI::BadURIError, ArgumentError, URI::InvalidComponentError
    nil
  end

  def self.tag_external(html, host)
    html.gsub(A_TAG_RE) do |tag|
      attrs = $1

      href_m = attrs.match(HREF_RE)
      href   = href_m && (href_m[1] || href_m[2])

      unless href
        proto_m = attrs.match(HREF_PROTO_RE)
        href    = "https:#{proto_m[1] || proto_m[2]}" if proto_m
      end

      next tag unless href

      link_host = extract_host(href)
      next tag if link_host.nil?
      next tag if host && link_host == host
      next tag if attrs.include?('data-ext')

      extra  = ' data-ext'
      extra += ' target="_blank"'           unless attrs.match?(/\btarget=/i)
      extra += ' rel="noopener noreferrer"' unless attrs.match?(/\brel=/i)
      "<a#{attrs}#{extra}>"
    end
  end

  def self.label_post_links(html)
    doc     = Nokogiri::HTML(html)
    changed = false

    doc.css('.post-content a[data-ext]').each do |a|
      next if a['aria-label']

      text = a.text.gsub(/\s+/, ' ').strip
      text = 'External link' if text.empty?
      text = text[0, 80] + '…' if text.length > 80
      a['aria-label'] = "#{text} (opens in new tab)"
      changed = true
    end

    changed ? doc.to_html : html
  end
end

Jekyll::Hooks.register [:pages, :documents], :post_render do |doc|
  next unless doc.output_ext == '.html'
  next unless doc.output.is_a?(String) && !doc.output.empty?
  next unless doc.output.include?('href=')

  host = ExternalLinks.site_host(doc.site.config)
  html = ExternalLinks.tag_external(doc.output, host)

  if doc.data['layout'] == 'post' && html.include?('post-content')
    html = ExternalLinks.label_post_links(html)
  end

  doc.output = html
end
