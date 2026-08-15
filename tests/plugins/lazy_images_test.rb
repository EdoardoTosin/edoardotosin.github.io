# frozen_string_literal: true
require_relative '../test_helper'
require_plugin 'lazy_images'

class LazyImagesTest < Minitest::Test
  def wrap(inner) = %(<div class="post-content">#{inner}</div>)

  def test_adds_loading_and_decoding_to_bare_img
    result = LazyImages.process(wrap('<img src="x.png">'))
    assert_includes result, 'loading="lazy"'
    assert_includes result, 'decoding="async"'
  end

  def test_preserves_explicit_loading_attribute
    result = LazyImages.process(wrap('<img src="x.png" loading="eager">'))
    assert_includes result, 'loading="eager"'
    refute_includes result, 'loading="lazy"'
  end

  def test_preserves_explicit_decoding_attribute
    result = LazyImages.process(wrap('<img src="x.png" decoding="sync">'))
    assert_includes result, 'decoding="sync"'
  end

  def test_ignores_images_outside_post_content
    html = '<div class="other"><img src="x.png"></div>'
    assert_equal html, LazyImages.process(html)
  end

  def test_leaves_html_without_img_tag_untouched
    html = wrap('<p>no images</p>')
    assert_equal html, LazyImages.process(html)
  end

  def test_handles_multiple_images_independently
    result = LazyImages.process(wrap('<img src="a.png"><img src="b.png" loading="eager">'))
    assert_equal 1, result.scan('loading="lazy"').length
    assert_equal 1, result.scan('loading="eager"').length
  end

  def test_returns_input_unchanged_when_both_attributes_are_already_set
    html = wrap('<img src="x.png" loading="lazy" decoding="async">')
    result = LazyImages.process(html)
    assert_equal 1, result.scan('loading="lazy"').length
    assert_equal 1, result.scan('decoding="async"').length
  end

  def test_handles_self_closing_img_syntax
    result = LazyImages.process(wrap('<img src="x.png" />'))
    assert_includes result, 'loading="lazy"'
  end
end
