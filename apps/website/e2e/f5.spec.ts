import { expect, test } from "@playwright/test";

test("F5 empty era shows copy", async ({ page }) => {
  await page.route("**/api/occs?*", async (r) =>
    r.fulfill({
      json: {
        cc: "MG",
        era: "Paleozoic",
        cards: [],
      },
    }),
  );

  await page.goto("http://localhost:3000/?cc=MG&era=Paleozoic");
  await expect(page.getByText(/No recorded taxonomical data/)).toBeVisible();
});

test("F5 empty MG Paleozoic shows copy", async ({ page }) => {
  await page.goto("/?cc=MG&era=Paleozoic");
  await expect(page.getByText(/No recorded taxa/i)).toBeVisible();
});
