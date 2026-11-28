import { defineConfig } from "vite-plus";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  test: { exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"] },
  build: { manifest: true },
});
