# DinoSpotter — Context (lean)

Glossary:

- Era: one of Paleozoic | Mesozoic | Cenozoic. Only 3 buckets.
- Epoch blurb: 1-2 line description + time range per sub-epoch.
- FossilSite: lat/lon + taxon ids found there.
- TaxonCard: silhouette + name, clickable → 90% modal.
- CountryFocus: selected country, camera zooms to it.

Decisions:

- Map: MapLibre globe, country-pick → zoom (ADR-001).
- Data: live PBDB API, cached/proxied to meet perf budget.
- CountryFocus: modern borders, sites at modern lat/lon.
- Perf budget: see `docs/perf-budget.md`. Enforced in CI.
- Out: auth, accounts, CMS, uploads. Mobile non-priority.
