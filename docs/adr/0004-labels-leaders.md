# ADR-004: Labels-only globe + leader lines, no dots (design resolution for quirks 7, 8, 19, 20)

Status: accepted 2026-09-06.
Decision: zoomed-out globe shows country name labels only (MapLibre symbol layer from bundled Natural Earth `countries.geojson`); small labels hide until safe zoom (collision-tested, F7). On CountryFocus the camera centers the country and `moss` 1.5px leader lines fan from every retained findspot to at most 8 taxon callout chips plus "+N more"; one GeoJSON line layer, 500 segments maximum, redraws on map movement, resize, and era change. Zero visible point layers.
Leader geometry: chips are DOM elements in a fixed rail. Each line endpoint is recomputed from the chip's screen anchor and converted back into map coordinates; it is not a fixed geographic point. Desktop uses the drawer-side rail; narrow screens use a bottom rail inside the globe panel.
Data provenance: the bundled country dataset must include its source version, license, and required attribution in `apps/website/public/geo/ATTRIBUTION.md` before it ships.
Why: user lock style Q8; dots fail density + 60fps; lines keep findspot truth without clutter. Overload is guarded by caps + deterministic grouping (quirks 7/19); collisions are guarded by zoom thresholds (quirks 8/20).
Alt: dot markers / silhouette pins (rejected — clutter, perf).
