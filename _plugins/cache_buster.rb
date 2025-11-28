require 'digest/md5'

module Jekyll
  module CacheBuster
    class Buster
      def self.bust(url, source_dir)
        return url if url.nil? || url.empty?

        # Remove any leading slash for file system lookup, but keep it for result
        path = url.sub(/^\//, '')
        
        # Try to find the file in the source directory
        file_path = File.join(source_dir, path)
        
        # If file doesn't exist, check if it's a CSS file that might be generated from SCSS/SASS
        if !File.exist?(file_path) && path.end_with?('.css')
          scss_path = file_path.sub(/\.css$/, '.scss')
          sass_path = file_path.sub(/\.css$/, '.sass')
          
          if File.exist?(scss_path)
            file_path = scss_path
          elsif File.exist?(sass_path)
            file_path = sass_path
          else
              # File really doesn't exist, return original url
              return url
          end
        end

        # Calculate hash
        begin
          hash = Digest::MD5.file(file_path).hexdigest[0..7]
          "#{url}?v=#{hash}"
        rescue
          url
        end
      end
    end

    def bust_cache(url)
      source_dir = @context.registers[:site].source
      Buster.bust(url, source_dir)
    end
  end
end

Liquid::Template.register_filter(Jekyll::CacheBuster)