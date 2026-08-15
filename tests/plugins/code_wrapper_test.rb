# frozen_string_literal: true
require_relative '../test_helper'
require_plugin 'code_wrapper'

class CodeWrapperDetectLangTest < Minitest::Test
  def el_for(html) = Nokogiri::HTML.fragment(html).at_css('div')

  def test_detects_language_from_class_on_wrapper
    el = el_for('<div class="highlight language-ruby"><code>x</code></div>')
    assert_equal 'RUBY', CodeWrapper.detect_lang(el)
  end

  def test_detects_language_from_class_on_nested_code_element
    el = el_for('<div class="highlight"><code class="language-python">x</code></div>')
    assert_equal 'PYTHON', CodeWrapper.detect_lang(el)
  end

  def test_maps_known_alias_to_display_label
    el = el_for('<div class="highlight language-js"><code>x</code></div>')
    assert_equal 'JS', CodeWrapper.detect_lang(el)
  end

  def test_unmapped_language_is_upcased_as_is
    el = el_for('<div class="highlight language-elixir"><code>x</code></div>')
    assert_equal 'ELIXIR', CodeWrapper.detect_lang(el)
  end

  def test_falls_back_to_code_when_no_language_class_present
    el = el_for('<div class="highlight"><code>x</code></div>')
    assert_equal 'CODE', CodeWrapper.detect_lang(el)
  end

  # start_with?('language-') is case-sensitive, so a capitalized class is simply not recognized.
  def test_uppercase_language_prefix_is_not_recognized
    el = el_for('<div class="highlight Language-Ruby"><code>x</code></div>')
    assert_equal 'CODE', CodeWrapper.detect_lang(el)
  end

  def test_first_language_class_wins_when_multiple_are_present
    el = el_for('<div class="highlight language-ruby language-python"><code>x</code></div>')
    assert_equal 'RUBY', CodeWrapper.detect_lang(el)
  end
end

class CodeWrapperProcessTest < Minitest::Test
  def test_wraps_highlight_block_in_code_block_div_with_header
    html = '<div class="highlight language-ruby"><pre><code>puts 1</code></pre></div>'
    result = CodeWrapper.process(html)
    assert_includes result, 'class="code-block"'
    assert_includes result, 'class="code-block__header"'
    assert_includes result, 'class="code-block__lang"'
    assert_includes result, '>RUBY<'
    assert_includes result, 'code-block__copy'
  end

  def test_leaves_html_without_highlight_class_untouched
    html = '<p>no code here</p>'
    assert_equal html, CodeWrapper.process(html)
  end

  # Must not double-wrap a block that's already inside a .code-block (idempotent re-render).
  def test_does_not_double_wrap_an_already_wrapped_block
    already_wrapped = CodeWrapper.process('<div class="highlight"><code>x</code></div>')
    result = CodeWrapper.process(already_wrapped)
    assert_equal 1, result.scan('code-block__header').length
  end

  def test_wraps_multiple_independent_highlight_blocks
    html = '<div class="highlight language-ruby"><code>a</code></div>' \
           '<div class="highlight language-python"><code>b</code></div>'
    result = CodeWrapper.process(html)
    assert_equal 2, result.scan('class="code-block"').length
    assert_includes result, '>RUBY<'
    assert_includes result, '>PYTHON<'
  end
end
