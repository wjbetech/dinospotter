import { expect, test } from "vite-plus/test";
import { artworkFor, silhouetteFor } from "../src/silhouette.ts";

test("specific birds and trace fossils retain their artwork within dinosaur clades", () => {
  expect(artworkFor("Aves", { taxonClass: "Aves", verifiedGroup: "theropod" })).toBe("bird");
  expect(artworkFor("Grallator", { verifiedGroup: "theropod" })).toBe("trace");
  expect(silhouetteFor("Nautilus", { phylum: "Mollusca", taxonClass: "Cephalopoda" })).toBe(
    "fallback",
  );
});

test("silhouetteFor pins order", () => {
  expect(silhouetteFor("Pterodactylus")).toBe("pterosaur");
  expect(silhouetteFor("Tyrannosaurus rex")).toBe("theropod");
  expect(silhouetteFor("Saurichthys")).toBe("marine");
  expect(silhouetteFor("Sauropoda")).toBe("sauropod");
  expect(silhouetteFor("Dinosauria")).toBe("fallback");
  expect(silhouetteFor("Stegosaurus")).toBe("ornithischian");
  expect(silhouetteFor("Podozamites")).toBe("leaf");
  expect(silhouetteFor("Brontopodus")).toBe("trace");
  expect(silhouetteFor("Aves")).toBe("bird");
  expect(silhouetteFor("Koreanaornis hamanensis")).toBe("bird");
  expect(silhouetteFor("Trigonioides")).toBe("bivalve");
  expect(silhouetteFor("Mystery animal")).toBe("fallback");
});

test("shells and plant organs receive distinct specimen art", () => {
  expect(silhouetteFor("Ammonoidea")).toBe("ammonite");
  expect(silhouetteFor("Gastropoda")).toBe("gastropod");
  expect(silhouetteFor("Inoceramus virgatus")).toBe("bivalve");
  expect(silhouetteFor("Cladophlebis")).toBe("fern");
  expect(silhouetteFor("Nilsonia")).toBe("leaf");
  expect(silhouetteFor("Mystery animal")).toBe("fallback");
});

test("taxonomy fills groups the name keywords miss", () => {
  expect(silhouetteFor("Cardium", { phylum: "Mollusca", taxonClass: "Bivalvia" })).toBe("bivalve");
  expect(silhouetteFor("Rissoa", { phylum: "Mollusca", taxonClass: "Gastropoda" })).toBe(
    "gastropod",
  );
  expect(silhouetteFor("Terebratula", { phylum: "Brachiopoda" })).toBe("invertebrate");
  expect(silhouetteFor("Carcharodon", { phylum: "Chordata", taxonClass: "Chondrichthyes" })).toBe(
    "marine",
  );
  expect(silhouetteFor("Equus", { phylum: "Chordata", taxonClass: "Mammalia" })).toBe("synapsid");
  expect(
    silhouetteFor("Mysticeti", {
      phylum: "Chordata",
      taxonClass: "Mammalia",
      taxonOrder: "Cetacea",
    }),
  ).toBe("marine");
  expect(silhouetteFor("Rana", { phylum: "Chordata", taxonClass: "Amphibia" })).toBe("amphibian");
  expect(silhouetteFor("Pinus", { phylum: "Spermatophyta", taxonClass: "Pinopsida" })).toBe("leaf");
  expect(silhouetteFor("Grallator", { phylum: "Chordata", taxonClass: "Reptilia" })).toBe("trace");
});
