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
  return leaders.slice(0, 12).map((leader) => positions.get(leader.tid)!);
}
