import { expect, test } from "@playwright/test";

test("F7 labels only, zero dots", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#globe")).toBeVisible();
  await expect(page.locator(".dot")).toHaveCount(0);
});
