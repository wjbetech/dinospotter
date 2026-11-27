import type { GeoJSONSource, Map } from "maplibre-gl";
import { placeCallouts, silhouetteFor, type Leader, type PositionedCallout } from "utils";

export function render(map: Map, items: PositionedCallout[], wrap: HTMLElement) {
  const bounds = wrap.getBoundingClientRect();
  const features = items.flatMap((item) => {
    const button = [...wrap.querySelectorAll<HTMLElement>(".callout")].find(
      (el) => el.dataset.tid === item.tid,
    );
    if (!button) return [];
    const rect = button.getBoundingClientRect();
    const x = rect.left - bounds.left + rect.width / 2;
    const y = rect.top - bounds.top + rect.height / 2;
    if (x < 0 || x > bounds.width) return [];
    return [
      {
        type: "Feature" as const,
        properties: { tid: item.tid },
        geometry: {
          type: "LineString" as const,
          coordinates: [item.anchor, map.unproject([x, y]).toArray()],
        },
      },
    ];
  });
  const data = { type: "FeatureCollection" as const, features };
  const source = map.getSource("leaders") as GeoJSONSource | undefined;
  if (source) void source.setData(data);
  else map.addSource("leaders", { type: "geojson", data });
  if (!map.getLayer("leaders"))
    map.addLayer({
      id: "leaders",
      type: "line",
      source: "leaders",
      paint: { "line-color": "#2F7D62", "line-width": 1.5, "line-opacity": 0.65 },
    });
  const anchors = {
    type: "FeatureCollection" as const,
    features: items.map((item) => ({
      type: "Feature" as const,
      properties: {},
      geometry: { type: "Point" as const, coordinates: item.anchor },
    })),
  };
  const anchorSource = map.getSource("findspots") as GeoJSONSource | undefined;
  if (anchorSource) void anchorSource.setData(anchors);
  else map.addSource("findspots", { type: "geojson", data: anchors });
  if (!map.getLayer("findspots"))
    map.addLayer({
      id: "findspots",
      type: "circle",
      source: "findspots",
      paint: { "circle-radius": 2.5, "circle-color": "#2F7D62" },
    });
}

export function renderCallouts(
  map: Map,
  wrap: HTMLElement,
  items: Leader[],
  onPick: (tid: string, button: HTMLButtonElement) => void,
): () => void {
  wrap.querySelectorAll(".callout, .callout-rail").forEach((el) => el.remove());
  const positioned = placeCallouts(items.slice(0, 12), {
    width: wrap.clientWidth,
    height: wrap.clientHeight,
  });
  const rail = document.createElement("div");
  rail.className = "callout-rail";
  if (positioned[0]?.rail) wrap.append(rail);
  for (const item of positioned) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "callout";
    button.dataset.tid = item.tid;
    const art = document.createElement("span");
    art.className = "callout-art";
    art.style.setProperty("--silhouette", `url('/sprites/${silhouetteFor(item.tna)}.svg')`);
    art.setAttribute("aria-hidden", "true");
    const footprint = document.createElement("span");
    footprint.className = "callout-footprint";
    footprint.style.setProperty("--footprint", "url('/sprites/footprint.svg')");
    footprint.setAttribute("aria-hidden", "true");
    const name = document.createElement("span");
    name.className = "callout-name";
    name.textContent = item.tna;
    button.append(art, footprint, name);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      onPick(item.tid, button);
    });
    button.addEventListener("dblclick", (event) => event.stopPropagation());
    if (item.rail) rail.append(button);
    else {
      button.style.left = `${item.callout[0]}px`;
      button.style.top = `${item.callout[1]}px`;
      wrap.append(button);
    }
  }
  const redraw = () => render(map, positioned, wrap);
  rail.addEventListener("scroll", redraw);
  redraw();
  return redraw;
}
