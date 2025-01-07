require 'date'

module Jekyll
  class GitDates < Generator
    priority :high
    safe true

    def generate(site)
      return if site.config['skip_git_dates']

      site.posts.docs.each do |post|
        file_path = post.path

        # Get creation date from git
        creation_date = `git log --follow --format=%aD -- "#{file_path}" | tail -1`.strip
        unless creation_date.empty?
          post.data['git_created_date'] = DateTime.parse(creation_date)
          # Only set date if not explicitly specified in front matter
          post.data['date'] ||= post.data['git_created_date']
        end

        # Get last modified date from git
        modified_date = `git log -1 --format=%aD -- "#{file_path}"`.strip
        unless modified_date.empty?
          post.data['git_modified_date'] = DateTime.parse(modified_date)
          # Only set last_modified_at if not explicitly specified in front matter
          post.data['last_modified_at'] ||= post.data['git_modified_date']
        end
      end
    end
  end
end