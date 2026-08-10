import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

// ---------------------------------------------------------------------------
// Superseded library APIs.
//
// CLAUDE.md names five libraries whose current syntax training data gets wrong
// and says to verify against Context7 rather than recall. That instruction has
// no mechanism behind it — a hook can run a command, block a tool, or inject
// text, and none of that makes an MCP call happen. So catch the damage instead
// of the intent: the wrong API is visible in the source.
//
// LIMIT, STATED HONESTLY: this catches *known* mistakes only. An API invented
// wholesale still lints clean. It is a floor, not a guarantee. It was chosen
// over a reminder hook because this repo already proved a nudge nobody is
// forced to act on gets ignored — the Stop hook ran a full session without
// firing and nobody noticed.
// ---------------------------------------------------------------------------
const SUPERSEDED_APIS = [
  {
    selector:
      "CallExpression[callee.object.name='rest'][callee.property.name=/^(get|post|put|patch|delete|all|head|options)$/]",
    message: "MSW v1 API. v2 uses http.get / http.post — import { http } from 'msw'.",
  },
  {
    selector: "CallExpression[callee.name='res'] > CallExpression[callee.object.name='ctx']",
    message:
      "MSW v1 response composition. v2 returns HttpResponse.json(body, { status }) directly.",
  },
  {
    selector:
      "VariableDeclarator[init.callee.name=/^use(Query|Queries|InfiniteQuery)$/] > ObjectPattern > Property[key.name='isLoading']",
    message:
      "TanStack Query v4 name. v5 renamed it isPending. isLoading still exists but means isPending && isFetching, which is not what most call sites want.",
  },
];

// ---------------------------------------------------------------------------
// Route split. `/` must never load these — the framework baseline measured
// 126.5KB against an estimated 90, and confining them is what pays for it.
// The budget table in docs/architecture.md is the single source for the numbers.
// ---------------------------------------------------------------------------
const SERVER_ONLY = {
  group: ["@/server", "@/server/*"],
  message:
    "src/server/ holds DATABASE_URL and the R2 secrets. Only route handlers under src/app/api/** may import it — everything else reaches data through an API route.",
};

// Import rule 1, the extraction boundary. CLAUDE.md and docs/dev-rules.md both
// said "three import rules, all lint-enforced" while this one was enforced
// nowhere — src/domain/ got it incidentally through the @/* ban and no other
// folder got it at all. A doc that overstates a guard is the failure class this
// repo has already paid for, so the guard now exists rather than the claim
// being softened. The relative form (`../../app/page`) is out of reach for a
// glob and is covered by check:docs instead.
const APP = {
  group: ["@/app", "@/app/*"],
  message:
    "Nothing under src/ imports from src/app/ — the extraction boundary. src/app/ composes modules; anything below it must stay movable to another app without dragging routing along, which is what keeps src/domain/ shareable with arena-player-admin.",
};

const AXIOS = {
  group: ["axios"],
  message:
    "axios is /booking-only (17.5KB measured). The landing page uses native fetch from src/modules/home/home.service.ts.",
};

const RHF = {
  group: ["react-hook-form"],
  message: "react-hook-form is /booking-only. It must not reach the landing bundle.",
};

const ZOD = {
  group: ["zod"],
  message:
    "zod is allowed in src/modules/booking-form/**, src/app/api/**, and src/server/** only. src/domain/ stays zod-free so the admin repo is not obliged to install it.",
};

// Hard rule 6, made mechanical rather than remembered. GSAP measured 43.6KB
// gzip with ScrollTrigger, and `/` only fits its budget because that sits
// behind a dynamic import in src/lib/motion.ts.
//
// This works because `no-restricted-imports` matches STATIC imports and does
// not match `import()` — probed, both directions. So the dynamic form inside
// motion.ts is the one remaining way to reach GSAP, and check:docs asserts
// that form appears in that file alone. @gsap/react is banned with it: its
// source opens `import gsap from "gsap"`, so importing useGSAP anywhere puts
// the whole 43.6KB back on first load.
const GSAP = {
  group: ["gsap", "gsap/*", "@gsap/react"],
  message:
    "GSAP is lazy-loaded through src/lib/motion.ts — 43.6KB that / cannot afford on first load. Use useMotion(), which also forces a prefers-reduced-motion branch GSAP does not provide on its own.",
};

const CROSS_MODULE = {
  group: ["@/modules/*/*", "@/modules/*"],
  message:
    "Feature modules never import each other. Shared vocabulary belongs in src/domain/. One home -> booking-form import is all it takes for a later `import { z }` there to ship zod to / with nothing failing.",
};

// A later config object REPLACES this rule for matching files rather than
// merging with it, so every override below must restate the patterns it still
// wants. Turning the rule off in a zone would silently lift the other bans too.
const DEFAULT_PATTERNS = [SERVER_ONLY, APP, AXIOS, RHF, ZOD, GSAP];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error", ...SUPERSEDED_APIS],
      "no-restricted-imports": ["error", { patterns: DEFAULT_PATTERNS }],
    },
  },

  // Feature modules: additionally barred from reaching sideways into each other.
  {
    files: ["src/modules/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [...DEFAULT_PATTERNS, CROSS_MODULE] }],
    },
  },

  // src/components/ and src/hooks/ sit BELOW modules: modules consume them, not
  // the other way round. A shared hook that imports @/modules/home is not
  // shared — it is a home hook in the wrong folder, and it drags whatever that
  // module imports onto every surface using it. Same reason CROSS_MODULE
  // exists, one layer down.
  {
    files: ["src/components/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [...DEFAULT_PATTERNS, CROSS_MODULE] }],
    },
  },

  // The booking form owns the three /booking packages. Still no @/server, and
  // still no reaching sideways. CROSS_MODULE rather than a literal
  // "@/modules/home": with two modules the two are equivalent, but the literal
  // form silently exempts a third module the day one is added, and this is the
  // only block that would have had that hole.
  {
    files: ["src/modules/booking-form/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [SERVER_ONLY, APP, GSAP, CROSS_MODULE] }],
    },
  },

  // The axios instance itself. Nothing else client-side may import axios.
  {
    files: ["src/services/api-client.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [SERVER_ONLY, APP, RHF, ZOD, GSAP] }],
    },
  },

  // src/app/ IS the composition layer, so it is the one place the @/app ban
  // must not apply — a layout importing its own page is the boundary working,
  // not breaking. Everything else it inherits.
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [SERVER_ONLY, AXIOS, RHF, ZOD, GSAP] }],
    },
  },

  // Route handlers run server-side, so zod there costs the client bundle
  // nothing and @/server is the whole point of the folder. axios and
  // react-hook-form stay banned — both are client concerns with no business in
  // a request handler. Must come after the src/app/** block to win.
  {
    files: ["src/app/api/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [AXIOS, RHF, GSAP] }],
    },
  },

  // src/server/ is below the extraction boundary, so unlike a route handler it
  // still may not reach into src/app/.
  {
    files: ["src/server/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [APP, AXIOS, RHF, GSAP] }],
    },
  },

  // src/domain/ is copied byte-identical into arena-player-admin. It must stay
  // dependency-light, must not reach upward into the rest of src/, and must
  // import its own siblings relatively so the copy resolves in both repos.
  {
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            SERVER_ONLY,
            AXIOS,
            RHF,
            ZOD,
            GSAP,
            {
              group: ["@/*"],
              message:
                "src/domain/ is byte-identical with arena-player-admin. Import siblings relatively (./slots) so the copy resolves the same in both repos regardless of either tsconfig, and never reach upward — domain is the bottom of the import graph.",
            },
            // The alias ban above is only half the boundary: `../server/db`
            // resolves upward without touching @/ at all, and relative imports
            // are this folder's own house style, so the wrong one is a single
            // keystroke from the right one. Worse, the failure is invisible —
            // the admin repo has no src/utils/ or src/server/, so such a file
            // stays byte-identical (check:domain passes) and simply does not
            // build over there. `./slots` is unaffected; only `..` matches.
            {
              group: ["../*"],
              message:
                "src/domain/ is the bottom of the import graph and is copied byte-identical into arena-player-admin, which has no src/utils/ or src/server/ to resolve against. Import siblings with ./ and nothing else.",
            },
          ],
        },
      ],
    },
  },

  // Must come last: turns off stylistic rules Prettier owns.
  prettier,

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
