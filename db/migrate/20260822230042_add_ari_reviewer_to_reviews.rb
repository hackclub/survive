class AddAriReviewerToReviews < ActiveRecord::Migration[8.1]
  def change
    add_column :reviews, :ari_reviewer_email, :string
    add_column :reviews, :ari_reviewer_slack_id, :string
  end
end
