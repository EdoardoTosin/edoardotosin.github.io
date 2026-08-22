# frozen_string_literal: true
require_relative '../test_helper'
require_plugin 'defang'

class DefangTest < Minitest::Test
  def process(html) = Defang.process(html)

  def test_wraps_legacy_hxxp_scheme
    assert_equal '<span class="defanged" translate="no">hxxp://evil[.]com</span>', process('hxxp://evil[.]com')
  end

  def test_wraps_ietf_safe_ioc_scheme
    assert_equal '<span class="defanged" translate="no">[hxxp]://evil.com</span>', process('[hxxp]://evil.com')
  end

  def test_wraps_bracketed_dot_notation
    assert_equal '<span class="defanged" translate="no">evil[.]com</span>', process('evil[.]com')
  end

  def test_wraps_multi_label_dot_notation
    assert_equal '<span class="defanged" translate="no">mail[.]evil[.]com</span>', process('mail[.]evil[.]com')
  end

  def test_wraps_at_sign_email_notation
    assert_equal '<span class="defanged" translate="no">user[@]evil[.]com</span>', process('user[@]evil[.]com')
  end

  def test_wraps_ipv6_colon_notation
    result = process('2001[:]0db8[:]0000[:]0000[:]0000[:]ff00[:]0042[:]8329')
    assert_includes result, '<span class="defanged" translate="no">'
    assert_includes result, '2001[:]0db8'
  end

  def test_does_not_wrap_plain_prose
    assert_equal 'a normal sentence with no IOCs', process('a normal sentence with no IOCs')
  end

  def test_does_not_wrap_inside_pre_block
    html = '<pre>hxxp://evil[.]com</pre>'
    assert_equal html, process(html)
  end

  def test_does_not_wrap_inside_code_block
    html = '<code>evil[.]com</code>'
    assert_equal html, process(html)
  end

  def test_does_not_wrap_inside_anchor_href
    html = '<a href="https://evil[.]com">evil[.]com</a>'
    result = process(html)
    refute_includes result, 'defanged">evil[.]com</span></a>'
  end

  def test_wraps_prose_around_untouched_tags
    html = '<p>see hxxp://evil[.]com here</p>'
    result = process(html)
    assert_includes result, '<p>see <span class="defanged" translate="no">hxxp://evil[.]com</span> here</p>'
  end

  def test_strips_trailing_sentence_punctuation_from_scheme_match
    result = process('visit hxxp://evil[.]com.')
    assert_includes result, '<span class="defanged" translate="no">hxxp://evil[.]com</span>.'
  end

  def test_empty_brackets_do_not_crash_or_falsely_match
    assert_equal 'a[]b', process('a[]b')
  end

  def test_leaves_normal_domain_and_ip_untouched
    assert_equal 'visit example.com or 10.0.0.1', process('visit example.com or 10.0.0.1')
  end

  def test_wraps_mixed_case_hxxp
    assert_equal '<span class="defanged" translate="no">hXXp://x.com</span>', process('hXXp://x.com')
  end

  # LEGACY_SCHEME requires a literal lowercase h/p/s; only the X's have a case-insensitive class.
  def test_leading_uppercase_h_is_not_recognized_as_legacy_scheme
    assert_equal 'HXXP://x.com', process('HXXP://x.com')
  end

  def test_wraps_hxxps_variant
    assert_equal '<span class="defanged" translate="no">hxxps://evil.com</span>', process('hxxps://evil.com')
  end

  def test_wraps_multiple_independent_iocs_in_one_string
    result = process('a[.]com and b[.]org')
    assert_equal '<span class="defanged" translate="no">a[.]com</span> and <span class="defanged" translate="no">b[.]org</span>', result
  end

  def test_wraps_bracketed_dot_ipv4
    assert_equal '<span class="defanged" translate="no">1[.]2[.]3[.]4</span>', process('1[.]2[.]3[.]4')
  end

  def test_wraps_ipv6_with_zone_id_and_cidr_suffix
    result = process('fe80[:]0[:]0[:]0[:]0[:]0[:]0[:]1%eth0')
    assert_equal '<span class="defanged" translate="no">fe80[:]0[:]0[:]0[:]0[:]0[:]0[:]1%eth0</span>', result
    result = process('2001[:]db8[:]0[:]0[:]0[:]0[:]0[:]1/64')
    assert_equal '<span class="defanged" translate="no">2001[:]db8[:]0[:]0[:]0[:]0[:]0[:]1/64</span>', result
  end

  def test_strips_trailing_question_mark
    assert_equal '<span class="defanged" translate="no">hxxp://evil[.]com</span>?', process('hxxp://evil[.]com?')
  end

  def test_does_not_strip_closing_paren_it_did_not_open
    result = process('(see hxxp://evil[.]com)')
    assert_equal '(see <span class="defanged" translate="no">hxxp://evil[.]com</span>)', result
  end

  def test_safe_ioc_scheme_accepts_arbitrary_scheme_name
    assert_equal '<span class="defanged" translate="no">[ftp]://evil[.]com</span>', process('[ftp]://evil[.]com')
  end

  def test_does_not_wrap_inside_script_or_style_blocks
    assert_equal '<script>var x = "evil[.]com"</script>', process('<script>var x = "evil[.]com"</script>')
    assert_equal '<style>/* evil[.]com */</style>', process('<style>/* evil[.]com */</style>')
  end

  def test_does_not_wrap_inside_html_comment
    html = '<!-- evil[.]com -->'
    assert_equal html, process(html)
  end

  # SKIP_RE skips the <span> wrapper tags but not their inner text, so a second pass re-wraps them.
  def test_running_twice_double_wraps_rather_than_staying_idempotent
    once = process('evil[.]com')
    twice = process(once)
    refute_equal once, twice
    assert_includes twice, 'defanged" translate="no"><span class="defanged" translate="no">'
  end
end
