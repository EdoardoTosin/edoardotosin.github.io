module Jekyll
  class TagPageGenerator < Generator
    safe true
    priority :low

    TAG_SANITIZE_REGEX = /[^a-z0-9\s-]/.freeze

    def generate(site)
      tags = Hash.new { |hash, key| hash[key] = [] }

      # Collect tags from relevant collections
      collect_tags(site, %w[posts notes], tags)

      # Generate tag pages
      tags.each do |tag, items|
        site.pages << TagPage.new(site, tag, items)
      end

      # Generate index page for tags
      site.pages << TagsIndexPage.new(site, tags.keys.sort)
    end

    private

    def collect_tags(site, collections, tags)
      collections.each do |collection_name|
        next unless site.collections[collection_name]

        site.collections[collection_name].docs.each do |doc|
          (doc.data['tags'] || []).each do |tag|
            tags[normalize_tag(tag)] << doc
          end
        end
      end
    end

    def normalize_tag(tag)
      tag.to_s.strip.downcase
         .gsub(TAG_SANITIZE_REGEX, '') # remove unwanted chars
         .tr(' ', '-')                # replace spaces with hyphens
         .squeeze('-')                # collapse multiple hyphens
    end
  end

  class TagPage < Page
    def initialize(site, tag_slug, items)
      @site, @base, @dir, @name = site, site.source, "tags", "#{tag_slug}.html"

      process(@name)
      read_yaml(File.join(@base, '_layouts'), 'tag.html')

      self.data.merge!(
        'title'       => tag_slug,
        'description' => "List of posts and notes tagged with #{tag_slug}",
        'tag'         => tag_slug,
        'items'       => items,
        'permalink'   => "/tags/#{tag_slug}/",
        'sitemap'     => 'false',
        'noindex'     => 'true',
      )
    end
  end

  class TagsIndexPage < Page
    def initialize(site, tags)
      @site, @base, @dir, @name = site, site.source, "tags", "index.html"

      process(@name)
      read_yaml(File.join(@base, '_layouts'), 'tags.html')

      self.data.merge!(
        'title'       => "All Tags",
        'description' => "List of all tags",
        'tags'        => tags,
        'permalink'   => "/tags/",
        'sitemap'     => 'false',
        'noindex'     => 'true',
      )
    end
  end
end
