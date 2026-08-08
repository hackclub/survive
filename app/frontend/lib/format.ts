export function formatHours(seconds: number) {
  const hours = seconds / 3600
  if (hours < 0.1) return "< 0.1 hrs"
  return `${hours.toFixed(1)} hrs`
}

export function humanizeField(field: string) {
  if (field === "base") return ""
  return field
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
