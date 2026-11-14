import { useEffect, useRef } from "react"

declare global {
  interface Window {
    L?: any
    __surviveLeaflet?: Promise<void>
  }
}

type HikePin = { id: number; name: string; trail: string; region: string; startsAt: string; latitude: number | null; longitude: number | null; status?: string }
const EMPTY_HIKES: HikePin[] = []

function loadLeaflet() {
  if (window.L) return Promise.resolve()
  if (!window.__surviveLeaflet) {
    window.__surviveLeaflet = new Promise<void>((resolve, reject) => {
      if (!document.querySelector('link[data-leaflet="true"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        link.dataset.leaflet = "true"
        document.head.appendChild(link)
      }
      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Could not load the map. Check your connection and try again."))
      document.head.appendChild(script)
    })
  }
  return window.__surviveLeaflet
}

export function HikeMap({ hikes = EMPTY_HIKES, editable = false, selected, onSelect, height = 390 }: {
  hikes?: HikePin[]
  editable?: boolean
  selected?: { latitude: number; longitude: number } | null
  onSelect?: (latitude: number, longitude: number) => void
  height?: number
}) {
  const element = useRef<HTMLDivElement>(null)
  const onSelectRef = useRef(onSelect)
  const selectedRef = useRef(selected)
  onSelectRef.current = onSelect
  selectedRef.current = selected

  useEffect(() => {
    let map: any
    let alive = true
    loadLeaflet().then(() => {
      if (!alive || !element.current || !window.L) return
      const L = window.L
      const currentSelection = selectedRef.current
      const firstPin = hikes.find(h => h.latitude != null && h.longitude != null)
      const center: [number, number] = currentSelection
        ? [currentSelection.latitude, currentSelection.longitude]
        : firstPin
          ? [firstPin.latitude!, firstPin.longitude!]
          : editable ? [-33.8, 151.2] : [20, 0]
      map = L.map(element.current).setView(center, editable ? 10 : (firstPin ? 11 : 2))
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map)

      if (editable) {
        let marker: any
        if (currentSelection) marker = L.marker(center).addTo(map)
        map.on("click", (event: any) => {
          const lat = Number(event.latlng.lat.toFixed(6))
          const lng = Number(event.latlng.lng.toFixed(6))
          if (marker) marker.setLatLng([lat, lng])
          else marker = L.marker([lat, lng]).addTo(map)
          onSelectRef.current?.(lat, lng)
        })
      } else {
        const pins = hikes.filter(h => h.latitude != null && h.longitude != null)
        const bounds: any[] = []
        pins.forEach(hike => {
          const point: [number, number] = [hike.latitude!, hike.longitude!]
          L.marker(point).addTo(map).bindPopup(`<strong>${escapePopup(hike.name)}</strong><br>${escapePopup(hike.trail)} · ${escapePopup(hike.region)}<br>${escapePopup(hike.startsAt)}${hike.status === "pending" ? "<br>Awaiting admin approval" : ""}`)
          bounds.push(point)
        })
        if (bounds.length > 1) map.fitBounds(L.latLngBounds(bounds), { padding: [28, 28], maxZoom: 12 })
      }
      setTimeout(() => map?.invalidateSize(), 100)
    }).catch(() => {
      if (element.current) element.current.textContent = "The map couldn't load. Please refresh or check your connection."
    })
    return () => { alive = false; map?.remove() }
  }, [hikes, editable])

  return <div ref={element} style={{ width: "100%", height, borderRadius: 12, overflow: "hidden", background: "var(--surface-2, #eee)" }} aria-label={editable ? "Choose the hike location by clicking the map" : "Map of upcoming public hikes"} />
}

function escapePopup(value: string) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!)
}
