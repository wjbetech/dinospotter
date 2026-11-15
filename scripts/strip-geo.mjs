import { readFileSync, writeFileSync } from "node:fs";

const path = "apps/website/public/geo/countries.geojson";
const geo = JSON.parse(readFileSync(path, "utf-8"));

geo.features = geo.features.map((feature) => {
  const raw =
    feature.properties.ISO_A2 === "-99" ? feature.properties.ISO_A2_EH : feature.properties.ISO_A2;

  return {
    type: "Feature",
    geometry: feature.geometry,
    properties: {
      ISO2: raw === "GB" ? "UK" : raw,
      NAME: feature.properties.NAME,
      LABEL_X: feature.properties.LABEL_X,
      LABEL_Y: feature.properties.LABEL_Y,
      LABELRANK: feature.properties.LABELRANK,
      MAPCOLOR7: feature.properties.MAPCOLOR7,
    },
  };
});

writeFileSync(path, JSON.stringify(geo));
