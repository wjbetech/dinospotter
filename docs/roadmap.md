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

**Purpose:** Give the existing map and data a coherent product structure and a visual language strong enough to carry later features. This stage changes presentation and navigation; deeper data, taxonomy and map behavior belong to later stages.

### 1.1 Build a home page screen

- [x] Create a new initial screen with the Header and Footer.
  - [x] The area between the header and footer should have a rotating maplibre globe full width and height section with the colored land borders still present, rotating slowly, opacity lowered.
  - [x] A title overlay with a button 'Get Started'.

### 1.2 Define the visual system

- [x] Create a small, named palette for paper, surface, water, selected land, moss actions, borders, primary text, muted text, warning and focus. Check text and control contrast on actual map and panel surfaces.
  - [ ] Work through the color scheme to ensure high contrast, visual depth and distinctiveness between sections and components, and overall theme matches the site.
- [ ] Choose display, body and data typography roles; set sizes and line heights for page title, section title, record name, body, caption and map label. Remove unused font files and conflicting declarations.
  - [ ] Assert the `px` or `rem` modality for fonts to make sure we are always working with responsive text sizes.
- [ ] Set spacing, radius, border and elevation scales. Specify when a surface is raised, inset or flat so depth communicates hierarchy rather than decorating every element.
- [ ] Build a compact component inventory: header/nav, primary and quiet buttons, fields, filter controls, record row, map badge, status panel, specimen view and footer. Document default, hover, selected, focus, disabled and loading states.
  - [ ] Each component should have it's own file and styles should be defined inline using tailwind.
  - [x] Move the shared header, navigation, share action and footer into component files with Tailwind utilities.
  - [x] Move the country picker, era filter and search controls into component-owned Tailwind styling; remove their superseded CSS selectors.
  - [x] Move fossil record rows and loading, empty and upstream status states into component-owned Tailwind styling.
  - [x] Remove the remaining overlapping legacy record and state selectors after visual review across countries.
- [ ] Consolidate the repeated rules in `apps/website/src/styles/tokens.css` into tokens and component sections. Preserve appearance until each component is deliberately redesigned.
  - [ ] Make sure the styles align with the previous point and we only have one unified style system.

**Review artifact:** A visual board or live component page with desktop and mobile examples. **Acceptance:** One token source controls the main UI; no later override blocks are needed to make a component look correct; contrast and focus are readable.

### 1.3 Design the core screens as a family

- [ ] Design the unselected globe view with a clear invitation and a useful explanation of what DinoSpotter contains (this may be best placed on the new home page).
  - [x] Load the exploration globe on entry without an extra button press.
- [ ] Design the selected-country workspace: country/time heading, map, up to eight quiet markers, featured record list, filters and a clearly selected fossil. Set a deliberate relationship between map and records.
- [ ] Design a specimen view that can later accept richer evidence without a wholesale layout change. Specify art, name, age, location, formation, source and save/share actions.
- [ ] Design useful loading, no-results, no-records, upstream-error and saved-empty states with a recovery action where one exists.
- [ ] Review each design at wide desktop, 768px tablet and 360–390px mobile. Check map area, panel order, scrolling, sticky elements and dialog behavior.
  - [x] Review Germany Mesozoic and Iceland Paleozoic at 390px, including a populated list and an empty result.
  - [x] Adjust the mobile marker rail so it does not cover the map scale, then review tablet and selected specimen states.
  - [ ] Refine the specimen dialog's oversized tablet layout and review its loading and error states as part of the specimen redesign.

**Review artifact:** Annotated screen captures or prototypes for these states. **Acceptance:** A user can identify the main action and current selection at a glance on each viewport; map and records do not obscure one another.

### 1.4 Edit the product language

- [ ] Create a short vocabulary sheet for country, era, fossil group, findsite, formation, featured result and source. Use the same terms in map, list, specimen view and guide.
- [ ] Replace generic or misleading labels, including copy that suggests all results are dinosaurs or that twelve featured groups are a country's complete record.
- [ ] Put brief provenance notes where they answer a real question: modern coordinates by the map; ranking by the featured list; date or freshness by the records; PBDB attribution by the evidence.
- [ ] Write specific empty and error messages with the next action. Review labels at narrow widths and with screen readers.

**Review artifact:** A copy deck covering every visible state. **Acceptance:** No unexplained specialist term blocks the main journey; caveats are concise and close to the claim they qualify.

### 1.5 Implement and accept Stage 1

- [ ] Implement navigation, tokens, components and copy in small PR slices, reviewing the real app after each slice. Keep state and data contracts intact unless the design explicitly requires a change.
- [ ] Run the repo checks, meaningful browser journeys and accessibility checks. Review screen captures for an unselected globe, a dense country, a sparse country, a selected specimen and mobile.
- [ ] Complete a human visual walkthrough against the agreed design direction, fix the findings and record the remaining issues under the appropriate later stage.

**Stage exit:** All four destinations have a purpose; the visual system is consistent; the core states are readable at 360px and desktop; keyboard focus, contrast and scrolling work; the user accepts the direction before Stage 2 expands functionality.

## Stage 2 — Reliable exploration

- [ ] Make selected record state consistent across map, list and detail, including filtering and reset.
- [ ] Place markers and leaders using projected screen positions. Prevent avoidable crossings, keep names in bounds and quiet unrelated lines. Check dense, sparse, wide and island countries.
- [ ] Expand the fossil candidate pool and use verified taxonomy and artwork so callouts can show familiar dinosaur groups when records support them. The current featured pool is limited to twelve records.
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
