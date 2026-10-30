class DashboardController < ApplicationController
  STAGE_ORDER = %w[returned ari final sent draft paid].freeze

  def index
    render inertia: "Dashboard/Hub"
  end

  def camp
    projects = current_user.projects
      .includes({ reviews: :coin_payout }, banner_attachment: :blob)
      .order(updated_at: :desc)
      .to_a

    ordered = projects.sort_by { |project| STAGE_ORDER.index(project.trail_stage) || STAGE_ORDER.size }

    render inertia: "Dashboard/Index", props: {
      projects: ordered.map(&:as_client_json),
      stats: {
        earned: current_user.coins_earned,
        approvedMinutes: current_user.approved_minutes,
        inReview: projects.count { |project| project.trail_stage.in?(%w[sent ari final]) },
        held: current_user.coins_held
      }
    }
  end
end
