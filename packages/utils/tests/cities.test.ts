import { statSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { majorCities } from "../src/cities.ts";

test("majorCities: capital first, then top 3 by population", () => {
  const places = [
    {
      name: "Busan",
      iso2: "KR",
      capital: false,
      pop: 3400000,
      lng: 129,
      lat: 35,
    },
    {
      name: "Seoul",
      iso2: "KR",
      capital: true,
      pop: 9700000,
      lng: 129,
      lat: 35,
    },
    {
      name: "Incheon",
      iso2: "KR",
      capital: false,
      pop: 2900000,
      lng: 129,
      lat: 35,
    },
    {
      name: "Daegu",
      iso2: "KR",
      capital: false,
      pop: 2400000,
      lng: 129,
      lat: 35,
    },
    {
      name: "Daejeon",
      iso2: "KR",
      capital: false,
      pop: 1500000,
      lng: 129,
      lat: 35,
    },
    {
      name: "Tokyo",
      iso2: "JP",
      capital: false,
      pop: 14000000,
      lng: 129,
      lat: 35,
    },
  ];

  const got = majorCities(places as never, "KR");

  expect(got.map((city: { name: string }) => city.name)).toEqual([
    "Seoul",
    "Busan",
    "Incheon",
    "Daegu",
  ]);
});

test("combined geo files stay under 600KB", () => {
  const geoFiles = join(import.meta.dirname, "../../../apps/website/public/geo");

  expect(
    statSync(join(geoFiles, "countries.geojson")).size +
      statSync(join(geoFiles, "places.geojson")).size,
  ).toBeLessThan(600 * 1024);
});
