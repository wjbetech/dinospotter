import type { TaxonCard } from "./pbdb.ts";

export function page(cards: TaxonCard[], num: number, size = 48): TaxonCard[] {
  return cards.slice(num * size, num * size + size);
}
