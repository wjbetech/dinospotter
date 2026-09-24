export interface TaxonDetail {
  tid: string;
  tna: string;
  rank: string;
  authority: string;
  parentTid: string;
  occurrenceCount: number | null;
  pbdbUrl: string;
}

export function taxonUrl(id: string): string {
  const rawString = id.replace(/^txn:/, "");

  if (!/^\d+$/.test(rawString)) throw new Error("invalid taxonomical id!");

  return `https://paleobiodb.org/data1.2/taxa/single.json?id=txn:${rawString}&show=attr`;
}

export function toTaxonDetail(rec: Record<string, unknown>): TaxonDetail {
  const tid = String(rec.oid ?? "");

  if (!tid) throw new Error("invalid taxonomical record!");

  return {
    tid,
    tna: String(rec.nam ?? ""),
    rank: String(rec.rnk ?? ""),
    authority: String(rec.att ?? ""),
    parentTid: String(rec.par ?? ""),
    occurrenceCount: rec.noc == null ? null : Number(rec.noc),
    pbdbUrl: `https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=${tid}`,
  };
}
