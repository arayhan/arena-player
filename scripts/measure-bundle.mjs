// Measures the gzipped client JS a browser actually downloads.
//
// Next 16 removed the per-route "First Load JS" table that Next 15 printed on
// every build, and Turbopack emits no app-build-manifest.json, so the plan of
// "parse the build output" no longer has any output to parse. This measures the
// emitted bytes instead, which is what the budget was always really about.
//
// Read-only. `scripts/check-budget.mjs` (step 08) adds the thresholds.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const STATIC = ".next/static";

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".js")) out.push(full);
  }
  return out;
}

try {
  statSync(STATIC);
} catch {
  console.error(`No ${STATIC}. Run \`pnpm build\` first.`);
  process.exit(1);
}

// Everything the browser loads before any route-specific code. Turbopack does
// not label these per route, so for a two-page site this IS the shared cost.
const manifest = JSON.parse(readFileSync(".next/build-manifest.json", "utf8"));
const shared = new Set([
  ...(manifest.polyfillFiles ?? []),
  ...(manifest.rootMainFiles ?? []),
  ...(manifest.lowPriorityFiles ?? []),
]);

const rows = walk(STATIC)
  .map((file) => {
    const key = file.replace(/\\/g, "/").replace(/^\.next\//, "");
    return {
      file: key,
      gzip: gzipSync(readFileSync(file)).length,
      shared: shared.has(key),
    };
  })
  .sort((a, b) => b.gzip - a.gzip);

const kb = (n) => (n / 1024).toFixed(1).padStart(7);
const sum = (list) => list.reduce((acc, r) => acc + r.gzip, 0);

for (const r of rows) {
  console.log(`${kb(r.gzip)} KB  ${r.shared ? "shared " : "       "}${r.file}`);
}

console.log("-".repeat(62));
console.log(`${kb(sum(rows.filter((r) => r.shared)))} KB  shared baseline (every route pays this)`);
console.log(`${kb(sum(rows))} KB  TOTAL client JS, gzip`);
