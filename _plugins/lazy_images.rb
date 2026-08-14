require 'nokogiri'

# lazy_images.rb - Adds loading="lazy" and decoding="async" to <img> tags inside
# .post-content that lack explicit loading attributes, so the CSS opacity fade-in
# applies and images never flash white before dark-theme styles settle.

module LazyImages
  def self.process(html)
    return html unless html.include?('<img')

    parsed     = Nokogiri::HTML(html)
    content_el = parsed.at_css('.post-content')
    return html unless content_el

    changed = false

    content_el.css('img').each do |img|
      unless img['loading']
        img['loading'] = 'lazy'
        changed = true
      end
      unless img['decoding']
        img['decoding'] = 'async'
        changed = true
      end
    end

    changed ? parsed.to_html : html
  end
end

Jekyll::Hooks.register [:documents], :post_render do |doc|
  next unless doc.output_ext == '.html'
  next unless doc.data['layout'] == 'post'
  next unless doc.output.is_a?(String) && doc.output.include?('<img')

  doc.output = LazyImages.process(doc.output)
end
