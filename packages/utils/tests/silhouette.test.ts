import { expect, test } from "vite-plus/test";
import { silhouetteFor } from "utils";

test("silhouetteFor pins order", () => {
  expect(silhouetteFor("Pterodactylus")).toBe("pterosaur");
  expect(silhouetteFor("Tyrannosaurus rex")).toBe("theropod");
  expect(silhouetteFor("Saurichthys")).toBe("marine");
  expect(silhouetteFor("Sauropoda")).toBe("sauropod");
  expect(silhouetteFor("Dinosauria")).toBe("fallback");
  expect(silhouetteFor("Stegosaurus")).toBe("ornithischian");
  expect(silhouetteFor("Mystery animal")).toBe("fallback");
});
