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

test("504 on abort", async () => {
  global.fetch = vi.fn(async () => {
    throw new DOMException("abort", "AbortError");
  });

  const res = await handler(new Request("http://test/api/occs?cc=US&era=Mesozoic"));

  expect(res.status).toBe(504);
});
