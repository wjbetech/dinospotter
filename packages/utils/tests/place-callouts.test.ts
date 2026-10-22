import { expect, test } from "vite-plus/test";
import { placeCallouts } from "../src/place-callouts.ts";

test("placeCallouts is deterministic", () => {
  const input = [
    {
      tid: "t1",
      tna: "A",
      count: 2,
      anchor: [0, 0] as [number, number],
      callout: [1, 1] as [number, number],
    },
  ];

  expect(placeCallouts(input)).toEqual(placeCallouts(input));
});
