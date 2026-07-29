module ReadingTimeFilter
  include Liquid::StandardFilters

  DEFAULT_WPM = 200

  def self.cache
    @cache ||= {}
  end

  def reading_time(input)
    return "" if input.nil?

    cache_key = input.to_s
    cached = ReadingTimeFilter.cache[cache_key]
    return cached if cached

    config = site_config

    wpm = (config["words_per_minute"] || DEFAULT_WPM).to_i
    wpm = DEFAULT_WPM if wpm <= 0
    second_label   = config["second_label"]   || "sec"
    minute_label   = config["minute_label"]   || "min"
    read_text      = config["read_text"]      || "read"

    text  = plain_text(input)
    words = text.split.size

    result =
      if words == 0
        "0 #{second_label} #{read_text}"
      else
        minutes = words.to_f / wpm

        if minutes < 1
          seconds = (minutes * 60).round
          "#{seconds} #{second_label} #{read_text}"
        else
          m = minutes.ceil
          "#{m} #{minute_label} #{read_text}"
        end
      end

    ReadingTimeFilter.cache[cache_key] = result
  end

  private

  def site_config
    @context.registers[:site].config["reading_time"] || {}
  end

  def plain_text(input)
    text = input.to_s
    text = text.gsub(/```.*?```/m, "")
    text = text.gsub(/<pre[\s\S]*?<\/pre>/i, "")
    text = text.gsub(/<code[\s\S]*?<\/code>/i, "")
    strip_html(text)
  end
end

Liquid::Template.register_filter(ReadingTimeFilter)
