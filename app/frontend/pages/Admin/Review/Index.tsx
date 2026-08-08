import { Head } from "@inertiajs/react"
import { Nav } from "../../../components/Nav"
import { Flash } from "../../../components/Flash"

export default function Index() {
  return (
    <>
      <Head title="Review - Survive" />

      <Nav />

      <main id="main" className="dashboard">
        <div className="dashboard__shell">
          <Flash />

          <div className="dashboard__header">
            <h1 className="dashboard__title">Review queue</h1>
          </div>

          <p className="u-lead u-soft">The queue is coming together, check back soon.</p>
        </div>
      </main>
    </>
  )
}
