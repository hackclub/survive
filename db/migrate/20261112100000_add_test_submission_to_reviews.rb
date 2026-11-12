class AddTestSubmissionToReviews < ActiveRecord::Migration[8.0]
  def change
    add_column :reviews, :test_submission, :boolean, null: false, default: false
  end
end
