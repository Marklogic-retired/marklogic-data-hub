require "rubygems"

require "bundler/setup"
require "jekyll"

task :default => [:jekyll_build]

task :jekyll_build do
  puts 'BUILDING...'
  Jekyll::PluginManager.require_from_bundler
  options = {
    service: false
  }
  Jekyll::Commands::Build.process(options)
end

task :jekyll_build_for_test do
  puts 'BUILDING...'
  Jekyll::PluginManager.require_from_bundler
  options = {
    service: false,
    baseurl: ''
  }
  Jekyll::Commands::Build.process(options)
end

task :test => [:jekyll_build_for_test] do
  puts 'TESTING...'
  require 'html-proofer'
  opts = {
    check_external_hash: true,
    check_opengraph: true,
    check_html: true,
    assume_extension: true,
    alt_ignore: [/.*facebook.*/],
    url_ignore: [/.*localhost.*/]
  }
  HTMLProofer.check_directory("./_site", opts).run
end
