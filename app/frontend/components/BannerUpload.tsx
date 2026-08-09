import { useEffect, useState } from "react"

export function BannerUpload({
  file,
  currentUrl,
  onChange,
}: {
  file: File | null
  currentUrl?: string | null
  onChange: (file: File | null) => void
}) {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const displayUrl = preview ?? currentUrl ?? null

  return (
    <div className="banner-upload">
      <label className="banner-upload__frame" htmlFor="banner">
        {displayUrl ? (
          <img className="banner-upload__image" src={displayUrl} alt="" />
        ) : (
          <span className="banner-upload__placeholder u-sm u-faint">No banner yet</span>
        )}
      </label>
      <input
        id="banner"
        className="banner-upload__input"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}
