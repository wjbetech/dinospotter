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

export interface TaxonHints {
  phylum?: string;
  taxonClass?: string;
  taxonOrder?: string;
}

export function artworkFor(
  taxonName: string,
  hints: TaxonHints & { verifiedGroup?: "theropod" | "sauropod" | "ornithischian" },
): SvgId {
  const kind = silhouetteFor(taxonName, hints);
  if (kind === "trace" || kind === "bird") return kind;
  return hints.verifiedGroup ?? kind;
}

export function silhouetteFor(taxonName: string, hints?: TaxonHints): SvgId {
  const phylum = (hints?.phylum ?? "").trim().toLowerCase();
  const klass = (hints?.taxonClass ?? "").trim().toLowerCase();
  const order = (hints?.taxonOrder ?? "").trim().toLowerCase();
  const name = taxonName.toLowerCase();

  // Trace taxa describe evidence of an animal, rather than the animal itself.
  if (
    /ichn|track|footprint|brontopodus|caririchnium|grallator|anomoepus|anchisauripus|kayentapus/.test(
      name,
    )
  )
    return "trace";

  if (phylum === "brachiopoda") return "invertebrate";
  if (/cnidaria|echinodermata|arthropoda|bryozoa|porifera|annelida|hemichordata/.test(phylum))
    return "invertebrate";
  if (phylum === "mollusca") {
    if (klass === "bivalvia") return "bivalve";
    if (klass === "gastropoda") return "gastropod";
    if (klass === "cephalopoda") {
      if (/ammon|lithacocer|franconit|usselicer|turrilit/.test(name) || /ammon/.test(order))
        return "ammonite";
      return "fallback";
    }
    return "invertebrate";
  }
  if (/tracheophyta|bryophyta|spermatophyta|pteridophyta|lycopodiophyta/.test(phylum)) {
    if (klass === "polypodiopsida") return "fern";
    if (/cycadopsida|ginkgoopsida|pinopsida|magnoliopsida|equisetopsida/.test(klass)) return "leaf";
    return "plant";
  }
  if (phylum === "chordata") {
    if (klass === "aves") return "bird";
    if (klass === "amphibia") return "amphibian";
    if (/chondrichthyes|actinopterygii|sarcopterygii|osteichthyes/.test(klass)) return "marine";
    if (/mammalia|synapsida/.test(klass))
      return /cetacea|sirenia|desmostylia/.test(order) ? "marine" : "synapsid";
    if (klass === "reptilia") {
      if (/pterosauria/.test(order)) return "pterosaur";
      if (/sauropterygia|plesiosauria|ichthyosauria|mosasauria/.test(order)) return "marine";
    }
  }

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
