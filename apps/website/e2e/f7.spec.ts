import { expect, test } from "@playwright/test";

test("F7 labels only, zero dots", async ({ page }) => {
  await page.goto("http://localhost:3000/?cc=US&era=Mesozoic");
  await expect(page.locator("#globe canvas")).toBeVisible();
  await expect(page.locator(".maplibre-marker")).toHaveCount(0);
});
