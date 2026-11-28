import { expect, test } from "@playwright/test";

test("home introduces the atlas and opens exploration", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Every place has a deeper past." })).toBeVisible();
  await expect(page.locator("#home-globe .maplibregl-canvas")).toBeVisible();
  await expect(page.locator("#app")).toBeHidden();
  await page.getByRole("link", { name: "Get started" }).click();
  await expect(page).toHaveURL(/\/explore(?:\?era=Mesozoic)?$/);
  await expect(page.locator("#app")).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("home fits a narrow screen and respects reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Get started" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
