# frozen_string_literal: true

require 'set'

Jekyll::Hooks.register :site, :post_read do |site|
  topics_path = File.join(site.source, '_data', 'topics.yml')

  existing = (site.data['topics'] || []).select { |t| t.is_a?(Hash) && t['name'].to_s != '' }
  known    = Set.new(existing.map { |t| t['name'].to_s.strip.downcase })

  used = Set.new
  site.posts.docs.each do |post|
    # Future posts, visible locally only with `future: true`, are skipped so previewing them doesn't write to topics.yml.
    post_date = post.data['date']
    next if post_date.is_a?(Time) && post_date > Time.now

    topic = post.data['topic']
    next if topic.nil?

    unless topic.is_a?(String) && !topic.strip.empty?
      Jekyll.logger.warn 'Topic:', "#{post.relative_path}: topic must be a single non-empty " \
        "string, got #{topic.class} (#{topic.inspect}). It will not drive /topics/, badge " \
        'colors, or related-post matching until fixed.'
      next
    end

    tp = topic.strip.downcase
    used.add(tp) unless tp.empty?
  end

  new_names = (used - known).sort
  next if new_names.empty?

  new_entries = new_names.map { |name| { 'name' => name, 'color' => '#64748b' } }
  all_entries = existing + new_entries
  site.data['topics'] = all_entries

  quote_if_needed = lambda do |val|
    val.match?(/[#:\[\]{}|&*!,>]/) || val.empty? ? "'#{val}'" : val
  end

  yaml_out = String.new
  all_entries.each do |entry|
    quoted_name  = quote_if_needed.call(entry['name'].to_s)
    quoted_color = quote_if_needed.call(entry['color'].to_s)
    yaml_out << "- name: #{quoted_name}\n  color: #{quoted_color}\n"
  end
  File.write(topics_path, yaml_out)
end
