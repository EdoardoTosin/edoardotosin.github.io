# frozen_string_literal: true
# defang.rb - Wraps Safe-IOC notation (draft-grimminck-safe-ioc-sharing: [scheme]:, [.], [@],
# [:] for IPv6, plus legacy hxxp/hxxps) in <span class="defanged"> at :post_convert; skips
# code/pre/a/tag boundaries so only prose text is affected.

module Defang

  SKIP_RE = /(<pre[\s>].*?<\/pre>|<code[\s>].*?<\/code>|<a[\s>].*?<\/a>|<script[\s>].*?<\/script>|<style[\s>].*?<\/style>|<!--.*?-->|<[^>]+>)/mi.freeze

  SAFE_SCHEME   = /\[[A-Za-z][A-Za-z0-9+\-.]*\]/.freeze
  LEGACY_SCHEME = /\bh[Xx]{2}ps?/.freeze
  SCHEME_RE = /(?:#{SAFE_SCHEME}|#{LEGACY_SCHEME}):(?:\/\/)?\S*(?<![.,;:!?)])/.freeze

  DOT_RE = /\b[\w\-]+(?:\[\.\][\w\-]+)+\b/.freeze

  AT_RE = /\b[\w.%+\-]+\[@\][\w\-]+(?:\[\.\][\w\-]+)+\b/.freeze

  HEX_GROUP = /[0-9A-Fa-f]{1,4}/.freeze
  V4_IN_V6  = /\d{1,3}(?:\[\.\]\d{1,3}){3}/.freeze
  V6_SEGMENT = /(?:#{HEX_GROUP}|#{V4_IN_V6})/.freeze
  IPV6_RE = /\[?#{V6_SEGMENT}?(?:\[:\]#{V6_SEGMENT}?){2,}\]?(?:%(?:25)?[\w.\-]+)?(?:\/\d{1,3})?/.freeze

  DEFANG_RE = Regexp.union(SCHEME_RE, AT_RE, IPV6_RE, DOT_RE).freeze

  def self.process(html)
    # Split on block/tag boundaries; replace only in even-indexed (text) segments.
    html.split(SKIP_RE).each_with_index.map do |part, i|
      i.even? ? part.gsub(DEFANG_RE) { %(<span class="defanged" translate="no">#{Regexp.last_match(0)}</span>) } : part
    end.join
  end

end

Jekyll::Hooks.register :documents, :post_convert do |doc|
  next unless doc.output_ext == '.html'
  next unless doc.content.is_a?(String) && !doc.content.empty?
  next unless doc.content.match?(/h[Xx]{2}p|\[[A-Za-z][A-Za-z0-9+\-.]*\]:|\[\.\]|\[@\]|\[:\]/)

  doc.content = Defang.process(doc.content)
end
