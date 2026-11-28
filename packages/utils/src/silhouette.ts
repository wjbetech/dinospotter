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
  | "ammonite"
  | "bivalve"
  | "gastropod"
  | "fern"
  | "leaf"
  | "invertebrate"
  | "fallback";

export function silhouetteFor(taxonName: string): SvgId {
  const name = taxonName.toLowerCase();

  if (/ammon|lithacocer|franconit|usselicer|turrilit/.test(name)) return "ammonite";
  if (/gastropod/.test(name)) return "gastropod";
  if (
    /trigonioides|bivalv|inoceram|gnesioceram|limopsis|astarte|pinna|cuspidaria|palaeoneilo|camptonectes|pseudolimea|grammatodon|buchia|nuculana|septocardia|cymbophora/.test(
      name,
    )
  )
    return "bivalve";
  if (/cladophlebis|dictyophyllum|fern|phlebopteris|coniopteris/.test(name)) return "fern";
  if (/podozamites|nilsonia|pagiophyllum|pityophyllum|brachyphyllum|ctenis|otozamites/.test(name))
    return "leaf";
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
  if (
    /cerat|hadro|steg|ankyl|ornithopod|iguanodon|triceratops|parasaurolophus|edmontosaurus|pachycephalosaurus/.test(
      name,
    )
  )
    return "ornithischian";
  if (/therapsid|synap|dimetrodon/.test(name)) return "synapsid";
  if (name.includes("amphib")) return "amphibian";
  if (
    /sauropod|titanosaur|diplodoc|brachiosaur|apatosaur|brontosaur|camarasaurus|argentinosaurus/.test(
      name,
    )
  )
    return "sauropod";
  if (
    /theropod|raptor|allosaur|dromaeosaur|tyrannosaur|spinosaurus|carnotaurus|giganotosaurus|coelophysis/.test(
      name,
    )
  )
    return "theropod";

  return "fallback";
}
