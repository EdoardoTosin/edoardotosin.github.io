require 'nokogiri'

module Jekyll
  module ConvertUrlsFilter
    def convert_urls(raw)
      doc = Nokogiri::HTML.fragment(raw.encode('UTF-8', :invalid => :replace, :undef => :replace, :replace => ''))
      
      doc.css('td').each do |cell|
        cell.inner_html = cell.inner_html.gsub(/\[([^\[\]]+)\]\((https?:\/\/[^\)]+)\)/) do
          text, url = Regexp.last_match(1), Regexp.last_match(2)
          "<a href=\"#{url}\">#{text}</a>"
        end
      end
      
      doc.to_html
    end
  end
end

Liquid::Template.register_filter(Jekyll::ConvertUrlsFilter)
