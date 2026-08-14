# frozen_string_literal: true

WIKILINK_SCAN_RE = /\[\[([^\[\]]+?)\]\]/.freeze

module Backlinks
  # Same key normalisation as ObsidianWikilinks::PageIndex#normalize, so a resolvable wikilink always backlinks.
  def self.normalize(str)
    str.to_s.strip.downcase.gsub('_', '-').gsub(/[^\p{Alnum}\s\-]/, '').gsub(/\s+/, '-').gsub(/-{2,}/, '-')
  end
end

Jekyll::Hooks.register :site, :pre_render do |site|
  all_posts = site.posts.docs
  next if all_posts.empty?

  # Build a lookup: normalised key -> post
  index = {}
  all_posts.each do |doc|
    slug = doc.data['slug'].to_s
    slug = File.basename(doc.basename.to_s, '.*') if slug.empty?
    slug_key  = Backlinks.normalize(slug)
    title_key = Backlinks.normalize(doc.data['title'])
    index[slug_key]  ||= doc unless slug_key.empty?
    index[title_key] ||= doc unless title_key.empty?
  end

  backlinks = Hash.new { |h, k| h[k] = [] }

  all_posts.each do |source|
    source.content.to_s.scan(WIKILINK_SCAN_RE) do |match|
      # Embeds render as inert text (obsidian_wikilinks.rb doesn't implement transclusion), so no backlink.
      next if $~.pre_match.end_with?('!')

      inner      = match[0]
      target_key = Backlinks.normalize(inner.split('|').first.split('#').first)
      target     = index[target_key]
      next unless target && target.url != source.url

      unless backlinks[target.url].any? { |p| p.url == source.url }
        backlinks[target.url] << source
      end
    end
  end

  all_posts.each do |doc|
    doc.data['backlinks'] = backlinks[doc.url] || []
  end
end
