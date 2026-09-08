export async function initGlobe(el: HTMLElement) {
  await import("maplibre-gl/dist/maplibre-gl.css");
  const { Map, setWorkerUrl } = await import("maplibre-gl");
  const workerUrl = (await import("maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url")).default;
  setWorkerUrl(workerUrl);

  const map = new Map({
    container: el,
    style: "https://demotiles.maplibre.org/globe.json",
    center: [0, 20],
    zoom: 1,
  });

  return map;
}
