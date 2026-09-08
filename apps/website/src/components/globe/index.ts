import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import { setWorkerUrl } from "maplibre-gl";

setWorkerUrl(workerUrl);

export async function initGlobe(el: HTMLElement) {
  await import("maplibre-gl/dist/maplibre-gl.css");
  const { Map } = await import("maplibre-gl");

  const map = new Map({
    container: el,
    style: "https://demotiles.maplibre.org/globe.json",
    center: [0, 20],
    zoom: 1,
  });

  return map;
}
