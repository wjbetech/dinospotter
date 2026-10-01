import type { GeoJSONSource } from "maplibre-gl";
import type { Leader } from "utils";

export function render(map: import("maplibre-gl").Map, leaders: Leader[]) {
  const lines = {
    type: "FeatureCollection",
    features: leaders.map((leader) => ({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [leader.anchor, leader.callout],
      },
    })),
  };

  if (map.getSource("leaders")) {
    void (map.getSource("leaders") as GeoJSONSource).setData(lines);
  } else {
    map.addSource("leaders", {
      type: "geojson",
      data: lines,
    });
  }

  if (!map.getLayer("leaders")) {
    map.addLayer({
      id: "leaders",
      type: "line",
      source: "leaders",
      paint: {
        "line-color": "#2F7D62",
        "line-width": 1.5,
      },
    });
  }
}
