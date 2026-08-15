# frozen_string_literal: true
require_relative '../test_helper'
require_plugin 'reading_time_filter'

FakeRTSite = Struct.new(:config)
FakeRTContext = Struct.new(:registers)

class ReadingTimeHost
  include ReadingTimeFilter

  def initialize(config = {})
    @context = FakeRTContext.new({ site: FakeRTSite.new({ 'reading_time' => config }) })
  end
end

class ReadingTimeFilterTest < Minitest::Test
  # The module memoizes by input text alone, so tests must use unique text or hit a stale cache.
  def unique_text(word_count, seed)
    (["word#{seed}"] * word_count).join(' ')
  end

  def test_empty_input_returns_empty_string
    assert_equal '', ReadingTimeHost.new.reading_time(nil)
  end

  def test_zero_words_reports_zero_seconds
    host = ReadingTimeHost.new
    result = host.reading_time('')
    assert_match(/\A0 sec read\z/, result)
  end

  def test_short_text_is_reported_in_seconds
    host = ReadingTimeHost.new
    text = unique_text(20, 'a1')
    result = host.reading_time(text)
    assert_match(/\A\d+ sec read\z/, result)
  end

  def test_long_text_is_reported_in_minutes_rounded_up
    host = ReadingTimeHost.new
    text = unique_text(450, 'a2') # 450 words / 200 wpm = 2.25 -> ceil to 3
    assert_equal '3 min read', host.reading_time(text)
  end

  def test_respects_custom_words_per_minute
    host = ReadingTimeHost.new({ 'words_per_minute' => 100 })
    text = unique_text(250, 'a3') # 250 / 100 = 2.5 -> ceil to 3
    assert_equal '3 min read', host.reading_time(text)
  end

  # A misconfigured words_per_minute of 0 must fall back to the default, not divide by zero.
  def test_zero_wpm_falls_back_to_default
    host = ReadingTimeHost.new({ 'words_per_minute' => 0 })
    text = unique_text(450, 'a4')
    assert_equal '3 min read', host.reading_time(text)
  end

  def test_negative_wpm_falls_back_to_default
    host = ReadingTimeHost.new({ 'words_per_minute' => -10 })
    text = unique_text(450, 'a5')
    assert_equal '3 min read', host.reading_time(text)
  end

  def test_custom_labels_are_used
    host = ReadingTimeHost.new({ 'minute_label' => 'minuti', 'read_text' => 'lettura' })
    text = unique_text(450, 'a6')
    assert_equal '3 minuti lettura', host.reading_time(text)
  end

  def test_strips_html_tags_before_counting_words
    host = ReadingTimeHost.new
    text = "<p>#{(['word'] * 20).join(' ')}</p> a7marker"
    result = host.reading_time(text)
    assert_match(/\A\d+ sec read\z/, result)
  end

  def test_excludes_fenced_code_block_content_from_word_count
    host = ReadingTimeHost.new
    prose = (['word'] * 10).join(' ')
    code = (['x'] * 1000).join(' ')
    text = "#{prose} a8marker ```\n#{code}\n``` "
    result = host.reading_time(text)
    assert_match(/\A\d+ sec read\z/, result)
  end

  def test_excludes_pre_tag_content_from_word_count
    host = ReadingTimeHost.new
    prose = (['word'] * 10).join(' ')
    code = (['x'] * 1000).join(' ')
    text = "#{prose} a9marker <pre>#{code}</pre>"
    result = host.reading_time(text)
    assert_match(/\A\d+ sec read\z/, result)
  end

  def test_exactly_one_minute_of_words_rounds_up_to_one_minute
    host = ReadingTimeHost.new
    assert_equal '1 min read', host.reading_time((['b1'] * 200).join(' '))
  end

  # One word short of a minute still renders in seconds, even though rounding lands on 60.
  def test_one_word_short_of_a_minute_reports_sixty_seconds_not_one_minute
    host = ReadingTimeHost.new
    assert_equal '60 sec read', host.reading_time((['b2'] * 199).join(' '))
  end

  def test_missing_reading_time_config_key_falls_back_to_defaults
    host = ReadingTimeHost.new({})
    assert_equal '1 min read', host.reading_time((['b3'] * 200).join(' '))
  end

  def test_non_string_input_is_coerced_via_to_s
    host = ReadingTimeHost.new
    assert_equal '0 sec read', host.reading_time(12_345)
  end

  def test_custom_second_label_is_used
    host = ReadingTimeHost.new({ 'second_label' => 'secondi' })
    assert_equal '0 secondi read', host.reading_time('c1solitaryword')
  end
end
