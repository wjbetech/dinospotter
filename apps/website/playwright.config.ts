import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:4175" },
  webServer: {
    command: "vp dev --port 4175 --strictPort",
    url: "http://localhost:4175",
    reuseExistingServer: !process.env.CI,
  },
});
