import { expect, test } from "@playwright/test";

test("F4 GB  normalizes to the UK", async ({ page }) => {
  await page.goto("/?cc=GB&era=Mesozoic");
  await expect(page).toHaveURL(/cc=UK/);
  await expect(page.locator(".card").first()).toBeVisible();
});
