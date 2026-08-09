// The mechanical half of doc review.
//
// Three review rounds found roughly half the issues were pure greps, and that
// mechanical edits became the largest source of NEW defects. This session alone
// produced four instances of one path-rename mistake across two repos, each
// found by a human re-reading rather than by a command. This is that command.
//
// It asserts nothing about judgement — whether a rationale is still true, or a
// skill still matches the PRD, stays a human ask.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();

// Files that record what was true when work happened. History is never
// rewritten, so it is never asserted against either.
const HISTORY = [
  "docs/PROGRESS.md",
  "docs/progress-archive",
  "docs/tasks/1a-step-01-architecture.md",
  "docs/tasks/1a-step-02-scaffold.md",
];

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "out",
  "build",
  ".impeccable", // gitignored critiques; not ours to assert against
]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const ALL = walk(ROOT).map((f) => relative(ROOT, f).split(sep).join("/"));
const isHistory = (f) => HISTORY.some((h) => f === h || f.startsWith(h + "/"));

// This file holds every pattern it searches for, so scanning itself reports a
// violation for each one. Excluded by name rather than by a clever regex.
const SELF = "scripts/check-docs.mjs";

const TEXT = /\.(md|mdx|ts|tsx|css|mjs|json|ps1|html)$/;
const sources = ALL.filter((f) => TEXT.test(f) && !isHistory(f) && f !== SELF);

// A marker in code is a violation; the same string in prose is documentation
// OF the rule. The discriminator is quoting: docs write `TODO(phase2)` or
// "Phase 1" when naming the thing they forbid. Strip inline code spans, fenced
// blocks, and double-quoted spans before testing prose.
const isProse = (f) => /\.(md|mdx)$/.test(f);
const stripCode = (line) => line.replace(/`[^`]*`/g, "").replace(/"[^"]*"/g, "");

// Only files that can carry a REAL marker are scanned for one. A marker is a
// code comment in shipping source; the same string in a hook's help text or in
// prose is a description of the rule, and this repo's own gotcha hook exists
// precisely to state it.
const SHIPS = (f) => /\.(ts|tsx|css)$/.test(f) && !f.startsWith("scripts/");
const markerScannable = sources.filter((f) => SHIPS(f) || isProse(f));

const failures = [];
const fail = (check, detail) => failures.push({ check, detail });

function linesOf(file) {
  try {
    return readFileSync(join(ROOT, file), "utf8").split("\n");
  } catch {
    return [];
  }
}

// Yields [lineNumber, testableText] with fenced code blocks dropped in prose.
function* scannable(file) {
  const prose = isProse(file);
  let fenced = false;
  const lines = linesOf(file);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (prose && /^\s*```/.test(raw)) {
      fenced = !fenced;
      continue;
    }
    if (prose && fenced) continue;
    yield [i + 1, prose ? stripCode(raw) : raw];
  }
}

// --- 1. TODO(phase2) must not survive anywhere ------------------------------
// Renamed to TODO(content) when the re-cut made "Phase 2" mean the landing page.
for (const f of markerScannable) {
  for (const [n, line] of scannable(f)) {
    if (line.includes("TODO(phase2)")) {
      fail("todo-phase2", `${f}:${n} — marker is TODO(content), not TODO(phase2)`);
    }
  }
}

// --- 2. Every TODO(content) belongs to a declared category ------------------
// CLAUDE.md hard rule 3 declares six. Five of them mark content that has no
// code yet (they land in Phase 2+), so this asserts NO ORPHANS rather than
// all-six-present — the latter cannot pass until the landing page exists.
const CATEGORIES = [
  "wa number",
  "whatsapp",
  "bank account",
  "address",
  "maps",
  "photo",
  "logo",
  "hero copy",
];
for (const f of markerScannable) {
  for (const [n, line] of scannable(f)) {
    const at = line.indexOf("TODO(content)");
    if (at === -1) continue;
    const rest = line.slice(at).toLowerCase();
    if (!CATEGORIES.some((c) => rest.includes(c))) {
      fail(
        "todo-content-category",
        `${f}:${n} — TODO(content) names no declared category. ` +
          `Hard rule 3 lists: WA number, bank account + holder, address + maps coords, photos, logo file, hero copy`,
      );
    }
  }
}

// --- 3. No bare "Phase 1" — only 1a, 1b, or a numbered later phase ----------
for (const f of sources) {
  for (const [n, line] of scannable(f)) {
    // "Phase 1" not followed by a/b or another digit
    if (/\bPhase 1(?![ab0-9])/.test(line)) {
      fail("bare-phase-1", `${f}:${n} — say Phase 1a or Phase 1b; bare "Phase 1" is ambiguous`);
    }
  }
}

// --- 4. No index.ts barrels under src/modules/ ------------------------------
// A barrel re-exports the whole module, so one import from it drags zod,
// react-hook-form and axios onto whatever route did the importing. Nothing
// errors; the page just gets slower. ESLint zones cannot express this.
for (const f of ALL) {
  if (/^src\/modules\/.*\/index\.tsx?$/.test(f) || /^src\/modules\/index\.tsx?$/.test(f)) {
    fail("module-barrel", `${f} — no index.ts barrels under src/modules/; import deep paths`);
  }
}

// --- 5. Feature modules never import each other -----------------------------
const MODULES = (() => {
  try {
    return readdirSync(join(ROOT, "src/modules")).filter((d) =>
      statSync(join(ROOT, "src/modules", d)).isDirectory(),
    );
  } catch {
    return [];
  }
})();
for (const f of ALL.filter((f) => /^src\/modules\/.+\.(ts|tsx)$/.test(f))) {
  const owner = f.split("/")[2];
  for (const [n, line] of scannable(f)) {
    for (const other of MODULES) {
      if (other === owner) continue;
      if (line.includes(`@/modules/${other}`)) {
        fail(
          "cross-module-import",
          `${f}:${n} — ${owner} imports ${other}. Shared vocabulary goes in src/domain/`,
        );
      }
    }
  }
}

// --- 6. Phase overview table names the same phases as the detail sections ---
{
  const prd = linesOf("docs/PRD.md");
  const inTable = new Set();
  const inDetail = new Set();

  // Scope the table read to the "## Phase overview" section. PRD's per-phase
  // task tables use the same `| 5 | … |` row shape, so an unscoped scan reports
  // task numbers as missing phases — which it did on the first run here.
  let inOverview = false;
  for (const line of prd) {
    if (/^##\s+Phase overview/i.test(line)) {
      inOverview = true;
      continue;
    }
    if (inOverview && /^##\s/.test(line)) inOverview = false;

    if (inOverview) {
      const row = line.match(/^\|\s*(1a|1b|[2-9])\s*\|/);
      if (row) inTable.add(row[1]);
    }
    const head = line.match(/^##\s+Phase\s+(1a|1b|[2-9])\b/);
    if (head) inDetail.add(head[1]);
  }
  for (const p of inTable) {
    if (!inDetail.has(p)) {
      fail(
        "phase-table-drift",
        `docs/PRD.md — phase ${p} is in the overview table but has no "## Phase ${p}" section`,
      );
    }
  }
  for (const p of inDetail) {
    if (!inTable.has(p)) {
      fail(
        "phase-table-drift",
        `docs/PRD.md — "## Phase ${p}" exists but the overview table omits it`,
      );
    }
  }
}

// --- 7. Design values copied into skills must match DESIGN.md ---------------
// This repo has lost time three separate ways to one failure: a value copied
// out of a source doc with nothing checking the copy. It hit the skills, the
// agents, and the hooks.
{
  const design = (() => {
    try {
      return readFileSync(join(ROOT, "docs/DESIGN.md"), "utf8");
    } catch {
      return null;
    }
  })();
  if (design) {
    const skillFiles = ALL.filter((f) => f.startsWith(".claude/skills/") && f.endsWith(".md"));
    for (const f of skillFiles) {
      linesOf(f).forEach((line, i) => {
        for (const hex of line.match(/#[0-9a-fA-F]{6}\b/g) ?? []) {
          const re = new RegExp(hex.replace("#", "#"), "i");
          if (!re.test(design)) {
            fail("design-value-drift", `${f}:${i + 1} — ${hex} does not appear in docs/DESIGN.md`);
          }
        }
        for (const ratio of line.match(/\b\d{1,2}\.\d{1,2}\s*:\s*1\b/g) ?? []) {
          const normalised = ratio.replace(/\s+/g, "");
          if (!design.replace(/\s+/g, "").includes(normalised)) {
            fail(
              "design-value-drift",
              `${f}:${i + 1} — contrast ratio ${ratio} does not appear in docs/DESIGN.md`,
            );
          }
        }
      });
    }
  }
}

// --- report -----------------------------------------------------------------
// Findings go to STDOUT, not stderr. The exit code carries pass/fail; the text
// is informational. PowerShell 5.1 wraps every stderr line from a native
// command in a NativeCommandError, which decorated the Stop hook message with
// a stack trace and, under ErrorActionPreference=Stop, made the hook swallow
// real failures entirely. Writing to stdout removes that whole class of trap.
const CHECKS = [
  "todo-phase2",
  "todo-content-category",
  "bare-phase-1",
  "module-barrel",
  "cross-module-import",
  "phase-table-drift",
  "design-value-drift",
];

if (failures.length === 0) {
  console.log(`check:docs — ${CHECKS.length} checks passed over ${sources.length} files`);
  process.exit(0);
}

const byCheck = new Map();
for (const { check, detail } of failures) {
  if (!byCheck.has(check)) byCheck.set(check, []);
  byCheck.get(check).push(detail);
}
for (const [check, details] of byCheck) {
  console.log(`\n✗ ${check}`);
  for (const d of details) console.log(`    ${d}`);
}
console.log(`\ncheck:docs FAILED — ${failures.length} problem(s) across ${byCheck.size} check(s)`);
process.exit(1);
