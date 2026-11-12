module CampSummary
  module_function

  # What the dashboard hub shows: project counts, approved time, and the one project
  # that most needs the maker (changes requested first, then their latest draft).
  def for(user)
    projects = user.projects.includes(reviews: :coin_payout).to_a
    stages = projects.map(&:trail_stage).tally
    needs_you = latest(projects, "changes") || latest(projects, "draft")

    {
      projects: projects.size,
      inReview: stages.fetch("sent", 0),
      changes: stages.fetch("changes", 0),
      drafts: stages.fetch("draft", 0),
      approvedMinutes: user.approved_minutes,
      next: needs_you && { id: needs_you.id, name: needs_you.name, stage: needs_you.trail_stage }
    }
  end

  def latest(projects, stage)
    projects.select { |project| project.trail_stage == stage }.max_by(&:updated_at)
  end
end
