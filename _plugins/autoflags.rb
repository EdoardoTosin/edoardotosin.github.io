# Automatically sets math: true / mermaid: true when the post content
# contains the corresponding syntax, so authors don't need to set these
# flags manually.
#
# Rules:
#   math:    triggered by $$ (display math) or \[ or \( delimiters
#   mermaid: triggered by ```mermaid fenced block
#
# An explicit `math: false` or `mermaid: false` in front matter opts out.
# An explicit `math: true` / `mermaid: true` is preserved as-is.
# The flag is only auto-set when the key is absent from front matter (nil).

Jekyll::Hooks.register :posts, :pre_render do |post|
  content = post.content.to_s

  if post.data['math'].nil?
    post.data['math'] = content.match?(/\$\$|\\\[|\\\(/)
  end

  if post.data['mermaid'].nil?
    post.data['mermaid'] = content.include?('```mermaid')
  end
end
