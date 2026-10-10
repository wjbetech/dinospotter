import { defineConfig } from "vite-plus";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  test: { exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"] },
  build: { manifest: true },
});
