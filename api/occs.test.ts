import { GET as handler } from "./occs.ts";
import { expect, test, vi } from "vite-plus/test";

test("400 error on arbitrary url", async () => {
  global.fetch = vi.fn(
    async () =>
      new Response("{}", {
        status: 200,
      }),
  );

  const res = await handler(
    new Request("http://test/api/occs?cc=US&era=Mesozoic&url=https://nonsensewebsite.com"),
  );

  expect(res.status).toBe(400);
});

test("429 → rate_limited + Retry-After", async () => {
  global.fetch = vi.fn(
    async () =>
      new Response("{}", {
        status: 429,
        headers: {
          "Retry-After": "2",
        },
      }),
  );

  const res = await handler(new Request("https://test/api/occs?cc=US&era=Mesozoic"));

  expect(res.status).toBe(429);
  expect(res.headers.get("Retry-After")).toBe("2");
  expect(res.status).toBe(429);
});

test("502 on 5xx", async () => {
  global.fetch = vi.fn(
    async () =>
      new Response("{}", {
        status: 500,
      }),
  );

  const res = await handler(new Request("http://test/api/occs?cc=US&era=Mesozoic"));

  expect(res.status).toBe(502);
});

test("returns only the 12 most-found taxa in deterministic order", async () => {
  const records = Array.from({ length: 15 }, (_, i) => ({
    oid: String(i),
    tid: String(i + 1),
    tna: `Taxon ${i + 1}`,
    oei: "Cretaceous",
    eag: 100 + i,
    lag: 90,
    lng: 120 + i / 10,
    lat: 35,
    sfm: "Formation",
  }));
  global.fetch = vi.fn(async () => Response.json({ records }));
  const res = await handler(new Request("http://test/api/occs?cc=KR&era=Mesozoic"));
  const payload = (await res.json()) as { cards: { tid: string }[] };

  expect(payload.cards).toHaveLength(12);
  expect(payload.cards.map((card) => card.tid)).toEqual(
    Array.from({ length: 12 }, (_, i) => String(15 - i)),
  );
});

test("504 on abort", async () => {
  global.fetch = vi.fn(async () => {
    throw new DOMException("abort", "AbortError");
  });

  const res = await handler(new Request("http://test/api/occs?cc=US&era=Mesozoic"));

  expect(res.status).toBe(504);
});

test("adds verified dinosaur occurrences without breaking the featured limit", async () => {
  global.fetch = vi.fn(async (input) => {
    const url = new URL(String(input));
    const clade = url.searchParams.get("base_name");
    if (clade === "Sauropoda") throw new Error("unavailable");
    const tid =
      clade === "Theropoda" ? "txn:100" : clade === "Ornithischia" ? "txn:200" : "txn:300";
    return Response.json({
      records: [
        { oid: `occ:${tid}`, tid, tna: clade ?? "Shell", eag: 100, lag: 90, lng: 12, lat: 40 },
      ],
    });
  });
  const response = await handler(new Request("http://test/api/occs?cc=US&era=Mesozoic"));
  const payload = (await response.json()) as { cards: { tid: string; verifiedGroup?: string }[] };
  expect(response.status).toBe(200);
  expect(payload.cards.length).toBeLessThanOrEqual(12);
  expect(payload.cards).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ tid: "txn:100", verifiedGroup: "theropod" }),
      expect.objectContaining({ tid: "txn:200", verifiedGroup: "ornithischian" }),
      expect.objectContaining({ tid: "txn:300" }),
    ]),
  );
});
