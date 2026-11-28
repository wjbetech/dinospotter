import { expect, test } from "@playwright/test";

test("search, linked selection and persistent saved collection", async ({ page }) => {
  await page.route("**/api/occs?*", (route) =>
    route.fulfill({
      json: {
        cc: "KR",
        era: "Mesozoic",
        cards: [
          {
            tid: "txn:1",
            tna: "Theropoda",
            eag: 100,
            lag: 90,
            sfm: "Gyeongsang",
            sites: [{ lng: 128, lat: 35.5 }],
          },
          {
            tid: "txn:2",
            tna: "Ammonoidea",
            eag: 100,
            lag: 90,
            sfm: "Other formation",
            sites: [{ lng: 128.1, lat: 35.6 }],
          },
        ],
      },
    }),
  );
  await page.route("**/api/taxon?*", (route) =>
    route.fulfill({ json: { rank: "group", authority: "" } }),
  );
  await page.goto("/?cc=KR&era=Mesozoic");
  await expect(page.locator(".callout")).toHaveCount(2);
  const search = page.getByRole("searchbox", { name: "Find ancient life" });
  await search.fill("ammon");
  await expect(page.locator(".card")).toHaveCount(1);
  await search.fill("gyeong");
  await expect(page.locator(".card")).toHaveCount(1);
  await page.locator(".card").hover();
  await expect(page.locator('.callout[data-tid="txn:1"]')).toHaveClass(/is-selected/);
  await search.fill("no match");
  await expect(page.getByText("No featured groups match.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByLabel("Fossil category").selectOption("dinosaur");
  await expect(page.locator(".card")).toHaveCount(1);
  await page.locator(".card").click();
  await page.getByRole("button", { name: "Save find", exact: true }).click();
  await page.getByRole("dialog").press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).not.toHaveURL(/txn=/);
  await page.reload();
  const saved = page.locator(".saved-list a");
  await expect(saved).toHaveCount(1);
  await saved.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Remove saved find" }).click();
  await expect(saved).toHaveCount(0);
});
