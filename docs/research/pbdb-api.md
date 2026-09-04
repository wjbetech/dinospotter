# PBDB API — findings (resolves #2)

Sources: https://paleobiodb.org/data1.2/ (stable v1.2), occs_doc, taxa_doc, live-tested Sep 2026.

## Endpoints (all GET, JSON, no key, fair-use)

- `occs/list.json?cc=XX&interval=<Name>&limit=&show=coords,ident,strat`
  → occurrences: `tna` (taxon), `oid/tid/cid`, `eag/lag` (Ma), `oei`, `lng/lat`, `sfm` (formation).
- `occs/taxa.json?<same params>&rank=genus&show=attr`
  → taxon summary for cards (counts per taxon).
- `intervals/list.json?scale=1`
  → full timescale: `nam/itp` (era/period/epoch), `eag/lag`, `col` (ICS color), `pid` parent.
- `taxa/single.json?id=txn:NN&show=attr` → detail for 90% modal.

## Country param

- `cc` = ISO-3166-1 alpha-2, EXCEPT UK: use `cc=UK` (not `GB` — verified live, `GB` warns + empty).
- Verified: `US`, `UK`, `DE`, `FR` return records; `GB` returns warning + `[]`.

## Cache strategy (meets perf budget)

- Never call PBDB from browser. Proxy + precompute per `country+era` at build/deploy (or nightly edge function), serve static JSON to client.
- `show=coords` only (not full `loc` text) keeps payloads small; cap `limit`, paginate cards client-side.
- Fallback: stale cache + “data may be incomplete” badge when PBDB down.

## Era mapping

- Query `interval=<Era>` (e.g. `Triassic`) for coarse buckets; refine with `min_ma/max_ma` from `intervals/list.json` for epoch blurbs.
