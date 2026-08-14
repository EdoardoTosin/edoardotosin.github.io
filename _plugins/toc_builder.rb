# toc_builder.rb - Injects build-time TOC <li> items into #toc-list and #toc-list-inline.
require 'nokogiri'
require 'cgi'

module TocBuilder
  def self.process(html)
    parsed     = Nokogiri::HTML(html)
    content_el = parsed.at_css('.post-content')
    return html unless content_el

    headings = content_el.css('h2[id], h3[id], h4[id]')
    return html if headings.empty?

    items = headings.map do |h|
      id = h['id'].to_s.strip
      next if id.empty?
      level = h.name[1].to_i
      text  = h.children.filter_map { |n| n.text if n.text? }.join(' ').gsub(/\s+/, ' ').strip
      text  = h.text.gsub(/\s+/, ' ').strip if text.empty?
      next if text.empty?
      %(<li class="toc-item toc-item--h#{level}"><a class="toc-link" href="##{id}">#{CGI.escapeHTML(text)}</a></li>)
    end.compact.join("\n")

    return html if items.empty?

    changed = false
    %w[toc-list toc-list-inline].each do |list_id|
      list = parsed.at_css("##{list_id}")
      next unless list
      next unless list.children.empty? || list.text.strip.empty?
      list.inner_html = items
      changed = true
    end

    %w[toc-widget toc-widget-inline].each do |widget_id|
      widget = parsed.at_css("##{widget_id}")
      widget&.remove_attribute('hidden')
      changed = true if widget
    end

    changed ? parsed.to_html : html
  end
end

Jekyll::Hooks.register [:documents], :post_render do |doc|
  next unless doc.output_ext == '.html'
  next unless doc.data['layout'] == 'post'
  next unless doc.output.is_a?(String)

  doc.output = TocBuilder.process(doc.output)
end
