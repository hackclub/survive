import { Head, Link, useForm, usePage } from "@inertiajs/react"
import { AppShell } from "../../components/AppShell"
import { Status } from "../../components/Status"
import { humanizeField } from "../../lib/format"
import type { SharedProps } from "../../types"

type Maker = {
  name: string
  email: string
  hackatimeConnected: boolean
  hackatimeProjects: number
  roles: string[]
  banned: boolean
  bannedReason: string | null
}

type Details = {
  birthday: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  postalCode: string
  phoneNumber: string
}

type Coins = { earned: number; adjusted: number; held: number; spendable: number }

export default function Show({
  maker,
  details,
  missing,
  needsBirthday,
  coins,
}: {
  maker: Maker
  details: Details
  missing: string[]
  needsBirthday: boolean
  coins: Coins
}) {
  const { errors } = usePage<SharedProps>().props

  const form = useForm({
    birthday: details.birthday,
    address_line1: details.addressLine1,
    address_line2: details.addressLine2,
    city: details.city,
    state: details.state,
    country: details.country,
    postal_code: details.postalCode,
    phone_number: details.phoneNumber,
  })

  const csrfToken =
    typeof document !== "undefined"
      ? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || ""
      : ""

  function save(event: React.FormEvent) {
    event.preventDefault()
    form.patch("/account")
  }

  const incomplete = missing.length > 0 || needsBirthday

  return (
    <>
      <Head title="You - Survive" />

      <AppShell
        eyebrow="Your account"
        title={maker.name}
        narrow
        lede={maker.email}
        tone={maker.banned ? "returned" : undefined}
        actions={
          maker.roles.length > 0 ? (
            <span className="rolechip">{maker.roles.join(" · ")}</span>
          ) : undefined
        }
      >
        {maker.banned && (
          <div className="panel panel--bad" style={{ marginBottom: "var(--sp-4)" }}>
            <p className="u-sm">
              Your account is suspended, so your {coins.earned + coins.adjusted} coins cannot be
              spent. Open orders are on hold, not cancelled.
            </p>
            {maker.bannedReason && (
              <p className="u-xs u-faint" style={{ marginTop: "var(--sp-2)" }}>
                Reason on file: {maker.bannedReason}
              </p>
            )}
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div className="project-form__errors">
            <ul>
              {Object.entries(errors).map(([field, messages]) =>
                messages.map((message) => (
                  <li key={`${field}-${message}`}>
                    {humanizeField(field)} {message}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        <div className="camp__grid">
          <form className="panel" onSubmit={save}>
            <div className="panel__head">
              <h2 className="panel__title">Your details</h2>
              {incomplete && <Status tone="warn">Incomplete</Status>}
            </div>

            <div className="field-group">
            <div className="field">
              <label className="field__label" htmlFor="birthday">
                Date of birth
              </label>
              <input
                id="birthday"
                className="field__input"
                type="date"
                value={form.data.birthday}
                onChange={(event) => form.setData("birthday", event.target.value)}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="address_line1">
                Street address
              </label>
              <input
                id="address_line1"
                className="field__input"
                type="text"
                autoComplete="address-line1"
                value={form.data.address_line1}
                onChange={(event) => form.setData("address_line1", event.target.value)}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="address_line2">
                Address line 2 <span className="u-faint">(optional)</span>
              </label>
              <input
                id="address_line2"
                className="field__input"
                type="text"
                autoComplete="address-line2"
                value={form.data.address_line2}
                onChange={(event) => form.setData("address_line2", event.target.value)}
              />
            </div>

            <div className="camp__pair">
              <div className="field">
                <label className="field__label" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  className="field__input"
                  type="text"
                  autoComplete="address-level2"
                  value={form.data.city}
                  onChange={(event) => form.setData("city", event.target.value)}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="state">
                  State or region <span className="u-faint">(optional)</span>
                </label>
                <input
                  id="state"
                  className="field__input"
                  type="text"
                  autoComplete="address-level1"
                  value={form.data.state}
                  onChange={(event) => form.setData("state", event.target.value)}
                />
              </div>
            </div>

            <div className="camp__pair">
              <div className="field">
                <label className="field__label" htmlFor="postal_code">
                  Postcode
                </label>
                <input
                  id="postal_code"
                  className="field__input"
                  type="text"
                  autoComplete="postal-code"
                  value={form.data.postal_code}
                  onChange={(event) => form.setData("postal_code", event.target.value)}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="country">
                  Country
                </label>
                <input
                  id="country"
                  className="field__input"
                  type="text"
                  autoComplete="country-name"
                  value={form.data.country}
                  onChange={(event) => form.setData("country", event.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="phone_number">
                Phone <span className="u-faint">(optional, for couriers)</span>
              </label>
              <input
                id="phone_number"
                className="field__input"
                type="tel"
                autoComplete="tel"
                value={form.data.phone_number}
                onChange={(event) => form.setData("phone_number", event.target.value)}
              />
            </div>

            <button
              className="btn btn--primary btn--sm"
              type="submit"
              disabled={form.processing}
              style={{ alignSelf: "flex-start" }}
            >
              {form.processing ? "Saving..." : "Save details"}
            </button>
            </div>
          </form>

          <div className="panel">
            <div className="panel__head">
              <h2 className="panel__title">Hackatime</h2>
              <Status tone={maker.hackatimeConnected ? "ok" : "warn"}>
                {maker.hackatimeConnected ? "Connected" : "Not connected"}
              </Status>
            </div>
            {maker.hackatimeConnected ? (
              <p className="u-xs u-faint">{maker.hackatimeProjects} projects visible</p>
            ) : (
              <form action="/auth/hackatime" method="post">
                <input type="hidden" name="authenticity_token" value={csrfToken} />
                <button className="btn btn--ghost btn--sm" type="submit">
                  Connect Hackatime
                </button>
              </form>
            )}
          </div>

          <div className="panel">
            <div className="panel__head">
              <h2 className="panel__title">Coins</h2>
              <Link className="btn btn--ghost btn--sm" href="/orders">
                Your orders
              </Link>
            </div>
            <div style={{ display: "flex", gap: "var(--sp-6)", flexWrap: "wrap" }}>
              <div>
                <b className="u-mono" style={{ fontSize: "1.3rem" }}>
                  {coins.earned}
                </b>
                <p className="u-xs u-faint">Earned</p>
              </div>
              {coins.adjusted !== 0 && (
                <div>
                  <b className="u-mono" style={{ fontSize: "1.3rem" }}>
                    {coins.adjusted > 0 ? "+" : ""}
                    {coins.adjusted}
                  </b>
                  <p className="u-xs u-faint">Adjusted</p>
                </div>
              )}
              <div>
                <b className="u-mono" style={{ fontSize: "1.3rem" }}>
                  {coins.held}
                </b>
                <p className="u-xs u-faint">Held</p>
              </div>
              <div>
                <b className="u-mono" style={{ fontSize: "1.3rem", color: "var(--lime-700)" }}>
                  {coins.spendable}
                </b>
                <p className="u-xs u-faint">Spendable</p>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </>
  )
}
