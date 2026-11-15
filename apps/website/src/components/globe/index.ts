import { leaders } from "utils";
import { render, renderCallouts } from "./leaders.ts";
import { store } from "../../store.ts";
import { pickCountry } from "../../globe/pick.ts";
import { zoomTo } from "../../globe/zoom.ts";
import { serializeUrl } from "../../url";
import { selectEra } from "../../ui/era-strip.ts";
import { openCardModal } from "../../ui/cards.ts";

const hint = document.querySelector<HTMLElement>("#hint");

function bboxFor(coords: unknown): [number, number, number, number] {
  let west = Infinity,
    south = Infinity,
    east = -Infinity,
    north = -Infinity;
  const visit = (node: unknown): void => {
    if (!Array.isArray(node) || node.length === 0) return;
    if (typeof node[0] === "number" && typeof node[1] === "number") {
      west = Math.min(west, node[0]);
      south = Math.min(south, node[1]);
      east = Math.max(east, node[0]);
      north = Math.max(north, node[1]);
      return;
    }
    for (const child of node) visit(child);
  };
  visit(coords);
  return [west, south, east, north];
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
    map.addImage("grain", img);

    map.addLayer({
      id: "land",
      type: "fill",
      source: "countries",
      paint: { "fill-color": "#FAF7F0" },
    });

    map.addLayer({
      id: "grain",
      type: "fill",
      source: "countries",
      paint: {
        "fill-pattern": "grain",
        "fill-opacity": 0.18,
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

      const feat = geo.features.find(
        (f: {
          properties: {
            ISO2: string;
          };
        }) => f.properties.ISO2 === countryCode,
      );

      if (feat) zoomTo(map, bboxFor(feat.geometry.coordinates));

      store.setState({
        countryCode,
        payload: null,
        status: "loading",
      });

      void selectEra(store.getState().era);

      store.setState({ countryCode });
      history.pushState(null, "", "?" + serializeUrl(countryCode, store.getState().era));
    });

    map.on("move", () => {
      const wrap = map.getContainer();
      wrap.querySelectorAll<HTMLButtonElement>(".callout").forEach((btn) => {
        const lng = Number(btn.dataset.lng);
        const lat = Number(btn.dataset.lat);
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
        const pt = map.project([lng, lat]);
        btn.style.left = `${pt.x}px`;
        btn.style.top = `${pt.y}px`;
      });
    });

    store.subscribe(() => {
      const { payload } = store.getState();

      if (!payload?.cards.length) return;

      const items = leaders(payload.cards);
      render(map, items);
      renderCallouts(map, map.getContainer(), items, (tid) => {
        const card = payload.cards.find((c) => c.tid === tid);
        if (card) void openCardModal(card, map.getContainer());
      });
    });

    return geo;
  });

  return map;
}
