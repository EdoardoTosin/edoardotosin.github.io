require 'nokogiri'
require 'cgi'

module Jekyll
  module ConvertUrlsFilter
    MARKDOWN_LINK_REGEX = /\[([^\[\]]+)\]\((https?:\/\/[^\)]+)\)/.freeze

    def convert_urls(raw)
      return raw unless raw

      # Clean up invalid characters in-place
      raw = raw.dup
      raw.encode!('UTF-8', invalid: :replace, undef: :replace, replace: '')

      doc = Nokogiri::HTML.fragment(raw)

      doc.css('td').each do |cell|
        original_html = cell.inner_html
        new_html = original_html.gsub(MARKDOWN_LINK_REGEX) do
          text = CGI.escapeHTML(Regexp.last_match(1))
          url  = Regexp.last_match(2)
          %(<a href="#{url}">#{text}</a>)
        end

        cell.inner_html = new_html unless new_html == original_html
      end
      
      doc.to_html
    end
  end
end

Liquid::Template.register_filter(Jekyll::ConvertUrlsFilter)
