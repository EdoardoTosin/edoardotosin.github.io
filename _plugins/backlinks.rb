# frozen_string_literal: true

WIKILINK_SCAN_RE = /\[\[([^\[\]]+?)\]\]/.freeze

Jekyll::Hooks.register :site, :pre_render do |site|
  all_posts = site.posts.docs
  next if all_posts.empty?

  # Build a lookup: normalised key -> post
  index = {}
  all_posts.each do |doc|
    slug  = File.basename(doc.basename.to_s, '.*').strip.downcase
    title = doc.data['title'].to_s.strip.downcase
    index[slug]  ||= doc
    index[title] ||= doc
  end

  backlinks = Hash.new { |h, k| h[k] = [] }

  all_posts.each do |source|
    source.content.to_s.scan(WIKILINK_SCAN_RE).each do |match|
      inner      = match[0]
      target_key = inner.split('|').first.split('#').first.strip.downcase
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
