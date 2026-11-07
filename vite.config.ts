import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Cuba's 163 stylesheets are written with `@import`, which Dart Sass
        // deprecated in favour of `@use`/`@forward`. Rewriting them would mean
        // rewriting the theme, so the warnings are silenced instead. `@import`
        // still works and is only removed in Dart Sass 3.
        silenceDeprecations: [
          'import',
          'global-builtin',
          'color-functions',
          'mixed-decls',
          'slash-div',
        ],
      },
    },
    lightningcss: {
      // Cuba's own source has an invalid custom property: style.scss declares
      // `-semi-dark: #1d1e26` with one dash instead of two, and
      // layout/_rtl.scss then reads it as `var(-semi-dark)`. LightningCSS
      // refuses to parse it; Cuba's CRA/webpack build let it through, and
      // browsers drop the declaration, so that border has never rendered in
      // Cuba either.
      //
      // Recovering rather than correcting the typo is deliberate: fixing it
      // would make an RTL dark-mode border appear that the template does not
      // show, which is a visual change to a design we are supposed to be
      // reproducing exactly. If Pixelstrap fix it upstream, drop this.
      errorRecovery: true,
    },
  },
  server: {
    // The API has no CORS configured (hello_fit_backend/src/main.ts calls
    // setGlobalPrefix but never enableCors), so the panel talks to it through
    // a dev proxy and stays same-origin. Production serves both behind one
    // origin, or the backend grows an allow-list -- a deployment decision,
    // not something to enable blindly.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
