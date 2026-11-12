module Ari
  module ApplyDelivery
    module_function

    DECISION_STATES = {
      "review.approved" => :approved,
      "review.changes" => :returned,
      "review.rejected" => :rejected
    }.freeze

    ROLLBACK_PHASES = {
      "review.reverted" => "reverted",
      "review.requeued" => "review"
    }.freeze

    PROJECT_ACTIONS = {
      approved: :approved,
      returned: :returned,
      rejected: :rejected
    }.freeze

    def call(delivery)
      state = DECISION_STATES[delivery.event]
      phase = ROLLBACK_PHASES[delivery.event]
      return skip(delivery, "event #{delivery.event} is not a decision or a rollback") if state.nil? && phase.nil?

      review = delivery.review
      return skip(delivery, "no review matched #{delivery.external_id}") if review.nil?

      state ? apply(review, delivery, state) : roll_back(review, delivery, phase)
      delivery.update!(processed_at: Time.current, error: nil)
    end

    def roll_back(review, delivery, phase)
      review.transaction do
        review.update!(
          state: :pending,
          decided_at: nil,
          approved_minutes: nil,
          minutes_breakdown: nil,
          justification: nil,
          maker_feedback: nil,
          reviewer_notes: nil,
          ari_decision: nil,
          ari_reviewer_email: nil,
          ari_reviewer_slack_id: nil,
          ari_phase: phase
        )

        review.project.reverted_event!(delivery.event)
        review.final_review&.void!
      end

      Rails.logger.warn("[Ari] #{delivery.event} rolled back review ##{review.id}, anything granted downstream must be undone")
    end

    def apply(review, delivery, state)
      payload = delivery.payload
      body = payload["review"] || {}
      feedback = body["note_to_maker"].to_s.strip.presence

      review.transaction do
        review.update!(
          state: state,
          decided_at: Time.current,
          maker_feedback: feedback,
          reviewer_notes: body["audit_note"].to_s.strip.presence,
          approved_minutes: minutes(body),
          minutes_breakdown: body["minutes_breakdown"],
          justification: body["justification"],
          ari_ship_id: payload["id"].presence || review.ari_ship_id,
          ari_decision: payload["decision"].presence,
          ari_phase: "reviewed",
          ari_reviewer_email: body.dig("reviewer", "email"),
          ari_reviewer_slack_id: body.dig("reviewer", "slack_id")
        )

        review.project.public_send("#{PROJECT_ACTIONS.fetch(state)}_event!", feedback)
      end

      return unless state == :approved

      review.open_final_review!
      AirtableSyncJob.perform_later(review.id)
    end

    def minutes(body)
      return body["approved_minutes"].to_i if body["approved_minutes"].present?
      return (body["approved_hours"].to_f * 60).round if body["approved_hours"].present?

      0
    end

    def skip(delivery, reason)
      delivery.update!(processed_at: Time.current, error: reason)
      Rails.logger.warn("[Ari] delivery #{delivery.delivery_id} skipped: #{reason}")
    end
  end
end
