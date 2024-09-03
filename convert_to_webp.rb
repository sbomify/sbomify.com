require 'fileutils'

SOURCE_DIR = "_site/assets/images"
DEST_DIR = "_site/img"

def convert_to_webp(source_dir, dest_dir)
  FileUtils.mkdir_p(dest_dir)

  puts "Destination directory: #{dest_dir} created or already exists."

  # Iterate through the source directory to find images
  Dir.glob("#{source_dir}/**/*.{jpg,jpeg,png}").each do |file|
    dest_file = "#{dest_dir}/#{File.basename(file, '.*')}.webp"

    # Convert the image to WebP format
    result = system("cwebp -q 80 -quiet #{file} -o #{dest_file} > /dev/null 2>&1")

    if result
      puts "Successfully converted #{file} to #{dest_file}"
    else
      puts "Failed to convert #{file}"
    end
  end
end

# Run the conversion
convert_to_webp(SOURCE_DIR, DEST_DIR)
