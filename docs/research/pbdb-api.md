# PBDB API — findings (resolves #2)

Sources: https://paleobiodb.org/data1.2/ (stable v1.2), occs_doc, taxa_doc, live-tested Sep 2026.

## Endpoints (all GET, JSON, no key, fair-use)

- `occs/list.json?cc=XX&interval=<Name>&limit=&show=coords,ident,strat`
  → `{ records: [...] }`; occurrence rows include `tna`, `oid/tid/cid`,
  `eag/lag` (numeric Ma), `oei` (interval/stage label), `lng/lat` (strings
  in the JSON response), and `sfm` (formation).
- `occs/taxa.json?<same params>&rank=genus&show=attr`
  → optional taxon summary for cards (counts per taxon); MVP does not make
  this extra request because occurrence rows are grouped locally by `tid`.
- `intervals/list.json?scale=1`
  → full timescale: `nam/itp` (era/period/epoch), `eag/lag`, `col` (ICS color), `pid` parent.
- `taxa/single.json?id=txn:NN&show=attr` → `{ records: [...] }` with taxon
  metadata such as `oid`, `nam`, `rnk`, `att`, `par`, and `noc`; it does not
  provide the selected occurrence's coordinates, formation, or age range.

## Country param

- `cc` = ISO-3166-1 alpha-2, EXCEPT UK: use `cc=UK` (not `GB` — verified live, `GB` warns + empty).
- Verified: `US`, `UK`, `DE`, `FR` return records; `GB` returns warning + `[]`.

## Cache strategy (meets perf budget) — design is superseded by ADR-002 + roadmap §3.5

- Live PBDB `data1.2` primary via thin cached proxy (`GET /api/occs?cc=&era=`, `GET /api/taxon?id=`). Never call PBDB from browser.
- Headers: `Cache-Control: public, max-age=60, stale-while-revalidate=86400`; payload carries `updatedAt` and only claims `stale=true` when the proxy can prove it served an older payload.
- `show=coords,ident,strat` only (not full `loc` text); `limit=500`; page 48 + virtualize client-side.
- Fallback: planned seed `apps/website/public/data/seed/US-Mesozoic.json` (first paint/offline) + matching client cache + "data may be incomplete" badge + Retry (same `cc+era`).
- Historical note: precompute-per-`country+era` at build/deploy was the earlier plan; live proxy replaces it.

## Era mapping

- MVP does not rely on broad era matching: expand each era into its named Period requests and merge deterministically (quirk 15): Mesozoic = `Triassic,Jurassic,Cretaceous`; Paleozoic = `Cambrian,Ordovician,Silurian,Devonian,Carboniferous,Permian`; Cenozoic = `Paleogene,Neogene,Quaternary`.
- Refine epoch blurbs with `min_ma/max_ma` from `intervals/list.json` for display.
