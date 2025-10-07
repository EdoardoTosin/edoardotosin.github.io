#!/usr/bin/env ruby
#
# Update the `last_modified_at` attribute for all markdown files with a `date` attribute
# Only considers content changes, ignoring front-matter only modifications

require 'shellwords'
require 'yaml'
require 'time'
require 'date'
require 'open3'
require 'digest'

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

def extract_content_only(file_path)
  content = File.read(file_path, encoding: 'UTF-8', invalid: :replace, undef: :replace, replace: '')
  
  # Remove front matter if it exists
  if content.start_with?('---')
    content = content.sub(/\A---\s*\n.*?\n---\s*\n/m, '')
  end
  
  # Normalize whitespace for more accurate comparison
  content.strip.gsub(/\s+/, ' ')
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

def get_correct_timezone_offset(lastmod_date)
  # Calculate DST boundaries for Europe/London timezone
  year = lastmod_date.year
  
  # Last Sunday in March at 01:00 UTC
  march_31 = Time.new(year, 3, 31, 1, 0, 0, '+00:00')
  dst_start = march_31 - ((march_31.wday % 7) * 86_400)
  
  # Last Sunday in October at 01:00 UTC  
  october_31 = Time.new(year, 10, 31, 1, 0, 0, '+00:00')
  dst_end = october_31 - ((october_31.wday % 7) * 86_400)
  
  utc_time = lastmod_date.utc
  (utc_time >= dst_start && utc_time < dst_end) ? '+01:00' : '+00:00'
end

def get_git_history_with_patches(file_path)
  escaped = Shellwords.escape(file_path)
  
  # Get all commits with their patches
  cmd = "git log -p --follow --pretty='format:COMMIT_SEPARATOR%n%H%n%ad' --date=iso -- #{escaped}"
  
  output, status = Open3.capture2(cmd)
  return [] if !status.success? || output.strip.empty?
  
  commits = []
  current_commit = nil
  
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
    # Skip git diff headers
    next if line.start_with?('diff --git', 'index ', '+++', '@@')
    
    # Check for front matter delimiters in the diff
    if line =~ /^[+-]---\s*$/
      front_matter_delimiter_count += 1
      in_front_matter = (front_matter_delimiter_count == 1)
      next
    end
    
    # We're out of front matter after the second delimiter
    if front_matter_delimiter_count >= 2
      in_front_matter = false
    end
    
    # Check for actual content changes (additions or deletions)
    if !in_front_matter && (line.start_with?('+') || line.start_with?('-'))
      # Skip empty lines and context lines
      content_line = line[1..-1].strip
      if !content_line.empty? && !line.start_with?('---', '+++')
        content_changed = true
        break
      end
    end
  end
  
  content_changed
end

def git_last_content_modified(file_path)
  # First check if file is tracked by git
  escaped = Shellwords.escape(file_path)
  tracked_check, status = Open3.capture2("git ls-files --error-unmatch #{escaped}")
  return nil unless status.success?
  
  # Get commit count
  count_cmd = "git rev-list --count HEAD -- #{escaped}"
  commit_count, status = Open3.capture2(count_cmd)
  return nil if !status.success? || commit_count.to_i == 0
  
  # Get full history with patches
  commits = get_git_history_with_patches(file_path)
  return nil if commits.empty?
  
  # Find the most recent commit that affected content (not just front matter)
  commits.each do |commit|
    if patch_affects_content?(commit[:patch])
      return commit[:date]
    end
  end
  
  # If no content changes found, return nil (will keep original date)
  nil
rescue => e
  Jekyll.logger.error "Git command failed for #{file_path}: #{e.message}"
  nil
end

def find_site_file(site, file_path)
  expanded = File.expand_path(file_path, site.source)
  
  # Check in pages
  page = site.pages.find { |p| File.expand_path(p.path, site.source) == expanded }
  return page if page
  
  # Check in posts
  post = site.posts.docs.find { |p| File.expand_path(p.path, site.source) == expanded }
  return post if post
  
  # Check in all collections
  site.collections.values.each do |collection|
    doc = collection.docs.find { |d| File.expand_path(d.path, site.source) == expanded }
    return doc if doc
  end
  
  nil
end

def should_skip_file?(file_path, site)
  # Skip files in specific directories
  skip_dirs = ['_site', '.git', 'node_modules', 'vendor', '.sass-cache', '.jekyll-cache']
  skip_dirs.any? { |dir| file_path.include?("/#{dir}/") }
end

# --------------------------
# Main Hook
# --------------------------
Jekyll::Hooks.register :site, :post_read do |site|
  Jekyll.logger.info "Running content-aware `last_modified_at` update plugin..."
  
  updated_count = 0
  skipped_count = 0
  error_count = 0
  
  find_all_markdown_files(site.source).each do |file_path|
    begin
      # Skip excluded directories
      if should_skip_file?(file_path, site)
        Jekyll.logger.debug "Skipping excluded file: #{file_path}"
        skipped_count += 1
        next
      end
      
      # Check file exists
      unless File.exist?(file_path)
        Jekyll.logger.debug "File not found: #{file_path}"
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
      date = parse_date(front_matter['date'], file_path)
      unless date
        Jekyll.logger.warn "Could not parse date for: #{file_path}"
        skipped_count += 1
        next
      end
      
      # Get last content modification date from git
      lastmod_date = git_last_content_modified(file_path)
      
      if lastmod_date.nil?
        Jekyll.logger.debug "No content modifications found for: #{file_path}"
        # Use the original date as last_modified_at if no content changes detected
        lastmod_date = date
      end
      
      # Ensure lastmod is not before the original date
      if lastmod_date < date
        Jekyll.logger.debug "Last modified date is before original date for: #{file_path}"
        lastmod_date = date
      end
      
      # Format the date with correct timezone
      formatted_lastmod = lastmod_date.getlocal(get_correct_timezone_offset(lastmod_date))
                                     .strftime('%Y-%m-%dT%H:%M:%S%:z')
      
      # Update the site file
      site_file = find_site_file(site, file_path)
      if site_file
        # Only update if different from existing value
        if site_file.data['last_modified_at'] != formatted_lastmod
          site_file.data['last_modified_at'] = formatted_lastmod
          Jekyll.logger.info "Updated 'last_modified_at' for: #{File.basename(file_path)} -> #{formatted_lastmod}"
          updated_count += 1
        else
          Jekyll.logger.debug "No change needed for: #{File.basename(file_path)}"
        end
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
