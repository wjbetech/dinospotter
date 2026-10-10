import { expect, test } from "vite-plus/test";
import { pickCountry } from "./pick.ts";

const feats = [
  {
    properties: {
      ISO2: "US",
    },
    geometry: {
      coordinates: [
        [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
          [-1, -1],
        ],
      ],
    },
  },
];

test("inside → US, outside → null", () => {
  expect(pickCountry([0, 0], feats)).toBe("US");
  expect(pickCountry([10, 10], feats)).toBeNull();
});
