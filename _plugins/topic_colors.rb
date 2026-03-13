# topic_colors.rb - WCAG contrast derivation for topic badge colors. See docs/STYLES.md.

module TopicColors

  # Color parsing
  def self.parse_hex(hex)
    h = hex.strip.delete('#')
    h = h.chars.map { |c| c * 2 }.join if h.length == 3
    h = h[0, 6].ljust(6, '0')
    [h[0,2], h[2,2], h[4,2]].map { |s| s.to_i(16) }
  end

  def self.to_linear(c)
    s = c / 255.0
    s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055)**2.4
  end

  def self.luminance(r, g, b)
    0.2126 * to_linear(r) + 0.7152 * to_linear(g) + 0.0722 * to_linear(b)
  end

  def self.contrast(l1, l2)
    hi, lo = [l1, l2].minmax.reverse
    (hi + 0.05) / (lo + 0.05)
  end

  # RGB ↔ HSL
  def self.to_hsl(r, g, b)
    r /= 255.0; g /= 255.0; b /= 255.0
    max = [r, g, b].max; min = [r, g, b].min
    l = (max + min) / 2.0
    return [0.0, 0.0, l] if max == min

    d = max - min
    s = l > 0.5 ? d / (2.0 - max - min) : d / (max + min)
    h = case max
        when r then ((g - b) / d + (g < b ? 6.0 : 0.0)) / 6.0
        when g then ((b - r) / d + 2.0) / 6.0
        else        ((r - g) / d + 4.0) / 6.0
        end
    [h * 360.0, s, l]
  end

  def self.hsl_to_rgb(h, s, l)
    h /= 360.0
    if s == 0
      v = (l * 255).round.clamp(0, 255)
      return [v, v, v]
    end
    q = l < 0.5 ? l * (1.0 + s) : l + s - l * s
    p = 2.0 * l - q
    [h + 1.0/3, h, h - 1.0/3].map do |t|
      t += 1.0 if t < 0.0; t -= 1.0 if t > 1.0
      val = if    t < 1.0/6 then p + (q - p) * 6.0 * t
              elsif t < 0.5   then q
              elsif t < 2.0/3 then p + (q - p) * (2.0/3 - t) * 6.0
              else p
              end
      (val * 255).round.clamp(0, 255)
    end
  end

  def self.to_hex(r, g, b) = '#%02x%02x%02x' % [r, g, b]

  # Steps HSL lightness until contrast >= target against bg_lum (saturates at 0/1)
  def self.adjust_for_contrast(r, g, b, bg_lum, target: 4.5, dir: :darken)
    h, s, l = to_hsl(r, g, b)
    step = dir == :darken ? -0.005 : 0.005

    120.times do
      rr, gg, bb = hsl_to_rgb(h, s, l)
      return to_hex(rr, gg, bb) if contrast(luminance(rr, gg, bb), bg_lum) >= target
      l = (l + step).clamp(0.0, 1.0)
      break if l <= 0.0 || l >= 1.0
    end

    rr, gg, bb = hsl_to_rgb(h, s, l)
    to_hex(rr, gg, bb)
  end

  # Luminance of the dark-mode card background (#1c2132)
  BG_DARK_LUM = begin
    r, g, b = parse_hex('#1c2132')
    luminance(r, g, b)
  end

  # Returns {subtle, text_light, text_dark} derived from a single hex color
  def self.derive(color_hex)
    r, g, b = parse_hex(color_hex)

    {
      'subtle'     => "rgba(#{r},#{g},#{b},.12)",
      'text_light' => adjust_for_contrast(r, g, b, 1.0,          target: 4.5, dir: :darken),
      'text_dark'  => adjust_for_contrast(r, g, b, BG_DARK_LUM,  target: 4.5, dir: :lighten)
    }
  end

end

Jekyll::Hooks.register :site, :pre_render do |site|
  topics = site.data['topics']
  next unless topics.is_a?(Array)

  topics.each do |t|
    next unless t.is_a?(Hash) && t['name'] && t['color']
    derived = TopicColors.derive(t['color'])
    derived.each { |k, v| t[k] ||= v } # only fill if not already set manually
  end
end
