export type SvgId =
  | "theropod"
  | "sauropod"
  | "ornithischian"
  | "pterosaur"
  | "marine"
  | "synapsid"
  | "amphibian"
  | "fallback";

export function silhouetteFor(taxonName: string): SvgId {
  const name = taxonName.toLowerCase();

  if (name.includes("ptero")) return "pterosaur";
  if (/saurichthys|ichthy|mosa|plesio/.test(name)) return "marine";
  if (/cerat|hadro|steg|ankyl|ornithopod|iguanodon/.test(name)) return "ornithischian";
  if (/therapsid|synap|dimetrodon/.test(name)) return "synapsid";
  if (name.includes("amphib")) return "amphibian";
  if (/sauropod|titanosaur|diplodoc|brachiosaur|apatosaur|brontosaur/.test(name)) return "sauropod";
  if (/theropod|raptor|rex|allosaur|dromaeosaur|tyrannosaur/.test(name)) return "theropod";

  return "fallback";
}
