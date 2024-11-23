module Jekyll
  class AddCopyToClipboard < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      puts "AddCopyToClipboard plugin:"

      # Exit early if the include file is missing
      return unless include_file_exists?(site)

      # Process relevant markdown files
      process_markdown_files(site.posts.docs + site.collections.fetch('notes', []).docs, site)
    end

    private

    # Checks if the clipboard include file exists
    def include_file_exists?(site)
      File.exist?(site.in_source_dir('_includes', 'CopyToClipboard.html'))
    end

    # Processes all Markdown documents
    def process_markdown_files(documents, site)
      documents.each do |document|
        next unless markdown_file?(document)

        updated_content = add_copy_to_clipboard(document.content)
        if updated_content != document.content
          document.content = updated_content
          print_debug_info(site, document)
        end
      end
    end

    # Verifies if a document is a markdown file and should be processed
    def markdown_file?(document)
      document.extname == ".md" && document.path != "README.md"
    end

    # Adds the clipboard include string before even-numbered code blocks
    def add_copy_to_clipboard(content)
      return content unless content

      clipboard_string = "{% include CopyToClipboard.html %}"
      block_index = 0

      content.gsub(/^(```)/) do |match|
        insert = block_index.even? ? "#{clipboard_string}\n" : ""
        block_index += 1
        "#{insert}#{match}"
      end
    end

    # Prints debug information for updated posts by URL
    def print_debug_info(site, document)
      base_url = site.config['url'] || ""
      puts "- Updated #{base_url}#{document.url}"
    end
  end
end
