# frozen_string_literal: true
require_relative '../test_helper'
require_plugin 'heading_anchors'

class HeadingAnchorsTest < Minitest::Test
  def wrap(inner) = %(<div class="post-content">#{inner}</div>)

  def test_adds_anchor_link_to_heading_with_id
    result = HeadingAnchors.process(wrap('<h2 id="intro">Intro</h2>'))
    assert_includes result, '<a class="heading-anchor" href="#intro"'
  end

  def test_ignores_headings_without_an_id
    html = wrap('<h2>No Id</h2>')
    assert_equal html, HeadingAnchors.process(html)
  end

  def test_leaves_html_without_post_content_untouched
    html = '<div class="other"><h2 id="intro">Intro</h2></div>'
    assert_equal html, HeadingAnchors.process(html)
  end

  def test_supports_h2_h3_and_h4
    result = HeadingAnchors.process(wrap('<h2 id="a">A</h2><h3 id="b">B</h3><h4 id="c">C</h4>'))
    %w[a b c].each { |id| assert_includes result, %(href="##{id}") }
  end

  def test_aria_label_uses_visible_heading_text
    result = HeadingAnchors.process(wrap('<h2 id="a">Getting Started</h2>'))
    assert_includes result, 'aria-label="Link to section: Getting Started"'
  end

  def test_omits_aria_label_when_heading_has_no_text_content
    result = HeadingAnchors.process(wrap('<h2 id="a"><img src="x.png" alt=""></h2>'))
    refute_includes result, 'aria-label="Link to section: '
  end

  # Regression: running twice (e.g. plugin re-invoked) must not add a second anchor.
  def test_is_idempotent_when_run_twice
    once = HeadingAnchors.process(wrap('<h2 id="a">A</h2>'))
    twice = HeadingAnchors.process(once)
    assert_equal 1, twice.scan('heading-anchor').length
  end

  def test_ignores_a_heading_with_a_blank_id_attribute
    html = wrap('<h2 id="">Blank Id</h2>')
    assert_equal html, HeadingAnchors.process(html)
  end

  def test_each_heading_gets_its_own_independent_anchor
    result = HeadingAnchors.process(wrap('<h2 id="a">A</h2><h2 id="b">B</h2>'))
    assert_equal 2, result.scan('heading-anchor').length
    assert_includes result, 'href="#a"'
    assert_includes result, 'href="#b"'
  end

  # filter_map only reads direct text-node children, so inline markup after the first one is dropped.
  def test_aria_label_is_truncated_by_inline_markup_after_the_first_text_node
    result = HeadingAnchors.process(wrap('<h2 id="a">Foo <em>Bar</em></h2>'))
    assert_includes result, 'aria-label="Link to section: Foo"'
  end

  def test_h1_is_not_anchored
    html = wrap('<h1 id="a">Title</h1>')
    assert_equal html, HeadingAnchors.process(html)
  end
end
