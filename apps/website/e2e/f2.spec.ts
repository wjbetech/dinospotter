import { expect, test } from "@playwright/test";

test("F2 era switch + back", async ({ page }) => {
  await page.goto("http://localhost:3000/?cc=US&era=Mesozoic");
  await page.getByRole("radio", { name: /Cenozoic/ }).click();
  await expect(page).toHaveURL(/era=Cenozoic/);
  await page.goBack();
  await expect(page).toHaveURL(/era=Mesozoic/);
});
