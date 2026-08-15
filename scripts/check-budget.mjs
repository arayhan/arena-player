// Measures the gzipped client JS each route actually downloads, and fails on a
// breach of the budget in docs/architecture.md.
//
//   node scripts/check-budget.mjs            enforce, exit 1 on breach
//   node scripts/check-budget.mjs --report   per-chunk table, always exit 0
//   node scripts/check-budget.mjs --limit N  enforce against N KB instead
//
// ONE MEASUREMENT, ONE POLYFILL RULE. This absorbed scripts/measure-bundle.mjs,
// which measured the same bytes with its own copy of the exclusion rule. Two
// implementations meant the numbers in the budget table could be produced one
// way and enforced another — and they already had drifted: this file matched the
// polyfill by the hash prefix `static/chunks/0cz`, which is a TURBOPACK CONTENT
// HASH. Any dependency bump rehashes that chunk, the prefix stops matching, and
// 38.7KB silently counts as shipped on every route. It would not even fail
// loudly at today's numbers, just quietly eat a third of the headroom. The
// manifest's own polyfillFiles list is authoritative; use it.
//
// WHY NOT PARSE THE BUILD OUTPUT, AS THE PLAN ASSUMED
//
// Next 16 removed the per-route "First Load JS" table Next 15 printed, and
// Turbopack emits no top-level app-build-manifest.json. The per-route
// .next/server/app/<route>/build-manifest.json it DOES emit lists only the
// polyfill and the shared root files — the route's own chunk is missing from
// it, which is exactly the number this exists to watch.
//
// The prerendered HTML is the honest source: it is literally the list of
// scripts the browser is told to download for that route.
//
// PER ROUTE, NOT ONE TOTAL. A single global number hides the case this project
// actually cares about — /booking's form libraries leaking onto /.
//
// The ceiling is READ FROM docs/architecture.md, not copied here. That file
// calls itself "the single source — reference it, never copy the numbers", and
// a check that restates the limit is one more copy to drift against. If the
// number cannot be parsed, this exits non-zero rather than falling back to a
// default: a budget check guessing its own budget is worse than no check.

import { spawn } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();
const APP_DIR = ".next/server/app";
const MANIFEST = ".next/build-manifest.json";
const APP_PATHS = ".next/server/app-paths-manifest.json";
const BUDGET_DOC = "docs/architecture.md";

const REPORT_ONLY = process.argv.includes("--report");
const limitFlag = process.argv.indexOf("--limit");
const limitOverride = limitFlag === -1 ? null : Number(process.argv[limitFlag + 1]);

function die(message) {
  console.log(`check:budget FAILED — ${message}`);
  process.exit(1);
}

function ceilingFromDoc() {
  if (limitOverride !== null) {
    if (!Number.isFinite(limitOverride) || limitOverride <= 0) {
      die("--limit needs a positive number of KB");
    }
    return { kb: limitOverride, source: "--limit override" };
  }

  let doc;
  try {
    doc = readFileSync(join(ROOT, BUDGET_DOC), "utf8");
  } catch {
    die(`cannot read ${BUDGET_DOC}, which owns the budget`);
  }

  // Matches the "Initial JS, first load | **≤ 240KB gzip**" row.
  const match = doc.match(/Initial JS, first load[^|]*\|[^|]*?(\d+(?:\.\d+)?)\s*KB/i);
  if (!match) {
    die(
      `could not find the "Initial JS, first load" limit in ${BUDGET_DOC}.\n` +
        `    Refusing to guess. Fix the row or fix this pattern; do not add a default.`,
    );
  }
  return { kb: Number(match[1]), source: BUDGET_DOC };
}

/**
 * The chunks only legacy browsers fetch. Next emits these with `noModule`, so
 * the target device never downloads them and they are excluded from the
 * comparison — but read from the manifest, never guessed from a filename.
 */
function legacyChunks() {
  try {
    const manifest = JSON.parse(readFileSync(join(ROOT, MANIFEST), "utf8"));
    return new Set(manifest.polyfillFiles ?? []);
  } catch {
    // Absent manifest is not "no polyfill" — it is not knowing. Saying so
    // beats silently counting 38.7KB as shipped on every route.
    return null;
  }
}

function walkHtml(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkHtml(full, out);
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
const kb = (n) => n.toFixed(1).padStart(7);

const pages = walkHtml(join(ROOT, APP_DIR));

// FAIL LOUDLY rather than report success over nothing. A build that produced no
// prerendered HTML is a build this never examined.
if (pages.length === 0) {
  die(`no prerendered HTML under ${APP_DIR}.\n    Run \`pnpm build\` first. Nothing was measured.`);
}

const legacy = legacyChunks();
if (legacy === null) die(`cannot read ${MANIFEST}, so the legacy-polyfill set is unknown`);

// EVERY DECLARED ROUTE MUST BE MEASURED, or this reports green on a repo it did
// not fully examine.
//
// walkHtml only finds PRERENDERED routes. A route that reads searchParams or
// cookies on the server is dynamic, emits no HTML, and simply disappears from
// the report — which prints "All N route(s) within budget" and exits 0. The
// route most likely to go dynamic is /booking, since Phase 3 reads
// `?date=&time=` from the pasted WhatsApp link. That is the exact route the
// nine-zone import split and the whole zod/rhf/axios confinement exist to
// police, so it vanishing silently is the worst possible blind spot.
//
// Reconciling against app-paths-manifest.json turns a silent omission into a
// loud failure that names the route and says what to do about it.
function declaredRoutes() {
  try {
    const manifest = JSON.parse(readFileSync(join(ROOT, APP_PATHS), "utf8"));
    return Object.keys(manifest)
      .filter((k) => k.endsWith("/page"))
      .map((k) => (k === "/page" ? "/" : k.replace(/\/page$/, "")));
  } catch {
    return null;
  }
}

const declared = declaredRoutes();
if (declared === null) die(`cannot read ${APP_PATHS}, so the route list is unknown`);

function rowFor(route, body) {
  const chunks = [...new Set(body.match(/static\/chunks\/[a-zA-Z0-9_.-]+\.js/g) ?? [])];

  let shipped = 0;
  let excluded = 0;
  const detail = [];
  for (const chunk of chunks) {
    const size = gzipKb(chunk);
    const isLegacy = legacy.has(chunk);
    if (isLegacy) excluded += size;
    else shipped += size;
    detail.push({ chunk, size, isLegacy });
  }

  return { route, shipped, excluded, detail };
}

const rows = pages.sort().map((html) => rowFor(routeOf(html), readFileSync(html, "utf8")));

// Anything declared but not prerendered is dynamic; ask the server for it.
const dynamicRoutes = declared.filter((route) => !rows.some((r) => r.route === route));
if (dynamicRoutes.length > 0) {
  const served = await htmlFromServer(dynamicRoutes);
  for (const [route, body] of served) rows.push(rowFor(route, body));
  rows.sort((a, b) => a.route.localeCompare(b.route));
}

// --- dynamic routes: measured by ASKING THE SERVER ---------------------------
//
// A route that reads searchParams is dynamic, emits no prerendered HTML, and
// used to fail this check with "measure it another way and add it here
// deliberately". This is that other way, and it is deliberate: `/booking` reads
// `?date=&time=` from the pasted WhatsApp link and is never going to be static.
//
// IT IS THE SAME MEASUREMENT, NOT A SECOND ONE. The script list is parsed out
// of the HTML the browser actually receives — for a static route that HTML sits
// on disk, and for a dynamic route the production server is the only place it
// exists. Booting `next start` once and fetching the route yields the identical
// evidence rather than an estimate assembled from manifests, which is exactly
// what the note above rejects.
//
// A guess would have been cheaper and wrong: /booking is the route the nine
// import zones and the whole zod/axios/react-hook-form confinement exist to
// police, so sizing it by anything other than what ships is the one shortcut
// this file may not take.
async function htmlFromServer(routes) {
  const port = 3987;
  const bin = join(ROOT, "node_modules", "next", "dist", "bin", "next");
  const server = spawn(process.execPath, [bin, "start", "--port", String(port)], {
    cwd: ROOT,
    stdio: "ignore",
  });

  try {
    // Poll rather than sleep: a fixed wait is either too short on a cold cache
    // or wasted time on a warm one.
    const deadline = Date.now() + 60_000;
    for (;;) {
      if (Date.now() > deadline) throw new Error(`next start did not answer on :${port} in 60s`);
      try {
        const probe = await fetch(`http://127.0.0.1:${port}/`);
        if (probe.ok) break;
      } catch {
        /* not listening yet */
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    const out = new Map();
    for (const route of routes) {
      const response = await fetch(`http://127.0.0.1:${port}${route}`);
      if (!response.ok) throw new Error(`${route} answered ${response.status}`);
      out.set(route, await response.text());
    }
    return out;
  } finally {
    server.kill();
  }
}

// --- --report: what measure-bundle.mjs used to print --------------------------
if (REPORT_ONLY) {
  for (const row of rows) {
    console.log(`\n${row.route}`);
    for (const d of row.detail.sort((a, b) => b.size - a.size)) {
      console.log(`  ${kb(d.size)} KB  ${d.isLegacy ? "legacy " : "       "}${d.chunk}`);
    }
    console.log(`  ${"-".repeat(56)}`);
    console.log(`  ${kb(row.shipped)} KB  shipped to the target device`);
    console.log(`  ${kb(row.excluded)} KB  legacy polyfill (noModule), excluded`);
  }
  process.exit(0);
}

// --- enforce -----------------------------------------------------------------
const measured = new Set(rows.map((r) => r.route));
const unmeasured = declared.filter((route) => !measured.has(route));

if (unmeasured.length > 0) {
  die(
    `${unmeasured.length} declared route(s) produced no measurement:\n` +
      unmeasured.map((r) => `        ${r}`).join("\n") +
      `\n\n    A route with no prerendered HTML is DYNAMIC — it reads searchParams,\n` +
      `    cookies, or headers on the server. This check cannot size it, and\n` +
      `    silently skipping it would report every remaining route as green while\n` +
      `    the unmeasured one carries whatever it likes.\n\n` +
      `    Fix it, do not suppress it: either keep the route static, or measure\n` +
      `    it another way and add it here deliberately.`,
  );
}

const { kb: CEILING, source } = ceilingFromDoc();
const breaches = rows.filter((r) => r.shipped > CEILING);

console.log(`check:budget — ceiling ${CEILING}KB gzip, from ${source}\n`);
for (const r of rows) {
  console.log(
    `${kb(r.shipped)} KB  ${r.route}` +
      `   (${r.detail.length} chunks, + ${r.excluded.toFixed(1)}KB legacy polyfill, excluded)` +
      (r.shipped > CEILING ? "  BREACH" : ""),
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
