# ADR-005: CountryFocus detail for every country

Status: accepted 2026-09-07 (amends ADR-004 for focused-nation view only).
Reference: `docs/research/asset/example.png` is one instance of the
pattern, not the spec: focused nation + regional divisions + major
towns + silhouettes in margin space with leaders to findspots.
Decision: on CountryFocus, for any ISO2, fit the country bbox with
margin padding and show admin-1 + major town/city labels plus scale;
place at most 8 silhouette callouts (moss silhouette + short name) in
margin space with 1.5px `moss` leaders to 2–3px anchor dots at
findspots; overflow → "+N more".
Why: one generic rule reproduces the reference pattern worldwide;
anchors are endpoints of the single line layer (≤500 segments), not a
marker layer, so ADR-004 perf rationale holds.
Open: D4 must pick the global basemap/admin/city source, license,
attribution, and offline behavior; cards/modal keep `ink` (ADR-003).

Phase 7 amendment (roadmap Round 3, implemented 2026-11-27): cap is 12;
English major cities and metric scale remain, admin-1 and island insets are out.
Bundled 50m places replaces the sparse 110m cities extract; see geo attribution.
