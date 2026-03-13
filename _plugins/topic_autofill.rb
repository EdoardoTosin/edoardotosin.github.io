# frozen_string_literal: true

require 'yaml'
require 'set'

Jekyll::Hooks.register :site, :post_read do |site|
  topics_path = File.join(site.source, '_data', 'topics.yml')

  existing = (site.data['topics'] || []).select { |t| t.is_a?(Hash) && t['name'].to_s != '' }
  known    = Set.new(existing.map { |t| t['name'].to_s.strip.downcase })

  used = Set.new
  site.posts.docs.each do |post|
    tp = post.data['topic'].to_s.strip.downcase
    used.add(tp) unless tp.empty?
  end

  new_names = (used - known).sort
  next if new_names.empty?

  new_entries = new_names.map { |name| { 'name' => name, 'color' => '#64748b' } }
  site.data['topics'] = existing + new_entries

  File.write(topics_path, YAML.dump(existing + new_entries))
end