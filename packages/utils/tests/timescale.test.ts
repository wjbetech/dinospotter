import { expect, test } from "vite-plus/test";
import { eraOfPeriod, normalizeColor, toBlurb } from "../src/timescale.ts";

test("normalize RGB colors", () => {
  expect(normalizeColor("#abc")).toBe("#AABBCC");
});

test("eraOfPeriod for Triassic period", () => {
  expect(eraOfPeriod("Triassic")).toBe("Mesozoic");
});

test("toBlurb for Jurassic period", () => {
  const blurb = toBlurb({ nam: "Jurassic", itp: "Jurassic", eag: 201.3, lag: 145, col: "#99CC99" });
  expect(blurb.era).toBe("Mesozoic");
  expect(blurb.color).toBe("#99CC99");
});
