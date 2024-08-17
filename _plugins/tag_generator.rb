module Jekyll
  class TagPageGenerator < Generator
    safe true
    priority :low

    def generate(site)
      tags = Hash.new { |hash, key| hash[key] = [] }

      # Collect tags from posts
      site.posts.docs.each do |post|
        post_tags = post.data['tags'] || []
        post_tags.each do |tag|
          normalized_tag = normalize_tag(tag)
          tags[normalized_tag] << post
        end
      end

      # Collect tags from notes (assuming notes are in a separate collection)
      if site.collections['notes']
        site.collections['notes'].docs.each do |note|
          note_tags = note.data['tags'] || []
          note_tags.each do |tag|
            normalized_tag = normalize_tag(tag)
            tags[normalized_tag] << note
          end
        end
      end

      # Generate tag pages
      tags.each do |tag, items|
        page = TagPage.new(site, tag, items)
        site.pages << page
      end

      # Generate index page for tags
      index_page = TagsIndexPage.new(site, tags.keys)
      site.pages << index_page
    end

    private

    def normalize_tag(tag)
      tag.strip.downcase.gsub(/[^a-z0-9\s-]/, '').gsub(/\s+/, '-')
    end
  end

  class TagPage < Page
    def initialize(site, tag_slug, items)
      @site = site
      @base = site.source
      @dir = "tags"
      @name = "#{tag_slug}.html"

      self.process(@name)
      self.read_yaml(File.join(@base, '_layouts'), 'tag.html')
      self.data['title'] = "#{tag_slug}"
      self.data['description'] = "List of posts and notes tagged with #{tag_slug}"
      self.data['tag'] = tag_slug
      self.data['items'] = items
      self.data['permalink'] = "/tags/#{tag_slug}/"
    end
  end

  class TagsIndexPage < Page
    def initialize(site, tags)
      @site = site
      @base = site.source
      @dir = "tags"
      @name = "index.html"

      self.process(@name)
      self.read_yaml(File.join(@base, '_layouts'), 'tags.html')
      self.data['title'] = "All Tags"
      self.data['description'] = "List of all tags"
      self.data['tags'] = tags
      self.data['permalink'] = "/tags/"
    end
  end
end
