require 'rake/testtask'

Rake::TestTask.new(:test) do |t|
  t.libs << 'tests'
  t.pattern = 'tests/plugins/**/*_test.rb'
  t.verbose = true
  t.warning = false
end

task default: :test
