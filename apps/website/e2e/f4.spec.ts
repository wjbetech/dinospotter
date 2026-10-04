import { expect, test } from "@playwright/test";

test("F4 GB  normalizes to the UK", async ({ page }) => {
  await page.goto("http://localhost:3000/?cc=GB&era=Mesozoic");
  await expect(page).toHaveURL(/cc=UK/);
  await expect(page.getByRole("radiogroup")).toBeVisible();
});
