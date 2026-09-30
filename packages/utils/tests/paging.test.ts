import { expect, test } from "vite-plus/test";
import { page } from "../src/paging.ts";

test("page: 48 per window", () => {
  const cards = Array.from(
    {
      length: 50,
    },
    (_, i) => ({
      tid: `${i}`,
    }),
  );

  expect(page(cards as never, 0)).toHaveLength(48);
  expect(page(cards as never, 1)).toHaveLength(2);
});
