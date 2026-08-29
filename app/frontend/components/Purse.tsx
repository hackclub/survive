import { useEffect, useRef, useState } from "react"

type Props = {
  spendable: number
  earned: number
  adjusted: number
  held: number
  heldOrders: number
}

export function Purse({ spendable, earned, adjusted, held, heldOrders }: Props) {
  const [open, setOpen] = useState(false)
  const [landing, setLanding] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const previous = useRef(spendable)

  useEffect(() => {
    if (previous.current === spendable) return
    previous.current = spendable
    setLanding(true)
    const timer = window.setTimeout(() => setLanding(false), 520)
    return () => window.clearTimeout(timer)
  }, [spendable])

  useEffect(() => {
    if (!open) return
    const onAway = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onAway)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onAway)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div
      className="nav__menu"
      ref={box}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="purse"
        aria-expanded={open}
        aria-label={`${spendable} wood to spend`}
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
      >
        <span className="coin" aria-hidden="true" />
        <b className={`purse__amount${landing ? " is-landing" : ""}`}>{spendable}</b>
        <span className="purse__unit">wood</span>
      </button>
      {open && (
        <div className="purse__pop">
          <div className="purse__row">
            <span className="u-soft">Earned</span>
            <span>{earned}</span>
          </div>
          {adjusted !== 0 && (
            <div className="purse__row">
              <span className="u-soft">Adjusted</span>
              <span>
                {adjusted > 0 ? "+" : ""}
                {adjusted}
              </span>
            </div>
          )}
          {held > 0 && (
            <div className="purse__row">
              <span className="u-soft">
                Held by {heldOrders} {heldOrders === 1 ? "order" : "orders"}
              </span>
              <span>&minus;{held}</span>
            </div>
          )}
          <div className="purse__row purse__row--total">
            <span>Spendable</span>
            <span>{spendable}</span>
          </div>
        </div>
      )}
    </div>
  )
}
