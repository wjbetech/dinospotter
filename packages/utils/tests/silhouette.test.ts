import { expect, test } from "vite-plus/test";
import { silhouetteFor } from "utils";

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
