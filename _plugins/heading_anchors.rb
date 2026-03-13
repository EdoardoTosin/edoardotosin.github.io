require 'nokogiri'

ANCHOR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" ' \
             'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' \
             'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' \
             '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>' \
             '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>' \
             '</svg>'

Jekyll::Hooks.register [:documents], :post_render do |doc|
  next unless doc.output_ext == '.html'
  next unless doc.data['layout'] == 'post'
  next unless doc.output.is_a?(String) && doc.output.include?('post-content')

  parsed     = Nokogiri::HTML(doc.output)
  content_el = parsed.at_css('.post-content')
  next unless content_el

  changed = false

  content_el.css('h2[id], h3[id], h4[id]').each do |h|
    next if h.at_css('.heading-anchor') # idempotent

    id = h['id'].to_s.strip
    next if id.empty? # skip headings without a valid id

    label = h.children.select { |n| n.text? }.map(&:text).join(' ').gsub(/\s+/, ' ').strip
    label = h.text.gsub(/\s+/, ' ').strip if label.empty?
    # If still empty (heading is only SVG/image), skip aria-label
    aria_label = label.empty? ? nil : "Link to section: #{label}"

    anchor               = parsed.create_element('a')
    anchor['class']      = 'heading-anchor'
    anchor['href']       = "##{id}"
    anchor['aria-label'] = aria_label if aria_label
    anchor.inner_html    = ANCHOR_SVG
    h.add_child(anchor)
    changed = true
  end

  doc.output = parsed.to_html if changed
end
