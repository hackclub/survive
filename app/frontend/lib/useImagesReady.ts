import { useEffect, useRef, useState } from "react"

const GIVE_UP_AFTER_MS = 4000

// True once every <img> inside the ref has loaded (or failed), so a layered scene can
// appear in one go instead of popping in a layer at a time. Never waits longer than
// GIVE_UP_AFTER_MS, so a slow image can't hide the page.
export function useImagesReady<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const images = Array.from(ref.current?.querySelectorAll("img") ?? [])
    const pending = images.filter((image) => !image.complete)
    if (pending.length === 0) {
      setReady(true)
      return
    }

    let remaining = pending.length
    const settle = () => {
      remaining -= 1
      if (remaining === 0) setReady(true)
    }

    pending.forEach((image) => {
      image.addEventListener("load", settle)
      image.addEventListener("error", settle)
    })
    const timer = window.setTimeout(() => setReady(true), GIVE_UP_AFTER_MS)

    return () => {
      window.clearTimeout(timer)
      pending.forEach((image) => {
        image.removeEventListener("load", settle)
        image.removeEventListener("error", settle)
      })
    }
  }, [])

  return [ref, ready] as const
}
