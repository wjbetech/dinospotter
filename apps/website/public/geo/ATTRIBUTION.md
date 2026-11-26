# Geography attribution

- Countries: existing bundled Natural Earth 110m country polygons, public domain.
  The exact original extract version has not been recorded and still needs confirmation.
- Places: Natural Earth 50m populated places v5.1.2, public domain.
  [Source](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_50m_populated_places.geojson)
  and [license](https://www.naturalearthdata.com/about/terms-of-use/).
- The 110m places file contained only Seoul for KR; the 50m extract supplies
  Seoul, Busan, Incheon, and Daejeon. This is the smallest tested scale meeting
  the capital + three other cities requirement for the KR proof.
- Regenerate with `node scripts/gen-places.mjs` from the repository root.
  The script retains capitals plus the three largest other named places per country,
  rounds coordinates to four decimals, and rejects output above 100KB.
- ISO2 codes are normalized to the app's GB → UK convention. Names are English
  where supplied by Natural Earth; populations describe the source dataset,
  not current population estimates.
