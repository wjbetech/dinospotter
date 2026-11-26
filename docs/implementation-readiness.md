# Implementation readiness

Updated 2026-11-27. The starter-era preflight has been superseded by the
implemented application. The current feature frontier is R5 art and R6 final
acceptance; see the roadmap handoff for exact progress.

## Current baseline

- The website, shared utilities, Vercel `/api/occs` and `/api/taxon`, country
  geography, seed, sprites, browser runner, and CI configuration all exist.
- `vp install` succeeds. Build `utils` before checking a fresh checkout: its
  workspace public export points to `dist/index.mjs`, with generated declarations.
- `vp check` passes after the utility build. `vp test` passes 30 tests across
  13 files. The browser suite passes 12 tests, including mocked KR CountryFocus
  at desktop and 390px widths and an axe WCAG check.
- `vp run --no-cache -r build` and `vp run website#check:budget` pass. Normal
  cached task execution can fail on this Windows host with OS error 123 even
  after compilation succeeds; this is a local Vite+ cache limitation.
- `vp env doctor` resolves managed Node 26.13.1 and pnpm 12.4.1, but reports
  that PATH's `node`, `npm`, and `npx` point at the system installation rather
  than Vite+ shims. Vercel CLI reports Node 24.13.0. CI currently uses Node 22.

## Recorded infrastructure choices

| ID  | Recorded decision                                                                                                                             | Current evidence                                                                                                                                                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D4  | Self-host the light style, country polygons, and trimmed Natural Earth places; no external tiles, rivers, regional borders, or island insets. | Style and geography load locally. Phase 7 uses 50m places because the 110m file only contained Seoul for KR. See `public/geo/ATTRIBUTION.md`.                                    |
| D5  | Use `vercel dev --listen 3000` from the repository root for full-stack work; `vp run dev` is frontend-only.                                   | Live KR occurrence and taxon routes responded successfully. `vercel.json` invokes Vite+ with the website root directly.                                                          |
| D6  | CDN cache headers do not prove a stale payload. Proxy returns `stale=false`; matching session/seed fallback belongs to the client.            | This is the existing proxy/client design, not a persistent stale-response cache. Broader retry/cache guarantees have not been re-certified in this refurb.                       |
| D7  | Vitest for pure/proxy tests; pinned Playwright for browser paths; axe for DOM checks; Lighthouse against a production preview.                | Playwright now starts its own frontend on port 4175, uses mocked API responses for the new feature, and is invoked in CI. Lighthouse was run locally; CI does not yet invoke it. |

## Reproducible local checks

Run these from `C:\WebDev\my-apps\dinospotter` in this order:

```powershell
vp install
vp run utils#build
vp check
vp test
vp exec playwright test --config apps/website/playwright.config.ts
vp run --no-cache -r build
vp run website#check:budget
```

The browser runner starts its own server; it does not require live PBDB. The
new KR fixture covers stable placement, 12 named callouts, overflow, city
selection, metric scale, keyboard modal/focus return, era clearing, and the
mobile rail. The existing navigation-only F1 smoke can still use seed fallback.

## Deployment contract

- Vercel project root: repository root; production frontend output:
  `apps/website/dist`.
- Build: utilities first, website second, as recorded in `vercel.json`.
- API functions remain under root `api/`, importing the built utility export.
- Frontend requests are relative `/api/*`; the browser never requests PBDB directly.
- The local server is not a production deployment or proof of preview settings.
  Remote project runtime/environment settings were not changed or re-certified.

## Remaining release checks

- R5 requires the user's final eight single-fill clade SVGs plus `footprint.svg`.
  Existing art is provisionally tinted moss using a CSS mask. The footprint
  companion is not implemented until that asset is supplied.
- R6's final human comparison against `docs/research/asset/example.png` remains
  open. Agent live checks of KR, US, and CH do not substitute for that sign-off.
- The exact version of the original country-polygon extract is not recorded.
  Its Natural Earth provenance is documented; exact version confirmation remains.
- A local Lighthouse mobile-profile homepage run measured LCP 1.37s, TBT 0ms,
  and CLS 0.0052. INP was absent from the navigation-only report, so neither this
  run nor the existing Lighthouse config proves the INP threshold.
- Repeat the production build, budgets, browser/axe checks, and Lighthouse after
  the art batch. Verify remote preview settings and perform a production smoke
  check before release. No deployment was performed in this session.
