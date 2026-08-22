class Admin::OverviewController < ApplicationController
  def index
    authorize :overview

    render inertia: "Admin/Overview", props: {
      submissions: submissions,
      finalReviews: final_reviews,
      ari: ari_health,
      recent: recent_activity
    }
  end

  private

  def submissions
    {
      total: Review.count,
      awaitingIngest: Review.awaiting_ingest.count,
      ingestFailed: Review.ingest_failed.count,
      stuck: Review.stuck.count,
      inAri: Review.awaiting_ari.count
    }
  end

  def final_reviews
    oldest = FinalReview.queued.order(:created_at).first

    {
      pending: FinalReview.queued.count,
      passed: FinalReview.passed.count,
      deducted: FinalReview.deducted.count,
      banned: FinalReview.banned.count,
      oldestWaiting: oldest&.created_at&.strftime("%b %d, %H:%M"),
      oldestWaitingDays: oldest ? ((Time.current - oldest.created_at) / 1.day).floor : nil
    }
  end

  def ari_health
    last = AriDelivery.recent.first

    {
      configured: Ari::Config.ingest_configured?,
      webhookConfigured: Ari::Config.webhook_configured?,
      lastDeliveryAt: last&.received_at&.strftime("%b %d, %H:%M"),
      lastDeliveryEvent: last&.event,
      unprocessedDeliveries: AriDelivery.unprocessed.count,
      lastStatusRefreshAt: Rails.cache.read(AriStatusRefreshJob::LAST_RUN_KEY)&.strftime("%b %d, %H:%M")
    }
  end

  def recent_activity
    AuditLog.recent.includes(:actor).limit(12).map do |entry|
      {
        id: entry.id,
        action: entry.action,
        actor: entry.actor&.display_name,
        target: [ entry.target_type, entry.target_id ].compact.join(" "),
        at: entry.created_at.strftime("%b %d, %H:%M")
      }
    end
  end
end
