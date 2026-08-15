# frozen_string_literal: true
require_relative '../test_helper'
require_plugin 'callouts'

class CalloutsTransformTest < Minitest::Test
  def bq(type, body) = "<blockquote>\n<p>[!#{type}]\n#{body}</p>\n</blockquote>"

  def test_leaves_html_without_bang_bracket_untouched
    html = '<blockquote><p>Just a regular quote</p></blockquote>'
    assert_equal html, Callouts.transform(html)
  end

  def test_transforms_note_into_callout_div
    result = Callouts.transform(bq('NOTE', 'Some text'))
    assert_includes result, 'class="callout callout--note"'
    assert_includes result, 'role="region"'
    assert_includes result, 'aria-label="Note callout"'
    assert_includes result, '<p>Some text</p>'
  end

  # TYPE_RE only matches the TYPES allowlist, so an unrecognized marker is left as plain HTML.
  def test_unrecognized_type_marker_is_left_as_plain_blockquote
    html = bq('BOGUS', 'text')
    assert_equal html, Callouts.transform(html)
  end

  def test_type_matching_is_case_insensitive
    result = Callouts.transform(bq('note', 'text'))
    assert_includes result, 'callout--note'
    assert_includes result, 'NOTE</div>'
  end

  def test_spoiler_type_renders_as_details_with_reveal_toggle
    result = Callouts.transform(bq('SPOILER', 'hidden text'), 'Spoiler')
    assert_includes result, '<details class="callout callout--spoiler">'
    assert_includes result, '<summary class="callout__title">'
    assert_includes result, 'Spoiler'
    assert_includes result, 'hidden text'
  end

  def test_spoiler_label_is_configurable
    result = Callouts.transform(bq('SPOILER', 'x'), 'Segreto')
    assert_includes result, 'Segreto'
  end

  def test_strips_leading_br_after_type_marker
    html = "<blockquote>\n<p>[!NOTE]<br />\nSome text</p>\n</blockquote>"
    result = Callouts.transform(html)
    assert_includes result, '<p>Some text</p>'
  end

  def test_omits_inline_paragraph_when_type_marker_has_no_inline_text
    html = "<blockquote>\n<p>[!NOTE]\n</p>\n<p>Body paragraph</p>\n</blockquote>"
    result = Callouts.transform(html)
    assert_includes result, 'Body paragraph'
  end

  def test_nested_blockquote_inside_callout_is_recursively_transformed
    inner = bq('TIP', 'inner text')
    html = "<blockquote>\n<p>[!NOTE]\nouter text</p>\n#{inner}\n</blockquote>"
    result = Callouts.transform(html)
    assert_includes result, 'callout--note'
    assert_includes result, 'callout--tip'
    assert_includes result, 'inner text'
  end

  def test_plain_nested_blockquote_without_marker_keeps_blockquote_tags
    html = "<blockquote>\n<p>[!NOTE]\nouter</p>\n<blockquote><p>plain quote</p></blockquote>\n</blockquote>"
    result = Callouts.transform(html)
    assert_includes result, '<blockquote><p>plain quote</p></blockquote>'
  end

  def test_multiple_top_level_callouts_are_all_transformed
    html = bq('NOTE', 'first') + bq('WARNING', 'second')
    result = Callouts.transform(html)
    assert_includes result, 'callout--note'
    assert_includes result, 'callout--warning'
  end

  def test_unclosed_blockquote_is_left_as_is_without_raising
    html = "<blockquote><p>[!NOTE]\ntext with no closing tag"
    result = Callouts.transform(html)
    assert_equal html, result
  end

  def test_supports_important_and_caution_types
    assert_includes Callouts.transform(bq('IMPORTANT', 'x')), 'callout--important'
    assert_includes Callouts.transform(bq('CAUTION', 'x')), 'callout--caution'
  end

  def test_three_levels_of_nesting_all_transform
    inner = bq('CAUTION', 'deepest')
    mid = "<blockquote>\n<p>[!WARNING]\nmid</p>\n#{inner}\n</blockquote>"
    outer = "<blockquote>\n<p>[!NOTE]\nouter</p>\n#{mid}\n</blockquote>"
    result = Callouts.transform(outer)
    assert_includes result, 'callout--note'
    assert_includes result, 'callout--warning'
    assert_includes result, 'callout--caution'
    assert_includes result, 'deepest'
  end

  def test_empty_string_input_returns_empty_string
    assert_equal '', Callouts.transform('')
  end

  def test_default_spoiler_label_is_spoiler
    result = Callouts.transform(bq('SPOILER', 'x'))
    assert_includes result, '>Spoiler<'
  end
end

class CalloutsFindMatchingCloseTest < Minitest::Test
  def test_finds_close_of_simple_blockquote
    html = '<blockquote>text</blockquote>after'
    start = html.index('>') + 1
    pos = Callouts.find_matching_close(html, start)
    assert_equal html.index('after'), pos
  end

  def test_handles_nested_blockquotes_by_depth
    html = '<blockquote>a<blockquote>b</blockquote>c</blockquote>after'
    start = html.index('>') + 1
    pos = Callouts.find_matching_close(html, start)
    assert_equal html.index('after'), pos
  end

  def test_returns_nil_when_no_closing_tag_exists
    html = '<blockquote>never closes'
    start = html.index('>') + 1
    assert_nil Callouts.find_matching_close(html, start)
  end

  def test_handles_immediately_empty_blockquote
    html = '<blockquote></blockquote>after'
    start = html.index('>') + 1
    pos = Callouts.find_matching_close(html, start)
    assert_equal html.index('after'), pos
  end

  def test_handles_three_levels_of_nesting_by_depth
    html = '<blockquote>a<blockquote>b<blockquote>c</blockquote>d</blockquote>e</blockquote>after'
    start = html.index('>') + 1
    pos = Callouts.find_matching_close(html, start)
    assert_equal html.index('after'), pos
  end
end
