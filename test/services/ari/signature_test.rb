require "test_helper"

class Ari::SignatureTest < ActiveSupport::TestCase
  SECRET = "whsec_test_secret"
  BODY = '{"event":"review.approved","ship_id":"shp_1"}'

  test "sign_body matches openssl hmac over the raw body" do
    expected = OpenSSL::HMAC.hexdigest("SHA256", SECRET, BODY)

    assert_equal expected, Ari::Signature.sign_body(BODY, secret: SECRET)
  end

  test "sign_body refuses to run without a secret" do
    assert_raises(Ari::NotConfigured) { Ari::Signature.sign_body(BODY, secret: "") }
  end

  test "delivery signature covers timestamp, delivery id and body" do
    stamp = 1_700_000_000
    expected = OpenSSL::HMAC.hexdigest("SHA256", SECRET, "#{stamp}.dlv_1.#{BODY}")

    assert_equal expected,
      Ari::Signature.delivery_signature(timestamp: stamp, delivery_id: "dlv_1", body: BODY, secret: SECRET)
  end

  test "verify_delivery accepts a signature it just made" do
    now = Time.at(1_700_000_000)
    signature = Ari::Signature.delivery_signature(
      timestamp: now.to_i, delivery_id: "dlv_1", body: BODY, secret: SECRET
    )

    assert_equal :ok, verify(signature: signature, timestamp: now.to_i, now: now)
  end

  test "verify_delivery rejects a body that changed by one byte" do
    now = Time.at(1_700_000_000)
    signature = Ari::Signature.delivery_signature(
      timestamp: now.to_i, delivery_id: "dlv_1", body: BODY, secret: SECRET
    )

    assert_equal :bad_signature,
      verify(signature: signature, timestamp: now.to_i, now: now, body: BODY.sub("shp_1", "shp_2"))
  end

  test "verify_delivery rejects a different delivery id" do
    now = Time.at(1_700_000_000)
    signature = Ari::Signature.delivery_signature(
      timestamp: now.to_i, delivery_id: "dlv_1", body: BODY, secret: SECRET
    )

    assert_equal :bad_signature,
      verify(signature: signature, timestamp: now.to_i, now: now, delivery_id: "dlv_2")
  end

  test "verify_delivery rejects a signature made with another secret" do
    now = Time.at(1_700_000_000)
    signature = Ari::Signature.delivery_signature(
      timestamp: now.to_i, delivery_id: "dlv_1", body: BODY, secret: "whsec_other"
    )

    assert_equal :bad_signature, verify(signature: signature, timestamp: now.to_i, now: now)
  end

  test "verify_delivery rejects a replay outside the window, in both directions" do
    signed_at = Time.at(1_700_000_000)
    signature = Ari::Signature.delivery_signature(
      timestamp: signed_at.to_i, delivery_id: "dlv_1", body: BODY, secret: SECRET
    )

    assert_equal :stale, verify(signature: signature, timestamp: signed_at.to_i, now: signed_at + 6.minutes)
    assert_equal :stale, verify(signature: signature, timestamp: signed_at.to_i, now: signed_at - 6.minutes)
    assert_equal :ok, verify(signature: signature, timestamp: signed_at.to_i, now: signed_at + 4.minutes)
  end

  test "verify_delivery reports missing headers and bad timestamps" do
    now = Time.at(1_700_000_000)

    assert_equal :missing_headers, verify(signature: nil, timestamp: now.to_i, now: now)
    assert_equal :missing_headers, verify(signature: "abc", timestamp: nil, now: now)
    assert_equal :missing_headers, verify(signature: "abc", timestamp: now.to_i, now: now, delivery_id: nil)
    assert_equal :bad_timestamp, verify(signature: "abc", timestamp: "not-a-number", now: now)
  end

  test "verify_delivery says not_configured before it says anything else" do
    now = Time.at(1_700_000_000)

    assert_equal :not_configured,
      Ari::Signature.verify_delivery(body: BODY, signature: "abc", timestamp: now.to_i,
        delivery_id: "dlv_1", secret: "", now: now)
  end

  private

  def verify(signature:, timestamp:, now:, body: BODY, delivery_id: "dlv_1")
    Ari::Signature.verify_delivery(
      body: body, signature: signature, timestamp: timestamp,
      delivery_id: delivery_id, secret: SECRET, now: now
    )
  end
end
