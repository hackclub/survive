require "test_helper"

class ActiveStorageR2Test < ActiveSupport::TestCase
  CONFIG = {
    service: "S3",
    bucket: "survive-test",
    endpoint: "https://acct.r2.cloudflarestorage.com",
    region: "auto",
    force_path_style: true,
    access_key_id: "key",
    secret_access_key: "secret",
    public: true
  }.freeze

  test "a public host rewrites urls onto the custom domain" do
    service = build_service(public_host: "survive.hackclub-assets.com")

    assert_equal "https://survive.hackclub-assets.com/abc123", service.url("abc123")
  end

  test "a public host strips the acl header R2 does not implement" do
    service = build_service(public_host: "survive.hackclub-assets.com")

    assert_nil service.upload_options[:acl]
  end

  test "without a public host the s3 behaviour is untouched" do
    service = build_service

    assert_equal "public-read", service.upload_options[:acl]
    assert_includes service.url("abc123"), "r2.cloudflarestorage.com"
  end

  private

  def build_service(**extra)
    ActiveStorage::Service.configure(:r2, { r2: CONFIG.merge(extra) })
  end
end
