export type Era = "Paleozoic" | "Mesozoic" | "Cenozoic";

function normalizeCc(countryCode: string): string {
  const trimmedCountryCode = countryCode.trim().toUpperCase();
  return trimmedCountryCode === "GB" ? "UK" : trimmedCountryCode;
}

export function parseUrl(str: string): {
  countryCode: string | null;
  era: Era;
} {
  const params = new URLSearchParams(str);
  const rawCc = params.get("cc");
  const countryCode = rawCc?.trim() ? normalizeCc(rawCc) : null;
  const paramsEra = params.get("era")?.toLowerCase();
  const era: Era =
    paramsEra === "paleozoic" ? "Paleozoic" : paramsEra === "cenozoic" ? "Cenozoic" : "Mesozoic";
  return { countryCode, era };
}

export function serializeUrl(countryCode: string | null, era: Era): string {
  const params = new URLSearchParams();
  if (countryCode?.trim()) params.set("cc", normalizeCc(countryCode));
  params.set("era", era);
  return `${params.toString()}`;
}
