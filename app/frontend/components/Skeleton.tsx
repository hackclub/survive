export function SkeletonCards() {
  return (
    <div className="camp__grid" aria-hidden="true">
      <div className="skeleton skeleton-card skeleton-card--tall" />
      <div className="camp__pair">
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </div>
    </div>
  )
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }} aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="skeleton" style={{ height: "2.6rem" }} />
      ))}
    </div>
  )
}
