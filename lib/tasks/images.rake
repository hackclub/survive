namespace :images do
  desc "Make the resized card copy for project banners and shop item images uploaded before card copies existed"
  task preprocess: :environment do
    [ [ Project, :banner ], [ ShopItem, :image ] ].each do |model, name|
      model.joins(:"#{name}_attachment").find_each do |record|
        record.public_send(name).variant(:card).processed
        print "."
      rescue StandardError => e
        puts "\n#{model.name} ##{record.id}: #{e.class}: #{e.message}"
      end
    end
    puts "\ndone"
  end
end
