import { Head, Link } from "@inertiajs/react"
import { AppShell } from "../../components/AppShell"
import { Status } from "../../components/Status"

type Maker = {
  name: string
  email: string
  hackatimeConnected: boolean
  hackatimeProjects: number
  roles: string[]
  banned: boolean
  bannedReason: string | null
}

type Coins = { earned: number; adjusted: number; held: number; spendable: number }

export default function Show({ maker, coins }: { maker: Maker; coins: Coins }) {
  const csrfToken =
    typeof document !== "undefined"
      ? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || ""
      : ""

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

        <div className="camp__grid">
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
