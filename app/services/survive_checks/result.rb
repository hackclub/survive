module SurviveChecks
  Result = Struct.new(:key, :name, :source, :verdict, :reasoning, :blocking, keyword_init: true) do
    VERDICTS = %w[pass fail uncertain skipped].freeze

    def verdict_value
      VERDICTS.include?(verdict.to_s) ? verdict.to_s : "uncertain"
    end

    def blocking_failure?
      blocking && verdict_value == "fail"
    end

    def to_h
      {
        "key" => key.to_s,
        "name" => name.to_s,
        "source" => source.to_s,
        "verdict" => verdict_value,
        "reasoning" => reasoning.to_s,
        "blocking" => blocking ? true : false
      }
    end
  end
end
