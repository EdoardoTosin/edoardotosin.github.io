#!/usr/bin/env ruby
#
# Update the `last_modified_at` attribute for all markdown files with a `date` attribute

require 'shellwords'
require 'yaml'
require 'time'
require 'date'

Jekyll::Hooks.register :site, :post_read do |site|
  Jekyll.logger.info "Running `last_modified_at` update plugin..."
  
  def find_all_markdown_files(base_dir)
    Dir.glob(File.join(base_dir, '**', '*.{md,markdown}'))
  end
  
  def read_front_matter(file_path)
    content = File.read(file_path)
    if content =~ /\A---\s*\n.*?\n---\s*\n/m
      yaml_content = content.match(/\A---\s*\n(.*?)\n---\s*\n/m)[1]
      YAML.safe_load(yaml_content, permitted_classes: [Time, Date], aliases: true) || {}
    else
      {}
    end
  rescue Psych::DisallowedClass => e
    Jekyll.logger.warn "Unsupported class in front matter for file: #{file_path} - #{e.message}"
    {}
  rescue StandardError => e
    Jekyll.logger.error "Error reading front matter for file: #{file_path} - #{e.message}"
    {}
  end
  
  def parse_date(date_str, file_path)
    Time.parse(date_str)
  rescue ArgumentError => e
    Jekyll.logger.warn "Invalid date format in front matter for file: #{file_path} - #{e.message}"
    nil
  end
  
  def get_correct_timezone_offset(lastmod_date)
    dst_start = Time.new(lastmod_date.year, 3, 31, 2, 0, 0)
    dst_start -= (dst_start.wday - 7) * 24 * 3600
    
    dst_end = Time.new(lastmod_date.year, 10, 31, 3, 0, 0)
    dst_end -= (dst_end.wday - 7) * 24 * 3600
    
    if lastmod_date >= dst_start && lastmod_date < dst_end
      return '+02:00'
    else
      return '+01:00'
    end
  end
  
  markdown_files = find_all_markdown_files(site.source)

  markdown_files.each do |file_path|
    next unless File.exist?(file_path)
    
    front_matter = read_front_matter(file_path)
    
    unless front_matter.key?('date')
      Jekyll.logger.debug "Skipping file without 'date' attribute: #{file_path}"
      next
    end
    
    date = parse_date(front_matter['date'].to_s, file_path)
    unless date
      Jekyll.logger.debug "Skipping file with invalid date format: #{file_path}"
      next
    end
    
    escaped_path = Shellwords.escape(file_path)
    
    git_log_command = "git log -1 --pretty='format:%ad' --date=iso -- #{escaped_path}"
    commit_count_command = "git rev-list --count HEAD -- #{escaped_path}"
    commit_count = `#{commit_count_command}`.strip.to_i
    
    if commit_count > 1
      lastmod_date = `#{git_log_command}`.strip
      
      if !lastmod_date.empty?
        parsed_lastmod_date = Time.parse(lastmod_date)
        timezone_offset = get_correct_timezone_offset(parsed_lastmod_date)
        
        formatted_lastmod_date = parsed_lastmod_date.getlocal(timezone_offset).strftime('%Y-%m-%dT%H:%M:%S%:z')
        
        site_file = site.pages.find { |page| File.expand_path(page.path, site.source) == file_path } ||
                    site.posts.docs.find { |post| File.expand_path(post.path, site.source) == file_path } ||
                    site.collections.values.flat_map(&:docs).find { |doc| File.expand_path(doc.path, site.source) == file_path }
        
        if site_file
          site_file.data['last_modified_at'] = formatted_lastmod_date
          Jekyll.logger.info "Updated 'last_modified_at' for: #{file_path} -> #{formatted_lastmod_date}"
        else
          permalink = front_matter['permalink']
          if permalink
            Jekyll.logger.info "Associating unlinked file: #{file_path} -> Permalink: #{permalink}"
            site.pages << Jekyll::Page.new(site, site.source, File.dirname(file_path), File.basename(file_path))
            site.pages.last.data['last_modified_at'] = formatted_lastmod_date
          else
            Jekyll.logger.warn "File not associated with a Jekyll document and no permalink: #{file_path}"
          end
        end
      else
        Jekyll.logger.warn "No modification date found for: #{file_path}"
      end
    else
      Jekyll.logger.debug "No updates detected for: #{file_path} (only 1 commit)"
    end
  end
end
