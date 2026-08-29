export function initMotion(): () => void {
  const cleanups: Array<() => void> = []

  document.querySelectorAll("[data-acc]").forEach((group) => {
    group.querySelectorAll(".acc").forEach((item) => {
      const btn = item.querySelector<HTMLButtonElement>(".acc__btn")
      const panel = item.querySelector<HTMLElement>(".acc__panel")
      if (!btn || !panel) return

      const onClick = () => {
        const open = item.classList.contains("is-open")
        group.querySelectorAll(".acc").forEach((other) => {
          other.classList.remove("is-open")
          other.querySelector(".acc__btn")?.setAttribute("aria-expanded", "false")
          other.querySelector(".acc__panel")?.setAttribute("aria-hidden", "true")
        })
        if (!open) {
          item.classList.add("is-open")
          btn.setAttribute("aria-expanded", "true")
          panel.setAttribute("aria-hidden", "false")
        }
      }

      btn.addEventListener("click", onClick)
      cleanups.push(() => btn.removeEventListener("click", onClick))
    })
  })

  return () => cleanups.forEach((fn) => fn())
}
