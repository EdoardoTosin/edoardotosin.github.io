# frozen_string_literal: true
# obsidian_wikilinks.rb - [[wikilink]] syntax to anchors. Runs at :post_render; skips <pre>/<code> blocks.

require 'cgi'

module ObsidianWikilinks
  WIKILINK_RE = /\[\[([^\[\]]+?)\]\]/.freeze

  class PageIndex
    def initialize(site)
      @by_slug  = {}
      @by_title = {}
      build(site)
    end

    def build(site)
      collect_docs(site).each do |doc|
        slug  = slug_from_doc(doc)
        title = title_from_doc(doc)

        @by_slug[slug]   ||= doc if slug
        @by_title[title] ||= doc if title
      end
    end

    def find(raw)
      key = normalize(raw)
      @by_slug[key] || @by_title[key]
    end

    private

    def collect_docs(site)
      docs = site.pages.dup
      docs.concat(site.posts.docs) if site.respond_to?(:posts)
      site.collections.each_value { |c| docs.concat(c.docs) }
      docs
    end

    def slug_from_doc(doc)
      slug = doc.data['slug'].to_s
      slug = File.basename(doc.basename.to_s, '.*') if slug.empty?
      normalize(slug)
    end

    def title_from_doc(doc)
      title = doc.data['title'].to_s
      normalize(title) unless title.empty?
    end

    def normalize(str)
      str.to_s.strip.downcase.gsub(/[^\p{Alnum}\s\-]/, '').gsub(/\s+/, '-').gsub(/-{2,}/, '-')
    end
  end

  module Parser
    def self.parse(inner)
      target, alias_text = inner.to_s.strip.split('|', 2).map(&:strip)
      page, heading = target.split('#', 2).map { |s| s&.strip }
      { page: page.to_s, heading: heading, alias: alias_text }
    end

    def self.anchor(heading)
      return nil unless heading
      heading.strip.downcase.gsub(/[^\p{Alnum}\s\-]/, '').gsub(/\s+/, '-')
    end
  end

  class Processor
    def initialize(site)
      @site  = site
      @index = PageIndex.new(site)
      @anchor_cache = {}
    end

    def process(html)
      # Split on <pre>/<code> blocks and HTML comments; replace only in even-indexed segments
      html.split(/(<pre[\s>].*?<\/pre>|<code[\s>].*?<\/code>|<!--.*?-->)/m).map.with_index do |part, i|
        i.even? ? replace_links(part) : part
      end.join
    end

    private

    def replace_links(text)
      text.gsub(WIKILINK_RE) do
        parsed = Parser.parse(Regexp.last_match(1))
        next Regexp.last_match(0) if parsed[:page].empty? && parsed[:heading].nil?

        if parsed[:page].empty? && parsed[:heading]
          href  = "##{anchor(parsed[:heading])}"
          label = (parsed[:alias] && !parsed[:alias].empty?) ? parsed[:alias] : parsed[:heading]
          next %(<a href="#{CGI.escapeHTML(href)}">#{CGI.escapeHTML(label)}</a>)
        end

        doc = @index.find(parsed[:page])

        if doc
          base  = @site.baseurl.to_s
          url   = base + doc.url.to_s
          url  += "##{anchor(parsed[:heading])}" if parsed[:heading]
          label = (parsed[:alias] && !parsed[:alias].empty?) ? parsed[:alias] : parsed[:page]
          %(<a href="#{CGI.escapeHTML(url)}">#{CGI.escapeHTML(label)}</a>)
        else
          broken_link(parsed[:page], parsed[:alias])
        end
      end
    end

    def anchor(heading)
      @anchor_cache[heading] ||= Parser.anchor(heading)
    end

    def broken_link(page, alias_text)
      %(<span class="wikilink-broken">#{CGI.escapeHTML(alias_text || page)}</span>)
    end
  end
end

Jekyll::Hooks.register :site, :post_render do |site|
  cfg = site.config['obsidian_wikilinks'] || {}
  next if cfg['enabled'] == false

  processor = ObsidianWikilinks::Processor.new(site)
  site.pages.each do |doc|
    next unless doc.output_ext == '.html'
    next unless doc.output.is_a?(String) && doc.output.include?('[[')

    doc.output = processor.process(doc.output)
  end

  if site.respond_to?(:posts)
    site.posts.docs.each do |doc|
      next unless doc.output_ext == '.html'
      next unless doc.output.is_a?(String) && doc.output.include?('[[')

      doc.output = processor.process(doc.output)
    end
  end

  site.collections.each_value do |collection|
    collection.docs.each do |doc|
      next unless doc.output_ext == '.html'
      next unless doc.output.is_a?(String) && doc.output.include?('[[')

      doc.output = processor.process(doc.output)
    end
  end
end
