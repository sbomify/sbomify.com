Jekyll::Hooks.register :site, :post_write do |site|
  system("ruby convert_to_webp.rb")
end
