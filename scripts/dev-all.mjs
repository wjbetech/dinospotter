// scripts/dev-all.mjs — boot FE + BE + PREVIEW concurrently in one terminal.
// FE      -> `vp dev` in apps/website (5173 dev server with HMR)
// BE      -> `vercel dev` at root (full-stack frontend + /api/occs + /api/taxon)
// PREVIEW -> `vp preview` in apps/website (4173 production dist preview, what Lighthouse scores)
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const jobs = [
  { name: "FE", cwd: path.join(root, "apps/website"), cmd: "vp dev" },
  { name: "BE", cwd: root, cmd: "vercel dev" },
  { name: "PREVIEW", cwd: path.join(root, "apps/website"), cmd: "vp preview" },
];

const children = jobs.map(({ name, cwd, cmd }) => {
  const child = spawn(cmd, { cwd, shell: true, stdio: ["ignore", "pipe", "pipe"] });
  const tag = (chunk) =>
    process.stdout.write(
      String(chunk)
        .split(/\r?\n/)
        .filter((line) => line.length > 0)
        .map((line) => `[${name}] ${line}\n`)
        .join(""),
    );
  child.stdout.on("data", tag);
  child.stderr.on("data", tag);
  child.on("exit", (code) => console.log(`[${name}] exited with code ${code}`));
  return child;
});

const shutdown = () => {
  for (const child of children) child.kill();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
