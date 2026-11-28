import { expect, test } from "@playwright/test";

test("F3 card modal Escape returns focus to its trigger", async ({ page }) => {
  await page.route("**/api/occs?*", (route) =>
    route.fulfill({
      json: {
        cc: "US",
        era: "Mesozoic",
        cards: [{ tid: "txn:1", tna: "Testosaurus", eag: 100, lag: 90, sfm: "Test Fm", sites: [] }],
      },
    }),
  );
  await page.route("**/api/taxon?*", (route) =>
    route.fulfill({ json: { tid: "txn:1", rank: "genus", authority: "Test Author" } }),
  );
  await page.goto("/?cc=US&era=Mesozoic");
  const card = page.locator(".card").first();
  await card.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("genus · Test Author")).toBeVisible();
  await page.getByRole("dialog").press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(card).toBeFocused();
});
