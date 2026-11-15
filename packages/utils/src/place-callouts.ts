import type { Leader } from "./leaders.ts";

export interface PositionedCallout extends Leader {
  x: number;
  y: number;
  rail: boolean;
}

function hash(input: string): number {
  let hashed = 0;
  for (const char of input) {
    hashed = (hashed * 31 + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hashed);
}

export function placeCallouts(leaders: Leader[], narrow = false): PositionedCallout[] {
  if (narrow) return leaders.map((l, i) => ({ ...l, x: i * 4, y: 0, rail: true }));

  const placed = leaders.map((leader) => ({
    ...leader,
    x: leader.anchor[0] + Math.cos(hash(leader.tid) * (Math.PI / 100)) * 2,
    y: leader.anchor[1] + Math.sin(hash(leader.tid) * (Math.PI / 100)) * 2,
    rail: false,
  }));

  for (let i = 1; i < placed.length; i++) {
    if (
      Math.abs(placed[i].x - placed[i - 1].x) < 1 &&
      Math.abs(placed[i].y - placed[i - 1].y) < 1
    ) {
      placed[i].x += 1.5;
    }
  }

  return placed;
}
