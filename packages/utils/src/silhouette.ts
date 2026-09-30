export type SvgId =
  | "theropod"
  | "sauropod"
  | "ornithischan"
  | "pterosaur"
  | "marine"
  | "synapsid"
  | "amphibian"
  | "fallback";

export function silhouetteFor(taxonName: string): SvgId {
  const name = taxonName.toLowerCase();

  if (name.includes("ptero")) return "pterosaur";

  if (name.includes("raptor") || name.includes("rex") || name.includes("thero")) {
    return "theropod";
  }

  if (
    name.includes("saurichthys") ||
    name.includes("ichthy") ||
    name.includes("mosa") ||
    name.includes("plesio")
  ) {
    return "marine";
  }

  if (name.includes("titan") || name.includes("saur")) {
    return "sauropod";
  }

  if (
    name.includes("cerat") ||
    name.includes("hadro") ||
    name.includes("steg") ||
    name.includes("ankyl")
  ) {
    return "ornithischan";
  }

  if (name.includes("therapsid") || name.includes("synap")) {
    return "synapsid";
  }

  if (name.includes("amphib")) {
    return "amphibian";
  }

  return "fallback";
}
