# frozen_string_literal: true
require_relative '../test_helper'
require_plugin 'topic_colors'

class TopicColorsParseHexTest < Minitest::Test
  def test_parses_six_digit_hex_with_hash
    assert_equal [255, 255, 255], TopicColors.parse_hex('#ffffff')
  end

  def test_parses_six_digit_hex_without_hash
    assert_equal [100, 116, 139], TopicColors.parse_hex('64748b')
  end

  def test_expands_three_digit_shorthand
    assert_equal [255, 255, 255], TopicColors.parse_hex('#fff')
  end

  def test_expands_three_digit_shorthand_with_distinct_channels
    assert_equal [17, 34, 51], TopicColors.parse_hex('#123')
  end

  def test_uppercase_hex_letters_parse_the_same_as_lowercase
    assert_equal TopicColors.parse_hex('#abcdef'), TopicColors.parse_hex('#ABCDEF')
  end

  # Not a supported input, but must degrade predictably (right-padded with zeros) rather than raise.
  def test_short_malformed_hex_is_zero_padded_on_the_right
    assert_equal [171, 0, 0], TopicColors.parse_hex('AB')
  end
end

class TopicColorsLuminanceContrastTest < Minitest::Test
  def test_white_has_luminance_of_one
    assert_in_delta 1.0, TopicColors.luminance(255, 255, 255), 0.0001
  end

  def test_black_has_luminance_of_zero
    assert_in_delta 0.0, TopicColors.luminance(0, 0, 0), 0.0001
  end

  def test_black_on_white_has_maximum_contrast_of_21
    lum_black = TopicColors.luminance(0, 0, 0)
    lum_white = TopicColors.luminance(255, 255, 255)
    assert_in_delta 21.0, TopicColors.contrast(lum_black, lum_white), 0.01
  end

  def test_contrast_is_symmetric_regardless_of_argument_order
    a = TopicColors.luminance(100, 116, 139)
    b = TopicColors.luminance(255, 255, 255)
    assert_in_delta TopicColors.contrast(a, b), TopicColors.contrast(b, a), 0.0001
  end

  def test_identical_colors_have_contrast_of_one
    lum = TopicColors.luminance(120, 120, 120)
    assert_in_delta 1.0, TopicColors.contrast(lum, lum), 0.0001
  end

  def test_to_linear_below_the_srgb_gamma_threshold_uses_the_linear_divisor
    assert_in_delta 10 / 255.0 / 12.92, TopicColors.to_linear(10), 0.0001
  end

  def test_to_linear_above_the_srgb_gamma_threshold_uses_the_power_curve
    s = 11 / 255.0
    expected = ((s + 0.055) / 1.055)**2.4
    assert_in_delta expected, TopicColors.to_linear(11), 0.0000001
  end
end

class TopicColorsHslRoundTripTest < Minitest::Test
  def test_rgb_to_hsl_to_rgb_round_trips
    colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [100, 116, 139], [255, 255, 255], [0, 0, 0],
              [128, 128, 128], [200, 100, 50], [50, 200, 100], [100, 50, 200]]
    colors.each do |r, g, b|
      h, s, l = TopicColors.to_hsl(r, g, b)
      rr, gg, bb = TopicColors.hsl_to_rgb(h, s, l)
      assert_in_delta r, rr, 1, "red channel round-trip for [#{r},#{g},#{b}]"
      assert_in_delta g, gg, 1, "green channel round-trip for [#{r},#{g},#{b}]"
      assert_in_delta b, bb, 1, "blue channel round-trip for [#{r},#{g},#{b}]"
    end
  end

  def test_to_hex_formats_lowercase_zero_padded
    assert_equal '#0a0b0c', TopicColors.to_hex(10, 11, 12)
  end
end

class TopicColorsAdjustForContrastTest < Minitest::Test
  # Darkening a light color on a light background must still reach WCAG AA (4.5:1).
  def test_darkens_light_color_to_meet_target_contrast_on_light_background
    bg_lum = TopicColors.luminance(255, 255, 255)
    hex = TopicColors.adjust_for_contrast(200, 200, 50, bg_lum, target: 4.5, dir: :darken)
    r, g, b = TopicColors.parse_hex(hex)
    achieved = TopicColors.contrast(TopicColors.luminance(r, g, b), bg_lum)
    assert_operator achieved, :>=, 4.49
  end

  # Lightening a dark color against a dark background must reach WCAG AA (4.5:1).
  def test_lightens_dark_color_to_meet_target_contrast_on_dark_background
    bg_lum = TopicColors.luminance(28, 33, 50)
    hex = TopicColors.adjust_for_contrast(20, 20, 60, bg_lum, target: 4.5, dir: :lighten)
    r, g, b = TopicColors.parse_hex(hex)
    achieved = TopicColors.contrast(TopicColors.luminance(r, g, b), bg_lum)
    assert_operator achieved, :>=, 4.49
  end

  def test_saturates_without_raising_when_target_is_unreachable
    bg_lum = TopicColors.luminance(128, 128, 128)
    hex = TopicColors.adjust_for_contrast(128, 128, 128, bg_lum, target: 21, dir: :darken)
    assert_match(/\A#[0-9a-f]{6}\z/, hex)
  end
end

class TopicColorsDeriveTest < Minitest::Test
  def test_derive_returns_all_four_expected_keys
    result = TopicColors.derive('#64748b')
    assert_equal %w[subtle text_light text_dark text_on_solid], result.keys
  end

  def test_subtle_is_an_rgba_string_using_source_channels
    result = TopicColors.derive('#64748b')
    assert_equal 'rgba(100,116,139,.12)', result['subtle']
  end

  def test_text_light_meets_aa_contrast_against_white_card_background
    result = TopicColors.derive('#64748b')
    r, g, b = TopicColors.parse_hex(result['text_light'])
    bg_lum = TopicColors.subtle_lum(*TopicColors.parse_hex('#64748b'), TopicColors::BG_LIGHT_RGB)
    achieved = TopicColors.contrast(TopicColors.luminance(r, g, b), bg_lum)
    assert_operator achieved, :>=, 4.49
  end

  def test_text_dark_meets_aa_contrast_against_dark_card_background
    result = TopicColors.derive('#64748b')
    r, g, b = TopicColors.parse_hex(result['text_dark'])
    bg_lum = TopicColors.subtle_lum(*TopicColors.parse_hex('#64748b'), TopicColors::BG_DARK_RGB)
    achieved = TopicColors.contrast(TopicColors.luminance(r, g, b), bg_lum)
    assert_operator achieved, :>=, 4.49
  end

  def test_text_on_solid_picks_white_for_a_dark_source_color
    result = TopicColors.derive('#1c2132')
    assert_equal '#ffffff', result['text_on_solid']
  end

  def test_text_on_solid_picks_dark_for_a_light_source_color
    result = TopicColors.derive('#f1f5f9')
    assert_equal '#0f172a', result['text_on_solid']
  end

  def test_derive_on_pure_black_does_not_raise_and_meets_contrast
    result = TopicColors.derive('#000000')
    r, g, b = TopicColors.parse_hex(result['text_dark'])
    bg_lum = TopicColors.subtle_lum(0, 0, 0, TopicColors::BG_DARK_RGB)
    achieved = TopicColors.contrast(TopicColors.luminance(r, g, b), bg_lum)
    assert_operator achieved, :>=, 4.49
  end

  def test_derive_on_pure_white_does_not_raise_and_meets_contrast
    result = TopicColors.derive('#ffffff')
    r, g, b = TopicColors.parse_hex(result['text_light'])
    bg_lum = TopicColors.subtle_lum(255, 255, 255, TopicColors::BG_LIGHT_RGB)
    achieved = TopicColors.contrast(TopicColors.luminance(r, g, b), bg_lum)
    assert_operator achieved, :>=, 4.49
  end

  def test_derive_is_deterministic_for_the_same_input
    assert_equal TopicColors.derive('#64748b'), TopicColors.derive('#64748b')
  end
end
