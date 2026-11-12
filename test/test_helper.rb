ENV["RAILS_ENV"] ||= "test"
# libpq crashes in forked test workers on macOS when it tries GSSAPI; nothing here uses it.
ENV["PGGSSENCMODE"] ||= "disable"
require_relative "../config/environment"
require "rails/test_help"
require_relative "support/builders"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    include Builders

    # Add more helper methods to be used by all tests here...
  end
end
