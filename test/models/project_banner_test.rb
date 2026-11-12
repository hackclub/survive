require "test_helper"

class ProjectBannerTest < ActiveSupport::TestCase
  REDIRECT = %r{/rails/active_storage/(blobs|representations)/}

  setup do
    @project = build_project(build_maker)
    @project.banner.attach(io: file_fixture("banner.webp").open, filename: "banner.webp", content_type: "image/webp")
    ActiveStorage::Current.url_options = { host: "assets.example.test", protocol: "https" }
  end

  teardown do
    service = ActiveStorage::Blob.service
    service.singleton_class.remove_method(:public?) if service.singleton_class.method_defined?(:public?, false)
  end

  test "off a public bucket, Rails makes the card copy and redirects" do
    assert_match %r{\A/rails/active_storage/representations/redirect/}, @project.banner_url
  end

  test "on a public bucket, the original is linked directly until the card copy exists" do
    make_service_public

    url = @project.banner_url

    assert_no_match REDIRECT, url
    assert_equal @project.banner.url, url
  end

  test "on a public bucket, the card copy is linked directly once it exists" do
    card = @project.banner.variant(:card).processed
    make_service_public

    url = Project.find(@project.id).banner_url

    assert_no_match REDIRECT, url
    assert_equal card.url, url
    assert_not_equal @project.banner.url, url
  end

  test "the card copy is a webp" do
    image = @project.banner.variant(:card).processed.image

    assert_equal "image/webp", image.blob.content_type
  end

  test "shop item images use the same direct links" do
    item = build_item
    item.image.attach(io: file_fixture("banner.webp").open, filename: "item.webp", content_type: "image/webp")
    make_service_public

    assert_equal item.image.url, item.image_url
  end

  private

  def make_service_public
    ActiveStorage::Blob.service.define_singleton_method(:public?) { true }
  end
end
