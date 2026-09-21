import type { Era } from "./timescale.ts";

export interface FossilSite {
  oid: string;
  tid: string;
  tna: string;
  oei: string;
  eag: number;
  lag: number;
  lng: number;
  lat: number;
  sfm: string;
}

export interface TaxonCard {
  tid: string;
  tna: string;
  oei: string;
  eag: number;
  lag: number;
  sfm: string;
  sites: FossilSite[];
}

export interface ParsedOccurrences {
  rows: FossilSite[];
  dropped: number;
  total: number;
}

export function normalizeCc(cc: string): string {
  const val = cc.trim().toUpperCase();
  return val === "GB" ? "UK" : val;
}

const ERA_PERIODS: Record<Era, string[]> = {
  Paleozoic: ["Cambrian", "Ordovician", "Silurian", "Devonian", "Carboniferous", "Permian"],
  Mesozoic: ["Triassic", "Jurassic", "Cretaceous"],
  Cenozoic: ["Paleogene", "Neogene", "Quaternary"],
};

export function buildOccsUrls(cc: string, era: Era): string[] {
  const normalizedCc = normalizeCc(cc);
  return ERA_PERIODS[era].map(
    (period) =>
      `https://paleobiodb.org/data1.2/occs/list.json?cc=${normalizedCc}&interval=${period}&limit=500&show=coords,ident,strat`,
  );
}

export function parseOccs(json: { records: any[] }): ParsedOccurrences {
  let dropped = 0;
  const rows: FossilSite[] = [];
  for (const r of json.records ?? []) {
    const eag = Number(r.eag),
      lag = Number(r.lag);
    const lng = Number(r.lng),
      lat = Number(r.lat);
    if (!r.tna || !r.tid || !Number.isFinite(eag) || !Number.isFinite(lag) || eag < lag) {
      dropped++;
      continue;
    }
    if (
      !Number.isFinite(lng) ||
      !Number.isFinite(lat) ||
      lng < -180 ||
      lng > 180 ||
      lat < -90 ||
      lat > 90 ||
      (lng === 0 && lat === 0)
    ) {
      dropped++;
      continue;
    }
    rows.push({
      oid: String(r.oid ?? `${r.tid}:${rows.length}`),
      tid: String(r.tid),
      tna: String(r.tna),
      oei: String(r.oei ?? ""),
      eag,
      lag,
      lng,
      lat,
      sfm: String(r.sfm ?? ""),
    });
  }
  return { rows, dropped, total: json.records?.length ?? 0 };
}

function pickFreq(vals: string[]): string {
  const mappedVals = new Map<string, number>();

  for (const val of vals) {
    mappedVals.set(val, (mappedVals.get(val) ?? 0) + 1);
  }

  let best = vals[0] ?? "",
    bestN = -1;

  for (const [val, num] of mappedVals) {
    if (num > bestN || (num === bestN && val < best)) {
      best = val;
      bestN = num;
    }
  }

  return best;
}

function pickSfm(vals: string[]): string {
  const mappedVals = new Map<string, number>();

  for (const val of vals) {
    mappedVals.set(val, (mappedVals.get(val) ?? 0) + 1);
  }

  let best = vals[0] ?? "",
    bestN = -1;

  for (const [val, num] of mappedVals) {
    if (
      num > bestN ||
      (num === bestN && (val.length > best.length || (val.length === best.length && val < best)))
    ) {
      best = val;
      bestN = num;
    }
  }

  return best;
}

export function groupByTid(rows: FossilSite[]): TaxonCard[] {
  const group = new Map<string, FossilSite[]>();

  for (const row of rows) {
    group.set(row.tid, [...(group.get(row.tid) ?? []), row]);
  }

  const cards = [...group].map(([tid, sites]) => ({
    tid,
    tna: pickFreq(sites.map((site) => site.tna)),
    oei: pickFreq(sites.map((site) => site.oei)),
    eag: Math.max(...sites.map((site) => site.eag)),
    lag: Math.min(...sites.map((site) => site.lag)),
    sfm: pickSfm(sites.map((site) => site.sfm)),
    sites,
  }));

  return cards.sort(
    (a, b) => b.sites.length - a.sites.length || b.eag - a.eag || a.tid.localeCompare(b.tid),
  );
}
