import { createInertiaApp } from '@inertiajs/react'

import '../styles/tokens.css'
import '../styles/layout.css'
import '../styles/nav.css'
import '../styles/buttons.css'
import '../styles/scene.css'
import '../styles/trail.css'
import '../styles/faq.css'
import '../styles/footer.css'
import '../styles/signin.css'
import '../styles/dashboard.css'
import '../styles/project-form.css'

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
