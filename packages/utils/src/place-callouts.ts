import type { Leader } from "./leaders.ts";

export interface PositionedCallout extends Leader {
  rail: boolean;
}

export function placeCallouts(
  leaders: Leader[],
  viewport = { width: 960, height: 720 },
): PositionedCallout[] {
  const rail = viewport.width < 500 || viewport.height < 560;
  const selected = leaders.slice(0, 12);
  const westFirst = [...selected].sort(
    (a, b) => a.anchor[0] - b.anchor[0] || a.tid.localeCompare(b.tid),
  );
  const split = Math.ceil(westFirst.length / 2);
  const positions = new Map<string, PositionedCallout>();
  // Approximate the focused-country projection with a monotone geographic plane.
  // Sorting each side by latitude prevents same-side inversions; swapping sides
  // then removes avoidable crossings between the two fans.
  const longitudes = selected.map((item) => item.anchor[0]);
  const latitudes = selected.map((item) => item.anchor[1]);
  const minLng = Math.min(...longitudes),
    maxLng = Math.max(...longitudes);
  const minLat = Math.min(...latitudes),
    maxLat = Math.max(...latitudes);
  const point = (item: PositionedCallout): [number, number] => [
    viewport.width * (0.25 + (0.5 * (item.anchor[0] - minLng)) / (maxLng - minLng || 1)),
    viewport.height * (0.25 + (0.5 * (maxLat - item.anchor[1])) / (maxLat - minLat || 1)),
  ];
  const crosses = (a: PositionedCallout, b: PositionedCallout): boolean => {
    const [ax, ay] = point(a),
      bx = a.callout[0],
      by = a.callout[1];
    const [cx, cy] = point(b),
      dx = b.callout[0],
      dy = b.callout[1];
    const orient = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) =>
      (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
    return (
      orient(ax, ay, bx, by, cx, cy) * orient(ax, ay, bx, by, dx, dy) < 0 &&
      orient(cx, cy, dx, dy, ax, ay) * orient(cx, cy, dx, dy, bx, by) < 0
    );
  };
  for (const [side, group] of [westFirst.slice(0, split), westFirst.slice(split)].entries()) {
    group.sort((a, b) => b.anchor[1] - a.anchor[1] || a.tid.localeCompare(b.tid));
    for (const [row, leader] of group.entries()) {
      const i = selected.indexOf(leader);
      const callout: [number, number] = rail
        ? [80 + i * 144, viewport.height - 64]
        : [
            side ? viewport.width - 84 : 84,
            group.length === 1
              ? viewport.height / 2
              : 96 + (row * (viewport.height - 160)) / (group.length - 1),
          ];
      positions.set(leader.tid, { ...leader, callout, rail });
    }
  }
  if (!rail) {
    const placed = [...positions.values()];
    const score = () =>
      placed.reduce(
        (count, a, i) => count + placed.slice(i + 1).filter((b) => crosses(a, b)).length,
        0,
      );
    let best = score();
    for (let pass = 0; pass < 3 && best > 0; pass++) {
      let changed = false;
      for (let i = 0; i < placed.length; i++)
        for (let j = i + 1; j < placed.length; j++) {
          const a = placed[i],
            b = placed[j];
          [a.callout, b.callout] = [b.callout, a.callout];
          const candidate = score();
          if (candidate < best) {
            best = candidate;
            changed = true;
          } else [a.callout, b.callout] = [b.callout, a.callout];
        }
      if (!changed) break;
    }
  }
  return leaders.slice(0, 12).map((leader) => positions.get(leader.tid)!);
}
