import { defineConfig } from "vite-plus";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig(({ command }) => ({
  plugins: [tailwindcss()],
  resolve: {
    alias:
      command === "serve"
        ? [
            {
              find: "utils",
              replacement: fileURLToPath(
                new URL("../../packages/utils/src/index.ts", import.meta.url),
              ),
            },
          ]
        : [],
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  test: { exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"] },
  build: { manifest: true },
}));
