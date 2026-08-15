# frozen_string_literal: true
require 'fileutils'
require 'yaml'
require_relative '../test_helper'
require_plugin 'topic_autofill'

class TopicAutofillTest < Minitest::Test
  def setup
    @tmpdir = Dir.mktmpdir
    FileUtils.mkdir_p(File.join(@tmpdir, '_data'))
  end

  def teardown
    FileUtils.remove_entry(@tmpdir)
  end

  def topics_yml_path = File.join(@tmpdir, '_data', 'topics.yml')

  def site_with(posts, data: {})
    FakeSite.new(source: @tmpdir, data: data, posts: FakePostsCollection.new(posts))
  end

  def trigger(site) = Jekyll::Hooks.trigger(:site, :post_read, site)

  def test_registers_a_new_topic_used_by_a_post
    post = FakePost.new(data: { 'topic' => 'Linux', 'date' => Time.now - 3600 }, relative_path: '_posts/a.md')
    site = site_with([post])
    trigger site
    names = site.data['topics'].map { |t| t['name'] }
    assert_includes names, 'linux'
  end

  def test_does_not_duplicate_an_already_known_topic
    existing = [{ 'name' => 'linux', 'color' => '#111111' }]
    post = FakePost.new(data: { 'topic' => 'Linux', 'date' => Time.now - 3600 })
    site = site_with([post], data: { 'topics' => existing })
    trigger site
    linux_entries = site.data['topics'].select { |t| t['name'] == 'linux' }
    assert_equal 1, linux_entries.length
    assert_equal '#111111', linux_entries.first['color']
  end

  def test_new_topic_gets_the_neutral_fallback_color
    post = FakePost.new(data: { 'topic' => 'Rust', 'date' => Time.now - 3600 })
    site = site_with([post])
    trigger site
    entry = site.data['topics'].find { |t| t['name'] == 'rust' }
    assert_equal '#64748b', entry['color']
  end

  def test_skips_posts_with_no_topic
    post = FakePost.new(data: { 'date' => Time.now - 3600 })
    site = site_with([post])
    trigger site
    assert_nil site.data['topics']
  end

  # Future posts (visible locally via `future: true`) must not write to topics.yml.
  def test_skips_future_dated_posts
    post = FakePost.new(data: { 'topic' => 'Quantum', 'date' => Time.now + (24 * 3600) })
    site = site_with([post])
    trigger site
    assert_nil site.data['topics']
  end

  # A non-string topic (e.g. a YAML list typo) must warn and be skipped, not crash the build.
  def test_non_string_topic_is_skipped_with_a_warning
    post = FakePost.new(data: { 'topic' => %w[Linux Security], 'date' => Time.now - 3600 },
                         relative_path: '_posts/bad.md')
    site = site_with([post])
    trigger site
    assert_nil site.data['topics']
  end

  def test_blank_string_topic_is_skipped
    post = FakePost.new(data: { 'topic' => '   ', 'date' => Time.now - 3600 })
    site = site_with([post])
    trigger site
    assert_nil site.data['topics']
  end

  def test_writes_topics_yml_to_disk
    post = FakePost.new(data: { 'topic' => 'Linux', 'date' => Time.now - 3600 })
    site = site_with([post])
    trigger site
    assert_path_exists topics_yml_path
    assert_includes File.read(topics_yml_path), 'name: linux'
  end

  # Values with YAML special characters must be quoted, or topics.yml fails to parse.
  def test_quotes_topic_names_containing_yaml_special_characters
    post = FakePost.new(data: { 'topic' => 'C++: Basics', 'date' => Time.now - 3600 })
    site = site_with([post])
    trigger site
    content = File.read(topics_yml_path)
    assert_includes content, "name: 'c++: basics'"
    reparsed = YAML.safe_load(content)
    assert_equal 'c++: basics', reparsed.first['name']
  end

  def test_multiple_new_topics_are_written_in_sorted_order
    posts = [
      FakePost.new(data: { 'topic' => 'Zebra', 'date' => Time.now - 3600 }),
      FakePost.new(data: { 'topic' => 'Alpha', 'date' => Time.now - 3600 }),
    ]
    site = site_with(posts)
    trigger site
    assert_equal %w[alpha zebra], site.data['topics'].map { |t| t['name'] }
  end

  def test_multiple_posts_sharing_a_topic_register_it_only_once
    posts = [
      FakePost.new(data: { 'topic' => 'Linux', 'date' => Time.now - 3600 }),
      FakePost.new(data: { 'topic' => 'linux', 'date' => Time.now - 3600 }),
    ]
    site = site_with(posts)
    trigger site
    assert_equal 1, site.data['topics'].count { |t| t['name'] == 'linux' }
  end

  def test_topic_is_stripped_and_downcased
    post = FakePost.new(data: { 'topic' => '  Linux  ', 'date' => Time.now - 3600 })
    site = site_with([post])
    trigger site
    assert_equal ['linux'], site.data['topics'].map { |t| t['name'] }
  end

  def test_malformed_existing_entries_are_dropped_rather_than_crashing
    existing = [{ 'name' => 'linux', 'color' => '#111' }, 'not-a-hash', { 'color' => '#222' }, nil]
    post = FakePost.new(data: { 'topic' => 'Rust', 'date' => Time.now - 3600 })
    site = site_with([post], data: { 'topics' => existing })
    trigger site
    names = site.data['topics'].map { |t| t['name'] }
    assert_equal %w[linux rust], names
  end

  def test_does_not_write_topics_yml_when_nothing_new
    existing = [{ 'name' => 'linux', 'color' => '#111111' }]
    post = FakePost.new(data: { 'topic' => 'Linux', 'date' => Time.now - 3600 })
    site = site_with([post], data: { 'topics' => existing })
    trigger site
    refute_path_exists topics_yml_path
  end

  # Current behavior, not an endorsement: quote_if_needed never escapes an embedded single quote.
  def test_topic_needing_quotes_that_also_contains_a_quote_produces_invalid_yaml
    post = FakePost.new(data: { 'topic' => "she said: 'hi'", 'date' => Time.now - 3600 })
    site = site_with([post])
    trigger site
    assert_raises(Psych::SyntaxError) { YAML.safe_load(File.read(topics_yml_path)) }
  end
end
