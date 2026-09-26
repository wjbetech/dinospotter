export function zoomDuration(): number {
  return matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900;
}

export function zoomTo(map: import("maplibre-gl").Map, bbox: [number, number, number, number]) {
  map.fitBounds(
    [
      [bbox[0], bbox[1]],
      [bbox[2], bbox[3]],
    ],
    {
      duration: zoomDuration(),
      essential: true,
    },
  );
}
