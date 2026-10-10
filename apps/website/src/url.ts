export type Era = "Paleozoic" | "Mesozoic" | "Cenozoic";

function normalizeCountryCode(countryCode: string): string {
  const trimmedCountryCode = countryCode.trim().toUpperCase();
  return trimmedCountryCode === "GB" ? "UK" : trimmedCountryCode;
}

export function parseUrl(str: string): {
  countryCode: string | null;
  era: Era;
  txn: string | null;
} {
  const params = new URLSearchParams(str);
  const rawCountryCode = params.get("cc");
  const countryCode = rawCountryCode?.trim() ? normalizeCountryCode(rawCountryCode) : null;
  const paramsEra = params.get("era")?.toLowerCase();
  const era: Era =
    paramsEra === "paleozoic" ? "Paleozoic" : paramsEra === "cenozoic" ? "Cenozoic" : "Mesozoic";
  return { countryCode, era, txn: params.get("txn") };
}

export function serializeUrl(countryCode: string | null, era: Era, txn?: string | null): string {
  const params = new URLSearchParams();
  if (countryCode?.trim()) params.set("cc", normalizeCountryCode(countryCode));
  params.set("era", era);
  if (txn?.trim()) {
    params.set("txn", txn.trim());
  }
  return `${params.toString()}`;
}
