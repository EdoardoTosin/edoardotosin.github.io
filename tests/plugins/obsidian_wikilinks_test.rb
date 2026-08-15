# frozen_string_literal: true
require_relative '../test_helper'
require_plugin 'obsidian_wikilinks'

class ObsidianWikilinksParserTest < Minitest::Test
  def test_parses_plain_target
    assert_equal({ page: 'My Post', heading: nil, alias: nil }, ObsidianWikilinks::Parser.parse('My Post'))
  end

  def test_parses_target_with_heading
    result = ObsidianWikilinks::Parser.parse('My Post#Section One')
    assert_equal 'My Post', result[:page]
    assert_equal 'Section One', result[:heading]
  end

  def test_parses_heading_only_link
    result = ObsidianWikilinks::Parser.parse('#Section One')
    assert_equal '', result[:page]
    assert_equal 'Section One', result[:heading]
  end

  def test_parses_pipe_alias
    placeholder = "\u{E000}"
    result = ObsidianWikilinks::Parser.parse("My Post#{placeholder}Custom Label")
    assert_equal 'My Post', result[:page]
    assert_equal 'Custom Label', result[:alias]
  end

  def test_anchor_slugifies_heading_text
    assert_equal 'section-one', ObsidianWikilinks::Parser.anchor('Section One')
  end

  def test_anchor_strips_punctuation_but_keeps_underscore
    assert_equal 'a_b-c', ObsidianWikilinks::Parser.anchor('A_B, C!')
  end

  def test_anchor_returns_nil_for_nil_heading
    assert_nil ObsidianWikilinks::Parser.anchor(nil)
  end

  def test_anchor_of_punctuation_only_heading_is_empty_string
    assert_equal '', ObsidianWikilinks::Parser.anchor('!!!')
  end

  def test_parses_combined_heading_and_alias
    placeholder = "\u{E000}"
    result = ObsidianWikilinks::Parser.parse("Page#Heading#{placeholder}Alias")
    assert_equal({ page: 'Page', heading: 'Heading', alias: 'Alias' }, result)
  end

  def test_strips_whitespace_around_page_and_alias
    placeholder = "\u{E000}"
    result = ObsidianWikilinks::Parser.parse("  My Post  #{placeholder}  Alias  ")
    assert_equal 'My Post', result[:page]
    assert_equal 'Alias', result[:alias]
  end
end

class ObsidianWikilinksRawEscaperTest < Minitest::Test
  def test_escapes_pipe_inside_wikilink
    result = ObsidianWikilinks::RawEscaper.escape('[[Target|Alias]]')
    refute_includes result, '|'
    assert_includes result, '[[Target'
    assert_includes result, 'Alias]]'
  end

  def test_leaves_pipe_untouched_inside_fenced_code_block
    md = "```\n[[Target|Alias]]\n```"
    assert_equal md, ObsidianWikilinks::RawEscaper.escape(md)
  end

  def test_leaves_pipe_untouched_inside_inline_code
    md = 'see `[[Target|Alias]]` here'
    assert_equal md, ObsidianWikilinks::RawEscaper.escape(md)
  end

  def test_escapes_wikilink_outside_code_when_mixed_with_code
    md = "`code` and [[Target|Alias]]"
    result = ObsidianWikilinks::RawEscaper.escape(md)
    assert_includes result, '`code`'
    refute_match(/\[\[Target\|Alias\]\]/, result)
  end

  def test_escapes_multiple_wikilinks_independently
    result = ObsidianWikilinks::RawEscaper.escape('[[A|B]] and [[C|D]]')
    refute_includes result, '|'
    assert_includes result, '[[A'
    assert_includes result, '[[C'
  end

  def test_wikilink_without_a_pipe_is_left_unchanged
    md = '[[Target]]'
    assert_equal md, ObsidianWikilinks::RawEscaper.escape(md)
  end

  def test_does_not_escape_pipes_outside_of_a_wikilink
    md = 'a | table | row'
    assert_equal md, ObsidianWikilinks::RawEscaper.escape(md)
  end
end

class ObsidianWikilinksPageIndexTest < Minitest::Test
  def test_finds_page_by_slug
    doc = FakePost.new(data: { 'slug' => 'my-page' }, basename: 'ignored.md')
    index = ObsidianWikilinks::PageIndex.new(FakeSite.new(pages: [doc]))
    assert_same doc, index.find('my-page')
  end

  def test_finds_page_by_basename_when_slug_absent
    doc = FakePost.new(data: {}, basename: 'my-page.md')
    index = ObsidianWikilinks::PageIndex.new(FakeSite.new(pages: [doc]))
    assert_same doc, index.find('my-page')
  end

  def test_finds_post_by_title
    doc = FakePost.new(data: { 'title' => 'My Great Post' })
    site = FakeSite.new(posts: FakePostsCollection.new([doc]))
    index = ObsidianWikilinks::PageIndex.new(site)
    assert_same doc, index.find('My Great Post')
  end

  def test_matches_underscore_and_hyphen_variants_of_the_same_slug
    doc = FakePost.new(data: { 'slug' => 'my_page' })
    index = ObsidianWikilinks::PageIndex.new(FakeSite.new(pages: [doc]))
    assert_same doc, index.find('my-page')
    assert_same doc, index.find('my_page')
  end

  def test_finds_docs_in_custom_collections
    doc = FakePost.new(data: { 'title' => 'Video Title' })
    site = FakeSite.new(collections: { 'videos' => FakeCollection.new([doc]) })
    index = ObsidianWikilinks::PageIndex.new(site)
    assert_same doc, index.find('Video Title')
  end

  def test_returns_nil_when_not_found
    index = ObsidianWikilinks::PageIndex.new(FakeSite.new)
    assert_nil index.find('nonexistent')
  end

  def test_title_match_is_case_insensitive
    doc = FakePost.new(data: { 'title' => 'My Great Post' })
    index = ObsidianWikilinks::PageIndex.new(FakeSite.new(posts: FakePostsCollection.new([doc])))
    assert_same doc, index.find('my great post')
  end

  # collect_docs concatenates pages before posts, and PageIndex only keeps the first doc per key.
  def test_a_page_wins_over_a_post_with_the_same_slug
    page = FakePost.new(data: { 'slug' => 'dup' }, url: '/from-page/')
    post = FakePost.new(data: { 'slug' => 'dup' }, url: '/from-post/')
    site = FakeSite.new(pages: [page], posts: FakePostsCollection.new([post]))
    index = ObsidianWikilinks::PageIndex.new(site)
    assert_same page, index.find('dup')
  end

  def test_falls_back_to_title_when_slug_does_not_match
    doc = FakePost.new(data: { 'slug' => 'a', 'title' => 'B Title' })
    index = ObsidianWikilinks::PageIndex.new(FakeSite.new(pages: [doc]))
    assert_same doc, index.find('B Title')
  end
end

class ObsidianWikilinksProcessorTest < Minitest::Test
  def processor_for(pages: [], posts: [])
    site = FakeSite.new(pages: pages, posts: FakePostsCollection.new(posts))
    ObsidianWikilinks::Processor.new(site)
  end

  def test_resolves_link_to_matching_page
    target = FakePost.new(data: { 'slug' => 'my-page' }, url: '/my-page/')
    html = processor_for(pages: [target]).process('see [[my-page]]')
    assert_includes html, '<a href="/my-page/">my-page</a>'
  end

  def test_uses_alias_as_link_label
    target = FakePost.new(data: { 'slug' => 'my-page' }, url: '/my-page/')
    html = processor_for(pages: [target]).process("[[my-page\u{E000}Custom Label]]")
    assert_includes html, '>Custom Label</a>'
  end

  def test_appends_heading_anchor_to_resolved_link
    target = FakePost.new(data: { 'slug' => 'my-page' }, url: '/my-page/')
    html = processor_for(pages: [target]).process('[[my-page#Section One]]')
    assert_includes html, 'href="/my-page/#section-one"'
  end

  def test_prefixes_link_with_site_baseurl
    target = FakePost.new(data: { 'slug' => 'my-page' }, url: '/my-page/')
    site = FakeSite.new(pages: [target], baseurl: '/blog')
    html = ObsidianWikilinks::Processor.new(site).process('[[my-page]]')
    assert_includes html, 'href="/blog/my-page/"'
  end

  def test_same_page_heading_only_link_becomes_local_anchor
    html = processor_for.process('[[#Section One]]')
    assert_includes html, 'href="#section-one"'
    assert_includes html, '>Section One</a>'
  end

  def test_unresolved_target_becomes_broken_link_span
    html = processor_for.process('[[Nonexistent Page]]')
    assert_includes html, 'class="wikilink-broken"'
    assert_includes html, '>Nonexistent Page</span>'
  end

  def test_embed_syntax_is_left_untouched
    target = FakePost.new(data: { 'slug' => 'my-page' }, url: '/my-page/')
    html = processor_for(pages: [target]).process('![[my-page]]')
    assert_equal '![[my-page]]', html
  end

  def test_does_not_process_wikilink_text_inside_pre_block
    html = processor_for.process('<pre>[[Nonexistent Page]]</pre>')
    assert_equal '<pre>[[Nonexistent Page]]</pre>', html
  end

  def test_html_escapes_broken_link_label
    html = processor_for.process('[[<script>alert(1)</script>]]')
    refute_includes html, '<script>alert(1)</script>'
    assert_includes html, '&lt;script&gt;'
  end

  def test_broken_link_with_an_alias_uses_the_alias_as_its_label
    placeholder = "\u{E000}"
    html = processor_for.process("[[Missing#{placeholder}My Label]]")
    assert_includes html, 'class="wikilink-broken"'
    assert_includes html, '>My Label</span>'
  end

  def test_does_not_process_wikilink_text_inside_html_comment
    html = '<!-- [[Nonexistent Page]] -->'
    assert_equal html, processor_for.process(html)
  end

  def test_processes_multiple_independent_links_in_one_string
    a = FakePost.new(data: { 'slug' => 'a' }, url: '/a/')
    b = FakePost.new(data: { 'slug' => 'b' }, url: '/b/')
    html = processor_for(pages: [a, b]).process('[[a]] and [[b]]')
    assert_includes html, 'href="/a/"'
    assert_includes html, 'href="/b/"'
  end

  def test_embed_of_an_unresolved_target_also_stays_untouched
    html = processor_for.process('![[Nonexistent]]')
    assert_equal '![[Nonexistent]]', html
  end
end
