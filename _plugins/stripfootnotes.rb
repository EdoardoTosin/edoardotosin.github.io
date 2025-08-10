# Source: https://gist.github.com/sumdog/99bf642024cc30f281bc

require 'nokogiri'

module Jekyll
  module StripFootnotesFilter
    FOOTNOTE_TAGS = %w[div sup a].freeze
    FOOTNOTE_CLASSES = %w[footnotes footnote].freeze

    def strip_footnotes(raw)
      return raw if raw.nil? || raw.empty?

      raw = raw.dup
      raw.encode!('UTF-8', invalid: :replace, undef: :replace, replace: '')

      doc = Nokogiri::HTML.fragment(raw)

      doc.css(FOOTNOTE_TAGS.join(',')).each do |ele|
        ele.remove if FOOTNOTE_CLASSES.include?(ele['class'])
      end

      doc.inner_html

    end
  end
end

Liquid::Template.register_filter(Jekyll::StripFootnotesFilter)
