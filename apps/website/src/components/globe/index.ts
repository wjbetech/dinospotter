import { leaders, majorCities, type City } from "utils";
import { renderCallouts } from "./leaders.ts";
import { store } from "../../store.ts";
import { pickCountry } from "../../globe/pick.ts";
import { zoomTo } from "../../globe/zoom.ts";
import { selectEra } from "../../ui/era-strip.ts";
import { openCardModal } from "../../ui/cards.ts";
import { serializeUrl } from "../../url.ts";
import type { FeatureCollection, Point, MultiPolygon, Polygon } from "geojson";
import type { GeoJSONSource } from "maplibre-gl";

type CountryProperties = {
  ISO2: string;
  NAME: string;
  LABEL_X: number;
  LABEL_Y: number;
  LABELRANK: number;
  BORDER_COLOR: string;
};

const borderPalette = ["#347F91", "#C46F50", "#B18A2D", "#527B55", "#8065A4"];

function bboxFor(coords: unknown): [number, number, number, number] {
  let west = Infinity,
    south = Infinity,
    east = -Infinity,
    north = -Infinity;
  const visit = (node: unknown): void => {
    if (!Array.isArray(node) || !node.length) return;
    if (typeof node[0] === "number" && typeof node[1] === "number") {
      west = Math.min(west, node[0]);
      south = Math.min(south, node[1]);
      east = Math.max(east, node[0]);
      north = Math.max(north, node[1]);
    } else node.forEach(visit);
  };
  visit(coords);
  return [west, south, east, north];
}

export async function initGlobe(el: HTMLElement) {
  await import("maplibre-gl/dist/maplibre-gl.css");
  const { Map, ScaleControl, setWorkerUrl } = await import("maplibre-gl");
  setWorkerUrl((await import("maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url")).default);
  const map = new Map({ container: el, style: "/styles/light.json", center: [0, 20], zoom: 1.5 });
  map.addControl(new ScaleControl({ unit: "metric" }), "bottom-left");
  map.on("load", async () => {
    const [geo, places] = await Promise.all([
      fetch("/geo/countries.geojson").then((r) => r.json()) as Promise<
        FeatureCollection<Polygon | MultiPolygon, CountryProperties>
      >,
      fetch("/geo/places.geojson").then((r) => r.json()) as Promise<
        FeatureCollection<Point, Omit<City, "lng" | "lat">>
      >,
    ]);
    const cities: City[] = places.features.map((f) => ({
      ...f.properties,
      lng: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
    }));
    geo.features.forEach((feature, index) => {
      feature.properties.BORDER_COLOR = borderPalette[index % borderPalette.length]!;
    });
    map.addSource("countries", { type: "geojson", data: geo });
    const waterContours = new Image(192, 192);
    waterContours.src = "/styles/water-contours.svg";
    await waterContours.decode();
    map.addImage("water-contours", waterContours);
    map.setPaintProperty("bg", "background-pattern", "water-contours");
    const landRelief = new Image(192, 192);
    landRelief.src = "/styles/land-relief.svg";
    await landRelief.decode();
    map.addImage("land-relief", landRelief);
    map.addLayer({
      id: "land",
      type: "fill",
      source: "countries",
      paint: { "fill-color": "#FAF7F0" },
    });
    // A fixed tile gives the land a quiet paper grain without another data source.
    const grain = new Image(16, 16);
    grain.src =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAfElEQVR4nKXNyxWCAAADwSAqqIgCAn6phCpswP67cFNDDnPct/p9V+GECRuccccWFzyxR4c3agxYcHQ8okCDGSVaPLDDFS9U6PHBATfPo7vnSu6eK7l7ruTuuZK750runiu5e67k7rmSu+dK7p4ruXuu5O65krvnSu6e/wFHofvklT1hCQAAAABJRU5ErkJggg==";
    await grain.decode();
    map.addImage("grain", grain);
    map.addLayer({
      id: "grain",
      type: "fill",
      source: "countries",
      paint: { "fill-pattern": "grain", "fill-opacity": 0.35 },
    });
    map.addLayer({
      id: "land-relief",
      type: "fill",
      source: "countries",
      paint: { "fill-pattern": "land-relief", "fill-opacity": 0.19 },
    });
    map.addLayer({
      id: "country-borders",
      type: "line",
      source: "countries",
      paint: {
        "line-color": [
          "case",
          ["==", ["get", "ISO2"], store.getState().countryCode ?? ""],
          "#765D40",
          ["get", "BORDER_COLOR"],
        ],
        "line-width": ["interpolate", ["linear"], ["zoom"], 0, 0.7, 4, 1.6],
        "line-opacity": 0.95,
      },
    });
    map.addLayer({ id: "hit", type: "fill", source: "countries", paint: { "fill-opacity": 0 } });
    map.addSource("labels", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: geo.features.map((f) => ({
          type: "Feature",
          properties: f.properties,
          geometry: { type: "Point", coordinates: [f.properties.LABEL_X, f.properties.LABEL_Y] },
        })),
      },
    });
    for (const small of [false, true])
      map.addLayer({
        id: small ? "labels-small" : "labels-big",
        type: "symbol",
        source: "labels",
        minzoom: small ? 4 : 1,
        filter: [small ? ">" : "<=", ["get", "LABELRANK"], 3],
        layout: {
          "text-field": ["get", "NAME"],
          "text-font": ["Inter"],
          "text-size": 12,
          "text-allow-overlap": false,
        },
        paint: { "text-color": "#4A545E", "text-halo-color": "#FAF7F0", "text-halo-width": 1.5 },
      });
    map.addSource("cities", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    map.addLayer({
      id: "cities",
      type: "symbol",
      source: "cities",
      minzoom: 3,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Inter"],
        "text-size": 12,
        "text-allow-overlap": false,
        "symbol-sort-key": ["get", "order"],
      },
      paint: { "text-color": "#1E242B", "text-halo-color": "#FAF7F0", "text-halo-width": 2 },
    });
    let focused: string | null = null;
    let redraw = () => {};
    const sync = () => {
      const { countryCode, payload, status } = store.getState();
      if (countryCode !== focused) {
        focused = countryCode;
        for (const small of [false, true]) {
          const rankFilter = [small ? ">" : "<=", "LABELRANK", 3] as const;
          map.setFilter(
            small ? "labels-small" : "labels-big",
            (countryCode
              ? ["all", rankFilter, ["==", "ISO2", countryCode]]
              : rankFilter) as unknown as Parameters<typeof map.setFilter>[1],
          );
        }
        map.setProjection({ type: countryCode ? "mercator" : "globe" });
        el.dataset.projection = countryCode ? "mercator" : "globe";
        map.setPaintProperty("land", "fill-color", [
          "case",
          ["==", ["get", "ISO2"], countryCode ?? ""],
          "#E5C58D",
          "#FAF7F0",
        ]);
        map.setPaintProperty("land", "fill-opacity", [
          "case",
          ["==", ["get", "ISO2"], countryCode ?? ""],
          1,
          countryCode ? 0.24 : 1,
        ]);
        map.setPaintProperty("grain", "fill-opacity", countryCode ? 0.1 : 0.35);
        map.setPaintProperty("land-relief", "fill-opacity", countryCode ? 0.06 : 0.19);
        map.setPaintProperty("country-borders", "line-color", [
          "case",
          ["==", ["get", "ISO2"], countryCode ?? ""],
          "#765D40",
          ["get", "BORDER_COLOR"],
        ]);
        map.setPaintProperty("country-borders", "line-opacity", [
          "case",
          ["==", ["get", "ISO2"], countryCode ?? ""],
          1,
          countryCode ? 0.28 : 0.95,
        ]);
        const country = geo.features.find((f) => f.properties.ISO2 === countryCode);
        if (country) zoomTo(map, bboxFor(country.geometry.coordinates));
        else map.easeTo({ center: [0, 20], zoom: 1.5, duration: 0 });
        el.dataset.country = countryCode ?? "";
        const backButton = el
          .closest("#map-panel")
          ?.querySelector<HTMLButtonElement>("#back-to-globe");
        if (backButton) {
          backButton.hidden = !countryCode;
          backButton.onclick = (event) => {
            event.stopPropagation();
            const { era } = store.getState();
            history.pushState(null, "", "?" + serializeUrl(null, era));
            store.setState({ countryCode: null, payload: null, status: "idle" });
          };
        }
        const selected = countryCode ? majorCities(cities, countryCode) : [];
        el.dataset.cities = selected.map((city) => city.name).join(", ");
        void (map.getSource("cities") as GeoJSONSource).setData({
          type: "FeatureCollection",
          features: selected.map((city, order) => ({
            type: "Feature",
            properties: { name: city.name, order },
            geometry: { type: "Point", coordinates: [city.lng, city.lat] },
          })),
        });
      }
      const cards = status === "loading" || status === "idle" ? [] : (payload?.cards ?? []);
      redraw = renderCallouts(map, el, leaders(cards), (tid, button) => {
        const card = cards.find((c) => c.tid === tid);
        if (card) void openCardModal(card, button);
      });
    };
    map.on("move", () => redraw());
    map.on("resize", sync);
    const unsubscribe = store.subscribe(sync);
    map.on("remove", unsubscribe);
    map.on("click", (event) => {
      const countryCode = pickCountry([event.lngLat.lng, event.lngLat.lat], geo.features);
      if (!countryCode) return;
      store.setState({ countryCode, payload: null, status: "loading" });
      void selectEra(store.getState().era);
    });
    sync();
  });
  return map;
}
