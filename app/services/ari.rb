module Ari
  class Error < StandardError; end
  class NotConfigured < Error; end
  class Unavailable < Error; end

  class IncompletePayload < Error
    attr_reader :missing

    def initialize(missing)
      @missing = missing
      super("Ari payload is missing #{missing.join(", ")}")
    end
  end
end
