import type { ReactNode } from "react"

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
      {title && <h3 className="empty__title">{title}</h3>}
      {text && <p className="empty__text">{text}</p>}
      {action}
    </div>
  )
}
