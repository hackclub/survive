namespace :airtable do
  desc "Push approved reviews with no Airtable record. DRY_RUN=1 prints payloads only, REVIEW_ID=n re-pushes one review."
  task backfill: :environment do
    dry_run = ENV["DRY_RUN"].present?

    reviews = if ENV["REVIEW_ID"].present?
      Review.where(id: ENV["REVIEW_ID"])
    else
      Review.approved.where(airtable_record_id: nil)
    end
    reviews = reviews.includes(project: [ :user, :hackatime_projects ]).order(:id)

    puts "#{reviews.count} review(s) to push#{' (dry run, nothing is sent)' if dry_run}"

    reviews.find_each do |review|
      if dry_run
        puts "\nreview ##{review.id} project ##{review.project_id} #{review.project.name.inspect}"
        puts JSON.pretty_generate({ "fields" => Airtable::Submission.fields(review) })
        next
      end

      AirtableSyncJob.perform_now(review.id)
      review.reload
      status = if review.airtable_error.present? then "FAILED #{review.airtable_error}"
      elsif review.airtable_record_id.present? then "ok #{review.airtable_record_id}"
      else "Airtable unavailable, retry queued"
      end
      puts "review ##{review.id} #{review.project.name.inspect}: #{status}"
    end
  end
end
