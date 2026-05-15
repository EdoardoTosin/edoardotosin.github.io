# frozen_string_literal: true
# defang.rb - Wraps defanged URL/IP notation (hXXp/hxxp, [.], [dot]) in <span class="defanged">
# at :post_convert; skips code/pre/a/tag boundaries so only prose text is affected.

module Defang

  SKIP_RE   = /(<pre[\s>].*?<\/pre>|<code[\s>].*?<\/code>|<a[\s>].*?<\/a>|<script[\s>].*?<\/script>|<style[\s>].*?<\/style>|<!--.*?-->|<[^>]+>)/mi.freeze
  SCHEME_RE = /\bh[Xx]{2}ps?(?:\[?[:\/.]+\]?)+\S*/.freeze
  DOT_RE    = /\b[\w.\-]+(?:\[\.?\]|\[dot\])[\w.\-\[\].]*\b/.freeze
  DEFANG_RE = Regexp.union(SCHEME_RE, DOT_RE).freeze

  def self.process(html)
    # Split on block/tag boundaries; replace only in even-indexed (text) segments.
    html.split(SKIP_RE).each_with_index.map do |part, i|
      i.even? ? part.gsub(DEFANG_RE) { %(<span class="defanged">#{Regexp.last_match(0)}</span>) } : part
    end.join
  end

end

Jekyll::Hooks.register :documents, :post_convert do |doc|
  next unless doc.output_ext == '.html'
  next unless doc.content.is_a?(String) && !doc.content.empty?
  next unless doc.content.match?(/h[Xx]{2}p|\[\.\]|\[dot\]/i)

  doc.content = Defang.process(doc.content)
end
