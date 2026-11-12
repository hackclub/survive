require "test_helper"

class ProjectBannerTest < ActiveSupport::TestCase
  setup do
    @project = build_project(build_maker)
    @project.banner.attach(io: file_fixture("banner.webp").open, filename: "banner.webp", content_type: "image/webp")
  end

  test "before the card copy exists, the url asks Rails to make it" do
    assert_match %r{\A/rails/active_storage/representations/redirect/}, @project.banner_url
  end

  test "once the card copy exists on a public bucket, the url points straight at it" do
    @project.banner.variant(:card).processed
    service = @project.banner.blob.service
    service.define_singleton_method(:public?) { true }
    ActiveStorage::Current.url_options = { host: "assets.example.test", protocol: "https" }

    url = Project.find(@project.id).banner_url

    assert_no_match %r{/rails/active_storage/representations/redirect/}, url
  ensure
    service&.singleton_class&.remove_method(:public?)
  end

  test "the card copy is a resized webp" do
    image = @project.banner.variant(:card).processed.image

    assert_equal "image/webp", image.blob.content_type
  end
end
