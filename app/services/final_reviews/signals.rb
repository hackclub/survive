module FinalReviews
  module Signals
    module_function

    OUTLIER_RATIO = 2.0

    def call(review)
      signals = {}
      flags = 0
      errors = []

      flags |= collect(signals, errors, FinalReview::FLAG_HACKATIME_FLAGGED) { hackatime_flagged(review, signals) }
      flags |= collect(signals, errors, FinalReview::FLAG_DUPLICATE_REPO) { duplicate_repo(review, signals) }
      flags |= collect(signals, errors, FinalReview::FLAG_NO_VERIFIED_TIME) { no_verified_time(review, signals) }
      flags |= collect(signals, errors, FinalReview::FLAG_HOURS_OUTLIER) { hours_outlier(review, signals) }
      flags |= collect(signals, errors, FinalReview::FLAG_PRIOR_DEDUCTIONS) { prior_deductions(review, signals) }

      flags |= FinalReview::FLAG_CHECK_FAILED if errors.any?
      signals["errors"] = errors

      { flags: flags, signals: signals }
    end

    def collect(_signals, errors, bit)
      yield ? bit : 0
    rescue StandardError => e
      errors << "#{e.class}: #{e.message}"
      0
    end

    def hackatime_flagged(review, signals)
      flagged = HackatimeSyncService.banned?(review.project.user)
      signals["hackatime_trust_flagged"] = flagged
      flagged
    end

    def duplicate_repo(review, signals)
      key = review.project.normalized_repo_url
      signals["normalized_repo_url"] = key
      return false if key.blank?

      others = Project.where(normalized_repo_url: key).where.not(id: review.project_id)
      signals["duplicate_repo_projects"] = others.limit(5).pluck(:name)
      signals["duplicate_repo_other_makers"] = others.where.not(user_id: review.project.user_id).count

      others.exists?
    end

    def no_verified_time(review, signals)
      breakdown = review.minutes_breakdown || {}
      hackatime = breakdown["hackatime"].to_i
      signals["minutes_breakdown"] = breakdown
      signals["hackatime_minutes"] = hackatime

      review.approved_minutes.to_i.positive? && hackatime.zero?
    end

    def hours_outlier(review, signals)
      minutes = review.approved_minutes.to_i
      signals["approved_minutes"] = minutes

      others = Review.where(state: :approved).where.not(id: review.id).where.not(approved_minutes: nil).pluck(:approved_minutes)
      signals["programme_sample_size"] = others.size
      return false if others.size < 5

      median = median_of(others)
      signals["programme_median_minutes"] = median
      return false if median.zero?

      ratio = (minutes / median.to_f).round(2)
      signals["outlier_ratio"] = ratio
      ratio >= OUTLIER_RATIO
    end

    def prior_deductions(review, signals)
      count = FinalReview
        .where(status: %i[deducted banned])
        .joins(review: :project)
        .where(projects: { user_id: review.project.user_id })
        .where.not(review_id: review.id)
        .count

      signals["prior_deductions"] = count
      count.positive?
    end

    def median_of(values)
      sorted = values.sort
      middle = sorted.size / 2
      sorted.size.odd? ? sorted[middle] : ((sorted[middle - 1] + sorted[middle]) / 2.0).round
    end
  end
end
