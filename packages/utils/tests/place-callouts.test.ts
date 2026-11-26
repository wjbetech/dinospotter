import { expect, test } from "vite-plus/test";
import { placeCallouts, type Leader } from "../src/index.ts";

const input: Leader[] = Array.from({ length: 12 }, (_, i) => ({
  tid: `txn:${i}`,
  tna: `Taxon ${i}`,
  count: 12 - i,
  anchor: [128, 35],
  callout: [128, 35],
}));

test("crowded callouts stay inside the viewport without overlaps", () => {
  const placed = placeCallouts(input, { width: 800, height: 600 });
  expect(placed).toHaveLength(12);
  for (const [i, a] of placed.entries()) {
    expect(a.callout[0]).toBeGreaterThanOrEqual(76);
    expect(a.callout[0]).toBeLessThanOrEqual(724);
    expect(a.callout[1]).toBeGreaterThanOrEqual(64);
    expect(a.callout[1]).toBeLessThanOrEqual(536);
    for (const b of placed.slice(i + 1)) {
      expect(
        Math.abs(a.callout[0] - b.callout[0]) >= 144 || Math.abs(a.callout[1] - b.callout[1]) >= 72,
      ).toBe(true);
    }
  }
});

test("placement is stable across runs and input order", () => {
  const viewport = { width: 800, height: 600 };
  const positions = (items: Leader[]) =>
    placeCallouts(items, viewport)
      .map(({ tid, callout }) => ({ tid, callout }))
      .sort((a, b) => a.tid.localeCompare(b.tid));
  expect(positions(input)).toEqual(positions([...input].reverse()));
  expect(positions(input)).toEqual(positions(input));
});

test("narrow viewports use separated scrollable bottom-rail positions", () => {
  const placed = placeCallouts(input, { width: 390, height: 460 });
  expect(placed.every((p) => p.rail)).toBe(true);
  expect(placed[0].callout[1]).toBe(396);
  expect(new Set(placed.map((p) => p.callout[0])).size).toBe(12);
});
