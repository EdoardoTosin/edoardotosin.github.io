module ReadingTimeFilter
  include Liquid::StandardFilters

  DEFAULT_WPM = 200

  def reading_time(input)
    return "" if input.nil?

    config = site_config

    wpm = (config["words_per_minute"] || DEFAULT_WPM).to_i
    second_label   = config["second_label"]   || "sec"
    minute_label   = config["minute_label"]   || "min"
    read_text      = config["read_text"]      || "read"

    text  = plain_text(input)
    words = text.split.size

    return "0 #{second_label} #{read_text}" if words == 0

    minutes = words.to_f / wpm

    if minutes < 1
      seconds = (minutes * 60).round
      "#{seconds} #{second_label} #{read_text}"
    else
      m = minutes.ceil
      "#{m} #{minute_label} #{read_text}"
    end
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
