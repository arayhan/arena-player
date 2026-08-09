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
import { join, relative, sep, posix } from "node:path";

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
// .html is here for docs/DESIGN.html specifically: it is the 1b design system
// doubling as the prototype, hero copy is one of the six TODO(content)
// categories, and it is neither SHIPS nor isProse — so before this it was the
// one file that could carry a real marker with nothing scanning for it.
const SHIPS = (f) => /\.(ts|tsx|css|html)$/.test(f) && !f.startsWith("scripts/");
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
//
// The fence toggle FAILS OPEN: an unbalanced fence leaves it stuck on and
// silently disables checks 1-3 for the rest of the file. That is the direction
// that hides violations rather than inventing them, so the imbalance is
// reported as its own finding rather than left to be discovered.
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
  // Reported once per file, not once per caller — checks 1, 2 and 3 each walk
  // the same file and would otherwise triple every finding.
  if (prose && fenced && !reportedFences.has(file)) {
    reportedFences.add(file);
    fail("unbalanced-fence", `${file} — odd number of \`\`\` fences; checks 1-3 stopped part-way`);
  }
}
const reportedFences = new Set();

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

// --- 5. Import boundaries, including the relative form ESLint cannot glob ----
//
// The ESLint zones catch the alias form (`@/modules/booking-form/…`). They
// cannot catch `../booking-form/…`: a glob would have to ban `../*` outright,
// which is wrong for every module — `src/modules/home/components/x.tsx`
// importing `../home.service` is correct and routine. So the relative form is
// resolved here instead, which is cheap because the path is all that matters.
//
// The gap this closes is not theoretical. CROSS_MODULE's own message says "one
// home -> booking-form import is all it takes for a later `import { z }` there
// to ship zod to / with nothing failing" — and until now BOTH named guards
// missed the relative spelling of exactly that import.
const MODULES = (() => {
  try {
    return readdirSync(join(ROOT, "src/modules")).filter((d) =>
      statSync(join(ROOT, "src/modules", d)).isDirectory(),
    );
  } catch {
    return [];
  }
})();

// Import/export specifiers, static and dynamic. Deliberately not a parser:
// this needs the string, not the AST, and a regex has no install cost.
const SPECIFIER = /(?:from|import)\s*\(?\s*["']([^"']+)["']/g;

const moduleOwner = (f) => (f.startsWith("src/modules/") ? f.split("/")[2] : null);

for (const f of ALL.filter((f) => /^src\/.+\.(ts|tsx)$/.test(f))) {
  const owner = moduleOwner(f);
  const dir = posix.dirname(f);

  for (const [n, line] of scannable(f)) {
    // Alias form — unchanged, and still the common case.
    if (owner) {
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

    // Relative form — resolve it and check where it lands.
    SPECIFIER.lastIndex = 0;
    let m;
    while ((m = SPECIFIER.exec(line)) !== null) {
      const spec = m[1];
      if (!spec.startsWith(".")) continue;
      const target = posix.normalize(posix.join(dir, spec));

      const targetOwner = moduleOwner(target);
      if (owner && targetOwner && targetOwner !== owner) {
        fail(
          "cross-module-import",
          `${f}:${n} — ${owner} imports ${targetOwner} via "${spec}". ` +
            `The ESLint zone only sees the @/ form; shared vocabulary goes in src/domain/`,
        );
      }

      if (target.startsWith("src/app/") && !f.startsWith("src/app/")) {
        fail(
          "app-boundary",
          `${f}:${n} — reaches into src/app/ via "${spec}". ` +
            `Nothing under src/ imports from src/app/; the @/app ban cannot see a relative path`,
        );
      }

      if (f.startsWith("src/domain/") && !target.startsWith("src/domain/")) {
        fail(
          "domain-escape",
          `${f}:${n} — src/domain/ reaches outside itself via "${spec}". ` +
            `arena-player-admin has no such folder to resolve against, so the copy stays ` +
            `byte-identical and simply does not build there`,
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
    // Skills, agents AND hooks. The comment above has always named all three;
    // the scan covered only skills, which left the agents — the surface that
    // produced the overstated-contrast-ratio defect — unwatched.
    const COPY_SURFACES = [".claude/skills/", ".claude/agents/", ".claude/hooks/"];
    const copies = ALL.filter(
      (f) => COPY_SURFACES.some((d) => f.startsWith(d)) && /\.(md|ps1|mjs|js)$/.test(f),
    );
    // Ratios are compared as a SET, not as a substring of the flattened doc.
    // "3:1" is a substring of "14.53:1", so the substring form quietly accepted
    // every integer ratio the moment a decimal one shared its digits — which is
    // how the first probe of this check passed against a value DESIGN.md has
    // never contained.
    const RATIO = /\b\d{1,2}(?:\.\d{1,2})?\s*:\s*1\b/g;
    const designRatios = new Set((design.match(RATIO) ?? []).map((r) => r.replace(/\s+/g, "")));
    for (const f of copies) {
      linesOf(f).forEach((line, i) => {
        for (const hex of line.match(/#[0-9a-fA-F]{6}\b/g) ?? []) {
          if (!new RegExp(hex, "i").test(design)) {
            fail("design-value-drift", `${f}:${i + 1} — ${hex} does not appear in docs/DESIGN.md`);
          }
        }
        // Integer ratios too: 3:1 is the WCAG 1.4.11 non-text bar and was
        // invisible to the decimals-only pattern that shipped first.
        for (const ratio of line.match(RATIO) ?? []) {
          if (!designRatios.has(ratio.replace(/\s+/g, ""))) {
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
  "app-boundary",
  "domain-escape",
  "phase-table-drift",
  "design-value-drift",
  "unbalanced-fence",
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
