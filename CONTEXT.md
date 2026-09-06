# DinoSpotter — Context (lean)

Glossary:

- Era: one of Paleozoic | Mesozoic | Cenozoic. Only 3 buckets.
- Epoch blurb: 1-2 line description + time range per sub-epoch.
- FossilSite: lat/lon + taxon ids found there.
- TaxonCard: silhouette + name, clickable → 90% modal.
- CountryFocus: selected country, camera centers it, leader lines point to findspots (no map dots).

Decisions:

- Map: MapLibre globe renderer with a light style, labels-only + leader lines, country-pick → center (ADR-001, ADR-004). Basemap source and attribution are still a readiness decision.
- Data: live PBDB `data1.2` via Vercel thin cached proxy, never browser-direct (ADR-002). Occurrence sites belong to a taxon card; taxon detail is metadata.
- CountryFocus: modern borders, sites at modern lat/lon.
- Perf budget: see `docs/perf-budget.md`. Enforced in CI.
- Out: auth, accounts, CMS, uploads. Mobile supports the responsive floor only; native/mobile-specific features are out.
