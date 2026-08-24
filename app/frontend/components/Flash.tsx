import { useEffect, useState } from "react"
import { usePage } from "@inertiajs/react"
import type { SharedProps } from "../types"

const COIN_HINT = /\bwood\b/i

export function Flash() {
  const { flash } = usePage<SharedProps>().props
  const [dismissed, setDismissed] = useState<string[]>([])

  const items = [
    flash.notice ? { kind: "notice" as const, text: flash.notice } : null,
    flash.alert ? { kind: "alert" as const, text: flash.alert } : null,
  ].filter((item) => item !== null && !dismissed.includes(item.text)) as Array<{
    kind: "notice" | "alert"
    text: string
  }>

  useEffect(() => {
    const notice = flash.notice
    if (!notice) return

    const timer = window.setTimeout(() => setDismissed((list) => [...list, notice]), 6000)
    return () => window.clearTimeout(timer)
  }, [flash.notice])

  if (items.length === 0) return null

  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map((item) => {
        const coins = item.kind === "notice" && COIN_HINT.test(item.text)

        return (
          <div
            key={item.text}
            className={`toast toast--${item.kind}${coins ? " toast--coins" : ""}`}
          >
            {coins ? (
              <span className="coin" aria-hidden="true" />
            ) : (
              <span className="toast__dot" aria-hidden="true" />
            )}
            {item.text}
            <button
              type="button"
              className="toast__close"
              onClick={() => setDismissed((list) => [...list, item.text])}
            >
              close
            </button>
            {item.kind === "notice" && <span className="toast__timer" aria-hidden="true" />}
          </div>
        )
      })}
    </div>
  )
}
