# frozen_string_literal: true
require_relative '../test_helper'
require_plugin 'obsidian_wikilinks'
require_plugin 'backlinks'

class BacklinksNormalizeTest < Minitest::Test
  def test_downcases
    assert_equal 'my-post', Backlinks.normalize('My Post')
  end

  def test_collapses_whitespace_to_single_hyphen
    assert_equal 'my-post', Backlinks.normalize('my   post')
  end

  def test_strips_punctuation
    assert_equal 'my-post', Backlinks.normalize("my post!")
  end

  def test_collapses_repeated_hyphens
    assert_equal 'my-post', Backlinks.normalize('my--post')
  end

  def test_strips_leading_trailing_whitespace
    assert_equal 'my-post', Backlinks.normalize('  my post  ')
  end

  def test_nil_input_normalizes_to_empty_string
    assert_equal '', Backlinks.normalize(nil)
  end

  def test_maps_underscore_to_hyphen
    assert_equal 'my-post', Backlinks.normalize('my_post')
  end

  def test_collapses_underscore_hyphen_mix_to_a_single_hyphen
    assert_equal 'my-post', Backlinks.normalize('my_-post')
  end

  # Parity with the wikilink resolver's own key derivation is the whole point of this function.
  def test_matches_obsidian_wikilinks_page_index_normalize
    site = FakeSite.new
    wl_index = ObsidianWikilinks::PageIndex.new(site)
    %w[My_Post my-post MY POST My_Great-Post c++ 100% café].each do |input|
      assert_equal wl_index.send(:normalize, input), Backlinks.normalize(input), "mismatch for #{input.inspect}"
    end
  end
end

class BacklinksHookTest < Minitest::Test
  def trigger(site) = Jekyll::Hooks.trigger(:site, :pre_render, site)

  def site_with(posts) = FakeSite.new(posts: FakePostsCollection.new(posts))

  def test_registers_a_backlink_for_a_resolved_wikilink
    target = FakePost.new(data: { 'slug' => 'my-page' }, url: '/my-page/')
    source = FakePost.new(content: 'see [[my-page]]', url: '/source/')
    site = site_with([target, source])
    trigger site
    assert_equal [source], target.data['backlinks']
    assert_equal [], source.data['backlinks']
  end

  def test_no_backlink_when_wikilink_target_is_unresolved
    source = FakePost.new(content: 'see [[Nonexistent]]', url: '/source/')
    site = site_with([source])
    trigger site
    assert_equal [], source.data['backlinks']
  end

  def test_no_backlink_for_a_self_referencing_link
    post = FakePost.new(data: { 'slug' => 'my-page' }, content: 'see [[my-page]]', url: '/my-page/')
    site = site_with([post])
    trigger site
    assert_equal [], post.data['backlinks']
  end

  def test_dedupes_multiple_links_from_the_same_source
    target = FakePost.new(data: { 'slug' => 'my-page' }, url: '/my-page/')
    source = FakePost.new(content: 'see [[my-page]] and again [[my-page|here]]', url: '/source/')
    site = site_with([target, source])
    trigger site
    assert_equal [source], target.data['backlinks']
  end

  def test_matches_by_title_when_source_has_no_slug
    target = FakePost.new(data: { 'title' => 'My Great Post' }, url: '/my-page/')
    source = FakePost.new(content: 'see [[My Great Post]]', url: '/source/')
    site = site_with([target, source])
    trigger site
    assert_equal [source], target.data['backlinks']
  end

  def test_alias_and_heading_fragments_still_resolve_to_the_target
    target = FakePost.new(data: { 'slug' => 'my-page' }, url: '/my-page/')
    source = FakePost.new(content: 'see [[my-page#Section|click here]]', url: '/source/')
    site = site_with([target, source])
    trigger site
    assert_equal [source], target.data['backlinks']
  end

  # obsidian_wikilinks.rb never renders an embed as a clickable link, so it must not backlink either.
  def test_embed_syntax_does_not_register_a_backlink
    target = FakePost.new(data: { 'slug' => 'my-page' }, url: '/my-page/')
    source = FakePost.new(content: 'see ![[my-page]]', url: '/source/')
    site = site_with([target, source])
    trigger site
    assert_equal [], target.data['backlinks']
  end

  # A hyphenated link must resolve to an underscore-slugged post, matching PageIndex#normalize.
  def test_underscore_slug_resolves_against_a_hyphenated_link
    target = FakePost.new(data: { 'slug' => 'my_page' }, url: '/my-page/')
    source = FakePost.new(content: 'see [[my-page]]', url: '/source/')
    site = site_with([target, source])
    trigger site
    assert_equal [source], target.data['backlinks']
  end

  def test_posts_with_no_incoming_links_get_an_empty_array
    post = FakePost.new(url: '/lonely/')
    site = site_with([post])
    trigger site
    assert_equal [], post.data['backlinks']
  end

  def test_noop_when_site_has_no_posts
    trigger site_with([])
    pass
  end
end
