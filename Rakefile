require 'uglifier'
require "jshintrb/jshinttask"

def source_file
  File.expand_path '../range.js', __FILE__
end

def min_file
  File.expand_path '../range.min.js', __FILE__
end

task default: :build

task build: [:js, :docs, :docs]

desc 'Minify js'
task :js do
  `java -jar $CLOSURE_PATH --js range.js --compilation_level ADVANCED_OPTIMIZATIONS > range.min.js`
end

task :docs do
  `jsdoc README.md -d doc #{source_file}`
end

task :server do
  `ruby -run -e httpd ./examples -p 8000`
end

Jshintrb::JshintTask.new :jshint do |t|
  t.pattern = source_file
  t.options = JSON.parse(IO.read('.jshintrc'))
end

