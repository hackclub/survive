import { Head } from "@inertiajs/react"
import { Nav } from "../../components/Nav"
import { Flash } from "../../components/Flash"
import { Scout } from "../../components/Scout"

export default function SignIn() {
  const csrfToken =
    typeof document !== "undefined"
      ? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || ""
      : ""

  return (
    <>
      <Head title="Sign in - Survive" />

      <div className="shell">
        <header className="band signin">
          <Nav />

          <div className="signin__card">
            <Scout className="signin__scout" />
            <form action="/auth/hack_club" method="post">
              <input type="hidden" name="authenticity_token" value={csrfToken} />
              <button className="btn btn--primary btn--lg" type="submit">
                Continue with Hack Club
              </button>
            </form>
          </div>
        </header>

        <Flash />
      </div>
    </>
  )
}
