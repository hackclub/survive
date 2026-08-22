module SurviveChecks
  class Base
    class << self
      def key
        name.demodulize.underscore
      end

      def label
        key.humanize
      end

      def source
        ""
      end

      def blocking?
        true
      end

      def call(context)
        new(context).call
      end
    end

    attr_reader :context

    delegate :project, :maker, :review, to: :context

    def initialize(context)
      @context = context
    end

    def call
      raise NotImplementedError
    end

    private

    def pass(reasoning = nil)
      result("pass", reasoning)
    end

    def fail!(reasoning)
      result("fail", reasoning)
    end

    def uncertain(reasoning)
      result("uncertain", reasoning)
    end

    def skipped(reasoning = nil)
      result("skipped", reasoning)
    end

    def result(verdict, reasoning)
      Result.new(
        key: self.class.key,
        name: self.class.label,
        source: self.class.source,
        verdict: verdict,
        reasoning: reasoning,
        blocking: self.class.blocking?
      )
    end
  end
end
