#!/usr/bin/env ruby
#
# Update the `last_modified_at` attribute for all markdown files with a `date` attribute

require 'shellwords'
require 'yaml'
require 'time'
require 'date'
require 'open3'

# Skip the plugin if the environment is set to development
if ENV['JEKYLL_ENV'] == 'development'
  Jekyll.logger.info "Skipping `last_modified_at` update plugin in development mode."
  return
end

# --------------------------
# Helper Methods
# --------------------------
def find_all_markdown_files(base_dir)
  Dir.glob(File.join(base_dir, '**', '*.{md,markdown}'))
end

def read_front_matter(file_path)
  content = File.read(file_path, encoding: 'UTF-8', invalid: :replace, undef: :replace, replace: '')
  return {} unless content.start_with?('---')

  if (fm = content[/\A---\s*\n(.*?)\n---\s*\n/m, 1])
    YAML.safe_load(fm, permitted_classes: [Time, Date], aliases: true) || {}
  else
    {}
  end
rescue Psych::DisallowedClass => e
  Jekyll.logger.warn "Unsupported class in front matter: #{file_path} - #{e.message}"
  {}
rescue StandardError => e
  Jekyll.logger.error "Error reading front matter: #{file_path} - #{e.message}"
  {}
end

def parse_date(date_str, file_path)
  Time.parse(date_str)
rescue ArgumentError => e
  Jekyll.logger.warn "Invalid date format in #{file_path} - #{e.message}"
  nil
end

def get_correct_timezone_offset(lastmod_date)
  dst_start = Time.new(lastmod_date.year, 3, 31, 2, 0, 0) - ((Time.new(lastmod_date.year, 3, 31).wday - 7) * 86_400)
  dst_end   = Time.new(lastmod_date.year, 10, 31, 3, 0, 0) - ((Time.new(lastmod_date.year, 10, 31).wday - 7) * 86_400)
  (lastmod_date >= dst_start && lastmod_date < dst_end) ? '+02:00' : '+01:00'
end

def git_last_modified(file_path)
  escaped = Shellwords.escape(file_path)
  log_cmd = "git log -1 --pretty='format:%ad' --date=iso -- #{escaped}"
  count_cmd = "git rev-list --count HEAD -- #{escaped}"

  commit_count, status1 = Open3.capture2(count_cmd)
  return nil if commit_count.to_i <= 1

  lastmod_date, status2 = Open3.capture2(log_cmd)
  return nil if lastmod_date.strip.empty?

  Time.parse(lastmod_date.strip)
rescue => e
  Jekyll.logger.error "Git command failed for #{file_path}: #{e.message}"
  nil
end

def find_site_file(site, file_path)
  expanded = File.expand_path(file_path, site.source)
  site.pages.find { |p| File.expand_path(p.path, site.source) == expanded } ||
    site.posts.docs.find { |p| File.expand_path(p.path, site.source) == expanded } ||
    site.collections.values.flat_map(&:docs).find { |d| File.expand_path(d.path, site.source) == expanded }
end

# --------------------------
# Hook
# --------------------------
Jekyll::Hooks.register :site, :post_read do |site|
  Jekyll.logger.info "Running `last_modified_at` update plugin..."

  find_all_markdown_files(site.source).each do |file_path|
    next unless File.exist?(file_path)

    front_matter = read_front_matter(file_path)
    unless front_matter.key?('date')
      Jekyll.logger.debug "Skipping file without 'date': #{file_path}"
      next
    end

    date = parse_date(front_matter['date'].to_s, file_path)
    next unless date

    lastmod_date = git_last_modified(file_path)
    unless lastmod_date
      Jekyll.logger.debug "No modification date for: #{file_path}"
      next
    end

    formatted_lastmod = lastmod_date.getlocal(get_correct_timezone_offset(lastmod_date))
                                   .strftime('%Y-%m-%dT%H:%M:%S%:z')

    site_file = find_site_file(site, file_path)
    if site_file
      site_file.data['last_modified_at'] = formatted_lastmod
      Jekyll.logger.info "Updated 'last_modified_at' for: #{file_path} -> #{formatted_lastmod}"
    elsif front_matter['permalink']
      Jekyll.logger.info "Associating unlinked file: #{file_path} -> Permalink: #{front_matter['permalink']}"
      page = Jekyll::Page.new(site, site.source, File.dirname(file_path), File.basename(file_path))
      page.data['last_modified_at'] = formatted_lastmod
      site.pages << page
    else
      Jekyll.logger.warn "File not associated with any Jekyll document: #{file_path}"
    end
  end
end
