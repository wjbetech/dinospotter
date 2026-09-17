export type Era = "Paleozoic" | "Mesozoic" | "Cenozoic";

function normalizeCc(cc: string): string {
  const trimmedCc = cc.trim().toUpperCase();
  return trimmedCc === "GB" ? "UK" : trimmedCc;
}

export function parseUrl(str: string): {
  cc: string | null;
  era: Era;
} {
  const params = new URLSearchParams(str);
  const rawCc = params.get("cc");
  const cc = rawCc?.trim() ? normalizeCc(rawCc) : null;
  const paramsEra = params.get("era")?.toLowerCase();
  const era: Era =
    paramsEra === "paleozoic" ? "Paleozoic" : paramsEra === "cenozoic" ? "Cenozoic" : "Mesozoic";
  return { cc, era };
}

export function serializeUrl(cc: string | null, era: Era): string {
  const params = new URLSearchParams();
  if (cc?.trim()) params.set("cc", normalizeCc(cc));
  params.set("era", era);
  return `${params.toString()}`;
}
