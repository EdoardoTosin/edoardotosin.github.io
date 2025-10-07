#!/usr/bin/env ruby
#
# Update the `last_modified_at` attribute for all markdown files with a `date` attribute
# Only considers content changes, ignoring front-matter only modifications

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
    YAML.safe_load(fm, permitted_classes: [Time, Date, DateTime], aliases: true) || {}
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
  return nil if date_str.nil? || date_str.to_s.strip.empty?
  
  # Handle various date formats
  case date_str
  when Time, Date, DateTime
    date_str.to_time
  else
    Time.parse(date_str.to_s)
  end
rescue ArgumentError => e
  Jekyll.logger.warn "Invalid date format in #{file_path}: '#{date_str}' - #{e.message}"
  nil
end

def get_timezone_from_config(site)
  # Get timezone from Jekyll config, default to 'UTC' if not set
  timezone = site.config['timezone'] || 'UTC'
  
  begin
    # Validate timezone by attempting to use it
    Time.now.getlocal(timezone)
    timezone
  rescue ArgumentError => e
    Jekyll.logger.warn "Invalid timezone '#{timezone}' in _config.yml, falling back to UTC: #{e.message}"
    'UTC'
  end
end

def get_git_history_with_patches(file_path)
  escaped = Shellwords.escape(file_path)
  
  # Get all commits with their patches
  cmd = "git log -p --follow --pretty='format:COMMIT_SEPARATOR%n%H%n%ad' --date=iso -- #{escaped}"
  
  output, status = Open3.capture2(cmd)
  return [] if !status.success? || output.strip.empty?
  
  commits = []
  
  output.split("COMMIT_SEPARATOR").each do |commit_block|
    next if commit_block.strip.empty?
    
    lines = commit_block.strip.split("\n")
    next if lines.size < 2
    
    hash = lines[0].strip
    date_str = lines[1].strip
    
    # Extract the patch content (everything after the date)
    patch_content = lines[2..-1].join("\n") if lines.size > 2
    
    commits << {
      hash: hash,
      date: Time.parse(date_str),
      patch: patch_content || ""
    }
  end
  
  commits
rescue => e
  Jekyll.logger.error "Git history failed for #{file_path}: #{e.message}"
  []
end

def patch_affects_content?(patch)
  return false if patch.nil? || patch.empty?
  
  in_front_matter = false
  front_matter_delimiter_count = 0
  content_changed = false
  
  patch.each_line do |line|
    # Skip git diff headers and file markers
    next if line.start_with?('diff --git', 'index ', '---', '+++', '@@')
    
    # Track front matter boundaries in diff
    if line =~ /^[+-]---\s*$/
      front_matter_delimiter_count += 1
      in_front_matter = (front_matter_delimiter_count == 1)
      next
    end
    
    # Exit front matter after second delimiter
    in_front_matter = false if front_matter_delimiter_count >= 2
    
    # Check for content changes outside front matter
    next if in_front_matter
    
    if line.start_with?('+', '-')
      # Extract the actual content (remove +/- prefix)
      content_line = line[1..-1]
      
      # Ignore empty lines and git markers
      next if content_line.nil? || content_line.strip.empty?
      
      # This is a real content change
      content_changed = true
      break
    end
  end
  
  content_changed
end

def git_last_content_modified(file_path)
  escaped = Shellwords.escape(file_path)
  
  # Check if file is tracked by git
  _, status = Open3.capture2("git ls-files --error-unmatch #{escaped} 2>/dev/null")
  return nil unless status.success?
  
  # Get commit count
  count_cmd = "git rev-list --count HEAD -- #{escaped}"
  commit_count, status = Open3.capture2(count_cmd)
  return nil if !status.success? || commit_count.to_i <= 1
  
  # Get full history with patches
  commits = get_git_history_with_patches(file_path)
  return nil if commits.empty?
  
  # Find the most recent commit that affected content
  commits.each do |commit|
    return commit[:date] if patch_affects_content?(commit[:patch])
  end
  
  # No content changes found
  nil
rescue => e
  Jekyll.logger.error "Git command failed for #{file_path}: #{e.message}"
  nil
end

def find_site_file(site, file_path)
  expanded = File.expand_path(file_path, site.source)
  
  # Check pages, posts, and all collection documents
  site.pages.find { |p| File.expand_path(p.path, site.source) == expanded } ||
    site.posts.docs.find { |p| File.expand_path(p.path, site.source) == expanded } ||
    site.collections.values.flat_map(&:docs).find { |d| File.expand_path(d.path, site.source) == expanded }
end

def should_skip_file?(file_path)
  # Skip files in specific directories
  skip_dirs = ['_site', '.git', 'node_modules', 'vendor', '.sass-cache', '.jekyll-cache']
  skip_dirs.any? { |dir| file_path.include?("/#{dir}/") || file_path.start_with?("#{dir}/") }
end

# --------------------------
# Main Hook
# --------------------------
Jekyll::Hooks.register :site, :post_read do |site|
  Jekyll.logger.info "Running content-aware `last_modified_at` update plugin..."
  
  # Get timezone from config
  timezone = get_timezone_from_config(site)
  Jekyll.logger.info "Using timezone: #{timezone}"
  
  updated_count = 0
  skipped_count = 0
  error_count = 0
  
  find_all_markdown_files(site.source).each do |file_path|
    begin
      # Check file exists
      next unless File.exist?(file_path)
      
      # Skip excluded directories
      if should_skip_file?(file_path)
        Jekyll.logger.debug "Skipping excluded file: #{file_path}"
        skipped_count += 1
        next
      end
      
      # Read front matter
      front_matter = read_front_matter(file_path)
      unless front_matter.key?('date')
        Jekyll.logger.debug "Skipping file without 'date': #{file_path}"
        skipped_count += 1
        next
      end
      
      # Parse the original date
      date = parse_date(front_matter['date'].to_s, file_path)
      next unless date
      
      # Get last content modification date from git
      lastmod_date = git_last_content_modified(file_path)
      
      # Skip if no content modifications found
      unless lastmod_date
        Jekyll.logger.debug "No content modifications for: #{file_path}"
        skipped_count += 1
        next
      end
      
      # Ensure lastmod is not before the original date
      lastmod_date = date if lastmod_date < date
      
      # Format the date with timezone from config
      formatted_lastmod = lastmod_date.getlocal(timezone)
                                     .strftime('%Y-%m-%d %H:%M:%S %:z')
      
      # Update the site file
      site_file = find_site_file(site, file_path)
      if site_file
        site_file.data['last_modified_at'] = formatted_lastmod
        Jekyll.logger.info "Updated 'last_modified_at' for: #{file_path} -> #{formatted_lastmod}"
        updated_count += 1
      elsif front_matter['permalink']
        # Handle unlinked files with permalink
        Jekyll.logger.info "Associating unlinked file: #{file_path} -> Permalink: #{front_matter['permalink']}"
        page = Jekyll::Page.new(site, site.source, File.dirname(file_path), File.basename(file_path))
        page.data['last_modified_at'] = formatted_lastmod
        site.pages << page
        updated_count += 1
      else
        Jekyll.logger.warn "File not associated with any Jekyll document: #{file_path}"
        error_count += 1
      end
      
    rescue StandardError => e
      Jekyll.logger.error "Error processing #{file_path}: #{e.message}"
      Jekyll.logger.debug e.backtrace.join("\n")
      error_count += 1
    end
  end
  
  Jekyll.logger.info "Content-aware last_modified_at plugin complete: #{updated_count} updated, #{skipped_count} skipped, #{error_count} errors"
end
