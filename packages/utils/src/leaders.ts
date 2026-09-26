import type { TaxonCard } from "./pbdb.ts";

export type Leader = {
  tid: string;
  tna: string;
  count: number;
  anchor: [number, number];
  callout: [number, number];
};

export function leaders(cards: TaxonCard[], max = 8): Leader[] {
  const group = new Map<string, Leader>();

  for (const card of cards)
    for (const site of card.sites) {
      group.set(card.tid, {
        tid: card.tid,
        tna: card.tna,
        count: (group.get(card.tid)?.count ?? 0) + 1,
        anchor: [site.lng, site.lat],
        callout: [site.lng + 1, site.lat + 1],
      });
    }

  return [...group.values()]
    .sort((a, b) => b.count - a.count || a.tid.localeCompare(b.tid))
    .slice(0, max);
}
