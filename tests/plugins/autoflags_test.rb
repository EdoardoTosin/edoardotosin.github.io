# frozen_string_literal: true
require_relative '../test_helper'
require_plugin 'autoflags'

class AutoflagsTest < Minitest::Test
  def trigger(post) = Jekyll::Hooks.trigger(:posts, :pre_render, post)

  def test_sets_math_true_when_display_math_delimiter_present
    post = FakePost.new(content: 'some $$x^2$$ formula', data: {})
    trigger post
    assert_equal true, post.data['math']
  end

  def test_sets_math_true_for_bracket_delimiter
    post = FakePost.new(content: 'inline \\[ x \\]', data: {})
    trigger post
    assert_equal true, post.data['math']
  end

  def test_sets_math_true_for_paren_delimiter
    post = FakePost.new(content: 'inline \\( x \\)', data: {})
    trigger post
    assert_equal true, post.data['math']
  end

  def test_sets_math_false_when_no_math_syntax_present
    post = FakePost.new(content: 'plain prose', data: {})
    trigger post
    assert_equal false, post.data['math']
  end

  def test_sets_mermaid_true_when_fenced_mermaid_block_present
    post = FakePost.new(content: "```mermaid\ngraph TD\n```", data: {})
    trigger post
    assert_equal true, post.data['mermaid']
  end

  def test_sets_mermaid_false_when_absent
    post = FakePost.new(content: 'plain prose', data: {})
    trigger post
    assert_equal false, post.data['mermaid']
  end

  # An explicit `false` in front matter is an opt-out and must survive even if syntax is present.
  def test_explicit_false_is_preserved_even_when_syntax_is_present
    post = FakePost.new(content: '$$x$$ and ```mermaid\ngraph TD\n```',
                         data: { 'math' => false, 'mermaid' => false })
    trigger post
    assert_equal false, post.data['math']
    assert_equal false, post.data['mermaid']
  end

  def test_explicit_true_is_preserved_even_without_matching_syntax
    post = FakePost.new(content: 'plain prose', data: { 'math' => true, 'mermaid' => true })
    trigger post
    assert_equal true, post.data['math']
    assert_equal true, post.data['mermaid']
  end

  def test_math_delimiter_mid_content_still_triggers
    post = FakePost.new(content: 'some intro text, then later $$E=mc^2$$ appears', data: {})
    trigger post
    assert_equal true, post.data['math']
  end

  def test_mentioning_the_word_mermaid_without_a_fence_does_not_trigger
    post = FakePost.new(content: 'this post talks about mermaid diagrams', data: {})
    trigger post
    assert_equal false, post.data['mermaid']
  end

  def test_each_flag_is_independently_auto_detected
    post = FakePost.new(content: '$$x$$ only, no diagrams', data: { 'mermaid' => false })
    trigger post
    assert_equal true, post.data['math']
    assert_equal false, post.data['mermaid']
  end
end
