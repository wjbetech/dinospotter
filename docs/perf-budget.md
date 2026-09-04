# Perf budget (enforced)

- Initial JS <250KB gzip, globe chunk lazy-loaded.
- LCP <2.5s, INP <200ms, 60fps zoom on M-series / mid Android.
- Map: instanced markers, silhouette sprites, no per-fossil geometry.
- Data: paged by country+era, virtualize card lists.
- Check: `vp build --report`, Lighthouse CI, `vitest bench` for pick/zoom math.
- Regression = fail CI.
