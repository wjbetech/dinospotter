export type SvgId =
  | "theropod"
  | "sauropod"
  | "ornithischian"
  | "pterosaur"
  | "marine"
  | "synapsid"
  | "amphibian"
  | "plant"
  | "trace"
  | "bird"
  | "invertebrate"
  | "fallback";

export function silhouetteFor(taxonName: string): SvgId {
  const name = taxonName.toLowerCase();

  if (/ichn|track|footprint|brontopodus|caririchnium/.test(name)) return "trace";
  if (/podozamites|cladophlebis|dictyophyllum|fern|plant|flora/.test(name)) return "plant";
  if (/\baves\b|ornis|bird|avian/.test(name)) return "bird";
  if (
    /trigonioides|bivalv|ammon|mollusk|trilobite|inoceram|gnesioceram|limopsis|astarte|gastropod|pinna|cuspidaria|palaeoneilo|camptonectes|pseudolimea|isocrania|orbiculiforma|grammatodon|turrilit|franconit|usselicer|lithacocer/.test(
      name,
    )
  )
    return "invertebrate";
  if (name.includes("ptero")) return "pterosaur";
  if (/saurichthys|ichthy|mosa|plesio/.test(name)) return "marine";
  if (/cerat|hadro|steg|ankyl|ornithopod|iguanodon/.test(name)) return "ornithischian";
  if (/therapsid|synap|dimetrodon/.test(name)) return "synapsid";
  if (name.includes("amphib")) return "amphibian";
  if (/sauropod|titanosaur|diplodoc|brachiosaur|apatosaur|brontosaur/.test(name)) return "sauropod";
  if (/theropod|raptor|rex|allosaur|dromaeosaur|tyrannosaur/.test(name)) return "theropod";

  return "fallback";
}
