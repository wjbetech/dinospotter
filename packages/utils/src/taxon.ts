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
  const tid = rec.oid == null ? "" : String(rec.oid as string | number);

  if (!tid) throw new Error("invalid taxonomical record!");

  return {
    tid,
    tna: (rec.nam as string | undefined) ?? "",
    rank: (rec.rnk as string | undefined) ?? "",
    authority: (rec.att as string | undefined) ?? "",
    parentTid: (rec.par as string | undefined) ?? "",
    occurrenceCount: rec.noc == null ? null : Number(rec.noc as string | number),
    pbdbUrl: `https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=${tid}`,
  };
}
