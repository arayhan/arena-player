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
// CLAUDE.md hard rule 3 declares SEVEN. Most of them mark content that has no
// code yet (they land in Phase 2+), so this asserts NO ORPHANS rather than
// all-seven-present — the latter cannot pass until the landing page exists.
//
// THE SEVENTH ARRIVED WITH A CLIENT ANSWER, NOT WITH A REFACTOR. On 2026-08-11
// the client settled the pricing open decision: no number on `/`, a real rupiah
// amount on `/booking`. That closes hard rule 2's exception clause and opens a
// content gap that did not exist before — the rate card itself, which nobody
// has supplied. A price is exactly the kind of value that must never be
// invented, so it joins the same marker family as the bank account.
const CATEGORIES = [
  "wa number",
  "whatsapp",
  "bank account",
  "address",
  "maps",
  "photo",
  "logo",
  "hero copy",
  "rate card",
  "price",
  "harga",
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
          `Hard rule 3 lists: WA number, bank account + holder, address + maps coords, ` +
          `photos, logo file, hero copy, rate card`,
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

// --- 4b. Schema values agree everywhere they are written ---------------------
//
// The schema is spelled out in THREE places — db/migrations/*.sql,
// docs/database.md, and docs/PRD.md — plus src/domain/, which is a fourth copy
// of the same vocabulary in TypeScript. That is the copied-value shape this
// repo has already lost time to three separate ways, and here it is the worst
// instance available:
//
//   uniq_active_slot compares time_slot as TEXT. A separator drift means either
//   every insert is rejected by the constraint, or — if the app side is the one
//   that moved — two rows book the same slot and the only race guard in the
//   system quietly does nothing.
//
//   ACTIVE_STATUSES mirrors that index's WHERE clause. If the two disagree, the
//   guard silently changes meaning.
//
// An earlier version of this check watched the migration alone, which left the
// two doc copies unguarded on the day the migration file was created.
//
// .sql is deliberately absent from TEXT above: widening that glob would drag
// SQL through the prose-oriented checks 1-3. These files are read by path.
{
  // Scope to the declaration FIRST, then extract inside the slice. The first
  // version skipped this and compared three prose mentions in slots.ts' own doc
  // comments against the nine in the SQL — a checker taken in by exactly the
  // confusion it exists to catch.
  const between = (text, start, end) => {
    const from = text.indexOf(start);
    if (from === -1) return null;
    const to = text.indexOf(end, from + start.length);
    return to === -1 ? null : text.slice(from, to);
  };
  const quoted = (slice) => (slice?.match(/["']([^"']+)["']/g) ?? []).map((s) => s.slice(1, -1));
  const read = (f) => linesOf(f).join("\n");

  // Every file that writes the CURRENT schema out. Only the LATEST migration
  // is compared, not every migration ever written: a migration is immutable
  // history the moment it is applied (hard rule — never edit an applied one),
  // so an OLDER file's own CHECK text is EXPECTED to disagree with today's
  // domain values once a later migration has superseded it. Comparing every
  // migration file against current TIME_SLOTS would fail forever the moment a
  // second migration exists, on a file nobody is allowed to touch to fix it.
  // Filenames sort correctly because they are YYYYMMDD-prefixed.
  const migrationFiles = ALL.filter((f) => /^db\/migrations\/.*\.sql$/.test(f)).sort();
  const latestMigration = migrationFiles[migrationFiles.length - 1];
  const SQL_SOURCES = [latestMigration, "docs/database.md", "docs/PRD.md"].filter(Boolean);

  const expected = {
    slots: quoted(between(read("src/domain/slots.ts"), "TIME_SLOTS = [", "]")),
    statuses: quoted(between(read("src/domain/status.ts"), "BOOKING_STATUSES = [", "]")),
    active: quoted(between(read("src/domain/status.ts"), "ACTIVE_STATUSES = [", "]")),
  };

  // SILENCE IS THE FAILURE MODE TO AVOID. Before step 06 these files do not
  // exist, and a check comparing two empty lists reports success having
  // compared nothing.
  if (expected.slots.length > 0 && expected.statuses.length > 0) {
    const CLAIMS = [
      {
        what: "time_slot_canonical",
        start: "constraint time_slot_canonical",
        end: "))",
        against: expected.slots,
        source: "TIME_SLOTS in src/domain/slots.ts",
      },
      {
        what: "status_valid",
        start: "constraint status_valid",
        end: "))",
        against: expected.statuses,
        source: "BOOKING_STATUSES in src/domain/status.ts",
      },
      {
        what: "uniq_active_slot WHERE",
        start: "create unique index uniq_active_slot",
        end: ";",
        against: expected.active,
        source: "ACTIVE_STATUSES in src/domain/status.ts",
      },
    ];

    for (const f of SQL_SOURCES) {
      const text = read(f);
      for (const claim of CLAIMS) {
        const slice = between(text, claim.start, claim.end);
        if (slice === null) continue; // this file does not spell that one out
        const found = quoted(slice);
        if (JSON.stringify(found) !== JSON.stringify(claim.against)) {
          fail(
            "schema-value-drift",
            `${f} — ${claim.what} does not match ${claim.source}\n` +
              `        here    : ${JSON.stringify(found)}\n` +
              `        expected: ${JSON.stringify(claim.against)}`,
          );
        }
      }

      // notes_length: one number, four copies, and the PRD field list already
      // disagreed with it once before the pre-flight pass caught it.
      const notes = text.match(/notes_length check \(notes is null or length\(notes\) <= (\d+)\)/);
      if (notes && notes[1] !== "500") {
        fail("schema-value-drift", `${f} — notes_length is ${notes[1]}, not 500`);
      }
    }

    // THERE IS NO "docs/database.md IS byte-identical to THE migration" CHECK
    // ANYMORE. That held only while db/migrations/ contained exactly one file,
    // when the whole schema WAS one migration. Since 2026-08-15's ALTER
    // migration, docs/database.md's fenced block is documented (in its own
    // prose, at the top of the Schema section) as the CURRENT schema — what
    // running every migration in order produces — not literally any single
    // file's bytes. The CLAIMS loop above still holds it to the values that
    // actually matter (the constraint lists agree with domain), which is the
    // guarantee this repo has been burned by losing, not character-identity
    // with one file among several.
  }
}

// --- 4c. GSAP is reachable from exactly one file -----------------------------
//
// eslint bans `gsap`, `gsap/*` and `@gsap/react` repo-wide, and that ban does
// NOT match `import("gsap")` — probed both directions. The dynamic form is
// therefore the one remaining way to reach GSAP, and it belongs in
// src/lib/motion.ts alone: motion.ts is what adds the prefers-reduced-motion
// branch GSAP has none of, so a dynamic import anywhere else is an animation
// that runs for someone who asked the OS for stillness. It also re-splits the
// 43.6KB across a second chunk.
{
  const MOTION = "src/lib/motion.ts";
  const DYNAMIC_GSAP = /import\s*\(\s*["']gsap(?:\/[^"']*)?["']\s*\)/;
  for (const f of ALL.filter((f) => /^src\/.+\.(ts|tsx)$/.test(f) && f !== MOTION)) {
    for (const [n, line] of scannable(f)) {
      if (DYNAMIC_GSAP.test(line)) {
        fail(
          "gsap-outside-motion",
          `${f}:${n} — dynamic import of GSAP outside ${MOTION}. ` +
            `Use useMotion(): it is what supplies the reduced-motion branch, and a ` +
            `second dynamic import splits the 43.6KB across another chunk`,
        );
      }
    }
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

// src/components/ and src/hooks/ sit BELOW modules — modules consume them, not
// the other way round. A shared hook importing a module is not shared; it is
// that module's hook in the wrong folder, and it drags whatever the module
// imports onto every surface that uses it.
const isSharedLayer = (f) => f.startsWith("src/components/") || f.startsWith("src/hooks/");

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
    if (isSharedLayer(f) && line.includes("@/modules/")) {
      fail(
        "shared-layer-inversion",
        `${f}:${n} — a shared ${f.startsWith("src/hooks/") ? "hook" : "component"} imports a module. ` +
          `It belongs to that module instead; src/components/ and src/hooks/ sit below modules`,
      );
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

      if (isSharedLayer(f) && target.startsWith("src/modules/")) {
        fail(
          "shared-layer-inversion",
          `${f}:${n} — reaches into a module via "${spec}". ` +
            `src/components/ and src/hooks/ sit below modules; if only one module needs it, ` +
            `it belongs in that module`,
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

// --- 14. The Ketentuan is VERBATIM, and this is the only thing that proves it -
//
// Hard rule 5 says the ten rules are copied from docs/PRD.md word for word.
// That rule is unenforceable by eye: the failure is not a crash or a visual
// defect, it is somebody tidying "Diluar" to "Di luar", normalising the mixed
// capitalisation, or shortening rule 7 — each individually an improvement, and
// collectively a rewrite of an agreement the client wrote and we do not own.
//
// A visitor is agreeing to this text when they book. So the PRD block and the
// shipped array are compared character for character.
{
  const prd = readFileSync(join(ROOT, "docs/PRD.md"), "utf8");
  const content = readFileSync(join(ROOT, "src/modules/home/home.content.ts"), "utf8");

  // The PRD block is a numbered markdown list under the verbatim heading.
  const block = prd.split("## Static content — Rules section (verbatim, Indonesian)")[1];
  if (!block) {
    fail("ketentuan-verbatim", "docs/PRD.md — the verbatim rules heading is gone; cannot compare");
  } else {
    const prdRules = [...block.matchAll(/^\d+\.\s+(.+)$/gm)].map((m) => m[1].trim());
    const shipped = [...content.matchAll(/^\s+"(.+)",$/gm)].map((m) => m[1].replace(/\\"/g, '"'));

    // NINE SINCE 2026-08-15, TEN BEFORE IT. The client dropped the DP rule and
    // rewrote the two after it. The count is asserted rather than inferred from
    // the file it is checking: a list that silently loses a rule to a bad edit
    // would otherwise still "match" as long as both copies lost the same one,
    // and this check exists precisely because the shipped text is an agreement a
    // visitor accepts by booking. Moving the number is a deliberate act, which
    // is the property worth keeping.
    const KETENTUAN_RULES = 9;
    if (prdRules.length !== KETENTUAN_RULES) {
      fail(
        "ketentuan-verbatim",
        `docs/PRD.md — expected ${KETENTUAN_RULES} rules, parsed ${prdRules.length}`,
      );
    }
    if (shipped.length !== prdRules.length) {
      fail(
        "ketentuan-verbatim",
        `home.content.ts ships ${shipped.length} rules, docs/PRD.md declares ${prdRules.length}`,
      );
    }
    prdRules.forEach((rule, i) => {
      if (shipped[i] !== rule) {
        fail(
          "ketentuan-verbatim",
          `rule ${i + 1} differs from docs/PRD.md — the Ketentuan is client content and is never reworded.\n` +
            `        PRD:     ${rule}\n` +
            `        shipped: ${shipped[i] ?? "(missing)"}`,
        );
      }
    });
  }
}

// --- 15. The typeface a document names must be the typeface the app loads ----
//
// THIS CHECK EXISTS BECAUSE A TYPEFACE CHANGE IS INVISIBLE TO EVERY OTHER GUARD
// IN THIS FILE. `design-value-drift` above compares hex colours and contrast
// ratios; a family name is not either. So when the display face went Orbitron ->
// Saira (2026-08-12) -> Panchang (2026-08-13), six authority documents kept
// asserting the retired name — DESIGN.md, DESIGN.html, PRD.md, PRODUCT.md, the
// design sidecar, and the design skill an agent loads BEFORE touching anything —
// and `pnpm check` stayed green through all of it for two days.
//
// The face has now changed twice in two days. A third change repeats this
// exactly unless something reads the code and fails the prose.
//
// THE SOURCE OF TRUTH IS layout.tsx, not a list here. A list would be one more
// copy to drift; the loaded families are parsed out of the `next/font` calls
// that actually ship. Anything else named as CURRENT is a finding.
{
  const layout = readFileSync(join(ROOT, "src/app/layout.tsx"), "utf8");

  // Two shapes, because the two faces load differently and both are load-bearing:
  // `next/font/google` imports the family as an identifier (Plus_Jakarta_Sans),
  // and `next/font/local` names its files by path (./fonts/Panchang-700.woff2).
  const loaded = new Set();
  for (const m of layout.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']next\/font\/google["']/g)) {
    for (const name of m[1].split(",")) {
      const clean = name.trim().replace(/_/g, " ");
      if (clean) loaded.add(clean.toLowerCase());
    }
  }
  for (const m of layout.matchAll(/["']\.\/fonts\/([A-Za-z][A-Za-z0-9]*)[-.]/g)) {
    loaded.add(m[1].toLowerCase());
  }

  // The watchlist is every face this project has ever named, plus the ones a
  // model reaches for by default. A face on this list that is NOT loaded may
  // only appear in a historical sentence.
  const KNOWN_FACES = [
    "orbitron",
    "saira",
    "panchang",
    "inter",
    "archivo",
    "roboto",
    "poppins",
    "montserrat",
    "space grotesk",
    "nv dune hero",
  ];
  const retired = KNOWN_FACES.filter((f) => !loaded.has(f));

  // WHERE A CLAIM IS BINDING. History files are already excluded from `sources`
  // by `isHistory`, which is the right call: "the pair is now Saira" was TRUE on
  // 2026-08-12 and rewriting it would be falsifying the record. These are the
  // files a future agent reads as CURRENT STATE.
  const AUTHORITY = (f) =>
    f === "docs/DESIGN.md" ||
    f === "docs/PRD.md" ||
    f === "docs/PRODUCT.md" ||
    f === "CLAUDE.md" ||
    f.startsWith(".claude/skills/") ||
    f.startsWith(".claude/rules/") ||
    f.startsWith(".claude/agents/");

  // A DATED SENTENCE IS HISTORY EVEN INSIDE AN AUTHORITY FILE, and this is the
  // discriminator the check lives or dies on. DESIGN.md's change log has to be
  // able to say "Was: Saira" without failing, or the guard would forbid the
  // project from recording its own decisions — and a guard that punishes honest
  // history is a guard people delete. A line is historical if it carries a
  // superseded-marker: a date, or one of the words that mark a retired claim.
  const HISTORICAL =
    /\b(20\d\d-\d\d-\d\d|superseded|used to|no longer|was\b|retired|previous|until|replaced|changed to|former)\b/i;

  // THE TEST IS SECTION-SCOPED, NOT LINE-SCOPED, AND THE FIRST VERSION WAS NOT.
  // Line-scoping failed on the first thing it was pointed at: DESIGN.md's change
  // log is a `| Was | Is now |` table under a dated heading, and the ROWS carry
  // no date of their own — so a document recording its own history honestly got
  // a finding for doing exactly that. A guard that punishes an accurate change
  // log is a guard the next person deletes. A heading marks its whole section as
  // historical until a heading of the same or higher level closes it.
  for (const f of sources) {
    if (!AUTHORITY(f)) continue;
    const lines = readFileSync(join(ROOT, f), "utf8").split(/\r?\n/);
    let historicalLevel = 0; // 0 = not inside a historical section
    lines.forEach((line, i) => {
      const heading = /^(#{1,6})\s+(.*)$/.exec(line);
      if (heading) {
        const level = heading[1].length;
        if (historicalLevel && level <= historicalLevel) historicalLevel = 0;
        if (!historicalLevel && HISTORICAL.test(heading[2])) historicalLevel = level;
      }
      if (historicalLevel) return;
      if (HISTORICAL.test(line)) return;
      for (const face of retired) {
        // Word-boundary, case-insensitive. `Saira` in a URL or a filename is
        // still a claim about what this project uses.
        if (new RegExp(`\\b${face.replace(/ /g, "\\s+")}\\b`, "i").test(line)) {
          fail(
            "typeface-drift",
            `${f}:${i + 1} — names "${face}" as current, but src/app/layout.tsx loads ` +
              `[${[...loaded].join(", ")}]. Say it in a dated or superseded sentence, or fix it.`,
          );
        }
      }
    });
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
  "schema-value-drift",
  "gsap-outside-motion",
  "cross-module-import",
  "shared-layer-inversion",
  "app-boundary",
  "domain-escape",
  "phase-table-drift",
  "design-value-drift",
  "unbalanced-fence",
  "ketentuan-verbatim",
  "typeface-drift",
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
