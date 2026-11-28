import { expect, test } from "vite-plus/test";
import { leaders } from "../src/leaders.ts";

test("leaders: sorts by count, caps at max", () => {
  const cards = [
    {
      tid: "2",
      tna: "B",
      oei: "",
      eag: 70,
      lag: 66,
      sfm: "",
      sites: [
        {
          lng: 0,
          lat: 0,
        },
      ],
    },
    {
      tid: "1",
      tna: "A",
      oei: "",
      eag: 70,
      lag: 66,
      sfm: "",
      sites: [
        {
          lng: 1,
          lat: 1,
        },
        {
          lng: 2,
          lat: 2,
        },
      ],
    },
  ];
  expect(leaders(cards as never, 8)[0].tid).toBe("1");
});

test("leaders: defaults to the top 12 in fame/popularity order", () => {
  const cards = Array.from(
    {
      length: 15,
    },
    (_, i) => ({
      tid: `t${i}`,
      tna: `Taxon ${i}`,
      oei: "",
      eag: 70,
      lag: 66,
      sfm: "",
      sites: Array.from(
        {
          length: 15 - i,
        },
        (_, j) => ({
          lng: j,
          lat: j,
        }),
      ),
    }),
  );

  const got = leaders(cards as never);

  expect(got).toHaveLength(12);
  expect(got[0].tid).toBe("t0");
});

test("ties and representative anchors remain stable when occurrence order changes", () => {
  const cards = [
    {
      tid: "txn:2",
      tna: "B",
      oei: "",
      eag: 100,
      lag: 90,
      sfm: "",
      sites: [
        { lng: 130, lat: 36 },
        { lng: 128, lat: 35 },
      ],
    },
    {
      tid: "txn:1",
      tna: "A",
      oei: "",
      eag: 100,
      lag: 90,
      sfm: "",
      sites: [
        { lng: 127, lat: 34 },
        { lng: 126, lat: 33 },
      ],
    },
  ];
  const ranked = leaders(cards as never);
  expect(ranked.map((item) => item.tid)).toEqual(["txn:1", "txn:2"]);
  expect(ranked[0].anchor).toEqual([126, 33]);
  expect(
    leaders(
      cards.toReversed().map((card) => ({ ...card, sites: card.sites.toReversed() })) as never,
    ),
  ).toEqual(ranked);
});
