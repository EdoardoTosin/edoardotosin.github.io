# frozen_string_literal: true

require 'set'

Jekyll::Hooks.register :site, :post_read do |site|
  topics_path = File.join(site.source, '_data', 'topics.yml')

  existing = (site.data['topics'] || []).select { |t| t.is_a?(Hash) && t['name'].to_s != '' }
  known    = Set.new(existing.map { |t| t['name'].to_s.strip.downcase })

  used = Set.new
  site.posts.docs.each do |post|
    topic = post.data['topic']
    next unless topic.is_a?(String)

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

  yaml_out = ''
  all_entries.each do |entry|
    quoted_name  = quote_if_needed.call(entry['name'].to_s)
    quoted_color = quote_if_needed.call(entry['color'].to_s)
    yaml_out << "- name: #{quoted_name}\n  color: #{quoted_color}\n"
  end
  File.write(topics_path, yaml_out)
end
