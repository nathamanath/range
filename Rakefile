require 'uglifier'
require "jshintrb/jshinttask"

task default: :build

task build: [:js, :docs]

task :js do
  js = File.read File.expand_path('../range.js', __FILE__)
  ugly = Uglifier.compile js

  File.open(File.expand_path('../range.min.js', __FILE__), 'w+') do |f|
    f.puts ugly
  end
end

task :docs do
  `jsdoc README.md -d doc range.js`
end

Jshintrb::JshintTask.new :jshint do |t|
  t.pattern = 'range.js'
  t.options = JSON.parse(IO.read('.jshintrc'))
end

