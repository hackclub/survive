import type { CSSProperties } from "react"

export function SkeletonBlock({
  width,
  height,
  className,
}: {
  width?: string
  height?: string
  className?: string
}) {
  const style: CSSProperties = {}
  if (width) style.width = width
  if (height) style.height = height

  return <span className={`skeleton${className ? ` ${className}` : ""}`} style={style} />
}

export function SkeletonText({ width = "100%" }: { width?: string }) {
  return <span className="skeleton skeleton--text" style={{ display: "block", width }} />
}

export function SkeletonAvatar() {
  return <span className="skeleton-avatar" />
}

export function SkeletonCards() {
  return (
    <div className="camp__grid" aria-hidden="true">
      <div className="skeleton-card skeleton-card--tall" />
      <div className="camp__pair">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
    </div>
  )
}

export function SkeletonRows({ rows = 5, height = "2.6rem" }: { rows?: number; height?: string }) {
  return (
    <div className="skeleton-rows" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonBlock key={index} height={height} />
      ))}
    </div>
  )
}

export function SkeletonTableRows({ columns, rows = 6 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <tr key={`skeleton-${row}`} aria-hidden="true">
          {Array.from({ length: columns }, (_, column) => (
            <td key={column}>
              <SkeletonText width={column === 0 ? "70%" : "45%"} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function SkeletonShopList({ rows = 8 }: { rows?: number }) {
  return (
    <div className="shop-grid" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div className="shop-card" key={index}>
          <div className="shop-card__image skeleton" />
          <div className="shop-card__body">
            <SkeletonText width="70%" />
            <SkeletonText width="90%" />
            <div className="shop-card__price">
              <SkeletonBlock width="3rem" height="1.2rem" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonPanels({ count = 3, lines = 3 }: { count?: number; lines?: number }) {
  return (
    <div className="skeleton-detail" aria-hidden="true">
      {Array.from({ length: count }, (_, panel) => (
        <div className="panel" key={panel}>
          <SkeletonText width="30%" />
          {Array.from({ length: lines }, (_, line) => (
            <SkeletonText key={line} width={line === lines - 1 ? "55%" : "100%"} />
          ))}
        </div>
      ))}
    </div>
  )
}
