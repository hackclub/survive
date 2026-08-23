const SPARKS = [
  { left: "12%", size: 4, life: 8, delay: 0, drift: 30, climb: -280 },
  { left: "27%", size: 3, life: 6.6, delay: 2.2, drift: -22, climb: -240 },
  { left: "44%", size: 4, life: 9, delay: 1.1, drift: 34, climb: -320 },
  { left: "61%", size: 3, life: 7.4, delay: 3.4, drift: -28, climb: -260 },
  { left: "78%", size: 4, life: 8.4, delay: 0.7, drift: 24, climb: -300 },
  { left: "89%", size: 3, life: 7, delay: 4.1, drift: -18, climb: -230 },
]

export function Embers() {
  return (
    <div className="embers" aria-hidden="true">
      {SPARKS.map((spark) => (
        <span
          key={spark.left}
          className="embers__spark"
          style={
            {
              left: spark.left,
              "--size": `${spark.size}px`,
              "--life": `${spark.life}s`,
              "--delay": `${spark.delay}s`,
              "--drift": `${spark.drift}px`,
              "--climb": `${spark.climb}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
