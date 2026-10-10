import { expect, test } from "@playwright/test";

test("F3 card modal Esc returns focus", async ({ page }) => {
  await page.goto("http://localhost:3000/?cc=US&era=Mesozoic");
  await page.locator("article[role='button']").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("F3 modal optens + Esc returns focus", async ({ page }) => {
  await page.goto("/?cc=US&era=Mesozoic");
  await page.getByRole("button").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
