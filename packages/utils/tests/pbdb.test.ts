import { expect, test } from "vite-plus/test";
import { buildOccsUrls, normalizeCc, parseOccs, groupByTid } from "../src/pbdb.ts";

test("normalizeCc turns GB to UK, gb to UK, uk to UK", () => {
  expect(normalizeCc("GB")).toBe("UK");
  expect(normalizeCc("gb")).toBe("UK");
  expect(normalizeCc("uk")).toBe("UK");
});

test("buildOccsUrls: Mesozoic → 3 URLs with cc=UK", () => {
  const urls = buildOccsUrls("gb", "Mesozoic");
  expect(urls).toHaveLength(3);
  for (const url of urls) {
    expect(url).toContain("cc=UK");
    expect(url).toContain("limit=500");
    expect(url).toContain("show=coords,ident,strat");
  }
  expect(urls[0]).toContain("interval=Triassic");
});

test("parseOccs: drops missing tna, 0,0, eag<lag", () => {
  const json = {
    records: [
      {
        oid: "1",
        tid: "10",
        tna: "T. rex",
        eag: 70,
        lag: 66,
        lng: 10,
        lat: 45,
        oei: "Maastrichtian",
        sfm: "Hell Creek",
      },
      { oid: "2", tid: "10", eag: 70, lag: 66, lng: 11, lat: 46 },
      { oid: "3", tid: "11", tna: "Triceratops", eag: 70, lag: 66, lng: 0, lat: 0 },
      { oid: "4", tid: "12", tna: "Brachiosaurus", eag: 66, lag: 70, lng: 10, lat: 45 },
    ],
  };
  const { rows, dropped, total } = parseOccs(json);
  expect(rows).toHaveLength(1);
  expect(dropped).toBe(3);
  expect(total).toBe(4);
});

test("groupByTid merges duplicates tid", () => {
  const cards = groupByTid([
    {
      tid: "10",
      tna: "A",
      eag: 70,
      lag: 66,
      lng: 0,
      lat: 0,
      oid: "1",
      oei: "",
      sfm: "",
    } as any,
    {
      tid: "10",
      tna: "A",
      eag: 68,
      lag: 65,
      lng: 1,
      lat: 1,
      oid: "2",
      oei: "",
      sfm: "",
    } as any,
    {
      tid: "11",
      tna: "B",
      eag: 70,
      lag: 66,
      lng: 2,
      lat: 2,
      oid: ":3",
      oei: "",
      sfm: "",
    } as any,
  ]);

  expect(cards).toHaveLength(2);
  expect(cards[0].sites).toHaveLength(2);
});
