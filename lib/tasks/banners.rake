namespace :banners do
  desc "Make the resized card copy for every project banner that doesn't have one yet"
  task preprocess: :environment do
    Project.joins(:banner_attachment).find_each do |project|
      project.banner.variant(:card).processed
      print "."
    rescue StandardError => e
      puts "\nproject ##{project.id}: #{e.class}: #{e.message}"
    end
    puts "\ndone"
  end
end
