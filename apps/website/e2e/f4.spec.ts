import { expect, test } from "@playwright/test";

test("F4 GB  normalizes to the UK", async ({ page }) => {
  await page.route("**/api/occs?*", async (r) =>
    r.fulfill({
      json: {
        cc: "UK",
        era: "Mesozoic",
        cards: [
          {
            tid: "txn:2",
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
  await page.goto("/?cc=GB&era=Mesozoic");
  await expect(page).toHaveURL(/cc=UK/);
  await expect(page.locator(".card").first()).toBeVisible();
});
