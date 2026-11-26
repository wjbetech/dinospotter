# Perf budget (enforced after T0.2)

- Initial JS <250KB gzip; globe chunk is lazy-loaded and <300KB gzip (MapLibre floor, measured ~255KB).
- LCP <2.5s and INP <200ms on the agreed Lighthouse profile; country zoom stays
  responsive on a mid-range Android device.
- Map: labels-only symbol layer plus one leader-line layer (≤500 segments,
  ≤12 callouts). Zoomed-out views have no dots; CountryFocus alone shows
  2.5px representative findspot anchors, as amended by Phase 7.
- Data: at most 500 occurrence rows per Period request, bounded era merge,
  page size 48, and viewport-only card DOM.
- Measure with `vp build --manifest` plus a checked artifact-size script,
  Lighthouse CI, and `vitest bench` for pick/leader geometry. The old
  `vp build --report` wording is not a Vite+ 0.2.4 command.
- CI fails on any threshold regression. Record the tool versions, device
  profile, compression method, and measured values with each budget change.

## Phase 7 check — 2026-11-27

- Windows local production build, Vite+ 0.2.4, gzip sizes reported by Vite:
  initial JS about 6.7KB; lazy MapLibre about 253KB plus about 3KB glue.
  Artifact gate passes; places 75,119 bytes, combined geography below 600KB.
- Lighthouse CI 0.14.0, one default mobile-profile run against production
  preview `/`: LCP 1,368ms, total blocking time 0ms, CLS 0.0052, performance 100.
- INP was not measured by this navigation-only run; it is not a verified gate.
  Recheck interaction responsiveness and final artwork before release.
- On this Windows host, task cache writes can fail with OS error 123.
  `vp run --no-cache -r build` successfully builds both workspace packages.
