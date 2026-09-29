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

  map.getSource("leaders")
    ? (map.getSource("leaders") as any).setData(lines)
    : map.addSource("leaders", {
        type: "geojson",
        data: lines,
      });

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
