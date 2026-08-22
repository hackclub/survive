export function formatHours(seconds: number) {
  const hours = seconds / 3600
  if (hours < 0.1) return "< 0.1 hrs"
  return `${hours.toFixed(1)} hrs`
}

export function formatMinutes(minutes: number) {
  const whole = Math.max(0, Math.round(minutes))
  const hours = Math.floor(whole / 60)
  const rest = whole % 60
  return hours > 0 ? `${hours}h ${rest}m` : `${rest}m`
}

export function humanizeField(field: string) {
  if (field === "base") return ""
  return field
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
