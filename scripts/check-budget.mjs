// Enforces the performance budget PER ROUTE, and fails the command on a breach.
//
// WHY THIS DOES NOT PARSE THE BUILD OUTPUT, AS THE PLAN ASSUMED
//
// Next 16 removed the per-route "First Load JS" table Next 15 printed, and
// Turbopack emits no top-level app-build-manifest.json. The per-route
// .next/server/app/<route>/build-manifest.json it DOES emit lists only the
// polyfill and the shared root files — the route's own chunk is missing from
// it, which is exactly the number this check exists to watch.
//
// The prerendered HTML is the honest source: it is literally the list of
// scripts the browser is told to download for that route. That is the
// definition the budget was always about.
//
// PER ROUTE, NOT ONE TOTAL. A single global number hides the case this project
// actually cares about — /booking's form libraries leaking onto /.
//
// The ceiling is READ FROM docs/architecture.md, not copied here. That file
// calls itself "the single source — reference it, never copy the numbers", and
// a check that restates the limit is one more copy for this repo to drift
// against. If the number cannot be parsed, this exits non-zero rather than
// falling back to a default: a budget check guessing its own budget is worse
// than no check.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();
const APP_DIR = ".next/server/app";
const BUDGET_DOC = "docs/architecture.md";

const limitFlag = process.argv.indexOf("--limit");
const limitOverride = limitFlag === -1 ? null : Number(process.argv[limitFlag + 1]);

function ceilingFromDoc() {
  if (limitOverride !== null) {
    if (!Number.isFinite(limitOverride) || limitOverride <= 0) {
      console.log("check:budget FAILED — --limit needs a positive number of KB");
      process.exit(1);
    }
    return { kb: limitOverride, source: "--limit override" };
  }

  let doc;
  try {
    doc = readFileSync(join(ROOT, BUDGET_DOC), "utf8");
  } catch {
    console.log(`check:budget FAILED — cannot read ${BUDGET_DOC}, which owns the budget`);
    process.exit(1);
  }

  // Matches the "Initial JS, first load | **≤ 240KB gzip**" row.
  const match = doc.match(/Initial JS, first load[^|]*\|[^|]*?(\d+(?:\.\d+)?)\s*KB/i);
  if (!match) {
    console.log(
      `check:budget FAILED — could not find the "Initial JS, first load" limit in ${BUDGET_DOC}.\n` +
        `    Refusing to guess. Fix the row or fix this pattern; do not add a default.`,
    );
    process.exit(1);
  }
  return { kb: Number(match[1]), source: `${BUDGET_DOC}` };
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

/** `.next/server/app/index.html` -> `/`, `.../booking.html` -> `/booking`. */
function routeOf(htmlPath) {
  const rel = relative(join(ROOT, APP_DIR), htmlPath).split(sep).join("/");
  const stripped = rel.replace(/\.html$/, "");
  return stripped === "index" ? "/" : `/${stripped}`;
}

const gzipKb = (file) => gzipSync(readFileSync(join(ROOT, ".next", file))).length / 1024;

const pages = walk(join(ROOT, APP_DIR));

// SKIP LOUDLY rather than report success over nothing. A build that produced
// no prerendered HTML is a build this check did not examine.
if (pages.length === 0) {
  console.log(
    `check:budget FAILED — no prerendered HTML under ${APP_DIR}.\n` +
      `    Run \`pnpm build\` first. Nothing was measured.`,
  );
  process.exit(1);
}

const { kb: CEILING, source } = ceilingFromDoc();
const breaches = [];
const rows = [];

for (const html of pages.sort()) {
  const body = readFileSync(html, "utf8");
  const chunks = [...new Set(body.match(/static\/chunks\/[a-zA-Z0-9_.-]+\.js/g) ?? [])];

  // The polyfill chunk is emitted with `noModule`, so only legacy browsers
  // fetch it and the target device never does. Excluded from the comparison
  // and printed anyway, so excluding it stays a visible decision.
  let polyfill = 0;
  let shipped = 0;
  for (const chunk of chunks) {
    const size = gzipKb(chunk);
    if (/^static\/chunks\/0cz/.test(chunk) || chunk.includes("polyfill")) polyfill += size;
    else shipped += size;
  }

  const route = routeOf(html);
  rows.push({ route, shipped, polyfill, count: chunks.length });
  if (shipped > CEILING) breaches.push({ route, shipped });
}

const fmt = (n) => n.toFixed(1).padStart(7);
console.log(`check:budget — ceiling ${CEILING}KB gzip, from ${source}\n`);
for (const r of rows) {
  const flag = r.shipped > CEILING ? "  BREACH" : "";
  console.log(
    `${fmt(r.shipped)} KB  ${r.route}` +
      `   (${r.count} chunks, + ${r.polyfill.toFixed(1)}KB legacy polyfill, excluded)${flag}`,
  );
}

if (breaches.length === 0) {
  const worst = Math.max(...rows.map((r) => r.shipped));
  console.log(
    `\nAll ${rows.length} route(s) within budget. Headroom on the heaviest: ${(CEILING - worst).toFixed(1)}KB`,
  );
  process.exit(0);
}

console.log(`\n✗ ${breaches.length} route(s) over the ${CEILING}KB ceiling:`);
for (const b of breaches) {
  console.log(
    `    ${b.route} — ${b.shipped.toFixed(1)}KB, over by ${(b.shipped - CEILING).toFixed(1)}KB`,
  );
}
console.log(
  `\ncheck:budget FAILED. The budget and its reasoning are in ${BUDGET_DOC};\n` +
    `raising the ceiling is a decision with measurements behind it, not a fix.`,
);
process.exit(1);
