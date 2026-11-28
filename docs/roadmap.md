# DinoSpotter — product roadmap

Updated 2026-11-28. This replaces the former ticket and mentor roadmap. Completed history lives in Git and pull requests.

## Product goal

Help a visitor discover fossil life in a place, understand the evidence, and follow the source. The map is the entry point; the fossil record is the product. DinoSpotter covers ancient life beyond dinosaurs and should say so plainly.

A production release must feel complete on desktop and mobile, remain useful when PBDB is slow, and never imply that featured results are a complete inventory or ancient geography.

## Current baseline

- MapLibre globe and country view with modern borders, cities, scale, up to eight map markers and twelve featured records.
- Three era choices, search over featured names and formations, illustrative category filters, taxon detail dialog, URL sharing and locally saved finds.
- Vercel proxy for PBDB occurrences and taxon details, local fallback, self-hosted geography, automated accessibility checks and a build budget.
- Current work is in draft [PR #17](https://github.com/wjbetech/dinospotter/pull/17).

## Problems to solve

1. **Understanding:** The map, list and dialog give too little explanation of a discovery. Age, location, formation, evidence, uncertainty and source need a clear hierarchy.
2. **Trust:** The featured twelve are ranked by recorded findsites, which could be mistaken for completeness or importance. Fossil categories and artwork are inferred from names; unknowns may be misrepresented.
3. **Exploration:** Three broad eras and twelve featured records do not provide a path into the wider evidence. Search only covers those featured records.
4. **Interface quality:** CSS has accumulated conflicting overrides. The map, list, dialog, guide and collection need a shared component system. The guide and collection are still sections on one long page.
5. **Map clarity:** Leader lines can cross; label density and framing vary by geography. Selected records need an obvious relation to their findspots at every viewport.
6. **Production confidence:** Local checks pass, but deployed country-route performance, real upstream failure behavior, interaction responsiveness and monitoring need verification.

## Release standard

A new visitor can select a country, choose a time interval, find a fossil, understand its age and provenance, open the PBDB evidence, save or share it, and recover from empty or failed data. Verify a large country, small country, island nation and sparse country at desktop and mobile widths. Keyboard and screen-reader journeys must cover the same actions.

## Stage 1 — Product and visual foundation

- [ ] Give Explore, Fossil record, Field guide and Saved finds purposeful destinations with clear navigation state.
- [ ] Establish semantic colors, type, spacing, surfaces, buttons, fields, cards, dialogs, focus states and responsive rules. Consolidate `tokens.css` instead of appending overrides.
- [ ] Design the country overview, record row, selected specimen and empty/error states as one family; review desktop and mobile captures.
- [ ] Rewrite copy around user actions and evidence. Explain modern coordinates, featured ranking, freshness and dinosaurs versus other fossils in context.
- [ ] Review hierarchy, contrast, clipping, whitespace and behavior from 360px to wide desktop.

**Done when:** Each state has a clear primary action, all destinations work, and representative routes show one consistent interface.

## Stage 2 — Reliable exploration

- [ ] Make selected record state consistent across map, list and detail, including filtering and reset.
- [ ] Place markers and leaders using projected screen positions. Prevent avoidable crossings, keep names in bounds and quiet unrelated lines. Check dense, sparse, wide and island countries.
- [ ] Separate a small featured map selection from a paginated or virtualized view of the broader record where data supports it.
- [ ] Add evidence-backed category, formation and geological interval filters with counts and shareable state. Label unverified classification honestly.
- [ ] Make country and era changes predictable in loading, cached, stale, empty, rate-limited and failed states.

**Done when:** Selection is unambiguous, map clutter stays controlled, and sparse countries have a useful path.

## Stage 3 — Evidence-rich fossil content

- [ ] Replace the generic large dialog with a specimen view prioritizing name, taxonomic status, age, location, formation, recorded sites and source.
- [ ] Use PBDB classification fields where available and audit art mapping against real results from several countries; leave unknowns unclassified.
- [ ] Explain how featured rank is calculated and distinguish occurrence count from scientific importance.
- [ ] Build a field guide for fossil groups, geological time, PBDB records and the limits of modern-border maps.
- [ ] Make saved finds robust without accounts: clear storage wording, reopen, removal and graceful storage failure. Evaluate account sync only if demand warrants it.

**Done when:** Visitors understand a find without leaving for basic context, and factual claims are traceable.

## Stage 4 — Data and performance hardening

- [ ] Audit proxy limits, upstream timeouts, retries, cache headers, stale behavior, schema validation and response size across common and sparse countries.
- [ ] Measure deployed focused-country LCP, CLS, API latency and interaction responsiveness on mid-range mobile hardware. Set evidence-based thresholds using the existing budget as a baseline.
- [ ] Verify exact geographic data versions, provenance, attribution and asset licenses.
- [ ] Remove dead assets, obsolete code and stale documentation after replacement paths work.
- [ ] Add privacy-conscious production error and usage visibility to detect broken routes and upstream failure rates.

**Done when:** Preview performance meets agreed thresholds, failures are observable, and upstream outages have a documented recovery path.

## Stage 5 — Launch and iteration

- [ ] Accept the full discovery, evidence, save and share journeys on a production preview at desktop and mobile widths.
- [ ] Complete keyboard, screen-reader, contrast, map-alternative and reduced-motion reviews.
- [ ] Review SEO and share metadata, source attribution, content accuracy, support/contact path and deployment settings.
- [ ] Resolve the draft PR into a reviewable release scope; merge and deploy after these checks and human visual review.
- [ ] Choose subsequent features from observed searches, behavior, load times and errors. Consider comparisons, collections and deeper time navigation when they improve the core journey.

**Done when:** Production smoke checks pass, the release has an owner and rollback path, and the next iteration follows observed use.

## Working rules

- Work in reviewable slices. Mark a task complete only when its behavior is visible and checked.
- Keep the muted green atlas direction while allowing the visual system to evolve.
- Tie factual claims to PBDB data or clearly labeled editorial content.
- Update this roadmap and the active PR when scope or evidence changes. It guides priority without freezing better ideas.
