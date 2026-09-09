export type Era = "Paleozoic" | "Mesozoic" | "Cenozoic";

// cc = country code, era = geological era, qs = query string

export function parseUrl(s: string): {
  cc: string | null;
  era: Era;
} {
  const params = new URLSearchParams(s);
  const rawCc = params.get("cc")?.trim().toUpperCase() || null;
  const rawEra = params.get("era")?.toLowerCase();
  const era: Era =
    rawEra === "paleozoic" ? "Paleozoic" : rawEra === "mesozoic" ? "Mesozoic" : "Cenozoic";

  return { cc: rawCc, era };
}

export function serializeUrl(cc: string | null, era: Era): string {
  const params = new URLSearchParams();
  const normalizedCc = cc?.trim().toUpperCase() || null;

  // fix this later for global cc mapping
  const mapped = normalizedCc === "US" ? "USA" : normalizedCc === "GB" ? "UK" : normalizedCc;
  if (mapped) params.set("cc", mapped);
  params.set("era", era.toLowerCase());

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
