import { useState } from "react"
import type { CheckResult, ChecksResult } from "../types"

function blockingFailures(results: CheckResult[]) {
  return results.filter((r) => r.blocking && r.verdict === "fail")
}

function advisoryFailures(results: CheckResult[]) {
  return results.filter((r) => !r.blocking && r.verdict !== "pass")
}

function unresolved(results: CheckResult[]) {
  return results.filter((r) => r.blocking && r.verdict === "uncertain")
}

function settled(results: CheckResult[]) {
  return results.filter((r) => r.verdict === "pass")
}

function Row({ result, tone }: { result: CheckResult; tone: "ok" | "no" | "warn" }) {
  return (
    <li className="checklist__row">
      <span className={`checklist__mark checklist__mark--${tone}`} aria-hidden="true">
        {tone === "ok" ? "✓" : tone === "no" ? "×" : "!"}
      </span>
      <span className="checklist__body">
        <span className="checklist__name">{result.name}</span>
        <span className="checklist__why">{result.reasoning}</span>
      </span>
    </li>
  )
}

export function Checklist({ checks }: { checks: ChecksResult }) {
  const [showAll, setShowAll] = useState(false)
  const results = checks.requirements
  const blockers = blockingFailures(results)
  const unknown = unresolved(results)
  const advisory = advisoryFailures(results)
  const passing = settled(results)
  const ready = passing.length
  const total = results.length

  const heading =
    blockers.length === 0
      ? "Ready to submit"
      : `${blockers.length} thing${blockers.length === 1 ? "" : "s"} left`

  return (
    <section className="checklist">
      <header className="checklist__head">
        <h2 className="u-h3">{heading}</h2>
        <span className={`tag ${blockers.length === 0 ? "tag--ok" : "tag--warn"}`}>
          {ready} of {total} ready
        </span>
      </header>

      <div className="checklist__meter">
        <span
          className="checklist__meter-fill"
          style={{ width: `${total === 0 ? 0 : (ready / total) * 100}%` }}
        />
      </div>

      <ul className="checklist__rows">
        {blockers.map((result) => (
          <Row key={result.key} result={result} tone="no" />
        ))}
        {unknown.map((result) => (
          <Row key={result.key} result={result} tone="warn" />
        ))}
        {advisory.map((result) => (
          <Row key={result.key} result={result} tone="warn" />
        ))}

        {passing.length > 0 && !showAll && (
          <li className="checklist__row">
            <span className="checklist__mark checklist__mark--ok" aria-hidden="true">
              {"✓"}
            </span>
            <span className="checklist__body">
              <span className="checklist__name">
                {passing.length} other{passing.length === 1 ? "" : "s"} ready
              </span>
              <span className="checklist__why">
                {passing.map((result) => result.name).join(", ")}.
              </span>
            </span>
            <button className="btn btn--quiet btn--sm" type="button" onClick={() => setShowAll(true)}>
              Show all
            </button>
          </li>
        )}

        {showAll && passing.map((result) => <Row key={result.key} result={result} tone="ok" />)}
      </ul>
    </section>
  )
}
