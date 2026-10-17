import { expect, test } from "@playwright/test";

test("F1 first visit US Mesozoic", async ({ page }) => {
  await page.goto("http://localhost:3000/?cc=US&era=Mesozoic");
  await expect(page.getByRole("radiogroup")).toBeVisible();
});

test("F1 US loads cards + URL", async ({ page }) => {
  await page.route("**/api/occs?*", async (r) =>
    r.fulfill({
      json: {
        cc: "US",
        era: "Mesozoic",
        cards: [
          {
            tid: "txn:1",
            tna: "Testosaurus",
            oei: "Norian",
            eag: 220,
            lag: 210,
            sfm: "Test Fm",
            sites: [],
          },
        ],
      },
    }),
  );
  await page.goto("/?cc=US&era=Mesozoic");
  await expect(page).toHaveURL(/cc=US.*era=Mesozoic/);
  await expect(page.locator(".card").first()).toBeVisible();
});
