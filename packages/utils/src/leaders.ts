import type { TaxonCard } from "./pbdb.ts";

export type Leader = {
  tid: string;
  tna: string;
  count: number;
  anchor: [number, number];
  callout: [number, number];
};

export function leaders(cards: TaxonCard[], max = 12): Leader[] {
  const group = new Map<string, Leader>();

  for (const card of cards)
    for (const site of card.sites) {
      group.set(card.tid, {
        tid: card.tid,
        tna: card.tna,
        count: (group.get(card.tid)?.count ?? 0) + 1,
        anchor: group.has(card.tid)
          ? [group.get(card.tid)!.anchor, [site.lng, site.lat] as [number, number]].sort(
              (a, b) => a[0] - b[0] || a[1] - b[1],
            )[0]
          : [site.lng, site.lat],
        callout: [0, 0],
      });
    }

  return [...group.values()]
    .sort((a, b) => b.count - a.count || a.tid.localeCompare(b.tid))
    .slice(0, max);
}
