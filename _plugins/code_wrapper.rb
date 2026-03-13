# code_wrapper.rb - Wraps Rouge .highlight blocks in .code-block div+header at build time.
require 'nokogiri'

LANG_ALIASES = {
  'plaintext' => 'TEXT', 'text' => 'TEXT', 'none' => 'TEXT',
  'sh' => 'BASH', 'shell' => 'BASH',
  'js' => 'JS', 'javascript' => 'JS',
  'ts' => 'TS', 'typescript' => 'TS',
  'apacheconf' => 'CONF', 'nginx' => 'CONF', 'conf' => 'CONF',
  'yml' => 'YAML', 'yaml' => 'YAML',
  'rb' => 'RUBY', 'ruby' => 'RUBY',
  'py' => 'PYTHON', 'python' => 'PYTHON'
}.freeze

COPY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" ' \
           'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' \
           'stroke-linejoin="round" aria-hidden="true">' \
           '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>' \
           '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>' \
           '</svg>'.freeze

def detect_lang(el)
  [el, el.at_css('code')].compact.each do |node|
    node.classes.each do |cls|
      if cls.start_with?('language-')
        name = cls.sub('language-', '')
        return (LANG_ALIASES[name] || name).upcase
      end
    end
  end
  'CODE'
end

Jekyll::Hooks.register [:documents, :pages], :post_render do |doc|
  next unless doc.output_ext == '.html'
  next unless doc.output.is_a?(String) && doc.output.include?('highlight')

  parsed  = Nokogiri::HTML(doc.output)
  changed = false

  parsed.css('.highlight').each do |block|
    next if block.ancestors.any? { |a| a['class']&.include?('code-block') }

    lang   = detect_lang(block)

    wrapper = Nokogiri::XML::Node.new('div', parsed)
    wrapper['class'] = 'code-block'

    header = Nokogiri::XML::Node.new('div', parsed)
    header['class'] = 'code-block__header'

    label = Nokogiri::XML::Node.new('span', parsed)
    label['class'] = 'code-block__lang'
    label.content  = lang

    btn = Nokogiri::XML::Node.new('button', parsed)
    btn['class']      = 'code-block__copy'
    btn['type']       = 'button'
    btn['aria-label'] = 'Copy code to clipboard'
    btn.inner_html    = "#{COPY_SVG}<span>Copy</span>"

    header.add_child(label)
    header.add_child(btn)
    wrapper.add_child(header)

    block.replace(wrapper)
    wrapper.add_child(block)
    changed = true
  end

  doc.output = parsed.to_html if changed
end
