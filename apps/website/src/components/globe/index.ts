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

    const points = {
      type: "FeatureCollection",
      features: geo.features.map((f: any) => ({
        type: "Feature",
        properties: f.properties,
        geometry: {
          type: "Point",
          coordinates: f.properties.LABEL_X
            ? [f.properties.LABEL_X, f.properties.LABEL_Y]
            : f.geometry.coordinates[0][0][0],
        },
      })),
    };

    map.addSource("labels", { type: "geojson", data: points as any });

    const img = new Image(8, 8);
    img.src =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVQYV2N49+7dfwYGBgZGBgYGBgYAZw8Hv0vWHwAAAABJRU5ErkJggg==";

    await img.decode();

    const size = 64;
    const canva = document.createElement("canvas");
    canva.width = canva.height = size;
    const ctx = canva.getContext("2d")!;
    const imgData = ctx.createImageData(size, size);
    for (let i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = 30;
      imgData.data[i + 3] = Math.random() > 0.5 ? 22 : 0;
    }
    map.addImage("grain", { width: size, height: size, data: imgData.data } as any);

    map.addImage("grain", {
      width: size,
      height: size,
      data: imgData.data,
    } as any);

    map.addLayer({
      id: "land",
      type: "fill",
      source: "countries",
      paint: { "fill-color": "#e7ffed" },
    });

    map.addLayer({
      id: "grain",
      type: "fill",
      source: "countries",
      paint: {
        "fill-pattern": "grain",
        "fill-opacity": 0.5,
      },
    });

    map.addLayer({
      id: "borders",
      type: "line",
      source: "countries",
      paint: {
        "line-color": [
          "match",
          ["get", "MAPCOLOR7"],
          1,
          "#f87171",
          2,
          "#60a5fa",
          3,
          "#34d399",
          4,
          "#fbbf24",
          5,
          "#a78bfa",
          6,
          "#f472b6",
          7,
          "#a3e635",
          "#4A545E",
        ],
        "line-width": 2,
        "line-opacity": 0.5,
      },
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
      id: "labels-big",
      type: "symbol",
      source: "labels",
      minzoom: 3,
      filter: ["<=", ["get", "LABELRANK"], 3],
      layout: {
        "text-field": ["get", "NAME"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 1, 10, 4, 12],
        "text-allow-overlap": false,
        "text-ignore-placement": false,
        "text-optional": true,
        "symbol-sort-key": ["get", "LABELRANK"],
      },
      paint: {
        "text-color": "#1E242B",
        "text-halo-color": "#FAF7F0",
        "text-halo-width": 1,
      },
    });

    map.addLayer({
      id: "labels-small",
      type: "symbol",
      source: "labels",
      minzoom: 4,
      filter: [">", ["get", "LABELRANK"], 3],
      layout: {
        "text-field": ["get", "NAME"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 1, 10, 4, 12],
        "text-allow-overlap": false,
        "text-ignore-placement": false,
        "text-optional": true,
        "symbol-sort-key": ["get", "LABELRANK"],
      },
      paint: {
        "text-color": "#1E242B",
        "text-halo-color": "#FAF7F0",
        "text-halo-width": 1,
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
