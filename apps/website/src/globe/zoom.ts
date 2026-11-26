export function zoomDuration(): number {
  return matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900;
}

export function zoomTo(map: import("maplibre-gl").Map, bbox: [number, number, number, number]) {
  const narrow = map.getContainer().clientWidth < 640;
  map.fitBounds(
    [
      [bbox[0], bbox[1]],
      [bbox[2], bbox[3]],
    ],
    {
      duration: zoomDuration(),
      essential: true,
      maxZoom: 7,
      padding: narrow
        ? { top: 48, bottom: 150, left: 36, right: 36 }
        : { top: 64, bottom: 64, left: 180, right: 180 },
    },
  );
}
