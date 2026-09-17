import { describe, expect, it } from "vite-plus/test";
import { parseUrl } from "./url.ts";

describe("parseUrl helper", () => {
  it("gb→UK + mesozoic→Mesozoic", () => {
    expect(parseUrl("?cc=gb&era=mesozoic")).toEqual({
      cc: "UK",
      era: "Mesozoic",
    });
  });
});
