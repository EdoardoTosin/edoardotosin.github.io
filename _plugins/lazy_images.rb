require 'nokogiri'

# lazy_images.rb - Adds loading="lazy" and decoding="async" to <img> tags inside
# .post-content that lack explicit loading attributes, so the CSS opacity fade-in
# applies and images never flash white before dark-theme styles settle.

Jekyll::Hooks.register [:documents], :post_render do |doc|
  next unless doc.output_ext == '.html'
  next unless doc.data['layout'] == 'post'
  next unless doc.output.is_a?(String) && doc.output.include?('<img')

  parsed     = Nokogiri::HTML(doc.output)
  content_el = parsed.at_css('.post-content')
  next unless content_el

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

  doc.output = parsed.to_html if changed
end
