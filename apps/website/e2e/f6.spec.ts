import { expect, test } from "@playwright/test";

test("F6 proxy down shows badge and retry", async ({ page }) => {
  await page.route("**/api/occs?*", async (r) =>
    r.fulfill({
      status: 500,
    }),
  );
  await page.goto("http://localhost:3000/?cc=US&era=Mesozoic");
  await expect(
    page.getByRole("button", {
      name: /Retry/,
    }),
  ).toBeVisible();
});
