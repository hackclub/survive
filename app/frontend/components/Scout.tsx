import type { CSSProperties } from "react"
import raccoon from "../images/raccoon.webp"

export function Scout({ className, style }: { className?: string; style?: CSSProperties }) {
  return <img className={className} style={style} src={raccoon} alt="" loading="lazy" />
}
