# frozen_string_literal: true

#
# Bulma Alerts - Jekyll Plugin
#
# Converts GitHub-style Markdown alerts to Bulma notifications.
#
# Syntax:
#   > [!NOTE]
#   > Content here...
#

module Jekyll
  module BulmaAlerts
    HOOK_PRIORITY = 10

    DEFAULTS = {
      emoji: true,
      monochrome: false
    }.freeze

    ALERT_TYPES = {
      'NOTE'      => { bulma_class: 'is-info', emoji: 'ℹ️', title: 'Note' },
      'TIP'       => { bulma_class: 'is-success', emoji: '💡', title: 'Tip' },
      'IMPORTANT' => { bulma_class: 'is-warning', emoji: '📌', title: 'Important' },
      'WARNING'   => { bulma_class: 'is-warning', emoji: '⚠️', title: 'Warning' },
      'CAUTION'   => { bulma_class: 'is-danger', emoji: '⛔', title: 'Caution' }
    }.freeze

    TITLE_STYLE = 'display:flex;align-items:center;font-weight:600;margin-bottom:0.5rem'.freeze
    EMOJI_STYLE = 'font-size:1em;line-height:1;display:inline-flex;align-items:center;margin-right:0.5em;filter: drop-shadow(0.05em 0.05em 0.1em #000);'.freeze

    MODERN_ALERT_RE = /^\s*>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/i.freeze
    LEGACY_ALERT_RE = /^\s*>\s*\*\*(Note|Tip|Important|Warning|Caution)\*\*\s*$/i.freeze
    BLOCKQUOTE_RE   = /^\s*>/.freeze
    CONTENT_RE      = /^\s*>\s?(.*)$/m.freeze

    class Converter
      def initialize(site)
        @site = site
        @markdown = site.find_converter_instance(Jekyll::Converters::Markdown) rescue nil

        cfg = site.config.fetch('bulma_alerts', {})
        @emoji_enabled = cfg.fetch('emoji', DEFAULTS[:emoji])
        @monochrome    = cfg.fetch('monochrome', DEFAULTS[:monochrome])
      end

      def convert(content)
        return content if content.nil? || content.empty?

        lines = content.lines
        result = []
        i = 0

        while i < lines.length
          alert = detect_alert(lines[i])

          if alert
            alert_lines, consumed = collect_lines(lines, i)
            html = build_notification(alert, alert_lines)

            result << "\n" unless result.empty? || result.last.strip.empty?
            result << html << "\n"
            i += consumed
          else
            result << lines[i]
            i += 1
          end
        end

        result.join
      end

      private

      def detect_alert(line)
        if (m = line.match(MODERN_ALERT_RE))
          { config: ALERT_TYPES[m[1].upcase], legacy: false }
        elsif (m = line.match(LEGACY_ALERT_RE))
          { config: ALERT_TYPES[m[1].upcase], legacy: true }
        end
      end

      def alert_marker?(line)
        line.match?(MODERN_ALERT_RE) || line.match?(LEGACY_ALERT_RE)
      end

      def collect_lines(lines, start)
        collected = [lines[start]]
        i = start + 1

        while i < lines.length
          line = lines[i]

          if line.match?(BLOCKQUOTE_RE)
            break if alert_marker?(line)
            collected << line
            i += 1
          elsif line.strip.empty?
            next_idx = (i + 1...lines.length).find { |j| !lines[j].strip.empty? }
            break if next_idx.nil? || !lines[next_idx].match?(BLOCKQUOTE_RE) || alert_marker?(lines[next_idx])
            collected << line
            i += 1
          else
            break
          end
        end

        [collected, collected.length]
      end

      def build_notification(alert, lines)
        cfg = alert[:config]
        body = extract_body(lines, alert[:legacy])
        body_html = @markdown ? @markdown.convert(body).strip : "<p>#{body}</p>"

        emoji = render_emoji(cfg)

        <<~HTML
          <div class="notification #{cfg[:bulma_class]}" role="alert">
            <p class="notification-title" style="#{TITLE_STYLE}">
              #{emoji}<strong>#{cfg[:title]}</strong>
            </p>
            #{body_html}
          </div>
        HTML
      end

      def extract_body(lines, legacy)
        start = legacy ? 0 : 1

        (lines[start..] || []).map do |l|
          m = CONTENT_RE.match(l)
          m ? m[1] : ''
        end.join("\n").strip
      end

      def render_emoji(cfg)
        return '' unless @emoji_enabled

        style = EMOJI_STYLE.dup
        style << ';filter:grayscale(1)' if @monochrome

        %(<span aria-hidden="true" style="#{style}">#{cfg[:emoji]}</span>)
      end
    end

    def self.process(content, site)
      Converter.new(site).convert(content)
    end
  end
end

# Hooks
[:pages, :posts, :documents].each do |type|
  Jekyll::Hooks.register type, :pre_render, priority: Jekyll::BulmaAlerts::HOOK_PRIORITY do |doc|
    next if doc.content.nil? || doc.content.empty?
    next if type == :pages && !['.md', '.markdown'].include?(doc.ext&.downcase)

    doc.content = Jekyll::BulmaAlerts.process(doc.content, doc.site)
  end
end

# Liquid filter
module Jekyll
  module BulmaAlertsFilter
    def bulma_alerts(input)
      return input if input.nil? || input.empty?
      Jekyll::BulmaAlerts.process(input, @context.registers[:site])
    end
  end
end

Liquid::Template.register_filter(Jekyll::BulmaAlertsFilter)
