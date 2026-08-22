module SurviveChecks
  class MakerAgeEligible < Base
    MIN_AGE = 13
    ADULT_AGE = 19

    def self.label
      "Age eligibility"
    end

    def call
      birthday = maker.birthday
      return fail!("There is no date of birth on file, so eligibility cannot be confirmed.") if birthday.blank?

      age = age_on(birthday, context.decided_on)
      return fail!("The maker was #{age} at review, under the #{MIN_AGE} floor for this programme.") if age < MIN_AGE
      return fail!("The maker was #{age} at review. This programme is for under #{ADULT_AGE}s and there is no exception.") if age >= ADULT_AGE

      pass("#{age} at review.")
    end

    private

    def age_on(birthday, date)
      age = date.year - birthday.year
      age -= 1 if date < birthday.to_date.change(year: date.year)
      age
    end
  end
end
