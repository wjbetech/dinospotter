import type { Leader } from "./leaders.ts";

export interface PositionedCallout extends Leader {
  rail: boolean;
}

function hash(input: string): number {
  let value = 0;
  for (const char of input) value = (value * 31 + char.charCodeAt(0)) | 0;
  return value >>> 0;
}

export function placeCallouts(
  leaders: Leader[],
  viewport = { width: 960, height: 720 },
): PositionedCallout[] {
  const rail = viewport.width < 500 || viewport.height < 560;
  const sorted = [...leaders].slice(0, 12).sort((a, b) => a.tid.localeCompare(b.tid));
  const used = new Set<number>();
  const positions = new Map<string, PositionedCallout>();
  // ponytail: twelve bounded slots keep collision handling small; expand only if the cap changes.
  for (const [i, leader] of sorted.entries()) {
    const seed = hash(`${leader.tid}:${leader.anchor.join(":")}`);
    let slot = seed % 12;
    while (used.has(slot)) slot = (slot + 1) % 12;
    used.add(slot);
    const row = Math.floor(slot / 2);
    const callout: [number, number] = rail
      ? [80 + i * 144, viewport.height - 64]
      : [
          slot % 2 ? viewport.width - 88 - (seed % 13) : 88 + (seed % 13),
          112 + (row * (viewport.height - 176)) / 5,
        ];
    positions.set(leader.tid, { ...leader, callout, rail });
  }
  return leaders.slice(0, 12).map((leader) => positions.get(leader.tid)!);
}
