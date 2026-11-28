# DinoSpotter — Context (lean)

Glossary:

- Era: one of Paleozoic | Mesozoic | Cenozoic. Only 3 buckets.
- Epoch blurb: 1-2 line description + time range per sub-epoch.
- FossilSite: lat/lon + taxon ids found there.
- TaxonCard: silhouette + name, clickable → 90% modal.
- CountryFocus: selected country, camera frames it with sea margin, shows major cities + metric scale and up to eight compact specimen callouts (up to 12 sidebar records) with leaders to findspot anchors (ADR-004, ADR-005).

Decisions:

- Map: MapLibre globe renderer with a light style, labels-only + leader lines, country-pick → focus-detail view (ADR-001, ADR-004, ADR-005). Self-hosted geography and remaining release checks are documented in `docs/implementation-readiness.md`.
- Data: live PBDB `data1.2` via Vercel thin cached proxy, never browser-direct (ADR-002). Occurrence sites belong to a taxon card; taxon detail is metadata.
- CountryFocus: modern borders, sites at modern lat/lon. Focused view adds city labels + scale; admin-1 regions and island insets are outside Phase 7. The visual target is to match `docs/research/asset/example.png`.
- Perf budget: see `docs/perf-budget.md`. Enforced in CI.
- Out: auth, accounts, CMS, uploads. Mobile supports the responsive floor only; native/mobile-specific features are out.
