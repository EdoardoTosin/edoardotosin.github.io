#!/usr/bin/env ruby
#
# Check for changed posts

Jekyll::Hooks.register :posts, :post_init do |post|

  commit_num = `git rev-list --count HEAD "#{ post.path }"`

  if commit_num.to_i > 1
    lastmod_date = `git log -1 --pretty="%ad" --date=iso "#{ post.path }"`
    post.data['last_modified_at'] = lastmod_date
    Jekyll.logger.info "Post URL: #{post.site.config['url']}#{post.url}"
    Jekyll.logger.info "Post updated: #{post.data['last_modified_at']}"
  end

end
