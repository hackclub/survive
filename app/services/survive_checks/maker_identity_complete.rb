module SurviveChecks
  class MakerIdentityComplete < Base
    REQUIRED = {
      first_name: "first name",
      last_name: "last name",
      email: "email",
      birthday: "date of birth",
      address_line1: "address",
      city: "city",
      country: "country",
      postal_code: "postcode"
    }.freeze

    def self.label
      "Your details"
    end

    def call
      missing = REQUIRED.filter_map { |field, label| label if maker.public_send(field).blank? }
      return pass("Everything a grant needs is on file.") if missing.empty?

      fail!("Hack Club Auth is missing your #{missing.to_sentence}. Grants and swag cannot ship without it.")
    end
  end
end
