class SlackReviewSubmittedJob < ApplicationJob
  queue_as :default

  discard_on ActiveRecord::RecordNotFound

  def perform(review_id)
    review = Review.includes(project: :user).find(review_id)
    return if review.test_submission?

    project = review.project
    maker = project.user

    SlackDmJob.perform_later(
      maker.id,
      "review-submitted:#{review.id}",
      "Your project “#{project.name}” has been submitted for review. You can follow its progress here: #{SlackDmService.project_url(project)}"
    )

    reviewers = User.where("roles && ARRAY['reviewer', 'admin', 'superadmin']::varchar[]")
    reviewers.find_each do |reviewer|
      SlackDmJob.perform_later(
        reviewer.id,
        "review-queue:#{review.id}",
        "A new Survive project needs review: “#{project.name}” by #{maker.display_name}. Open the review queue: #{SlackDmService.admin_reviews_url}"
      )
    end
  end
end
