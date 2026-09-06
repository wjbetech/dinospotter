# Perf budget (enforced after T0.2)

- Initial JS <250KB gzip; globe chunk is lazy-loaded and <150KB gzip.
- LCP <2.5s and INP <200ms on the agreed Lighthouse profile; country zoom stays
  responsive on a mid-range Android device.
- Map: labels-only symbol layer plus one leader-line layer (≤500 segments,
  ≤8 callouts), no visible dots, no per-fossil geometry.
- Data: at most 500 occurrence rows per Period request, bounded era merge,
  page size 48, and viewport-only card DOM.
- Measure with `vp build --manifest` plus a checked artifact-size script,
  Lighthouse CI, and `vitest bench` for pick/leader geometry. The old
  `vp build --report` wording is not a Vite+ 0.2.4 command.
- CI fails on any threshold regression. Record the tool versions, device
  profile, compression method, and measured values with each budget change.
