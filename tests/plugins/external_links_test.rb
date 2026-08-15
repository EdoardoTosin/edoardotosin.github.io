# frozen_string_literal: true
require_relative '../test_helper'
require_plugin 'external_links'

class ExternalLinksSiteHostTest < Minitest::Test
  def test_extracts_host_from_config_url
    assert_equal 'example.com', ExternalLinks.site_host({ 'url' => 'https://example.com' })
  end

  def test_returns_nil_when_url_is_empty
    assert_nil ExternalLinks.site_host({ 'url' => '' })
  end

  def test_returns_nil_when_url_is_missing
    assert_nil ExternalLinks.site_host({})
  end

  def test_returns_nil_for_invalid_url_instead_of_raising
    assert_nil ExternalLinks.site_host({ 'url' => 'ht!tp://' })
  end

  def test_strips_port_from_host
    assert_equal 'example.com', ExternalLinks.site_host({ 'url' => 'https://example.com:8080' })
  end
end

class ExternalLinksTagExternalTest < Minitest::Test
  def test_tags_external_link_with_data_ext_target_and_rel
    html = ExternalLinks.tag_external('<a href="https://other.com/x">link</a>', 'example.com')
    assert_includes html, 'data-ext'
    assert_includes html, 'target="_blank"'
    assert_includes html, 'rel="noopener noreferrer"'
  end

  def test_does_not_tag_link_to_own_host
    html = '<a href="https://example.com/x">link</a>'
    assert_equal html, ExternalLinks.tag_external(html, 'example.com')
  end

  def test_does_not_tag_relative_link
    html = '<a href="/blog/post">link</a>'
    assert_equal html, ExternalLinks.tag_external(html, 'example.com')
  end

  def test_handles_protocol_relative_href
    html = ExternalLinks.tag_external('<a href="//other.com/x">link</a>', 'example.com')
    assert_includes html, 'data-ext'
  end

  def test_does_not_duplicate_data_ext_on_already_tagged_link
    html = '<a href="https://other.com/x" data-ext target="_blank" rel="noopener noreferrer">link</a>'
    assert_equal html, ExternalLinks.tag_external(html, 'example.com')
  end

  def test_preserves_existing_target_and_rel_attributes
    html = ExternalLinks.tag_external('<a href="https://other.com/x" target="_self" rel="nofollow">link</a>',
                                       'example.com')
    assert_includes html, 'target="_self"'
    assert_includes html, 'rel="nofollow"'
    refute_includes html, 'target="_blank"'
  end

  # data-ext must match as a whole attribute name, so "data-extra" isn't mistaken for it.
  def test_word_boundary_match_does_not_confuse_similarly_named_attribute
    html = ExternalLinks.tag_external('<a href="https://other.com/x" data-extra="1">link</a>', 'example.com')
    assert_includes html, ' data-ext '
  end

  def test_leaves_link_with_no_host_config_untagged_as_external_when_host_nil
    html = ExternalLinks.tag_external('<a href="https://other.com/x">link</a>', nil)
    assert_includes html, 'data-ext'
  end

  def test_matches_single_quoted_href
    html = ExternalLinks.tag_external("<a href='https://other.com/x'>link</a>", 'example.com')
    assert_includes html, 'data-ext'
  end

  def test_matches_uppercase_href_attribute_name
    html = ExternalLinks.tag_external('<a HREF="https://other.com/x">link</a>', 'example.com')
    assert_includes html, 'data-ext'
  end

  def test_ignores_mailto_link
    html = '<a href="mailto:foo@bar.com">mail</a>'
    assert_equal html, ExternalLinks.tag_external(html, 'example.com')
  end

  def test_ignores_fragment_only_link
    html = '<a href="#section">jump</a>'
    assert_equal html, ExternalLinks.tag_external(html, 'example.com')
  end

  # URI#host strips the port, so a link back to the site on a different port is still "own host".
  def test_treats_own_host_on_a_different_port_as_internal
    html = '<a href="https://example.com:9999/x">port</a>'
    assert_equal html, ExternalLinks.tag_external(html, 'example.com')
  end

  def test_tags_multiple_links_independently
    html = ExternalLinks.tag_external(
      '<a href="https://other.com/a">a</a> <a href="/local">b</a> <a href="https://third.com/c">c</a>',
      'example.com',
    )
    assert_equal 2, html.scan('data-ext').length
  end

  def test_leaves_anchor_tag_with_no_attributes_untouched
    html = '<a>bare</a>'
    assert_equal html, ExternalLinks.tag_external(html, 'example.com')
  end

  def test_extract_host_is_case_insensitive_for_scheme
    assert_equal 'example.com', ExternalLinks.extract_host('HTTPS://example.com/x')
  end
end

class ExternalLinksLabelPostLinksTest < Minitest::Test
  def test_adds_aria_label_to_tagged_post_content_link
    html = '<div class="post-content"><a href="https://other.com" data-ext>Read more</a></div>'
    result = ExternalLinks.label_post_links(html)
    assert_includes result, 'aria-label="Read more (opens in new tab)"'
  end

  def test_falls_back_to_generic_label_for_empty_link_text
    html = '<div class="post-content"><a href="https://other.com" data-ext></a></div>'
    result = ExternalLinks.label_post_links(html)
    assert_includes result, 'aria-label="External link (opens in new tab)"'
  end

  def test_does_not_overwrite_existing_aria_label
    html = '<div class="post-content"><a href="https://other.com" data-ext aria-label="Custom">x</a></div>'
    result = ExternalLinks.label_post_links(html)
    assert_includes result, 'aria-label="Custom"'
  end

  def test_ignores_external_links_outside_post_content
    html = '<a href="https://other.com" data-ext>Read more</a>'
    assert_equal html, ExternalLinks.label_post_links(html)
  end

  def test_truncates_long_link_text
    text = 'x' * 100
    html = %(<div class="post-content"><a href="https://other.com" data-ext>#{text}</a></div>)
    result = ExternalLinks.label_post_links(html)
    assert_match(/aria-label="x{80}…\s\(opens in new tab\)"/, result)
  end

  def test_ignores_internal_link_without_data_ext_inside_post_content
    html = '<div class="post-content"><a href="/blog/post">Internal</a></div>'
    assert_equal html, ExternalLinks.label_post_links(html)
  end

  def test_collapses_whitespace_in_multiline_link_text
    html = "<div class=\"post-content\"><a href=\"https://other.com\" data-ext>\n  Read\n  more\n</a></div>"
    result = ExternalLinks.label_post_links(html)
    assert_includes result, 'aria-label="Read more (opens in new tab)"'
  end

  def test_returns_original_html_untouched_when_nothing_needs_a_label
    html = '<div class="post-content"><p>no links here</p></div>'
    assert_equal html, ExternalLinks.label_post_links(html)
  end
end
