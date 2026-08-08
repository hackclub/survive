import { useState } from "react"
import { formatHours } from "../lib/format"
import type { HackatimeProject } from "../types"

export function HackatimeProjectPicker({
  options,
  onSelect,
  placeholder = "Search your Hackatime projects",
}: {
  options: HackatimeProject[]
  onSelect: (option: HackatimeProject) => void
  placeholder?: string
}) {
  const [query, setQuery] = useState("")
  const trimmed = query.trim().toLowerCase()

  const matches =
    trimmed.length === 0
      ? []
      : options.filter((option) => option.name.toLowerCase().includes(trimmed)).slice(0, 8)

  return (
    <div className="hackatime-picker">
      <input
        className="field__input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />
      {matches.length > 0 && (
        <ul className="hackatime-picker__results">
          {matches.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                className="hackatime-picker__result"
                onClick={() => {
                  onSelect(option)
                  setQuery("")
                }}
              >
                <span className="u-mono u-sm">{option.name}</span>
                <span className="u-sm u-faint">{formatHours(option.seconds)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {trimmed.length > 0 && matches.length === 0 && (
        <p className="u-sm u-faint hackatime-picker__empty">No matches.</p>
      )}
    </div>
  )
}
