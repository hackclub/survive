import { usePage } from "@inertiajs/react"

export function Flash() {
  const { flash } = usePage()

  if (!flash.notice && !flash.alert) return null

  return (
    <div className="flash">
      {flash.notice && <div className="flash__banner flash__banner--notice">{flash.notice}</div>}
      {flash.alert && <div className="flash__banner flash__banner--alert">{flash.alert}</div>}
    </div>
  )
}
