import { useEffect, useState } from "react"
import { router } from "@inertiajs/react"

export function useVisiting() {
  const [visiting, setVisiting] = useState(false)

  useEffect(() => {
    const offStart = router.on("start", () => setVisiting(true))
    const offFinish = router.on("finish", () => setVisiting(false))

    return () => {
      offStart()
      offFinish()
    }
  }, [])

  return visiting
}
