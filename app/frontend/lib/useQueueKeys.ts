import { useEffect, useState } from "react"

type Options = {
  count: number
  onOpen?: (index: number) => void
  onEscape?: () => void
  tabs?: string[]
  onTab?: (href: string) => void
}

function typing(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable
}

export function useQueueKeys({ count, onOpen, onEscape, tabs, onTab }: Options) {
  const [cursor, setCursor] = useState(0)

  useEffect(() => {
    if (cursor > count - 1) setCursor(Math.max(0, count - 1))
  }, [count, cursor])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === "Escape") {
        onEscape?.()
        return
      }

      if (typing(event.target)) return

      if (event.key === "/") {
        event.preventDefault()
        document.querySelector<HTMLInputElement>("[data-queue-search]")?.focus()
        return
      }

      if (event.key === "j") {
        event.preventDefault()
        setCursor((value) => Math.min(count - 1, value + 1))
        return
      }

      if (event.key === "k") {
        event.preventDefault()
        setCursor((value) => Math.max(0, value - 1))
        return
      }

      if (event.key === "Enter" && count > 0) {
        event.preventDefault()
        onOpen?.(cursor)
        return
      }

      if (tabs && onTab && /^[1-9]$/.test(event.key)) {
        const target = tabs[Number(event.key) - 1]
        if (target) {
          event.preventDefault()
          onTab(target)
        }
      }
    }

    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [count, cursor, onOpen, onEscape, tabs, onTab])

  return { cursor, setCursor }
}
