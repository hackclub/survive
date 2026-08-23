import type { ReactNode } from "react"
import { Scout } from "./Scout"

export function Empty({
  title,
  text,
  action,
  idle,
}: {
  title?: string
  text?: string
  action?: ReactNode
  idle?: boolean
}) {
  return (
    <div className={`empty${idle ? " empty--idle" : ""}`}>
      <Scout className="empty__scout" />
      {title && <h3 className="empty__title">{title}</h3>}
      {text && <p className="empty__text">{text}</p>}
      {action}
    </div>
  )
}
