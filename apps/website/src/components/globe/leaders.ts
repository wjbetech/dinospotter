import type { GeoJSONSource } from "maplibre-gl";
import { placeCallouts, type Leader } from "utils";

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

export function renderCallouts(
  _map: import("maplibre-gl").Map,
  wrap: HTMLElement,
  leaders: Leader[],
  onPick: (tid: string) => void,
): void {
  const positioned = placeCallouts(leaders, wrap.clientWidth < 640);

  for (const callout of positioned.slice(0, 12)) {
    const button = document.createElement("button");
    button.className = "callout";
    button.innerHTML = `
    <img src="/sprites/fallback.svg" alt="" />
    <span>${callout.tna}</span>
   `;
    button.addEventListener("click", () => onPick(callout.tid));
    button.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onPick(callout.tid);
      }
    });
    wrap.append(button);
  }

  if (leaders.length > 12) {
    const more = document.createElement("button");
    more.textContent = `+${leaders.length - 12} more`;
    more.addEventListener("click", () => document.querySelector("#drawer")?.scrollIntoView());
    wrap.append(more);
  }
}
