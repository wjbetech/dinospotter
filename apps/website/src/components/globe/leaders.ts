import type { GeoJSONSource } from "maplibre-gl";
import { placeCallouts, silhouetteFor, type Leader } from "utils";

export function render(map: import("maplibre-gl").Map, leaders: Leader[]) {
  const positioned = placeCallouts(leaders, map.getContainer().clientWidth < 640);
  const lines = {
    type: "FeatureCollection",
    features: positioned.map((leader) => ({
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
  map: import("maplibre-gl").Map,
  wrap: HTMLElement,
  leaders: Leader[],
  onPick: (tid: string) => void,
): void {
  wrap.querySelectorAll(".callout").forEach((el) => el.remove());
  const positioned = placeCallouts(leaders, wrap.clientWidth < 640);

  for (const callout of positioned.slice(0, 12)) {
    const button = document.createElement("button");
    button.className = "callout";
    const img = document.createElement("img");
    img.src = `/sprites/${silhouetteFor(callout.tna)}.svg`;
    img.alt = "";
    const name = document.createElement("span");
    name.textContent = callout.tna;
    button.append(img, name);
    const pt = map.project([callout.x, callout.y]);
    button.dataset.lng = String(callout.x);
    button.dataset.lat = String(callout.y);
    button.style.cssText = `
    position:absolute;
    left:${pt.x}px;
    top:${pt.y}px;
    transform:translate(-50%, -50%)
    `;
    button.addEventListener("click", () => onPick(callout.tid));
    wrap.append(button);
  }

  if (leaders.length > 12) {
    const more = document.createElement("button");
    more.textContent = `+${leaders.length - 12} more`;
    more.addEventListener("click", () => document.querySelector("#drawer")?.scrollIntoView());
    wrap.append(more);
  }
}
