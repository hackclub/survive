# Admin-only numbers: who's signing up, who's around, who's coding, and how far people get.
class Admin::StatsController < ApplicationController
  RANGES = [ 7, 30, 90 ].freeze

  def index
    authorize :stats

    days = params[:days].to_i.presence_in(RANGES) || 30
    today = Time.current.to_date
    range = (today - (days - 1))..today

    render inertia: "Admin/Stats", props: {
      days: days,
      ranges: RANGES,
      today: today_tiles(today),
      daily: daily(range),
      funnel: funnel,
      totals: totals,
      trackingSince: {
        visits: UserActivityDay.minimum(:day)&.strftime("%b %-d"),
        hackatime: HackatimeDailyTotal.minimum(:day)&.strftime("%b %-d")
      }
    }
  end

  private

  def today_tiles(today)
    week = (today - 6)..today
    {
      signupsToday: User.where(created_at: today.all_day).count,
      signupsWeek: User.where(created_at: week.first.beginning_of_day..).count,
      activeToday: UserActivityDay.where(day: today).count,
      activeWeek: UserActivityDay.where(day: week).distinct.count(:user_id),
      codingToday: coding_by_day(today..today).dig(today, :coding).to_i,
      codingWeek: coding_users(week)
    }
  end

  def daily(range)
    signups = User.where(created_at: range.first.beginning_of_day..range.last.end_of_day)
      .group(Arel.sql("DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE '#{tz}')")).count
    active = UserActivityDay.where(day: range).group(:day).count
    coding = coding_by_day(range)

    range.map do |day|
      row = coding[day] || {}
      { day: day.iso8601, label: day.strftime("%b %-d"),
        signups: signups[day].to_i, active: active[day].to_i,
        coding: row[:coding].to_i, codingSurvive: row[:coding_survive].to_i,
        hours: (row[:seconds].to_i / 3600.0).round(1) }
    end
  end

  # A person was coding on a day if their Hackatime total went up since their last snapshot.
  # Their first snapshot has nothing to compare with, so it doesn't count.
  def coding_by_day(range)
    sql = <<~SQL
      SELECT day,
        COUNT(*) FILTER (WHERE total_seconds > prev_total) AS coding,
        COUNT(*) FILTER (WHERE linked_seconds > prev_linked) AS coding_survive,
        SUM(GREATEST(total_seconds - prev_total, 0)) AS seconds
      FROM (
        SELECT day, total_seconds, linked_seconds,
          LAG(total_seconds) OVER w AS prev_total, LAG(linked_seconds) OVER w AS prev_linked
        FROM hackatime_daily_totals
        WHERE day >= :since
        WINDOW w AS (PARTITION BY user_id ORDER BY day)
      ) t
      WHERE prev_total IS NOT NULL AND day BETWEEN :first AND :last
      GROUP BY day
    SQL
    rows = HackatimeDailyTotal.connection.select_all(
      HackatimeDailyTotal.sanitize_sql([ sql, { since: range.first - 30, first: range.first, last: range.last } ])
    )
    rows.to_h { |r| [ r["day"].to_date, { coding: r["coding"], coding_survive: r["coding_survive"], seconds: r["seconds"] } ] }
  end

  def coding_users(range)
    sql = <<~SQL
      SELECT COUNT(DISTINCT user_id) FROM (
        SELECT user_id, day, total_seconds, LAG(total_seconds) OVER (PARTITION BY user_id ORDER BY day) AS prev
        FROM hackatime_daily_totals WHERE day >= :since
      ) t WHERE prev IS NOT NULL AND total_seconds > prev AND day BETWEEN :first AND :last
    SQL
    HackatimeDailyTotal.connection.select_value(
      HackatimeDailyTotal.sanitize_sql([ sql, { since: range.first - 30, first: range.first, last: range.last } ])
    ).to_i
  end

  # How far people get, each step counted once per person.
  def funnel
    real = Review.real.joins(:project)
    [
      { label: "Signed up", value: User.count },
      { label: "Linked Hackatime", value: User.where.not(hackatime_uid: [ nil, "" ]).count },
      { label: "Started a project", value: Project.distinct.count(:user_id) },
      { label: "Shipped a project", value: real.distinct.count("projects.user_id") },
      { label: "Got hours approved", value: real.where(state: :approved).distinct.count("projects.user_id") },
      { label: "Ordered from the shop", value: Order.where.not(state: %i[rejected refunded]).distinct.count(:user_id) }
    ]
  end

  def totals
    {
      users: User.count,
      projects: Project.count,
      shipped: Review.real.count,
      approvedHours: (Review.real.approved.sum(:approved_minutes) / 60.0).round,
      woodEarned: CoinPayout.sum(:coins),
      woodSpent: Order.held.sum("frozen_coin_cost * quantity"),
      orders: Order.where.not(state: %i[rejected refunded]).count,
      hikes: HikeGrant.count
    }
  end

  def tz
    Time.zone.tzinfo.name.gsub("'", "")
  end
end
