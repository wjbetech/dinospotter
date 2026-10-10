import { expect, test } from "@playwright/test";

test("F2 era switch + back", async ({ page }) => {
  await page.route("**/api/occs?*", async (r) =>
    r.fulfill({
      json: {
        countryCode: "US",
        era: "Cenozoic",
        cards: [],
      },
    }),
  );
  await page.goto("http://localhost:3000/?cc=US&era=Mesozoic");
  await page.getByRole("radio", { name: /Cenozoic/ }).click();
  await expect(page).toHaveURL(/era=Cenozoic/);
  await page.goBack();
  await expect(page).toHaveURL(/era=Mesozoic/);
});

test("F2 era to Cenozoic + back", async ({ page }) => {
  await page.goto("/?cc=US&era=Mesozoic");
  page.getByRole("radio", {
    name: /Cenozoic/,
  });
  await expect(page).toHaveURL(/era=Cenozoic/);
  await page.goBack();
  await expect(page).toHaveURL(/era=Mesozoic/);
});
