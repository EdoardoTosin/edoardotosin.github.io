#!/usr/bin/env ruby
#
# Update the `last_modified_at` attribute for all markdown files with a `date` attribute
# Only counts commits where actual content (not frontmatter) changed

require 'shellwords'
require 'yaml'
require 'time'
require 'date'
require 'open3'

# Try to load TZInfo for accurate timezone support
begin
  gem 'tzinfo'
  require 'tzinfo'
  TZINFO_AVAILABLE = true
rescue LoadError, Gem::LoadError
  TZINFO_AVAILABLE = false
end

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
rescue => e
  Jekyll.logger.error "Error finding markdown files: #{e.message}"
  []
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
  return nil if date_str.nil? || date_str.to_s.strip.empty?
  Time.parse(date_str.to_s)
rescue ArgumentError => e
  Jekyll.logger.warn "Invalid date format in #{file_path}: '#{date_str}' - #{e.message}"
  nil
rescue => e
  Jekyll.logger.error "Error parsing date in #{file_path}: #{e.message}"
  nil
end

def get_timezone(site)
  # Get timezone from Jekyll config, default to 'Europe/Berlin'
  tz_string = site.config['timezone'] || 'Europe/Berlin'
  
  if TZINFO_AVAILABLE
    begin
      return TZInfo::Timezone.get(tz_string)
    rescue TZInfo::InvalidTimezoneIdentifier => e
      Jekyll.logger.warn "Invalid timezone '#{tz_string}': #{e.message}"
    rescue => e
      Jekyll.logger.warn "Error loading timezone with TZInfo: #{e.message}"
    end
  end
  
  # Fallback: Use ENV['TZ'] with Ruby's Time class
  begin
    original_tz = ENV['TZ']
    ENV['TZ'] = tz_string
    # Test if timezone is valid
    Time.now
    tz_string
  rescue => e
    Jekyll.logger.warn "Invalid timezone '#{tz_string}', using system default"
    nil
  ensure
    ENV['TZ'] = original_tz
  end
end

def format_with_timezone(time, timezone_or_string, site)
  if TZINFO_AVAILABLE && timezone_or_string.is_a?(TZInfo::Timezone)
    # Use TZInfo for accurate timezone conversion
    begin
      tz_time = timezone_or_string.to_local(time.utc)
      return tz_time.strftime('%Y-%m-%d %H:%M:%S %z')
    rescue => e
      Jekyll.logger.warn "Error converting to timezone: #{e.message}"
    end
  elsif timezone_or_string.is_a?(String)
    # Use Ruby's built-in timezone support via ENV['TZ']
    begin
      original_tz = ENV['TZ']
      ENV['TZ'] = timezone_or_string
      local_time = time.getlocal
      formatted = local_time.strftime('%Y-%m-%d %H:%M:%S %z')
      ENV['TZ'] = original_tz
      return formatted
    rescue => e
      Jekyll.logger.warn "Error formatting with timezone: #{e.message}"
      ENV['TZ'] = original_tz
    end
  end
  
  # Final fallback: use the time as-is
  time.getlocal.strftime('%Y-%m-%d %H:%M:%S %z')
end

def find_frontmatter_end_line(content)
  return 0 unless content.start_with?('---')
  
  lines = content.lines
  found_first = false
  
  lines.each_with_index do |line, idx|
    stripped = line.strip
    if stripped == '---' || stripped == '...'  # YAML also supports ... as delimiter
      if found_first
        return idx + 1
      else
        found_first = true
      end
    end
  end
  
  # If we only found one delimiter, frontmatter is malformed - treat entire file as content
  found_first ? lines.length : 0
rescue => e
  Jekyll.logger.warn "Error parsing frontmatter boundaries: #{e.message}"
  0
end

def has_content_changes?(diff_output, frontmatter_end_line)
  return false if diff_output.nil? || diff_output.strip.empty?
  
  # Parse diff hunks to check if any changes occur after frontmatter
  diff_output.each_line do |line|
    # Match unified diff hunk headers: @@ -start,count +start,count @@
    if line =~ /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/
      new_start = $1.to_i
      new_count = $2 ? $2.to_i : 1
      
      # Check if this hunk affects lines after frontmatter
      # A hunk at line X with count C affects lines X through X+C-1
      hunk_end = new_start + new_count - 1
      
      if new_start > frontmatter_end_line || hunk_end > frontmatter_end_line
        return true
      end
    end
  end
  
  false
rescue => e
  Jekyll.logger.warn "Error parsing diff output: #{e.message}"
  # On error, assume there are content changes to be safe
  true
end

def batch_git_last_modified(file_paths, site_source)
  return {} if file_paths.empty?
  
  # Check if we're in a git repository
  git_check, status = Open3.capture2('git rev-parse --git-dir 2>/dev/null')
  unless status.success?
    Jekyll.logger.warn "Not in a git repository. Skipping last_modified_at updates."
    return {}
  end
  
  # Convert to relative paths from git root for reliable git operations
  git_root, status = Open3.capture2('git rev-parse --show-toplevel')
  unless status.success?
    Jekyll.logger.error "Could not determine git root directory."
    return {}
  end
  git_root = git_root.strip
  
  relative_paths = []
  path_mapping = {}
  
  file_paths.each do |fp|
    begin
      rel_path = Pathname.new(fp).relative_path_from(Pathname.new(git_root)).to_s
      relative_paths << rel_path
      path_mapping[rel_path] = fp
    rescue ArgumentError => e
      Jekyll.logger.warn "Could not create relative path for #{fp}: #{e.message}"
    end
  end
  
  return {} if relative_paths.empty?
  
  # Batch process: get commit info for all files at once
  escaped_paths = relative_paths.map { |f| Shellwords.escape(f) }.join(' ')
  log_cmd = "git -C #{Shellwords.escape(git_root)} log --name-only --pretty='format:COMMIT|%H|%ad' --date=iso -- #{escaped_paths}"
  
  output, status = Open3.capture2(log_cmd)
  unless status.success?
    Jekyll.logger.error "Git log command failed with status: #{status.exitstatus}"
    return {}
  end
  
  return {} if output.strip.empty?
  
  # Parse commit log into structured data
  commits_by_file = Hash.new { |h, k| h[k] = [] }
  current_commit = nil
  current_date = nil
  
  output.each_line do |line|
    line = line.strip
    next if line.empty?
    
    if line.start_with?('COMMIT|')
      parts = line.split('|', 3)
      if parts.length >= 3
        current_commit = parts[1]
        current_date = parts[2]
      end
    elsif current_commit && path_mapping.key?(line)
      # Direct match using our mapping
      original_path = path_mapping[line]
      commits_by_file[original_path] << [current_commit, current_date]
    end
  end
  
  # Process each file to find content changes
  results = {}
  
  commits_by_file.each do |file_path, commits|
    # Need at least 2 commits to compare
    next if commits.length <= 1
    
    rel_path = relative_paths[file_paths.index(file_path)]
    next unless rel_path
    
    escaped = Shellwords.escape(rel_path)
    last_content_change = nil
    
    # Check commits from newest to oldest
    commits.each_with_index do |(commit_hash, commit_date), index|
      break if index == commits.length - 1
      
      prev_commit = commits[index + 1][0]
      
      # Validate commit hashes (should be 40 hex characters for full SHA-1)
      next unless commit_hash =~ /^[0-9a-f]{7,40}$/i && prev_commit =~ /^[0-9a-f]{7,40}$/i
      
      # Get diff between commits
      diff_cmd = "git -C #{Shellwords.escape(git_root)} diff --unified=0 #{Shellwords.escape(prev_commit)} #{Shellwords.escape(commit_hash)} -- #{escaped} 2>/dev/null"
      diff_output, diff_status = Open3.capture2(diff_cmd)
      
      next unless diff_status.success?
      next if diff_output.strip.empty?
      
      # Get file content at this commit to determine frontmatter boundaries
      file_cmd = "git -C #{Shellwords.escape(git_root)} show #{Shellwords.escape(commit_hash)}:#{escaped} 2>/dev/null"
      file_content, file_status = Open3.capture2(file_cmd)
      
      next unless file_status.success? && !file_content.strip.empty?
      
      # Find where frontmatter ends
      frontmatter_end_line = find_frontmatter_end_line(file_content)
      
      # Check if this commit has content changes (not just frontmatter)
      if has_content_changes?(diff_output, frontmatter_end_line)
        begin
          last_content_change = Time.parse(commit_date.strip)
          break
        rescue ArgumentError => e
          Jekyll.logger.warn "Invalid date format from git: '#{commit_date}' - #{e.message}"
          next
        end
      end
    end
    
    results[file_path] = last_content_change if last_content_change
  end
  
  results
rescue => e
  Jekyll.logger.error "Batch git processing failed: #{e.message}"
  Jekyll.logger.error e.backtrace.join("\n") if ENV['DEBUG']
  {}
end

def find_site_file(site, file_path)
  expanded = File.expand_path(file_path, site.source)
  site.pages.find { |p| File.expand_path(p.path, site.source) == expanded } ||
    site.posts.docs.find { |p| File.expand_path(p.path, site.source) == expanded } ||
    site.collections.values.flat_map(&:docs).find { |d| File.expand_path(d.path, site.source) == expanded }
rescue => e
  Jekyll.logger.error "Error finding site file for #{file_path}: #{e.message}"
  nil
end

# --------------------------
# Hook
# --------------------------
Jekyll::Hooks.register :site, :post_read do |site|
  begin
    Jekyll.logger.info "Running `last_modified_at` update plugin (content-only changes)..."
    
    # Get timezone configuration
    timezone = get_timezone(site)
    if TZINFO_AVAILABLE && timezone.is_a?(TZInfo::Timezone)
      Jekyll.logger.info "Using TZInfo with timezone: #{site.config['timezone'] || 'Europe/Berlin'}"
    elsif timezone.is_a?(String)
      Jekyll.logger.info "Using Ruby Time with timezone: #{timezone}"
    else
      Jekyll.logger.info "Using system timezone"
    end

    markdown_files = find_all_markdown_files(site.source)
    
    if markdown_files.empty?
      Jekyll.logger.warn "No markdown files found in site source."
      next
    end
    
    # Filter files that have a 'date' attribute
    files_with_dates = []
    file_metadata = {}
    
    markdown_files.each do |file_path|
      next unless File.exist?(file_path)

      front_matter = read_front_matter(file_path)
      next unless front_matter.key?('date')

      date = parse_date(front_matter['date'], file_path)
      next unless date
      
      files_with_dates << file_path
      file_metadata[file_path] = front_matter
    end
    
    if files_with_dates.empty?
      Jekyll.logger.info "No markdown files with 'date' attribute found."
      next
    end
    
    Jekyll.logger.info "Processing #{files_with_dates.length} files with dates..."
    
    # Batch process all files at once
    lastmod_dates = batch_git_last_modified(files_with_dates, site.source)
    
    if lastmod_dates.empty?
      Jekyll.logger.info "No content modifications found for any files."
      next
    end
    
    # Apply the results
    success_count = 0
    lastmod_dates.each do |file_path, lastmod_date|
      begin
        # Ensure last_modified_at is never earlier than the post date
        post_date = parse_date(file_metadata[file_path]['date'], file_path)
        if post_date && lastmod_date < post_date
          Jekyll.logger.debug "Skipping #{file_path}: last_modified_at (#{lastmod_date}) is earlier than date (#{post_date})"
          next
        end
        
        formatted_lastmod = format_with_timezone(lastmod_date, timezone, site)

        site_file = find_site_file(site, file_path)
        if site_file
          site_file.data['last_modified_at'] = formatted_lastmod
          Jekyll.logger.debug "Updated 'last_modified_at' for: #{file_path} -> #{formatted_lastmod}"
          success_count += 1
        elsif file_metadata[file_path] && file_metadata[file_path]['permalink']
          Jekyll.logger.debug "Associating unlinked file: #{file_path} -> Permalink: #{file_metadata[file_path]['permalink']}"
          page = Jekyll::Page.new(site, site.source, File.dirname(file_path), File.basename(file_path))
          page.data['last_modified_at'] = formatted_lastmod
          site.pages << page
          success_count += 1
        else
          Jekyll.logger.warn "File not associated with any Jekyll document: #{file_path}"
        end
      rescue => e
        Jekyll.logger.error "Error processing #{file_path}: #{e.message}"
      end
    end
    
    Jekyll.logger.info "Successfully updated last_modified_at for #{success_count}/#{lastmod_dates.length} files."
  rescue => e
    Jekyll.logger.error "Plugin execution failed: #{e.message}"
    Jekyll.logger.error e.backtrace.join("\n") if ENV['DEBUG']
  end
end
