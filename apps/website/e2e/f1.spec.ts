import { expect, test } from "@playwright/test";

test("F1 first visit US Mesozoic", async ({ page }) => {
  await page.goto("http://localhost:3000/?cc=US&era=Mesozoic");
  await expect(page.getByRole("radiogroup")).toBeVisible();
});
