import type { TaxonCard } from "./pbdb.ts";
import { silhouetteFor } from "./silhouette.ts";

export type Leader = {
  tid: string;
  tna: string;
  count: number;
  anchor: [number, number];
  callout: [number, number];
  verifiedGroup?: TaxonCard["verifiedGroup"];
};

export function leaders(cards: TaxonCard[], max = 12): Leader[] {
  const group = new Map<string, Leader>();

  for (const card of cards)
    for (const site of card.sites) {
      group.set(card.tid, {
        tid: card.tid,
        tna: card.tna,
        verifiedGroup: card.verifiedGroup,
        count: (group.get(card.tid)?.count ?? 0) + 1,
        anchor: group.has(card.tid)
          ? [group.get(card.tid)!.anchor, [site.lng, site.lat] as [number, number]].sort(
              (a, b) => a[0] - b[0] || a[1] - b[1],
            )[0]
          : [site.lng, site.lat],
        callout: [0, 0],
      });
    }

  const dinosaurs = new Set(["theropod", "sauropod", "ornithischian"]);
  const candidates = [...group.values()].sort((a, b) => {
    const aDinosaur = dinosaurs.has(a.verifiedGroup ?? silhouetteFor(a.tna));
    const bDinosaur = dinosaurs.has(b.verifiedGroup ?? silhouetteFor(b.tna));
    return (
      Number(Boolean(b.verifiedGroup)) - Number(Boolean(a.verifiedGroup)) ||
      Number(bDinosaur) - Number(aDinosaur) ||
      b.count - a.count ||
      a.tid.localeCompare(b.tid)
    );
  });
  const chosen: Leader[] = [];
  const counts = new Map<string, number>();
  for (const candidate of candidates) {
    const kind = candidate.verifiedGroup ?? silhouetteFor(candidate.tna);
    if ((counts.get(kind) ?? 0) >= 2) continue;
    chosen.push(candidate);
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
    if (chosen.length === max) return chosen;
  }
  for (const candidate of candidates) {
    if (!chosen.includes(candidate)) chosen.push(candidate);
    if (chosen.length >= max) break;
  }
  return chosen.slice(0, max);
}
