import { createInertiaApp, router } from '@inertiajs/react'

import '../styles/tokens.css'
import '../styles/layout.css'
import '../styles/nav.css'
import '../styles/band.css'
import '../styles/purse.css'
import '../styles/camp.css'
import '../styles/ptrail.css'
import '../styles/feedback.css'
import '../styles/buttons.css'
import '../styles/scene.css'
import '../styles/trail.css'
import '../styles/faq.css'
import '../styles/footer.css'
import '../styles/signin.css'
import '../styles/dashboard.css'
import '../styles/project-form.css'
import '../styles/flash.css'
import '../styles/admin-layout.css'
import '../styles/rail.css'
import '../styles/status.css'
import '../styles/table.css'
import '../styles/checklist.css'
import '../styles/final-review.css'
import '../styles/shop.css'
import '../styles/hub.css'

router.on("before", (event) => {
  const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
  if (csrfToken) {
    event.detail.visit.headers["X-CSRF-Token"] = csrfToken
  }
})

router.on("success", () => {
  const root = document.getElementById("app")
  if (!root) return

  root.dataset.entering = "true"
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      delete root.dataset.entering
    })
  })
})

void createInertiaApp({
  pages: "../pages",

  strictMode: true,

  defaults: {
    form: {
      forceIndicesArrayFormatInFormData: false,
      withAllErrors: true,
    },
    visitOptions: () => {
      return { queryStringArrayFormat: "brackets" }
    },
  },
});
