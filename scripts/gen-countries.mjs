import { readFileSync, writeFileSync } from "node:fs";

const geo = JSON.parse(readFileSync("apps/website/public/geo/countries.geojson", "utf8"));
const rows = geo.features
  .map((feat) => {
    const raw =
      feat.properties.ISO_A2 === "-99" ? feat.properties.ISO_A2_EH : feat.properties.ISO_A2;
    const code = raw === "GB" ? "UK" : raw;
    const name = feat.properties.NAME;
    if (!code || code === "-99" || !name) return null;
    return `  { countryCode: "${code}", name: "${name.replace(/"/g, '\\"')}" },`;
  })
  .filter(Boolean)
  .sort();

writeFileSync(
  "packages/utils/src/countries.ts",
  `export const COUNTRIES = [\n${rows.join("\n")}\n] as const;\n`,
);
