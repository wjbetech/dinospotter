// paint mixer that only handles #RRGGBB.
// #acb => #AABBCC.
// #aabbcc => #AABBCC.
// return warning and moss if invalid.
export type Era = "Paleozoic" | "Mesozoic" | "Cenozoic";

export function normalizeColor(raw: string): string {
  const s = raw.trim();
  if (/^#([0-9a-fA-F]{3})$/.test(s))
    return `#${s
      .slice(1)
      .split("")
      .map((c) => c + c)
      .join("")
      .toUpperCase()}`;
  if (/^#([0-9a-fA-F]{6})$/.test(s)) return s.toUpperCase();
  if (/^[0-9a-fA-F]{6}$/.test(s)) return `#${s.toUpperCase()}`;
  const m = s.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (m) {
    const [r, g, b] = m.slice(1).map(Number);
    if ([r, g, b].every((v) => v >= 0 && v <= 255))
      return `#${[r, g, b]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()}`;
  }
  console.warn(`normalizeColor: invalid ${raw}`);
  return "#2F7D62";
}

export function eraOfPeriod(period: string): Era {
  const str = period.trim().toLowerCase();

  if (["triassic", "jurassic", "cretaceous"].includes(str)) return "Mesozoic";
  if (["cambrian", "ordovician", "silurian", "devonian", "carboniferous", "permian"].includes(str))
    return "Paleozoic";
  if (["paleogene", "neogene", "quaternary"].includes(str)) return "Cenozoic";
  console.warn(`eraOfPeriod: unknown ${period}`);
  return "Mesozoic";
}

export function toBlurb(row: { nam: string; eag: number; lag: number; col: string; itp: string }): {
  name: string;
  era: Era;
  eag: number;
  lag: number;
  color: string;
  description: string;
} {
  return {
    name: row.nam,
    era: eraOfPeriod(row.itp || row.nam),
    eag: row.eag,
    lag: row.lag,
    color: normalizeColor(row.col),
    description: `${row.nam} - ${row.eag}-${row.lag} Ma`,
  };
}
