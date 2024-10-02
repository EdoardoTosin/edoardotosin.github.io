# _plugins/add_copy_to_clipboard.rb

module Jekyll
  class AddCopyToClipboard < Jekyll::Generator
    safe true
    priority :low

    # This method is called by Jekyll to generate content
    def generate(site)
      puts "AddCopyToClipboard plugin:"
      # Check if the clipboard include file exists
      @include_exists = include_file_exists?(site)
      process_all_markdown_files(site)
    end

    private

    # Checks if the clipboard include file exists in the _includes folder
    def include_file_exists?(site)
      includes_dir = site.in_source_dir('_includes')
      File.exist?(File.join(includes_dir, 'Copy-to-Clipboard.html'))
    end

    # Processes all Markdown files from specified collections
    def process_all_markdown_files(site)
      # Process posts and notes collections
      (site.posts.docs + site.collections['notes'].docs).each do |document|
        process_markdown_content(document)
      end
    end

    # Processes the content of a given Markdown document
    def process_markdown_content(document)
      # Proceed only if the document has content, is a Markdown file, and the include file exists
      return unless document.content && document.extname == ".md" && @include_exists

      # Skip the README.md file
      return if document.path == "README.md"

      original_content = document.content
      updated_content = add_copy_to_clipboard(original_content)

      # Update the document content and print debug info if changes were made
      if original_content != updated_content
        document.content = updated_content
        print_debug_info(document.path)
      end
    end

    # Adds the clipboard include string before even-numbered code blocks
    def add_copy_to_clipboard(content)
      # Detect the newline format used in the original content (CRLF or LF)
      newline_format = content.include?("\r\n") ? "\r\n" : "\n"

      # Define the string to add before each code block
      clipboard_string = "{% include Copy-to-Clipboard.html %}"

      # Counter to track code block index
      block_index = 0

      # Use a custom regex to match all code blocks and apply the clipboard string based on index
      content.gsub(/(\r?\n```)/m) do |match|
        # Add clipboard string before opening code blocks
        if block_index.even?
          "#{newline_format}#{clipboard_string}#{newline_format}#{match.strip}"
        else
          match
        end.tap { block_index += 1 }  # Increment the block index
      end
    end

    # Prints a compact debug message with the relative path for each updated file
    def print_debug_info(path)
      # Calculate the relative path from the project's root
      relative_path = Pathname.new(path).relative_path_from(Pathname.pwd).to_s
      puts "- Updated #{relative_path}"
    end
  end
end
