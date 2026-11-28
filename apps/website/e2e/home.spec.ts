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
  await expect(page.locator("#home-globe .maplibregl-canvas")).toBeVisible({ timeout: 15000 });
  await expect(page.locator("#home-globe")).not.toHaveAttribute("data-longitude", /\d/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("home globe visibly rotates while motion is allowed", async ({ page }) => {
  await page.goto("/");
  const globe = page.locator("#home-globe");
  await expect(globe).toHaveAttribute("data-longitude", /\d/, { timeout: 15000 });
  const first = Number(await globe.getAttribute("data-longitude"));
  await page.waitForTimeout(3000);
  const second = Number(await globe.getAttribute("data-longitude"));
  expect(second - first).toBeGreaterThan(10);
});
