export function pointInPolygon(point: [number, number], ring: [number, number][]): boolean {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x1, y1] = ring[j];
    const [x2, y2] = ring[i];
    const [px, py] = point;

    const yStraddles = y1 > py !== y2 > py;
    if (!yStraddles) continue;

    const xIntersect = ((x2 - x1) * (py - y1)) / (y2 - y1) + x1;
    if (px < xIntersect) inside = !inside;
  }
  return inside;
}

export function pickCountry(
  point: [number, number],
  features: {
    properties: {
      ISO2: string;
    };
    geometry: {
      type?: string;
      coordinates: number[][][] | number[][][][];
    };
  }[],
): string | null {
  for (const feat of features) {
    const polys =
      feat.geometry.type === "MultiPolygon"
        ? (feat.geometry.coordinates as [number, number][][][])
        : [feat.geometry.coordinates as [number, number][][]];
    for (const poly of polys) {
      const ring = poly[0];
      if (ring && pointInPolygon(point, ring)) {
        return feat.properties.ISO2;
      }
    }
  }
  return null;
}
