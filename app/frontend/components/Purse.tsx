import { useEffect, useRef, useState } from "react"

type Props = {
  spendable: number
  earned: number
  adjusted: number
  held: number
  heldOrders: number
}

// The wood image is embedded directly in this file.
// Replace WOOD_IMAGE_DATA with the Base64 data from the PNG.
const WOOD_IMAGE_DATA = "data:image/png;base64,PASTE_BASE64_HERE"

function WoodIcon({ size = 30 }: { size?: number }) {
  return (
    <img
      src={WOOD_IMAGE_DATA}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      draggable={false}
      style={{
        display: "block",
        objectFit: "contain",
        flexShrink: 0,
      }}
    />
  )
}

export function Purse({
  spendable,
  earned,
  adjusted,
  held,
  heldOrders,
}: Props) {
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
      if (!box.current?.contains(event.target as Node)) {
        setOpen(false)
      }
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
        <WoodIcon size={30} />

        <b className={`purse__amount${landing ? " is-landing" : ""}`}>
          {spendable}
        </b>

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
                Held by {heldOrders}{" "}
                {heldOrders === 1 ? "order" : "orders"}
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
