module SurviveCheckService
  module_function

  ENGINE = "survive_checks_v1".freeze
  CHECKS = [
    SurviveChecks::RepoReachable,
    SurviveChecks::DemoPresent,
    SurviveChecks::ScreenshotValid,
    SurviveChecks::DescriptionPresent,
    SurviveChecks::HackatimeLinked
  ].freeze

  def run(project:, review: nil)
    context = SurviveChecks::Context.new(project: project, review: review)
    visible = CHECKS.map { |klass| safe_call(klass, context) }.reject { |result| result.verdict_value == "skipped" }

    {
      "overall" => overall(visible),
      "blocking" => visible.select(&:blocking_failure?).map(&:to_h),
      "requirements" => visible.map(&:to_h),
      "checked_at" => Time.current.iso8601,
      "engine" => ENGINE
    }
  end

  def safe_call(klass, context)
    klass.call(context)
  rescue StandardError => e
    Rails.logger.error("SurviveCheck #{klass} crashed: #{e.class}: #{e.message}")

    SurviveChecks::Result.new(
      key: klass.key,
      name: klass.label,
      source: klass.source,
      verdict: "uncertain",
      reasoning: "This check could not run.",
      blocking: klass.blocking?
    )
  end

  def overall(results)
    return "fail" if results.any?(&:blocking_failure?)
    return "uncertain" if results.any? { |result| result.verdict_value == "uncertain" }

    "pass"
  end
end
