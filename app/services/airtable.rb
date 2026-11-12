module Airtable
  class Error < StandardError; end
  class NotConfigured < Error; end
  class Unavailable < Error; end
  class Rejected < Error; end
end
