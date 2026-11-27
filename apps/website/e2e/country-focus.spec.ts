import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const cards = Array.from({ length: 15 }, (_, i) => ({
  tid: `txn:${i + 1}`,
  tna: [
    "Brontopodus",
    "Podozamites",
    "Caririchnium",
    "Aves",
    "Ornithopoda",
    "Trigonioides",
    "Cladophlebis",
    "Koreanaornis hamanensis",
    "Sauropoda",
    "Dinosauria",
    "Theropoda",
    "Dictyophyllum",
    "Koreasaurus 13",
    "Koreasaurus 14",
    "Koreasaurus 15",
  ][i]!,
  oei: "Cretaceous",
  eag: 100,
  lag: 90,
  sfm: "Gyeongsang",
  sites: [{ lng: 128 + i * 0.01, lat: 35.5, oid: String(i), tid: `txn:${i + 1}` }],
}));

test.beforeEach(async ({ page }) => {
  await page.route("**/api/occs?*", (route) =>
    route.fulfill({
      json: {
        cc: "KR",
        era: "Mesozoic",
        cards: new URL(route.request().url()).searchParams.get("era") === "Cenozoic" ? [] : cards,
      },
    }),
  );
  await page.route("**/api/taxon?*", (route) =>
    route.fulfill({
      json: {
        tid: "txn:1",
        tna: "Koreasaurus 1",
        pbdbUrl: "https://paleobiodb.org/classic/checkTaxonInfo?taxon_no=1",
      },
    }),
  );
});

test("KR: top taxa, floating callouts, cities, scale, modal and globe return", async ({ page }) => {
  await page.goto("/?cc=KR&era=Mesozoic");
  const callouts = page.locator(".callout");
  await expect(callouts).toHaveCount(12);
  await expect(page.locator(".callout-more")).toHaveCount(0);
  await expect(page.locator(".callout-rail")).toHaveCount(0);
  await expect(page.locator(".card")).toHaveCount(12);
  await expect(page.locator('.callout-art[data-kind="plant"]')).toHaveCount(3);
  await expect(page.locator('.callout-art[data-kind="bird"]')).toHaveCount(2);
  await expect(page.locator('.callout-art[data-kind="trace"]')).toHaveCount(2);
  await expect(page.locator('.callout-art[data-kind="invertebrate"]')).toHaveCount(1);
  await expect(page.locator(".callout-footprint")).toHaveCount(0);
  const backBox = await page.getByRole("button", { name: "Back to globe" }).evaluate((node) => {
    const { x, y, width, height } = node.getBoundingClientRect();
    return { x, y, width, height };
  });
  const calloutBoxes = await callouts.evaluateAll((nodes) =>
    nodes.map((node) => {
      const { x, y, width, height } = node.getBoundingClientRect();
      return { x, y, width, height };
    }),
  );
  expect(
    calloutBoxes.every(
      (box) =>
        backBox.x + backBox.width <= box.x ||
        backBox.y + backBox.height <= box.y ||
        backBox.x >= box.x + box.width ||
        backBox.y >= box.y + box.height,
    ),
  ).toBe(true);
  const heights = await callouts.evaluateAll(
    (nodes) => new Set(nodes.map((node) => (node as HTMLElement).style.top)).size,
  );
  expect(heights).toBeGreaterThan(2);
  await expect(page.locator(".maplibregl-ctrl-scale")).toBeVisible();
  await expect(page.locator("#globe")).toHaveAttribute("data-country", "KR");
  await expect(page.locator("#globe")).toHaveAttribute("data-projection", "mercator");
  await expect(page.locator("#globe")).toHaveAttribute(
    "data-cities",
    /Seoul, Busan, Incheon, Daejeon/,
  );
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze())
      .violations,
  ).toEqual([]);
  const positions = await callouts.evaluateAll((nodes) =>
    nodes.map((n) => [n.getAttribute("data-tid"), n.getAttribute("style")]),
  );
  await page.reload();
  await expect(callouts).toHaveCount(12);
  await expect(page.locator(".callout-footprint[aria-hidden='true']")).toHaveCount(0);
  expect(
    await callouts.evaluateAll((nodes) =>
      nodes.map((n) => [n.getAttribute("data-tid"), n.getAttribute("style")]),
    ),
  ).toEqual(positions);
  const first = page.locator(".callout").filter({ hasText: "Brontopodus" });
  await first.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(first).toBeFocused();
  await first.press("Space");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("radio", { name: /Cenozoic/ }).click();
  await expect(callouts).toHaveCount(0);
  await page.getByRole("button", { name: "Back to globe" }).click();
  await expect(page.locator("#globe")).toHaveAttribute("data-country", "");
  await expect(page.locator("#globe")).toHaveAttribute("data-projection", "globe");
  await expect(page.getByRole("button", { name: "Back to globe" })).toBeHidden();
  await expect(page).not.toHaveURL(/cc=/);
});

test("narrow country focus uses a scrollable rail with no overlapping buttons", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?cc=KR&era=Mesozoic");
  await expect(page.locator(".callout-rail .callout")).toHaveCount(12);
  const boxes = await page.locator(".callout").evaluateAll((nodes) =>
    nodes.map((n) => {
      const r = n.getBoundingClientRect();
      return { left: r.left, right: r.right };
    }),
  );
  for (let i = 1; i < boxes.length; i++)
    expect(boxes[i].left).toBeGreaterThanOrEqual(boxes[i - 1].right);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
