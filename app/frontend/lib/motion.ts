const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const rand = (a: number, b: number) => a + Math.random() * (b - a)

function initNav(cleanups: Array<() => void>) {
  const nav = document.querySelector<HTMLElement>("[data-nav]")
  if (!nav) return

  const burger = nav.querySelector<HTMLButtonElement>("[data-burger]")
  if (burger) {
    const onBurgerClick = () => {
      const open = nav.classList.toggle("is-open")
      burger.setAttribute("aria-expanded", String(open))
    }
    burger.addEventListener("click", onBurgerClick)
    cleanups.push(() => burger.removeEventListener("click", onBurgerClick))

    const onLinkClick = () => {
      nav.classList.remove("is-open")
      burger.setAttribute("aria-expanded", "false")
    }
    nav.querySelectorAll(".nav__link").forEach((a) => a.addEventListener("click", onLinkClick))
    cleanups.push(() =>
      nav.querySelectorAll(".nav__link").forEach((a) => a.removeEventListener("click", onLinkClick))
    )
  }

  const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 24)
  onScroll()
  window.addEventListener("scroll", onScroll, { passive: true })
  cleanups.push(() => window.removeEventListener("scroll", onScroll))
}

function initReveals(reduced: boolean, cleanups: Array<() => void>) {
  const targets = document.querySelectorAll<HTMLElement>("[data-reveal]")
  if (!targets.length) return

  if (reduced || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-in"))
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add("is-in")
        io.unobserve(entry.target)
      })
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  )

  targets.forEach((el) => io.observe(el))
  cleanups.push(() => io.disconnect())
}

function initAccordion(cleanups: Array<() => void>) {
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
}

function initEmbers(reduced: boolean) {
  const hosts = [...document.querySelectorAll<HTMLElement>("[data-embers]")]
  if (!hosts.length || reduced) return

  const total = window.innerWidth < 720 ? 12 : 22

  hosts.forEach((host) => {
    const frag = document.createDocumentFragment()

    for (let i = 0; i < total; i += 1) {
      const e = document.createElement("span")
      e.className = "ember"
      e.style.setProperty("--size", `${rand(2, 6).toFixed(1)}px`)
      e.style.setProperty("--delay", `${rand(0, 7).toFixed(2)}s`)
      e.style.setProperty("--life", `${rand(4.5, 9).toFixed(2)}s`)
      e.style.setProperty("--drift", `${rand(-90, 140).toFixed(0)}px`)
      e.style.setProperty("--climb", `${rand(-260, -560).toFixed(0)}px`)
      e.style.marginInlineStart = `${rand(-46, 46).toFixed(0)}px`
      e.style.marginBlockEnd = `${rand(-14, 26).toFixed(0)}px`
      frag.appendChild(e)
    }

    host.appendChild(frag)
  })
}

function initTitle() {
  document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
    const text = el.textContent?.trim() ?? ""
    el.textContent = ""
    ;[...text].forEach((ch, i) => {
      const span = document.createElement("span")
      span.textContent = ch === " " ? " " : ch
      span.style.setProperty("--i", String(i))
      el.appendChild(span)
    })
  })
}

function initParallax(reduced: boolean, cleanups: Array<() => void>) {
  const scenes = [...document.querySelectorAll<HTMLElement>("[data-scene]")]
  if (reduced || !scenes.length) return

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  let ticking = false
  let raf = 0

  const fine = window.matchMedia("(pointer: fine)").matches
  const onPointerMove = (ev: PointerEvent) => {
    pointer.tx = ev.clientX / window.innerWidth - 0.5
    pointer.ty = ev.clientY / window.innerHeight - 0.5
  }
  if (fine) {
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    cleanups.push(() => window.removeEventListener("pointermove", onPointerMove))
  }

  const frame = () => {
    ticking = false
    pointer.x += (pointer.tx - pointer.x) * 0.07
    pointer.y += (pointer.ty - pointer.y) * 0.07

    scenes.forEach((scene) => {
      const rect = scene.getBoundingClientRect()
      const travelled = clamp(-rect.top, 0, rect.height)

      scene.querySelectorAll<HTMLElement>("[data-depth]").forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth ?? "0") || 0
        const grow = parseFloat(layer.dataset.grow ?? "0") || 0
        const sway = parseFloat(layer.dataset.sway ?? "0") || 0
        layer.style.setProperty("--py", `${(travelled * depth).toFixed(2)}px`)
        layer.style.setProperty("--px", `${(pointer.x * sway * -1).toFixed(2)}px`)
        layer.style.setProperty(
          "--sc",
          (1.06 + (travelled / Math.max(rect.height, 1)) * grow).toFixed(4)
        )
      })
    })

    if (fine) raf = requestAnimationFrame(frame)
  }

  const request = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(frame)
  }

  window.addEventListener("scroll", request, { passive: true })
  window.addEventListener("resize", request, { passive: true })
  raf = requestAnimationFrame(frame)

  cleanups.push(() => {
    window.removeEventListener("scroll", request)
    window.removeEventListener("resize", request)
    cancelAnimationFrame(raf)
  })
}

export function initMotion(): () => void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const cleanups: Array<() => void> = []

  initNav(cleanups)
  initTitle()
  initReveals(reduced, cleanups)
  initAccordion(cleanups)
  initEmbers(reduced)
  initParallax(reduced, cleanups)

  return () => cleanups.forEach((fn) => fn())
}
