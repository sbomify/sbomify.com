module Jekyll
  class PictureTag < Liquid::Tag

    def initialize(tag_name, markup, tokens)
      super
      @attributes = {}

      params = markup.strip.split
      @src = params.shift

      Jekyll.logger.info "PictureTag:", "Initializing picture for: #{@src}"

      params.each do |param|
        key, value = param.split('=')
        value = value.gsub(/"/, '') if value
        @attributes[key] = value
      end

      @filename = File.basename(@src, File.extname(@src))
    end

    def render(context)
      webp_src = "/img/#{@filename}.webp"
      jpg_src = "#{@src}"

      additional_attributes = @attributes.map { |key, value| "#{key}=\"#{value}\"" if value }.compact.join(' ')

      <<-HTML
<picture>
  <source srcset="#{webp_src}" type="image/webp">
  <img src="#{jpg_src}" #{additional_attributes}>
</picture>
      HTML
    end
  end
end

Liquid::Template.register_tag('picture', Jekyll::PictureTag)
