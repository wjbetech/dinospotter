import { expect, test } from "@playwright/test";

test("F6 proxy down shows badge and retry", async ({ page }) => {
  await page.route("**/api/occs?*", async (r) =>
    r.fulfill({
      status: 500,
      body: "{}",
    }),
  );
  await page.goto("/?cc=US&era=Mesozoic");
  await expect(page.getByText(/PBDB unavailable/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Retry/i })).toBeVisible();
});
