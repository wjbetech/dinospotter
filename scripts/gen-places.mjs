// Natural Earth v5.1.2, public domain. Keep capitals + three largest other places per country.
import { writeFileSync } from "node:fs";
const source =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_populated_places.geojson";
const response = await fetch(source);
if (!response.ok) throw new Error(`Natural Earth: HTTP ${response.status}`);
const geo = await response.json();
const groups = new Map();
for (const feature of geo.features) {
  const cc = feature.properties.ISO_A2;
  if (!cc || cc === "-99") continue;
  if (!groups.has(cc)) groups.set(cc, []);
  groups.get(cc).push(feature);
}
const features = [...groups]
  .sort(([a], [b]) => a.localeCompare(b))
  .flatMap(([cc, items]) => {
    const capitals = items.filter((f) => f.properties.ADM0CAP);
    const rest = items
      .filter((f) => !f.properties.ADM0CAP)
      .sort(
        (a, b) =>
          b.properties.POP_MAX - a.properties.POP_MAX ||
          a.properties.NAME.localeCompare(b.properties.NAME),
      )
      .slice(0, 3);
    return [...capitals, ...rest].map((f) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: f.geometry.coordinates.map((n) => Math.round(n * 10000) / 10000),
      },
      properties: {
        name: f.properties.NAME_EN || f.properties.NAME,
        iso2: cc === "GB" ? "UK" : cc,
        capital: Boolean(f.properties.ADM0CAP),
        pop: f.properties.POP_MAX,
      },
    }));
  });
const output = JSON.stringify({ type: "FeatureCollection", features });
if (Buffer.byteLength(output) > 100 * 1024) throw new Error("Places exceed 100KB budget");
writeFileSync(new URL("../apps/website/public/geo/places.geojson", import.meta.url), output);
console.log(`${features.length} places, ${Buffer.byteLength(output)} bytes`);
