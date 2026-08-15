# frozen_string_literal: true
require_relative '../test_helper'
require_plugin 'toc_builder'

class TocBuilderTest < Minitest::Test
  def wrap(headings, list: '<ul id="toc-list"></ul>')
    %(#{list}<div class="post-content">#{headings}</div>)
  end

  def test_injects_li_items_for_each_heading_with_id
    result = TocBuilder.process(wrap('<h2 id="a">Section A</h2><h3 id="b">Section B</h3>'))
    assert_includes result, 'toc-item toc-item--h2'
    assert_includes result, 'href="#a"'
    assert_includes result, '>Section A<'
    assert_includes result, 'toc-item toc-item--h3'
  end

  def test_skips_headings_without_an_id
    result = TocBuilder.process(wrap('<h2>No Id</h2>'))
    refute_includes result, 'toc-item'
  end

  def test_leaves_output_untouched_when_no_headings_present
    html = wrap('<p>no headings</p>')
    assert_equal html, TocBuilder.process(html)
  end

  def test_leaves_output_untouched_when_no_post_content
    html = '<ul id="toc-list"></ul><h2 id="a">A</h2>'
    assert_equal html, TocBuilder.process(html)
  end

  def test_fills_both_toc_list_and_toc_list_inline
    html = '<ul id="toc-list"></ul><ul id="toc-list-inline"></ul>' \
           '<div class="post-content"><h2 id="a">A</h2></div>'
    result = TocBuilder.process(html)
    assert_equal 2, result.scan('<li class="toc-item').length
  end

  def test_does_not_overwrite_a_list_that_already_has_content
    html = '<ul id="toc-list"><li>existing</li></ul><div class="post-content"><h2 id="a">A</h2></div>'
    result = TocBuilder.process(html)
    assert_includes result, 'existing'
    refute_includes result, 'toc-item'
  end

  def test_unhides_the_toc_widget_when_headings_exist
    html = '<div id="toc-widget" hidden></div><ul id="toc-list"></ul>' \
           '<div class="post-content"><h2 id="a">A</h2></div>'
    result = TocBuilder.process(html)
    refute_includes result, 'id="toc-widget" hidden'
  end

  def test_escapes_heading_text_in_the_generated_link_label
    result = TocBuilder.process(wrap('<h2 id="a">A &amp; B</h2>'))
    assert_includes result, 'A &amp; B'
  end

  def test_h4_headings_are_included
    result = TocBuilder.process(wrap('<h4 id="a">Deep</h4>'))
    assert_includes result, 'toc-item--h4'
  end

  # Same direct-text-node extraction quirk as heading_anchors.rb (see that file's test for why).
  def test_heading_label_is_truncated_by_inline_markup_after_the_first_text_node
    result = TocBuilder.process(wrap('<h2 id="a">Foo <em>Bar</em></h2>'))
    assert_match(%r{<a class="toc-link" href="#a">Foo</a>}, result)
  end

  def test_fills_a_list_that_only_has_whitespace_content
    html = "<ul id=\"toc-list\">   \n  </ul><div class=\"post-content\"><h2 id=\"a\">A</h2></div>"
    result = TocBuilder.process(html)
    assert_includes result, 'toc-item'
  end

  def test_only_unhides_the_widget_that_is_actually_present
    html = '<div id="toc-widget-inline" hidden></div><ul id="toc-list"></ul>' \
           '<div class="post-content"><h2 id="a">A</h2></div>'
    result = TocBuilder.process(html)
    refute_includes result, 'id="toc-widget-inline" hidden'
  end

  def test_multiple_headings_preserve_document_order
    result = TocBuilder.process(wrap('<h2 id="a">A</h2><h2 id="b">B</h2><h2 id="c">C</h2>'))
    assert_operator result.index('#a'), :<, result.index('#b')
    assert_operator result.index('#b'), :<, result.index('#c')
  end
end
