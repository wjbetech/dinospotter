import { createStore } from "../../store";
import { pickCountry } from "../../globe/pick.ts";
import { zoomTo } from "../../globe/zoom.ts";
import { serializeUrl } from "../../url";

const store = createStore({
  countryCode: null,
  payload: null,
  era: "Mesozoic",
  status: "idle",
});
const hint = document.querySelector<HTMLElement>("#hint");

function bboxFor(_countryCode: string): [number, number, number, number] {
  return [-125, 24, -66, 49];
}

export async function initGlobe(el: HTMLElement) {
  await import("maplibre-gl/dist/maplibre-gl.css");
  const { Map, setWorkerUrl } = await import("maplibre-gl");
  const workerUrl = (await import("maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url")).default;
  setWorkerUrl(workerUrl);

  const map = new Map({
    container: el,
    style: "/styles/light.json",
    center: [0, 20],
    zoom: 3,
  });

  map.on("load", async () => {
    const geo = await fetch("/geo/countries.geojson").then((r) => r.json());

    map.addSource("countries", {
      type: "geojson",
      data: geo,
    });

    map.addLayer({
      id: "hit",
      type: "fill",
      source: "countries",
      paint: {
        "fill-color": "transparent",
      },
    });

    map.addLayer({
      id: "labels",
      type: "symbol",
      source: "countries",
      layout: {
        "text-field": ["get", "name"],
        "text-allow-overlap": false,
        "text-ignore-placement": false,
        "text-optional": true,
      },
    });

    if (new URLSearchParams(location.search).get("spike") === "paleo") {
      const { togglePaleo } = await import("../../globe/paleo-spike.ts");
      togglePaleo(map, true);
    }

    map.on("click", (e) => {
      const countryCode = pickCountry([e.lngLat.lng, e.lngLat.lat], geo.features);

      if (!countryCode) {
        if (hint) hint.textContent = "Pick a country to start.";
        return;
      }

      store.setState({ countryCode });
      zoomTo(map, bboxFor(countryCode));
      history.pushState(null, "", "?" + serializeUrl(countryCode, store.getState().era));
    });

    return geo;
  });

  return map;
}
