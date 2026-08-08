import { Head } from "@inertiajs/react"
import { Nav } from "../../components/Nav"

export default function SignIn() {
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
          <a className="btn btn--primary btn--lg" href="/auth/hca/start">
            Continue with Hack Club
          </a>
        </div>
      </main>
    </>
  )
}
