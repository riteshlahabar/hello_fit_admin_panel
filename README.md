# HelloFit admin panel

React 19 + Vite 8 + TypeScript. The admin surface for the HelloFit platform,
talking to the NestJS API in `../hello_fit_backend`.

Project index: `../claude.md` · state: `../state/` · history: `../worklog/`.

## The design is Cuba

The UI is **Cuba 4.8.26** (Pixelstrap, ThemeForest), supplied by the client as
`../cuba_4-8-26.zip`. Per the project's no-invented-UI rule, screens are
converted from that template rather than designed here.

Cuba ships its React build as Create React App + JavaScript + React 17/18.
This project does not use it. What was taken is the **design**, ported into
this repo's own stack:

| Taken from Cuba | Where |
|---|---|
| The whole SCSS theme, 163 files, verbatim | `src/assets/scss/` |
| Icon fonts (themify, icofont, fontawesome, flag-icon, whether-icon) | `src/assets/fonts/`, `src/assets/scss/vendors/` |
| The 80-symbol icon sprite (40 `stroke-*` + 40 `fill-*`) | `public/svg/sprite.svg` |
| Layout shell — header, sidebar, footer, tap-top, loader | `src/Layout/` |
| The 23 `CommonElements` primitives and their `attr*` prop convention | `src/CommonElements/`, re-exported by `src/AbstractElements.ts` |
| Theme/layout state (12 layouts, dark mode, colours) | `src/Config/ThemeConfig.ts`, `src/Data/Layouts.ts`, `src/_helper/Customizer/` |
| Login screen markup | `src/Auth/Signin.tsx` |

Every ported file carries a header naming the Cuba file it came from and any
change made to it. Changes are mechanical only:

- `.jsx` → `.tsx`, props typed.
- CRA → Vite: `process.env.PUBLIC_URL` → `src/Config/base.ts`, `require()` of
  images → static imports, `~`-prefixed SCSS imports unprefixed.
- React 17 → 19: `ReactDOM.render` → `createRoot`; `CSSTransition` given a
  `nodeRef` because `findDOMNode` is gone.
- SVG filter primitives in the loader spelled `feGaussianBlur` /
  `feColorMatrix`, which is what JSX requires.
- Unguarded `document.querySelector(...)` dereferences use `?.`.

**The design itself is not modified.** Any visual difference from Cuba is a
bug, not a restyle.

### Deliberately not ported

- **`Layout/ThemeCustomizer/`** (~860 lines, 14 files). It is the template's
  showroom, not admin design: the header reads "PREVIEW SETTINGS / Try It Real
  Time" and the nav is four outbound Pixelstrap links, one of them an Envato
  "Buy Now" affiliate link. Its stylesheet is still imported, so nothing else
  changes. Port it if the in-product layout switcher is actually wanted.
- **`Header/Leftbar/NotificationSlider`** — three slides of Pixelstrap
  marketing copy, including the same Envato affiliate link. Its grid column is
  kept so the header layout is unchanged.
- **`BookmarkHeader` and `CartHeader`** — the template's bookmark-app and
  ecommerce-cart demos, each backed by a fake-data context.
- **Cuba's 22 other context providers** (chat, email, todo, kanban, product,
  wishlist, …). All hold demo data for template pages.
- **`Services/fack.backend.js`** — Cuba's fake backend, which intercepts
  `fetch` and answers from a hard-coded array. Replaced by `src/Services/api.ts`.
- Cuba's login social buttons (plain links to LinkedIn/Twitter/Facebook) and
  "Create Account" — there is no admin self-signup.

### Known Cuba quirks left in place

- `style.scss` declares `-semi-dark` with one dash instead of two and
  `layout/_rtl.scss` reads it as `var(-semi-dark)`. Invalid CSS that browsers
  drop, in Cuba too. LightningCSS is set to `errorRecovery` rather than the
  typo being corrected — fixing it would make a border appear that the template
  does not show. See `vite.config.ts`.
- Cuba's SCSS uses `@import`, deprecated by Dart Sass. Warnings are silenced in
  `vite.config.ts`; rewriting to `@use` would mean rewriting the theme.
- The default avatar (`assets/images/dashboard/profile.png`) is Cuba's blank
  35×35 starter-kit placeholder. The full template ships real ones.
- `StrictMode` is off in `src/main.tsx`: Cuba's sidebar mutates `active` in
  place on its menu objects and double-invoked effects fight it.

## What is not Cuba

`src/Services/api.ts` and `src/_helper/Auth/` are written for this project.
They implement the backend's real contract: the
`{ success, data, meta, message }` envelope, `{ success: false, error }` on
failure, admin-audience bearer tokens, and **single-flight** refresh rotation
(the backend rotates refresh tokens and detects replay, so two concurrent
refreshes would log the admin out).

Permissions on the client are for rendering only. `PermissionsGuard` on the
server re-checks every request.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint     # oxlint
```

The API needs to be up on port 3000 (`cd ../hello_fit_backend && npm run build
&& node -r dotenv/config dist/main.js`). The backend has **no CORS**
configured, so `vite.config.ts` proxies `/api` to it and the browser stays
same-origin. Set `VITE_API_BASE_URL` only when serving the panel from a
different origin — which also needs the backend to allow it.

Sign in at `/login` with an `AdminUser`. The seed creates
`admin@hellofit.local` when `SEED_ADMIN_PASSWORD` is set, and never resets an
existing admin's password.

## State

The Cuba shell runs: login, the private-route gate, sidebar, header, dark mode,
breadcrumbs, route transitions, and a placeholder dashboard. **There are no
real admin screens yet.** Each one is added by converting the matching page out
of Cuba's `template.zip` and wiring it to endpoints that already exist.

Two things gate what comes next, both recorded in `../state/open-points.md`:

- Masters CRUD and admin-user CRUD are **not built on the backend** — the panel
  cannot manage cities, branches, languages or admin users until they are.
- The **marketplace-vs-single-institute** question is still unanswered, and it
  decides what the allocation-queue and catalog screens even are. Those two
  wait.
