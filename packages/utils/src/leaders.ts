import type { TaxonCard } from "./pbdb.ts";
import { artworkFor } from "./silhouette.ts";

export type Leader = {
  tid: string;
  tna: string;
  count: number;
  anchor: [number, number];
  callout: [number, number];
  verifiedGroup?: TaxonCard["verifiedGroup"];
  phylum?: string;
  taxonClass?: string;
  taxonOrder?: string;
};

// Household names get first crack at the limited callout slots. Keep this
// data-only: adding a genus here is the whole change.
const FAMOUS = new Set([
  "tyrannosaurus",
  "triceratops",
  "stegosaurus",
  "velociraptor",
  "brachiosaurus",
  "diplodocus",
  "spinosaurus",
  "ankylosaurus",
  "parasaurolophus",
  "allosaurus",
  "apatosaurus",
  "iguanodon",
  "pteranodon",
  "plesiosaurus",
  "mammuthus",
  "smilodon",
]);

export function fame(taxonName: string): number {
  const genus = taxonName.toLowerCase().trim().split(/\s+/)[0] ?? "";
  return FAMOUS.has(genus) ? 1 : 0;
}

export function leaders(cards: TaxonCard[], max = 12): Leader[] {
  const group = new Map<string, Leader>();

  for (const card of cards)
    for (const site of card.sites) {
      group.set(card.tid, {
        tid: card.tid,
        tna: card.tna,
        verifiedGroup: card.verifiedGroup,
        phylum: card.phylum,
        taxonClass: card.taxonClass,
        taxonOrder: card.taxonOrder,
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
  const kindOf = (card: Leader) => artworkFor(card.tna, card);
  const candidates = [...group.values()].sort((a, b) => {
    const aKind = kindOf(a);
    const bKind = kindOf(b);
    return (
      Number(dinosaurs.has(bKind)) - Number(dinosaurs.has(aKind)) ||
      fame(b.tna) - fame(a.tna) ||
      Number(Boolean(b.verifiedGroup)) - Number(Boolean(a.verifiedGroup)) ||
      b.count - a.count ||
      a.tid.localeCompare(b.tid)
    );
  });

  const chosen: Leader[] = [];
  const counts = new Map<string, number>();
  // Interleave the three dinosaur groups before any group gets a second slot.
  for (let pass = 0; pass < 2; pass++)
    for (const kind of ["theropod", "sauropod", "ornithischian"]) {
      const pick = candidates.find((card) => kindOf(card) === kind && !chosen.includes(card));
      if (!pick || chosen.length === max) continue;
      chosen.push(pick);
      counts.set(kind, (counts.get(kind) ?? 0) + 1);
    }
  for (const candidate of candidates) {
    if (chosen.length === max) return chosen;
    if (chosen.includes(candidate)) continue;
    const kind = kindOf(candidate);
    if ((counts.get(kind) ?? 0) >= 2) continue;
    chosen.push(candidate);
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  for (const candidate of candidates) {
    if (chosen.length === max) break;
    if (!chosen.includes(candidate)) chosen.push(candidate);
  }
  return chosen;
}
