# frozen_string_literal: true
# Requiring 'jekyll' once here gives every plugin file the Jekyll::Hooks/Jekyll.logger constants it needs at load time.
require 'minitest/autorun'
require 'jekyll'
require 'tmpdir'

PLUGINS_DIR = File.expand_path('../_plugins', __dir__)

def require_plugin(name)
  require File.join(PLUGINS_DIR, name)
end

# Duck-typed stand-ins for Jekyll::Site/Document, covering only what each plugin actually calls.
FakePost = Struct.new(:data, :relative_path, :content, :url, :basename) do
  def initialize(data: {}, relative_path: 'fake.md', content: '', url: '/fake/', basename: 'fake.md')
    super(data, relative_path, content, url, basename)
  end
end

FakePostsCollection = Struct.new(:docs)

FakeCollection = Struct.new(:docs)

# Shared :site hooks (pre_render/post_render) fire for every plugin registered on them, not just the one under test.
FakeSite = Struct.new(:source, :data, :posts, :config, :pages, :collections, :baseurl) do
  def initialize(source: Dir.mktmpdir, data: {}, posts: FakePostsCollection.new([]), config: {},
                  pages: [], collections: {}, baseurl: '')
    super(source, data, posts, config, pages, collections, baseurl)
  end

  def respond_to?(name, include_all = false)
    name == :posts ? true : super
  end
end
