# DinoSpotter — End-to-End Roadmap (for mentor builds)

> Status: v6.0 — planning review 2026-09-06 (no feature code). Design quirks are resolved on paper; implementation and verification are not. See `docs/implementation-readiness.md`, §§4, 8, 11.
> Method: `to-tickets` (tracer bullets + blocking edges) + `tdd` (red→green per seam) + `setup-ts-deep-modules` (entry-point boundaries) + `implement-spec` (frontier execution). See §9.
> How to use: you build, agent mentors. Each ticket is one mentor turn. Each micro-chunk (M0, M1…) is one TDD red→green cycle inside the ticket — do in order, commit per chunk.
> Invoke per ticket: `mentor: <ticket-slug>` e.g. `mentor: globe click → country?`
> Mentor rules (from `docs/agents/code-mentor.md`): <200 words, 1 starter snippet, 1 doc URL, 1 task + 1 check (`vp check` / `vp test`), perf+CI note every ticket.
> Read order before any ticket: `docs/implementation-readiness.md`, `CONTEXT.md`, the four ADRs, `docs/research/pbdb-api.md`, `docs/perf-budget.md`, then this file §§2–§3. Stop at a readiness blocker instead of making an infrastructure decision inside a feature ticket.
> Current frontier: `T0.0` only. The starter build is still blocked by the missing tsgo dependency; do not invoke a feature mentor ticket until the readiness gate is green.

## 0. Vision, success, non-goals, repo map

**Job (one sentence):** pick a country on a light globe → see fossil taxa found there in 3 era buckets with epoch blurbs → open a TaxonCard scale-grid modal.

**Glossary (canonical, do not rename):** Era (Paleozoic | Mesozoic | Cenozoic only), Epoch blurb (1–2 lines + Ma range + ICS dot), FossilSite (lat/lon + taxon ids), TaxonCard (silhouette + name → modal), CountryFocus (selected ISO2, camera centers it, leader lines point to findspots).

**Decisions (locked 2026-09-06, quirks resolved docs-only):** MapLibre globe renderer with a light style and labels-only + leader lines (ADR-001, ADR-004); live PBDB `data1.2` primary via thin cached proxy on Vercel (ADR-002), never browser-direct; modern borders + modern lat/lon with explicit copy; own flat silhouette set (ADR-003); perf budget enforced in CI; static frontend + serverless proxy; no auth/accounts/CMS/uploads; mobile = responsive floor only. The concrete basemap/style source, local API path, cache mechanism, and browser CI runner remain D4-D7 readiness decisions.

**MVP success criteria (measurable):**

- S1: click any of US/UK/DE/FR on globe → camera centers country + leader lines to findspots + cards load <2.5s LCP on broadband.
- S2: era strip filters cards without refetch when cached; refetch on miss with skeleton; leader lines redraw on era change.
- S3: card → modal opens 90% overlay with silhouette, Ma range, formation, PBDB link; Esc closes, focus returns.
- S4: UK works (`GB→UK` mapping); empty country shows designed empty state, not blank.
- S5: `vp check`, `vp test`, and `vp run -r build` green; measured initial JS <250KB gzip; Lighthouse CI passes; no PBDB-direct browser calls; zoomed-out zero dots (labels only), CountryFocus anchors per ADR-005.
- S6: keyboard-only path (listbox → era → card → modal) works; reduced-motion respected.

**Non-goals (explicit out):** auth, accounts, CMS, uploads, native mobile, paleogeographic reconstruction, i18n, analytics, PWA/offline-first, user-generated content, paid tiles.

**Repo map (where code lives):**

- `apps/website/src/`: current starter files plus planned `globe/`, `data/`, `ui/`, and `styles/` modules.
- `apps/website/public/` — planned country data, seed payload, and hand-drawn clade SVGs; none of these artifacts exist yet.
- `packages/utils/src/` — current starter export plus planned pure logic. It must stay DOM-free and be consumed through its package export in Vitest and the website.
- `api/` — planned root-level Vercel serverless proxy `GET /api/occs?cc=&era=` + `GET /api/taxon?id=`. It is not present yet; deployment and local execution are readiness items.
- `docs/adr/` — 001 (globe) → 002 (proxy, done) → 003 (silhouettes, done) → 004 (labels + leaders, done).

---

## 1. Design direction — "Field Guide Light" (style Round 2 locked 2026-09-06, see §11)

User constraints: default MapLibre light style, light + fun + easy on eyes; warm paper bg; moss + straw accents; sand + grid cards; segmented panels like new VS Code UI; 2 clean minimalist Scandinavian fonts; flat ink silhouettes; tick-bar scale; pill era strip; NO map dots — labels + leader lines; 900ms zoom + stagger; 90% modal.

**Thesis:** hero is the globe itself in default MapLibre light style. No marketing hero, no dark theme.

**Tokens (light, locked Q1–Q3):**

- `paper #FAF7F0` — app bg (warm paper, locked Q1)
- `card #FFFFFF` — panels, drawer
- `ink #1E242B` — primary text + silhouette fill (flat, locked Q5)
- `moss #2F7D62` — primary accent: focus ring, active era, leader lines
- `straw #D9A441` — secondary accent (locked Q2 + §11): warnings, cached badge, selected-country halo only. Never body text.
- `sky #DCEBF5` — map water / secondary wash (matches default MapLibre light)
- `sand #EDE6D6` — card figure wash + 8px grid backdrop (locked Q3)
- `ink-soft #4A545E` — secondary text (≥4.5:1 on paper)
- `line #E5DED0` — 1px segmented panel borders on `paper` (locked Q3, VS Code style)
- Era tints: PBDB ICS `col` dots only (locked Q7).

**Type (2 fonts, locked Q4 Round 2 — clean minimalist Scandinavian):**

- Titles: `Space Grotesk` 500/700 (country name + section heads; `font-display: swap`, latin subset). Geometric sans, calm at large sizes, no serif wildcard.
- Body + data: `Inter` 400/500 (blurbs, cards, Ma ranges with `font-variant-numeric: tabular-nums`; single family for all paragraph + numeric text).
- Load via `fontsource` self-host, max 4 files total (Space-Grotesk-500/700, Inter-400/500). No mono family — tabular nums cover Ma/latlon.

**Segmented layout (locked Q3 — VS Code style):** flat `paper` canvas with `card` panels separated by 1px `line #E5DED0` borders + 12px radius + 8px gaps (like new VS Code editor groups / side panels). No shadows except modal. Panels: `#globe-panel` (globe + era strip footer), `#drawer-panel` (country + blurbs + cards), `#modal-panel`. Active panel gets 1px `moss` top accent (2px inset, no layout shift). Gaps stay `paper` so UI reads as segmented sections, not floating cards.

**Breakpoints (explicit):**

- `≥1024px`: 60/40 split globe/drawer; era strip under globe.
- `640–1023px`: 50/50, cards 2-col.
- `<640px`: stacked (globe 320px tall → era strip → drawer); cards 1-col; globe gestures limited to tap (no hover dependency).

**Motion spec:** one orchestrated moment only — country zoom (900ms ease-out cubic, 0ms when `prefers-reduced-motion`) + card stagger fade (max 6 cards, 40ms stagger, disabled on reduced motion). No scroll reveals, no parallax.

**Focus + contrast:** `moss #2F7D62` 3px outline on `:focus-visible`; body text `ink` on `paper` ≥12:1; secondary text ≥4.5:1 (use `ink-soft #4A545E` for meta, never light gray on sand).

**Era strip behavior (exact):** 3 buttons in one `radiogroup`, `aria-checked` reflects active era; click filters loaded payload client-side; if payload for `cc+era` not cached, fetch via proxy with skeleton cards; URL syncs `?cc=&era=` (shareable, back-button safe); default era on first load = `Mesozoic` (most engaging).

**Card spec (exact):** 3:2 figure area (`sand` bg + 8px grid + human tick bar), flat ink silhouette SVG (§3.3, locked Q5–Q6), name (Inter 500), `eag–lag Ma` (Inter tabular-nums) + ICS dot, formation `sfm` truncated 1 line. Hover: 2px `moss` border (no layout shift via `box-shadow` inset). Selected card: `aria-selected`.

**Modal spec (90% overlay):** `role=dialog aria-modal`, focus trap + return focus to card, Esc closes, backdrop click closes, PBDB source link (`paleobiodb.org`), silhouette large + scale ticks + stats table (Ma, formation, coords, `tid`), "sites at modern lat/lon" footnote. Mobile: full-sheet bottom.

**Copy deck (exact strings, sentence case):**

- Empty (no country): "Pick a country to start."
- Empty (no taxa in era): "No recorded taxa for {country} in the {era}. Try another era."
- Loading: "Loading fossil records…" (skeleton cards, `aria-busy=true`).
- Cached: "Showing cached data. Data may be incomplete."
- Degraded: "PBDB unavailable — showing cached data. Data may be incomplete." + Retry button.
- Error (no fallback): "PBDB unavailable. Try again." + Retry button.
- Geo footnote (always under drawer): "Sites plotted at modern coordinates."

**Layout (segmented, locked Q3):** `paper` canvas, 8px gaps, `card` panels with 1px `line` borders + 12px radius. Desktop: `#globe-panel` (60%, globe + era strip footer) + `#drawer-panel` (40%, country + blurbs + cards). Mobile: stacked.

```
+------------------------------------------------+
| globe-panel (60%)      | drawer-panel (40%)    |
|  [globe: labels only]  | Country (Space Grotesk)|
|  [era strip: P|M|C]    | Epoch blurb (Inter)   |
|                        | TaxonCards grid       |
+------------------------------------------------+
```

**Globe labels + leader lines (locked Q8 — replaces all map dots/markers, amended by ADR-005 for CountryFocus detail):**

- Zoomed out: country name labels only (MapLibre symbol layer from bundled polygons). Small countries hide labels until zoom ≥ threshold where label fits safely (collision-tested, no overlap). No dots at any zoom-out level.
- On CountryFocus (see `docs/research/asset/example.png`, ADR-005): camera frames the country with sea-margin padding for callouts; show admin-1 (province/state) + major town/city labels, scale bar, and island-inset padding where the bbox needs it. `moss` 1.5px leader lines fan from 2–3px findspot anchor dots to silhouette callouts (moss silhouette + taxon short name, max 8 visible, rest grouped "+N more"); lines + anchors redraw on era change. Anchors are line endpoints in the single GeoJSON layer, not a marker layer.
- Leader geometry (exact): callouts sit in sea/margin space around the focused nation (never covering its admin/city labels); on narrow screens they fall back to a bottom rail inside the globe panel. Desktop keeps the drawer-side rail only as overflow for "+N more" listing. Grouping = by `tid` count desc; overflow → "+N more" chip at rail bottom. Callouts and cards are buttons → open same modal.
- Perf: labels via symbol layer (GPU), leader lines as single GeoJSON line layer (≤500 segments, cap visible callouts 8). Replaces `sites` marker module — see §2.1.

**Signature (one risk):** scale-grid TaxonCards. Each card shows a flat dark-ink 2D silhouette on `sand` grid (tick-bar scale, locked Q5–Q6), name + Ma in Inter tabular-nums. Justification: directly encodes the reference image language, ownable, fun. One orchestrated moment only (country zoom + card pop-in).

---

## 1.1 User flows (golden paths — test these in T5.3)

- F1 first visit: load `/` → globe (labels only) + "Pick a country to start." → click US → centers US + leader lines → skeleton → Mesozoic cards → URL `?cc=US&era=Mesozoic`.
- F2 era switch: US loaded → click Cenozoic → cached? filter instantly + lines redraw : skeleton + fetch → URL updates → back button returns to Mesozoic.
- F3 modal: click card → 90% modal (silhouette + Ma + formation + PBDB link) → Esc → focus returns to card.
- F4 UK quirk: pick UK → cards load (proves `GB→UK`); type `?cc=GB` manually → normalized to `UK`.
- F5 empty: pick MG + Paleozoic → "No recorded taxa…" + era suggestion (no lines drawn).
- F6 failure: proxy down → cached/seed cards + "PBDB unavailable…" + Retry; Retry refetches same `cc+era`.
- F7 labels: zoomed-out globe shows country labels, small ones hidden until safe zoom; no dots zoomed-out. CountryFocus adds admin/city labels + silhouette callouts per ADR-005.

---

## 2. Architecture — deep modules, seams, hosting, state

Design for depth (small interface, large implementation). Each module lists its interface (what callers learn) — implementation stays behind the seam. Pure logic lives in `packages/utils` (DOM-free, vitest); side effects live in `apps/website` adapters.

### 2.1 Module table (with files + tests)

| Module                                              | Interface (seam)                                                                                          | Files                                                                                                                             | Implementation notes                                                                                                                                                                                                                                                  | Test surface (exact)                                                                                                         |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `timescale`                                         | `getEras(): Era[]`, `getEpochs(era): EpochBlurb[]`, `eraOf(ma): Era`                                      | planned `packages/utils/src/timescale.ts`, `apps/website/src/data/eras.ts`, and bundled `apps/website/public/data/timescale.json` | loads a versioned snapshot of `intervals/list.json`; maps `nam/itp/eag/lag/col/pid` → 3 buckets + blurbs; normalizes ICS `col` (§3.4); no browser-direct PBDB request                                                                                                 | vitest: bucket mapping for Triassic/Jurassic/Cretaceous → Mesozoic; Ma ordering desc; unknown interval → fallback era + warn |
| `pbdb-client` (pure)                                | `buildOccsUrls(cc, era): string[]`, `parseOccs(json): ParsedOccurrences`, `groupByTid(rows): TaxonCard[]` | `packages/utils/src/pbdb.ts`                                                                                                      | `GB→UK` map; one URL per PBDB Period; `show=coords,ident,strat`; cap `limit=500` per request; drop invalid rows with counts; group by `tid`; aggregate age envelope and sites; sort desc `eag`                                                                        | vitest: GB→UK, period expansion, malformed rows, dup-tid site merge, age envelope, deterministic sort                        |
| `pbdb-proxy` (server)                               | `GET /api/occs?cc=&era=` → `SitePayload`; `GET /api/taxon?id=` → `TaxonDetail`                            | planned `api/occs.ts`, `api/taxon.ts` (Vercel, ADR-002)                                                                           | validate allowlisted params; fetch all Periods with bounded concurrency; normalize and merge through the pure client; one 8s upstream attempt deadline; return typed JSON errors and `Retry-After` for 429; cache behavior follows D6                                 | contract test: mocked PBDB → payload shape; headers; validation; GB→UK; timeout/429/5xx                                      |
| `globe`                                             | `initGlobe(el): Map`, `pickCountry(lng,lat): ISO2 \| null`, `zoomTo(cc): void` (centers country)          | planned `apps/website/src/globe/{index,pick,zoom,labels}.ts`                                                                      | MapLibre globe projection, selected light style from D4, lazy chunk; country polygons + label layer via bundled Natural Earth GeoJSON; zoomed-out = labels only, small labels hidden until safe zoom; ocean click → `null` (no-op + hint)                             | `vitest bench`: pick/zoom math; e2e: click US → `?cc=US`                                                                     |
| `leaders` (replaces `sites` markers — Q8 + ADR-005) | `leaders(cards, max): Leader[]`, `render(leaders, layout): void`                                          | planned `apps/website/src/globe/leaders.ts`, `packages/utils/src/leaders.ts` + test                                               | flatten `TaxonCard.sites`; deterministic group/count order; single GeoJSON line + anchor layer (`moss` 1.5px, 2–3px anchors) from findspot to sea/margin silhouette callouts per ADR-005; max 8 + "+N more"; update on map move, resize, era change; cap 500 segments | vitest: grouping, cap, overflow, deterministic order; visual: redraw after pan/resize/era                                    |
| `cards`                                             | `list(payload, page): TaxonCard[]` (page=48)                                                              | planned `apps/website/src/ui/cards.ts`                                                                                            | paginate + virtualize (only render viewport rows); render taxon cards, not individual occurrence sites; skeleton while loading; `aria-busy`                                                                                                                           | vitest: paging; DOM test: card selection and keyboard order                                                                  |
| `modal`                                             | `openTaxon(card, detail): void`, `close(): void`                                                          | planned `apps/website/src/ui/modal.ts`                                                                                            | 90% overlay per §1 spec; focus trap; card supplies sites/formation while detail supplies taxonomic attributes                                                                                                                                                         | a11y test: trap, Esc, focus return                                                                                           |
| `silhouettes`                                       | `silhouetteFor(tna): SvgId`                                                                               | planned `packages/utils/src/silhouette.ts`, `apps/website/public/sprites/*.svg`                                                   | clade keyword map (see §3.3); fallback glyph; lazy sprite                                                                                                                                                                                                             | vitest: mapping table incl. unknown → fallback                                                                               |

**Seam discipline:** one adapter = hypothetical; two = real. `pbdb-proxy` starts as one serverless adapter; the planned seed JSON (`apps/website/public/data/seed/*.json` for US-Mesozoic only) is a second adapter used solely for first-paint/offline fallback — that justifies the seam.

### 2.2 State + URL (single source of truth)

```
state = { cc: ISO2 | null, era: Era (default Mesozoic), payload: SitePayload | null, status: idle|loading|ready|empty|degraded|error, source: network|session|seed|null, selectedTxn: string | null }
```

- URL `?cc=&era=` is the serialized selection: on load, parse URL → fetch; initial normalization uses `replaceState`; user selection uses `pushState`; `popstate` restores without creating another history entry.
- Invalid or missing `cc` becomes `null`; invalid `era` becomes `Mesozoic`; `GB` normalizes to `UK`; serialization omits `cc` when null and always writes a valid era.
- Cache key `cc+era` in memory Map (max 12 entries, LRU) + versioned `sessionStorage` for payload JSON (guard parse, schema validation, quota/security errors in try/catch).
- Each load owns an `AbortController` or request sequence. A late response for an old `cc+era` must not replace the current payload or URL.
- No global store library for MVP — one `store.ts` with subscribe/render (≤80 lines). Redux/Zustand explicitly out.

### 2.3 Error taxonomy (every fetch path handles all five)

| Case                              | UI                                                                                                                 | Retry                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| network fail                      | use the newest matching session/seed payload if available; otherwise show the error state, never skeletons forever | Retry button refetches same `cc+era` |
| PBDB 5xx / timeout (>8s abort)    | same as above                                                                                                      | same                                 |
| PBDB warning + `[]` (e.g. bad cc) | empty-era copy (§1)                                                                                                | no retry, suggest another era        |
| schema drift (missing `tna/tid`)  | dev-console error + typed proxy error; client may use a matching cached payload                                    | no automatic retry                   |
| rate-limit (429)                  | client retries the proxy after 2s → 8s, then uses matching fallback or error state                                 | auto-retry ×2, then badge/error      |

### 2.4 Hosting (production host resolved; execution contract pending)

Static frontend (Vite build) + 2 root-level Vercel serverless functions (`/api/occs`, `/api/taxon`) per ADR-002. The Vercel project root, Node runtime, build/output settings, and preview behavior are part of T0.0. Local full-stack development must use the D5 decision; `vp run dev` alone only serves the frontend unless an equivalent local API adapter is added.

---

## 3. Data contracts, PBDB mapping, silhouettes, colors (normative)

### 3.1 Types (canonical data model)

```ts
export type Era = "Paleozoic" | "Mesozoic" | "Cenozoic";
export interface EraDescription {
  name: string;
  era: Era;
  lag: number;
  eag: number;
  color: string;
  description: string;
}
export interface EpochBlurb {
  name: string;
  era: Era;
  eag: number;
  lag: number;
  color: string;
  description: string;
}
export interface IntervalRow {
  nam: string;
  itp: string;
  eag: number;
  lag: number;
  col: string;
  pid: string | null;
}
export interface FossilSite {
  oid: string;
  tid: string;
  tna: string;
  oei: string;
  eag: number;
  lag: number;
  lng: number;
  lat: number;
  sfm: string;
}
export interface TaxonCard {
  tna: string;
  tid: string;
  oei: string;
  eag: number;
  lag: number;
  sfm: string;
  sites: FossilSite[];
}
export interface ParsedOccurrences {
  rows: FossilSite[];
  dropped: number;
  total: number;
}
export interface SitePayload {
  cc: string;
  era: Era;
  updatedAt: string;
  stale: boolean;
  dropped: number;
  total: number;
  cards: TaxonCard[];
}
export interface ApiError {
  error: "invalid_request" | "rate_limited" | "upstream" | "timeout" | "schema";
  message: string;
  retryAfterSeconds?: number;
}
export interface TaxonDetail {
  tid: string;
  tna: string;
  rank: string;
  authority: string;
  parentTid: string;
  occurrenceCount: number | null;
  pbdbUrl: string;
}
export type SvgId =
  | "theropod"
  | "sauropod"
  | "ornithischian"
  | "pterosaur"
  | "marine"
  | "synapsid"
  | "amphibian"
  | "fallback";
export type Status = "idle" | "loading" | "ready" | "empty" | "degraded" | "error";
export type DataSource = "network" | "session" | "seed" | null;
```

`FossilSite` is an occurrence location. `TaxonCard` is the deduplicated
presentation record and owns all of that taxon's sites. `SitePayload.total` is
the number of raw PBDB rows received across all Period requests; `dropped` is
the number rejected before grouping. `TaxonCard.eag` is the maximum valid
early age across its rows and `lag` is the minimum valid late age, so the card
range covers the grouped evidence. `tna` and `oei` are selected by frequency,
then lexical order; `sfm` is selected by frequency, then string length, then
lexical order. `TaxonDetail` comes from `taxa/single` and contains taxonomic
metadata only; age, formation, and coordinates always come from the selected
card.
The API returns `cards`, not a field named `sites`; leaders flatten
`cards[].sites`.

### 3.2 PBDB → app field map (pin `data1.2`)

| PBDB                    | App                                | Rule                                                                                                                                                                                                                                                        |
| ----------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `oid`                   | `FossilSite.oid`                   | required stable occurrence id; synthesize `period:index` only if PBDB omits it and record a warning                                                                                                                                                         |
| `tna`                   | `FossilSite.tna` / `TaxonCard.tna` | required; drop record if missing (count in `dropped`)                                                                                                                                                                                                       |
| `tid`                   | `FossilSite.tid` / `TaxonCard.tid` | required; group key (not name)                                                                                                                                                                                                                              |
| `oei`                   | `FossilSite.oei` / `TaxonCard.oei` | optional interval/stage label; empty string if absent                                                                                                                                                                                                       |
| `eag`/`lag`             | `FossilSite` age and card envelope | finite Ma numbers; reject missing, non-finite, or `eag < lag`; display `"{eag}–{lag} Ma"` 1dp                                                                                                                                                               |
| `lng`/`lat`             | `FossilSite.lng/lat`               | finite numbers in `[-180,180]`/`[-90,90]`; reject null and the exact `0,0` sentinel                                                                                                                                                                         |
| `sfm`                   | site and card meta                 | optional formation; use `""` when absent and truncate card to 1 line                                                                                                                                                                                        |
| `cc` param              | `SitePayload.cc`                   | normalize uppercase; `GB→UK` before fetch                                                                                                                                                                                                                   |
| `interval`              | era bucket                         | `interval=<Period>` per era (e.g. Mesozoic = Triassic+Jurassic+Cretaceous); proxy merges rows before returning `SitePayload`                                                                                                                                |
| `taxa/single?id=txn:NN` | `TaxonDetail`                      | map PBDB `oid/nam/rnk/att/par/noc` to `tid/tna/rank/authority/parentTid/occurrenceCount`; occurrence age, `sfm`, and coordinates remain from the selected card. The PBDB source link may be exposed as a link, but the browser never fetches PBDB directly. |

Limits: `limit=500` per Period request, bounded concurrent requests, `show=coords,ident,strat` only (never full `loc` text); page size 48 client-side. The proxy returns only the stable `ApiError` envelope: `400` for invalid input, `429` with `Retry-After` for rate limiting, `502` for upstream/schema failure, and `504` for timeout. Error responses are not cached; arbitrary PBDB JSON and client-supplied upstream URLs never cross the seam.

### 3.3 Silhouette set (locked: own art, inverted from reference)

- 8 clade SVGs for MVP: theropod, sauropod, ornithischian, pterosaur, marine reptile, synapsid, amphibian, generic fallback. Dark `ink #1E242B` fill on `sand` grid; tick bar representing 1.8m for scale in cards, with the full human figure reserved for the modal.
- Keyword map (`silhouetteFor`): match `tna` lowercase in this order: `ptero→pterosaur`, `raptor|rex|thero→theropod`, `titan|saur→sauropod`, `cerat|hadro|steg|ankyl→ornithischian`, `saurichthys|ichthy|mosa|plesio→marine`, `therapsid|synap→synapsid`, `amphib→amphibian`, else fallback. Vitest pins the order and table.
- Files: planned `apps/website/public/sprites/{theropod,sauropod,...}.svg` + single sprite sheet build; lazy-load below fold. ADR-003 records "own art, no third-party" decision.

### 3.4 ICS color normalize (exact)

Accept `#RRGGBB`, `#RGB`, `RRGGBB`, `rgb(r,g,b)`; output uppercase `#RRGGBB`; on parse fail → `moss #2F7D62` fallback + console warn. Used for era chip dots only (globe stays default light).

### 3.5 Cache headers + seed

- Proxy: `Cache-Control: public, max-age=60, stale-while-revalidate=86400`; `updatedAt` ISO timestamp. `stale=true` only when the implementation has actually served an older payload; the HTTP SWR header alone is not evidence for that field.
- Client fallback order: matching in-memory payload, matching versioned `sessionStorage` payload, then `US-Mesozoic` seed for that exact selection. A fallback sets `source` to `session` or `seed` and `status` to `degraded`; an empty network payload sets `status` to `empty`.
- A successful fresh network payload sets `source=network` and `status=ready`; a network payload with `stale=true` sets `source=network` and `status=degraded`.
- Seed fallback: planned `apps/website/public/data/seed/US-Mesozoic.json` (hand-verified snapshot, ≤50 occurrence rows) for first-paint demo + offline; loaded only for the exact `US` + `Mesozoic` key.

---

## 4. Quirks — design resolutions and verification

The resolutions below remove design ambiguity. A check in the final column is
pending until the named ticket adds the implementation and test. Do not treat
the checkmark as evidence that the current starter already supports the rule.

| #   | Quirk                                                                        | Impact                                      | Resolution (locked) + ticket                                                                                                                          | Verify                             |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | `cc=GB` returns warning + `[]`; must use `cc=UK`                             | UK shows empty                              | ✅ Resolved: `normalizeCc` trims + uppercases + `GB→UK` in `packages/utils` + URL parse; proxy contract covers it (T1.2, T0.3, T1.2b)                 | vitest: `GB`,`gb`,`UK` → `UK`      |
| 2   | PBDB fair-use, no key, downtime/slow/429                                     | UI hangs, rate-limit                        | ✅ Design resolved ADR-002: Vercel thin proxy, never browser-direct; 8s deadline; bounded 429 retry; client fallback (T1.2b, T1.4)                    | contract test mocked 500/429       |
| 3   | Modern borders vs paleogeography confusion                                   | user expects dinos where continents were    | ✅ Resolved: permanent footnote "Sites plotted at modern coordinates." under drawer + modal; paleo overlay explicit non-goal §0 (T4.3)                | copy review T4.3                   |
| 4   | Missing/null `lng/lat`, 0,0 outliers                                         | stray line endpoints / crash                | ✅ Resolved §3.2: proxy drops missing/null/out-of-range/0,0 + counts `dropped` in `SitePayload`; client guards leader render (T1.2, T1.2b)            | vitest null + 0,0 dropped          |
| 5   | Synonyms / duplicate `tna`, rank drift                                       | duplicate cards                             | ✅ Resolved §3.2: group by `tid` (not name), aggregate all sites and show `oei` (T1.2)                                                                | vitest dup-tid merge               |
| 6   | No images in PBDB                                                            | blank cards                                 | ✅ Resolved ADR-003: own 8 flat clade SVGs + fallback, keyword order pinned §3.3 (T3.2)                                                               | visual T3.2                        |
| 7   | Large `US` payloads                                                          | blows 250KB / slow cards / line soup        | ✅ Design resolved §3.2/§3.5: `limit=500` per Period, bounded merge, page 48 + virtualize, 500 segs + 8 callouts (T1.2, T1.2b, T2.3, T3.1)            | build artifact + bench             |
| 8   | MapLibre globe: antimeridian, ocean clicks, pick precision, label collisions | wrong pick, dead clicks, overlapping labels | ✅ Resolved ADR-004: default light, ocean → `null` + hint, bench pick math, small labels hidden until safe zoom (T2.1, T2.2, F7)                      | e2e ocean + F7                     |
| 9   | `eag/lag` inverted intuition                                                 | wrong sort/display                          | ✅ Resolved §3.2: aggregate age envelope, display `eag–lag Ma` 1dp Inter tabular-nums (T1.2)                                                          | vitest age envelope                |
| 10  | ICS `col` format varies                                                      | broken chip tint                            | ✅ Resolved §3.4: `#RGB/#RRGGBB/RRGGBB/rgb()` → `#RRGGBB`, else `moss` + warn (T1.1)                                                                  | vitest color table                 |
| 11  | Keyboard + reduced-motion                                                    | a11y fail                                   | ✅ Resolved §1: listbox alternative, 900ms zoom / 0ms reduced-motion, modal trap + focus return, `moss` 3px focus-visible, S6 path (T2.2, T3.3, T5.2) | manual + axe T5.2                  |
| 12  | Starter template in `main.ts`/`counter.ts`                                   | confusion, dead code                        | ✅ Resolved: T0.1 deletes `counter.ts`/demo markup/unused assets, `tokens.css` replaces `style.css` (no code yet, docs locked)                        | `vp check` clean                   |
| 13  | `pbdb-api.md` says "precompute" but roadmap says "live proxy"                | conflicting guidance                        | ✅ Resolved 2026-09-06: `pbdb-api.md` cache + era sections rewritten to live proxy + per-Period merge; ADR-002 + §3.5 win                             | docs agree; proxy contract pending |
| 14  | No host chosen for serverless proxy                                          | proxy unbuildable                           | ✅ Vercel is the production host in ADR-002; project root, runtime, build settings, preview, and local execution remain T0.0/D5 work                  | deployment smoke test              |
| 15  | Broad PBDB era matching may vary by endpoint                                 | incomplete or empty results                 | ✅ Resolved in the design: deterministic per-Period requests and merge in `pbdb-api.md` + §3.2                                                        | vitest era merge                   |
| 16  | Country polygons source undecided                                            | globe pick unbuildable                      | ✅ Bundled Natural Earth country data is selected; ISO2/GB-to-UK mapping, license, attribution, and basemap style remain T0.3/D4 work                 | fixture and attribution check      |
| 17  | Font loading blows budget                                                    | LCP regression                              | ✅ Resolved §1: Space Grotesk 500/700 + Inter 400/500 self-host, `swap`, tabular-nums, 4 files max (T0.1, T4.2)                                       | build manifest + Lighthouse        |
| 18  | `sessionStorage` JSON corrupt / disabled                                     | crash on load                               | ✅ Resolved §2.2: versioned safe read/write + schema validation + fetch fallback contract (T0.3)                                                      | vitest guard                       |
| 19  | Leader-line overload on fossil-rich countries (US/DE)                        | line soup, unreadable                       | ✅ Resolved ADR-004: cap 8 + "+N more", 500 segs, group by `tid` count; drawer keeps full list (T2.3)                                                 | vitest grouping + visual T2.3      |
| 20  | Small-country labels collide at low zoom                                     | overlap, clutter                            | ✅ Resolved ADR-004: hide small labels until safe zoom, collision-tested symbol layer, F7 (T2.1)                                                      | F7 e2e                             |

---

## 5. Phased roadmap (mentor-ticketed, tracer bullets + micro-chunks)

Rules (from `to-tickets` + `tdd` + `setup-ts-deep-modules`): each ticket is a vertical tracer bullet (schema→API→UI→test), sized to one mentor turn, with blocking edges. Each micro-chunk (M) is one red→green TDD cycle at a pre-agreed seam. Do chunks in order. Pure logic → `packages/utils/src/*.ts` via the package entry point; applications consume the workspace package, never another package's `src` directory. Commit per chunk. The dependency table in §6 is authoritative; phase headings are grouping only. `T0.0` and D4-D7 readiness work must be complete before feature tickets are handed to the mentor.

### Phase 0 — Foundation — exit: starter gone, host chosen, CI red on budget breach

Blocked by: none.

#### T0.0 `chore: make the toolchain and deployment contract runnable` — Blocked by: none.

Mentor: `mentor: baseline and deployment gate?` Files: `docs/implementation-readiness.md`, workspace/package configuration, planned `api/tsconfig.json`, `vercel.json`, and CI configuration. DoD: clean starter passes the documented install/check/test/build commands; D4-D7 are either closed or explicitly blocked; no feature code is included. Check: `vp check`, `vp run -r test`, `vp run -r build`. Perf: record the unmodified build baseline. Doc: https://viteplus.dev/guide/ci

- M0.0.1 resolve the `tsgo` dependency failure and record whether `@typescript/native-preview` or the non-tsgo pack path is used.
- M0.0.2 add a typed check for root `api/` and document Vercel root, runtime, build/output settings, preview environment, and local `/api` execution.
- M0.0.3 make the workspace package dependency and task ordering explicit; prove the website imports only the public utility export.
- M0.0.4 close D4-D7 with ADRs or leave them as named blockers. No feature ticket may absorb one of these decisions.

#### T0.1 `chore: strip starter and install globe deps` — Blocked by: T0.0.

Mentor: `mentor: strip starter?` Files: `apps/website/src/main.ts`, `apps/website/src/counter.ts` (delete), `apps/website/src/style.css`→`apps/website/src/styles/tokens.css`, `apps/website/package.json`. DoD: `vp check` clean, globe only via lazy import, and package dependencies match the workspace contract. Check: `vp check`. Perf: baseline recorded by T0.0; compare the new initial bundle. Doc: https://maplibre.org/maplibre-gl-js/docs/

- M0.1.1 delete starter (red: no test; green: delete): remove `counter.ts`, demo markup in `main.ts`, unused `hero.png` refs. Snippet:

```ts
// main.ts — TODO: you fill in boot shell only
import "./styles/tokens.css";
document.querySelector("#app")!.innerHTML = `<div id="globe"></div><aside id="drawer"></aside>`;
```

- M0.1.2 tokens.css (locked Q1–Q3 Round 2): `:root{--paper:#FAF7F0;--card:#fff;--ink:#1E242B;--ink-soft:#4A545E;--moss:#2F7D62;--straw:#D9A441;--sky:#DCEBF5;--sand:#EDE6D6;--line:#E5DED0}` + `:focus-visible{outline:3px solid var(--moss)}` + panel rule (1px `line` border, 12px radius, 8px gap). No test; visual.
- M0.1.3 deps + lazy guard: `pnpm add maplibre-gl` + `@fontsource/space-grotesk @fontsource/inter` (locked Q4 Round 2 — 2 families only); assert no static `import "maplibre-gl"` in `main.ts` (grep in CI). Snippet:

```ts
// TODO: you fill in — lazy only, never static import
const loadGlobe = () => import("./globe/index.ts");
```

- M0.1.4 remove starter-only assets after confirming no planned UI references them.

#### T0.2 `chore: CI perf + lint gates` — Blocked by: T0.0, T0.1.

Files: `.github/workflows/ci.yml`, benchmark config, `vite.config.ts`, `package.json` (devDeps). DoD: CI runs the test matrix in `docs/implementation-readiness.md`; a temporary budget breach fails and reverting it passes. Check: `vp check`, `vp test`, `vp build`.

- M0.2.0 add the selected browser/Lighthouse dependencies with pinned versions and use Vite+'s documented GitHub Action setup.
- M0.2.1 configure a benchmark command explicitly (`vitest bench`); `vp test` is not assumed to discover benchmark files.
- M0.2.2 budget gate: parse the actual Vite build manifest or report artifact and assert initial gzip <250KB and globe chunk <150KB. Do not depend on an undocumented `vp build --report` flag.
- M0.2.3 enforce the utility package public-export rule with a configured dependency check, not an unconfigured “boundary lint” claim.

#### T0.3 `chore: country polygons + URL state skeleton` — Blocked by: T0.0, T0.1.

Files: planned `apps/website/public/geo/countries.geojson`, `apps/website/src/store.ts`, `apps/website/src/url.ts`. DoD: `?cc=US&era=Mesozoic` sets state, no fetch. Check: `vp test`.

- M0.3.1 geo file: add Natural Earth `countries.geojson` with documented version/license in `apps/website/public/geo/ATTRIBUTION.md`, normalized ISO2 properties, and explicit `GB` polygon → `UK` application mapping. Verify: fixture exists, <500KB, and includes a MultiPolygon plus antimeridian case.
- M0.3.2 url parse/serialize (TDD seam `parseUrl`/`serializeUrl`): test `?cc=gb&era=mesozoic` → `{cc:"UK",era:"Mesozoic"}` (GB→UK here too). Snippet:

```ts
// TODO: you fill in — normalize + GB→UK + era default Mesozoic
export function parseUrl(s: string): { cc: string | null; era: Era } {
  /* ... */
}
```

- M0.3.3 store: `subscribe/render`, LRU Map(12), versioned `sessionStorage` try/catch, `source/status` semantics, and stale-response protection. Snippet: `export const store = createStore({ cc: null, era: "Mesozoic" as Era, status: "idle" as Status });`

### Phase 1 — Data pipeline — exit: live proxy serving validated `SitePayload`

Blocked by: T0.0, T0.1, T0.2.

#### T1.1 `feat(data): timescale adapter` — Blocked by: T0.0, T0.2 (public-export check).

Mentor: `mentor: era buckets from intervals?` Files: planned `packages/utils/src/timescale.ts`, `packages/utils/src/index.ts` (re-export), `packages/utils/tests/timescale.test.ts`, and `apps/website/public/data/timescale.json`. DoD: the checked-in snapshot maps named Period rows to the three eras; Triassic/Jurassic/Cretaceous→Mesozoic; unknown→fallback+warn. Check: `vp test`. Doc: https://paleobiodb.org/data1.2/intervals_doc.html Perf: load the static snapshot once, not per request.

- M1.1.1 `normalizeColor` (seam: pure fn): accept `#RGB/#RRGGBB/RRGGBB/rgb()` → `#RRGGBB` else `#2F7D62`. Snippet:

```ts
// TODO: you fill in — §3.4 table
export function normalizeColor(raw: string): string {
  /* ... */
}
```

- M1.1.2 `eraOfPeriod` map: `Triassic|Jurassic|Cretaceous→Mesozoic`, etc.; unknown→`Mesozoic`+`console.warn`. Test pins table.
- M1.1.3 `getEpochs` blurbs: `nam,eag,lag,col→EpochBlurb` + `description` 1–2 lines (static copy map, not PBDB text). Snippet: `export function toBlurb(r: IntervalRow): EpochBlurb { /* ... */ }`
- M1.1.4 entry-point export: add to `index.ts`; boundary lint passes.

#### T1.2 `feat(data): PBDB pure client and aggregation` — Blocked by: T1.1, T0.2.

Mentor: `mentor: proxy URL for UK?` Files: planned `packages/utils/src/pbdb.ts` + tests. DoD: pure code expands one era into Period URLs, parses fixed fixtures, returns `ParsedOccurrences`, groups by `tid` into cards with all sites, and has deterministic age/name/formation behavior. Check: `vp test`. Perf: bounded rows and no DOM dependency. Doc: https://paleobiodb.org/data1.2/occs/list_doc.html

- M1.2.1 `normalizeCc`: trim+upper, `GB→UK`. Test: `GB,gb," uk "`→`UK`.

```ts
// TODO: you fill in
export function normalizeCc(cc: string): string {
  /* ... */
}
```

- M1.2.2 `buildOccsUrls` per-Period expansion (quirk 15): `era→Period[]` (`Mesozoic→[Triassic,Jurassic,Cretaceous]`), `show=coords,ident,strat`, `limit=500`. Test asserts normalized `cc=UK` in every URL.
- M1.2.3 `parseOccs`: count raw rows, coerce only valid numeric fields, drop missing/null/out-of-range/0,0 coordinates and missing `tna/tid`, and return `ParsedOccurrences`. Test uses malformed literal fixtures.
- M1.2.4 `groupByTid`: merge duplicate `tid`, preserve every valid site, aggregate age envelope and deterministic formation, then sort by occurrence count desc, `eag` desc, and `tid` asc. Test: 3 rows/2 tids → 2 cards.
- M1.2.5 entry-point export and contract fixtures: all website consumers import the package export; no deep import.

#### T1.2b `feat(api): PBDB occurrence proxy` — Blocked by: T0.0, T1.2.

Files: planned `api/occs.ts`, `api/tsconfig.json`, proxy contract tests, and deployment config. DoD: allowlisted `cc`/`era`, bounded concurrent Period fetches, one 8s upstream-attempt deadline, typed 4xx/5xx JSON envelopes, `Retry-After` on 429, cache headers, and validated `SitePayload`. Check: `vp test`. Perf: no more than three Period requests per client request; upstream timeout is observable.

- M1.2b.1 define `200`, `400`, `429`, `502`, and timeout response bodies and headers before handler code.
- M1.2b.2 mock `fetch` for success, empty, malformed, timeout, 429, and 5xx; assert no PBDB URL or arbitrary query parameter is accepted from the client. Client retry timing is tested separately at 2s then 8s, at most twice.
- M1.2b.3 test local full-stack routing and a Vercel preview smoke request before calling the ticket complete.

#### T1.3 `feat(data): taxon detail proxy` — Blocked by: T1.2b.

Files: planned `api/taxon.ts`, `packages/utils/src/taxon.ts` + test. DoD: modal gets validated `TaxonDetail` in one fetch; the selected card remains the source for formation and coordinates. Check: `vp test`.

- M1.3.1 `toTaxonDetail` mapper + `pbdbUrl` builder. Map PBDB `oid`, `nam`, `rnk`, `att`, `par`, and `noc`; accept either `txn:NN` or `NN`, normalize to one `txn:NN`, and reject every other id before building the URL. Snippet: `export function taxonUrl(id: string): string { const raw = id.replace(/^txn:/, ""); if (!/^\\d+$/.test(raw)) throw new Error("invalid tid"); return \`https://paleobiodb.org/data1.2/taxa/single.json?id=txn:${raw}&show=attr\`; }`
- M1.3.2 `api/taxon.ts` route + cache headers (same as occs).

#### T1.4 `feat(data): seed + skeletons + badge` — Blocked by: T1.2b. Independent of T1.3.

Files: planned `apps/website/public/data/seed/US-Mesozoic.json`, `apps/website/src/ui/{skeleton,badge}.ts`. DoD: offline first visit shows seed+badge and exact `degraded` semantics. Check: `vp check`.

- M1.4.1 seed JSON ≤50 recs (hand-verified snapshot, matches `SitePayload`).
- M1.4.2 skeleton cards (`aria-busy=true`, "Loading fossil records…").
- M1.4.3 badge + Retry: exact copy §1; Retry refetches same `cc+era`.
- Seed checks: US/UK/DE/FR live + MG/MN empty states.

### Phase 2 — Globe core — exit: tap country → zoom → `?cc=` syncs, 60fps

Blocked by: T0.3 and D4. Data tickets are not required for the renderer itself.

#### T2.1 `feat(globe): lazy globe chunk, labels layer, default light` — Blocked by: T0.3, D4.

Mentor: `mentor: globe click → country?` Files: planned `apps/website/src/globe/{index,style,labels}.ts`. DoD: globe absent from initial JS; labels render, no dots. Check: `vp build --manifest` plus the artifact-size script. Doc: https://maplibre.org/maplibre-gl-js/docs/ Perf: chunk <150KB gzip.

- M2.1.1 `initGlobe` lazy: `await import("maplibre-gl")` inside `initGlobe(el)`, globe projection, selected self-hosted/approved light style, and documented attribution. Snippet:

```ts
// TODO: you fill in — never static-import maplibre-gl
export async function initGlobe(el: HTMLElement) {
  const m = await import("maplibre-gl"); /* ... */
}
```

- M2.1.2 transparent hit-test fill + label layers from bundled `countries.geojson`; small labels hidden until safe zoom (locked Q8). Rendered basemap sources follow D4; no unlicensed or undocumented public tile dependency.
- M2.1.3 manifest assert: the generated manifest shows `maplibre` in an async chunk only; the size script checks compressed bytes.

#### T2.2 `feat(globe): pick + center-zoom + listbox` — Blocked by: T2.1.

Files: planned `apps/website/src/globe/{pick,zoom}.ts`, `apps/website/src/ui/country-listbox.ts`, and benchmark configuration. DoD: click US→centers US + `?cc=US`, zoom<1s (locked Q8–Q9). Check: `vp test`.

- M2.2.1 `pickCountry` pure math (seam: `pointInPolygon`): ray-cast on geojson rings; ocean→`null`. Bench it. Snippet: `export function pointInPolygon(pt: [number,number], ring: [number,number][]): boolean { /* ... */ }`
- M2.2.2 `zoomTo` centers country bbox (900ms ease-out cubic locked Q9, 0ms if `matchMedia("(prefers-reduced-motion: reduce)")`). Snippet: `export function zoomDuration(): number { return matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900; }`
- M2.2.3 click wiring: map click→`pickCountry`→`store.setCc`→center + `history.pushState` for user selection. Initial URL normalization uses `replaceState`; ocean→hint copy.
- M2.2.4 listbox: `<select>` of ISO2→name (same `setCc` path); keyboard S6.

#### T2.3 `feat(globe): leader lines + silhouette callouts` — Blocked by: T2.2, T1.2b.

Mentor: `mentor: leader lines?` Files: planned `apps/website/src/globe/leaders.ts`, `packages/utils/src/leaders.ts` + test. DoD: CountryFocus shows ≤8 silhouette callouts + moss lines to 2–3px anchors with admin/city labels per ADR-005; redraws on era change (locked Q8). Check: `vp test` + visual.

- M2.3.1 `leaders` pure (seam): flatten card sites, rank taxon groups by site count desc then `tid`, select max 8 groups, and cap emitted segments at 500. Snippet: `export function leaders(cards: TaxonCard[], max = 8): Leader[] { /* ... */ }`
- M2.3.2 `render` single GeoJSON line + anchor layer (`moss` 1.5px, 2–3px anchor dots as line endpoints) + silhouette callouts (`moss` fill, Inter 500 short name) placed in sea/margin space per ADR-005; update on map move/zoom/resize; "+N more" chip when grouped; clear on era change. On narrow screens use a bottom rail inside the globe panel so the geometry remains defined.

### Phase 3 — Sites + cards + modal — exit: cards → 90% modal per §1 spec

Blocked by: data contracts and the card interaction shell. T3.1/T3.3 can proceed without T2.3.

#### T3.1 `feat(cards): grid + virtualize + paginate` — Blocked by: T1.1, T1.2.

Mentor: `mentor: card grid?` Files: planned `apps/website/src/ui/cards.ts`, `packages/utils/src/paging.ts` + test. DoD: 500 occurrence rows produce a bounded taxon-card DOM and scroll without jank. Check: `vp test`. Perf: no full-list DOM.

- M3.1.1 `page` pure: `slice(payload.cards, page*48, 48)`. Snippet: `export function page(cards: TaxonCard[], n: number, size = 48): TaxonCard[] { /* ... */ }`
- M3.1.2 `renderCards` viewport-only: IntersectionObserver appends next page; `aria-busy` during fetch.
- M3.1.3 card DOM per §1 spec: 3:2 `sand` figure + grid + flat silhouette + Inter name + tabular-nums Ma + ICS dot + `sfm` 1-line; hover via inset shadow (no shift).

#### T3.2 `feat(cards): silhouette set + ADR-003` — Blocked by: T3.1.

Files: planned `apps/website/public/sprites/*.svg`, `packages/utils/src/silhouette.ts` + test, `docs/adr/0003-silhouettes.md`. DoD: every card figured; unknown→fallback pinned. Check: `vp test`.

- M3.2.1 `silhouetteFor` keyword map (§3.3 table). Snippet:

```ts
// TODO: you fill in — order matters (ptero before saur)
export function silhouetteFor(
  tna: string,
):
  | "theropod"
  | "sauropod"
  | "ornithischian"
  | "pterosaur"
  | "marine"
  | "synapsid"
  | "amphibian"
  | "fallback" {
  /* ... */
}
```

- M3.2.2 8 SVGs ink-on-transparent + tick-bar component (1.8m human bar).
- M3.2.3 sprite sheet + lazy below-fold; ADR-003 already locked docs-only (no amendment).

#### T3.3 `feat(modal): taxon detail 90%` — Blocked by: T1.3, T3.1.

Files: planned `apps/website/src/ui/modal.ts`. DoD: keyboard open/close, axe clean. Check: `vp check`. Doc: https://paleobiodb.org/data1.2/

- M3.3.1 `openTaxon` shell: `role=dialog aria-modal`, backdrop, PBDB link, footnote. Snippet: `export function openTaxon(card: TaxonCard, detail: TaxonDetail, returnTo: HTMLElement): void { /* ... */ }`
- M3.3.2 focus trap: keep Tab inside, store `returnTo`. Snippet: `function trap(e: KeyboardEvent): void { /* ... */ }`
- M3.3.3 Esc + backdrop close + focus return; stats table (Ma, sfm, coords, tid).

### Phase 4 — Era strip + theme polish — exit: §1 spec pixel-complete

Blocked per ticket below; theme work is independent of data and card work.

#### T4.1 `feat(ui): era strip radiogroup` — Blocked by: T1.2b, T0.3.

Files: planned `apps/website/src/ui/era-strip.ts`. DoD: era switch never loses `cc`; back-button restores. Check: `vp test`.

- M4.1.1 radiogroup DOM: 3 buttons, `aria-checked`, ICS dots. Snippet: `export function renderEraStrip(active: Era, dots: Record<Era,string>): HTMLElement { /* ... */ }`
- M4.1.1b blurbs: load bundled `timescale.json` once → `toBlurb` per Period → render under country name; on a missing/corrupt snapshot show era name + Ma range only (no blurb). Never fetch PBDB directly from the browser.
- M4.1.2 filter-or-fetch: cache hit→instant filter; miss→skeleton+fetch same `cc`. Snippet: `export async function selectEra(era: Era): Promise<void> { /* ... */ }`
- M4.1.3 URL sync: `pushState` for user era changes, `replaceState` only for initial normalization, `popstate` restore without a new history entry; default `Mesozoic` first load.

#### T4.2 `feat(ui): segmented theme + 2 fonts` — Blocked by: T0.1. Independent of T4.1.

Files: planned `apps/website/src/styles/tokens.css`, `apps/website/src/main.ts` (fontsource imports). DoD: contrast ≥4.5:1, a11y 100, VS Code-style segments. Check: `vp check`.

- M4.2.1 fontsource self-host (locked Q4 Round 2): `@fontsource/space-grotesk` 500/700 + `@fontsource/inter` 400/500, `swap`, tabular-nums for Ma.
- M4.2.2 segmented CSS: `paper` canvas, 8px gaps, `card` panels 1px `line` + 12px radius; breakpoints §1 (60/40, 50/50, stacked<640px, globe 320px).
- M4.2.3 motion CSS: zoom handled in JS; card stagger max-6 × 40ms, `@media (prefers-reduced-motion: reduce){*{animation:none}}`.

#### T4.3 `feat(ui): copy deck + empty/error states` — Blocked by: T1.4, T4.1.

Files: planned `apps/website/src/ui/states.ts`, copy in §1. DoD: all 5 error cases (§2.3) show correct copy, including the no-fallback error state. Check: `vp check`.

- M4.3.1 `renderState` switch: `idle|loading|ready|empty|degraded|error` → exact strings §1. Snippet: `export function copyFor(s: Status, cc: string | null, era: Era): string { /* ... */ }`
- M4.3.2 footnote always visible: "Sites plotted at modern coordinates."
- M4.3.3 Retry wiring → refetch same `cc+era` (no state loss).

### Phase 5 — Perf, a11y, QA — exit: all §0 success criteria S1–S6 green

Blocked by: Phases 0–4.

#### T5.1 `perf: budget audit` — Blocked by: all build tickets.

DoD: regression fails CI (prove once). Check: `vp run -r build`.

- M5.1.1 `vp build --manifest`: initial gzip <250KB, globe chunk <150KB; record the command, compression method, and numbers in the PR.
- M5.1.2 Lighthouse CI: LCP<2.5s, INP<200ms on US/Mesozoic.
- M5.1.3 sprite/font audit: sheet size, 4 font files max, leader-layer segment cap live (500 segs, 8 callouts).

#### T5.2 `a11y: keyboard + motion + axe` — Blocked by: T3.3, T4.2.

DoD: axe 0 violations, S6 script passes. Check: `vp check`.

- M5.2.1 keyboard script: listbox→era→card→modal→Esc→focus-returns (manual checklist §1.1 F-flows).
- M5.2.2 reduced-motion: zoom 0ms, no stagger (assert `zoomDuration()===0` under emulation).
- M5.2.3 contrast: `ink/paper`, `ink-soft` ≥4.5:1; `moss` focus visible.

#### T5.3 `test: e2e golden paths F1–F7` — Blocked by: T5.1, T5.2, D5, D7.

DoD: 7 flows green against a deterministic local API fixture; live PBDB is a separate smoke check. Check: browser runner command documented in `docs/implementation-readiness.md`.

- M5.3.1 F1+F2+F7: first-visit + era switch + back-button + label-only zoomed-out check (zero dots zoomed-out; ADR-005 anchors in focus).
- M5.3.2 F3+F4: modal Esc + UK/`GB` normalize.
- M5.3.3 F5+F6: empty era + offline seed + Retry.

### Phase 6 — Launch + stretch (post-MVP, ordered, each needs `gh` issue + perf note)

Blocked by: T5.x sign-off. 1. `txn=` deep-link modal. 2. Longer TTLs + seeds. 3. `sfm` formation filter. 4. More countries. 5. Paleo-overlay spike (non-MVP).

---

## 6. `gh` issue breakdown (19 issues, dependency order = creation order)

Labels: `ready-for-agent` (build), `ready-for-human` (decisions/docs), `needs-triage` (stretch). Branch: `dev` → PR to `master`. Body = What to build + Acceptance criteria (DoD §5) + Blocked by + Perf + Check + Doc. Native blocking links where supported, else "Blocked by" text (per `to-tickets`).

| #     | Title                                                       | Label           | Blocked by                  | Perf                 | Check                                           |
| ----- | ----------------------------------------------------------- | --------------- | --------------------------- | -------------------- | ----------------------------------------------- |
| T0.0  | chore: make toolchain and deployment contract runnable      | ready-for-human | none                        | baseline report      | `vp check`, `vp run -r test`, `vp run -r build` |
| T0.1  | chore: strip starter and install globe deps                 | ready-for-agent | T0.0                        | baseline comparison  | `vp check`                                      |
| T0.2  | chore: CI perf + lint gates (250KB fail)                    | ready-for-agent | T0.0, T0.1                  | prove fail once      | `vp check`, `vp test`, `vp build`               |
| T0.3  | chore: country polygons + URL state skeleton                | ready-for-agent | T0.0, T0.1                  | no fetch on parse    | `vp test`                                       |
| T1.1  | feat(data): timescale adapter (3 eras + ICS normalize)      | ready-for-agent | T0.0, T0.2                  | static snapshot      | `vp test`                                       |
| T1.2  | feat(data): PBDB pure client and aggregation                | ready-for-agent | T1.1, T0.2                  | bounded rows         | `vp test`                                       |
| T1.2b | feat(api): PBDB occurrence proxy                            | ready-for-human | T0.0, T1.2                  | bounded requests/SWR | `vp test`                                       |
| T1.3  | feat(data): taxon detail proxy                              | ready-for-agent | T1.2b                       | single-fetch modal   | `vp test`                                       |
| T1.4  | feat(data): seed snapshot + skeletons + badge               | ready-for-agent | T1.2b                       | offline first-paint  | `vp check`                                      |
| T2.1  | feat(globe): lazy globe chunk + labels layer, default light | ready-for-human | T0.3, D4                    | chunk <150KB         | `vp build`                                      |
| T2.2  | feat(globe): pick + center-zoom + listbox + bench           | ready-for-agent | T2.1                        | zoom <1s             | `vp test`                                       |
| T2.3  | feat(globe): leader lines + silhouette callouts (cap 8)     | ready-for-agent | T2.2, T1.2b                 | single layer         | `vp test`, benchmark                            |
| T3.1  | feat(cards): grid + virtualize + paginate                   | ready-for-agent | T1.1, T1.2                  | no full-list DOM     | `vp test`                                       |
| T3.2  | feat(cards): silhouette set (ADR-003 locked)                | ready-for-human | T3.1                        | lazy sprite          | `vp test`                                       |
| T3.3  | feat(modal): 90% detail + a11y                              | ready-for-agent | T1.3, T3.1                  | axe 0                | `vp check`                                      |
| T4.1  | feat(ui): era strip radiogroup + URL sync                   | ready-for-agent | T1.2b, T0.3                 | no refetch on hit    | `vp test`                                       |
| T4.2  | feat(ui): segmented theme + 2 fonts (Space Grotesk + Inter) | ready-for-human | T0.1                        | a11y 100             | `vp check`                                      |
| T4.3  | feat(ui): copy deck + 5 error states                        | ready-for-human | T1.4, T4.1                  | —                    | `vp check`                                      |
| T5.x  | perf+a11y+e2e audit F1–F7 (S1–S6 sign-off)                  | ready-for-agent | all feature tickets, D5, D7 | LCP<2.5s             | matrix command                                  |

Create in order (blockers first): `gh issue create --title "…" --label ready-for-agent --body "Blocked by: … DoD: … Perf: … Check: …"`. Frontier = any issue whose blockers are closed. Stretch stays `needs-triage` until MVP ships.

---

## 7. Validation per ticket (mentor contract + TDD loop — enforced)

Every micro-chunk runs red→green at its seam (per `tdd`): 1 failing test → minimal code → pass → next chunk. No horizontal slicing (never all tests first). Expected values from spec literals (§3), never recomputed from code (no tautologies). Tests through public entry points only (per `setup-ts-deep-modules`).
Every ticket ends with: 1 task for you (`// TODO: you fill in`), 1 runnable check (`vp check`/`vp test`/`vp build`, or the named browser/benchmark command), 1 doc URL (MapLibre / Vite / Vitest / PBDB), 1 perf note. No full-file dumps unless asked. Ticket done = all chunks green + §5 DoD + check + perf.

Seams under test (pre-agreed, highest possible): `normalizeCc`, `buildOccsUrls`, `parseOccs`, `groupByTid`, `normalizeColor`, `eraOfPeriod`, `silhouetteFor`, `page`, `leaders`, `pointInPolygon`, `parseUrl/serializeUrl`, cache read/write guards, proxy contract (`/api/occs`, `/api/taxon`), and E2E F1–F7.

Mentor invocations: `mentor: strip starter?`, `mentor: era buckets from intervals?`, `mentor: proxy URL for UK?`, `mentor: globe click → country?`, `mentor: leader lines?`

## 8. Risks, non-goals, open decisions

Non-goals (locked 2026-09-06, amended 2026-09-07 by ADR-005): auth, CMS, uploads, native mobile, paleogeographic reconstruction, i18n, analytics, PWA, paid tiles, zoomed-out map dots (labels only). CountryFocus alone uses 2–3px anchor dots as leader endpoints. Static frontend + serverless proxy. Risk: PBDB schema drift → pin `data1.2`, validate in proxy, fail CI loudly. Risk: PBDB slowness/429 → client fallback plus bounded proxy retries (§2.3). Risk: proxy cache semantics → implement only the stale behavior the chosen cache can prove (§3.5, D6). Risk: silhouette licensing → own art only (ADR-003). Risk: leader-line overload → cap 8 callouts + grouping (§2.1). Risk: scope creep → any new ask needs a `gh` issue + ADR before code.

Closed decisions: D1 (host → Vercel, ADR-002), D2 (8-clade list, ADR-003), D3 (`straw #D9A441` final, §1). Open readiness decisions D4-D7 are listed in `docs/implementation-readiness.md`; they block only the tickets named in §6.

## 9. Skills, docs, traceability, certainty checklist

Applied: `grilling`+`grill-me` (§10 rounds) → `domain-modeling` (glossary §0) → `codebase-design` (modules/seams §2) → `frontend-design` (§1) → `wayfinder` (fog→map: zero open) → `to-spec` (this file §§0–4 are the spec) → `to-tickets` (§§5–6 tracer bullets + blocking edges) → `tdd` (§7 red→green per seam) → `setup-ts-deep-modules` (entry-point boundaries §5/§7) → `implement-spec` (frontier execution order §5). Online lookup: no new external skills needed — local skills cover breakdown discipline; MapLibre/Vite/Vitest/PBDB docs linked per ticket.

Traceability: every ticket → glossary term (§0) + quirk row (§4) + success criterion S1–S6 + flow F1–F7. ADRs: 001 (globe) → 002 (proxy, done) → 003 (silhouettes, done) → 004 (labels + leaders, done).

Certainty checklist (planning completeness, not implementation status):

- [x] Scope/success: §0 S1–S6 + non-goals + repo map.
- [x] Design exact: tokens/type/segments/motion/focus/card/modal/copy/era-strip/labels+leaders — §1.
- [x] Flows: F1–F7 golden paths — §1.1.
- [x] Architecture: modules + seams + state/URL + error taxonomy — §2.
- [x] Data normative: types + PBDB map + silhouettes + colors + cache/seed — §3.
- [x] Quirks have design resolutions and pending verification — §4.
- [x] Tickets have explicit blockers, micro-chunks, checks, and perf notes — §5–§6.
- [x] TDD seams are named — §7.
- [ ] Toolchain/deployment baseline is green — `docs/implementation-readiness.md` T0.0.
- [ ] D4-D7 are closed — `docs/implementation-readiness.md`.
- [x] Grill Round 1 Q1–Q4 + style Round 2 Q1–Q10 — §§10–11.
      Remaining fog: T0.0 and D4-D7; Phase 6 stretch stays `needs-triage`.

---

## 10. Grill Round 1 — answered 2026-09-06 (locked)

❓ **Q1** - **Scope lock**: static site + API, no auth/CMS/uploads?

✅ Locked: static site, no auth/accounts/CMS/uploads. Mobile = responsive floor only.

---

❓ **Q2** - **Data freshness**: predominantly PBDB API?

✅ Locked: live PBDB v1.2 primary via thin cached proxy (short-TTL + stale-while-revalidate). No precompute-only pipeline.

---

❓ **Q3** - **Silhouettes**: shaded 2D dino representations (inverted colors)?

✅ Locked: own flat 2D silhouette set, dark ink on light sand grid + scale ticks (inverted from reference). Clade-mapped, generic fallback. No third-party art for MVP.

---

❓ **Q4** - **Map style**: default MapLibre, light + fun + easy on eyes?

✅ Locked: default MapLibre light style. Light "Field Guide" theme (paper/card/ink/moss/sand). Horizontal era strip, ICS colors as chip dots only.

---

## 11. Grill Round 2 — style alignment (answered 2026-09-06, locked)

❓ **Q1** - **Page background**: warm paper vs white vs cool gray?

✅ Locked: warm `paper #FAF7F0` + `card #FFFFFF`.

---

❓ **Q2** - **Accent**: single moss vs +1 yellow/moss accent?

✅ Locked: `moss #2F7D62` primary + `straw #D9A441` secondary final (warnings, cached badge, halo only; never body text). D3 closed.

---

❓ **Q3** - **Card wash + panels**: sand+grid, VS Code segments?

✅ Locked: `sand #EDE6D6` + 8px grid figures; `line #E5DED0` 1px segmented panels + 12px radius + 8px gaps (VS Code style), no shadows except modal.

---

❓ **Q4** - **Fonts**: trio vs 2 minimalist Scandinavian?

✅ Locked: 2 families — `Space Grotesk` 500/700 titles + `Inter` 400/500 body/data (tabular-nums for Ma). Self-host, 4 files max. No mono family.

---

❓ **Q5** - **Silhouette rendering**: flat vs shaded gradient?

✅ Locked: flat `ink #1E242B` fill (crisp at small sizes).

---

❓ **Q6** - **Scale cue**: tick bar vs human figure per card?

✅ Locked: tick bar in cards, full human figure in modal only.

---

❓ **Q7** - **Era strip**: pill+dots vs full ICS vs vertical?

✅ Locked: segmented pill `radiogroup` + ICS dots; globe stays default light.

---

❓ **Q8** - **Map markers**: dots vs labels + leader lines?

✅ Locked + ADR-005 amendment: NO dots zoomed-out. Zoomed-out = country labels only (small hidden until safe zoom, F7). CountryFocus = frame country with sea margin + admin-1/city labels + `moss` 1.5px leaders from 2–3px anchors to ≤8 silhouette callouts + "+N more". `sites/cluster` module replaced by `leaders` (§2.1, T2.3, quirks 19–20).

---

❓ **Q9** - **Motion**: 900ms + stagger vs 400ms snappy?

✅ Locked: 900ms ease-out cubic + 6×40ms stagger, 0ms reduced-motion.

---

❓ **Q10** - **Modal**: 90% centered + sheet mobile?

✅ Locked: 90% centered dialog + bottom sheet mobile.

---

Next: create `gh` issues per §6, start Phase 0 via `mentor: strip starter?`
