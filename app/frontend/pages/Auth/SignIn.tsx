import { Head } from "@inertiajs/react"
import { Nav } from "../../components/Nav"

export default function SignIn() {
  const csrfToken =
    typeof document !== "undefined"
      ? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || ""
      : ""

  return (
    <>
      <Head title="Sign in - Survive" />

      <Nav />

      <main id="main" className="signin">
        <div className="signin__card">
          <h1 className="signin__title">Sign in to Survive</h1>
          <p className="signin__note">
            One click with your Hack Club account. If you don't have one yet, making it takes
            about a minute.
          </p>
          <form action="/auth/hack_club" method="post">
            <input type="hidden" name="authenticity_token" value={csrfToken} />
            <button className="btn btn--primary btn--lg" type="submit">
              Continue with Hack Club
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
