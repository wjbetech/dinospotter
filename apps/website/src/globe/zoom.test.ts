import { expect, test, vi } from "vite-plus/test";
import { zoomDuration } from "./zoom.ts";

test("zoomDuration is 0 under reduced motion", () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
  }));

  expect(zoomDuration()).toBe(0);
});
