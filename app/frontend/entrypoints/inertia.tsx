import { createInertiaApp } from '@inertiajs/react'

import '../styles/tokens.css'
import '../styles/layout.css'
import '../styles/nav.css'
import '../styles/buttons.css'
import '../styles/scene.css'
import '../styles/trail.css'

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
