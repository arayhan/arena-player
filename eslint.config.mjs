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

const CROSS_MODULE = {
  group: ["@/modules/*/*", "@/modules/*"],
  message:
    "Feature modules never import each other. Shared vocabulary belongs in src/domain/. One home -> booking-form import is all it takes for a later `import { z }` there to ship zod to / with nothing failing.",
};

// A later config object REPLACES this rule for matching files rather than
// merging with it, so every override below must restate the patterns it still
// wants. Turning the rule off in a zone would silently lift the other bans too.
const DEFAULT_PATTERNS = [SERVER_ONLY, AXIOS, RHF, ZOD];

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

  // The booking form owns the three /booking packages. Still no @/server, and
  // still no reaching into src/modules/home.
  {
    files: ["src/modules/booking-form/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            SERVER_ONLY,
            {
              group: ["@/modules/home", "@/modules/home/*"],
              message: CROSS_MODULE.message,
            },
          ],
        },
      ],
    },
  },

  // The axios instance itself. Nothing else client-side may import axios.
  {
    files: ["src/services/api-client.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [SERVER_ONLY, RHF, ZOD] }],
    },
  },

  // Route handlers and the server layer run server-side, so zod there costs the
  // client bundle nothing. axios and react-hook-form stay banned — both are
  // client concerns with no business in a request handler.
  {
    files: ["src/app/api/**/*.ts", "src/server/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [AXIOS, RHF] }],
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
            {
              group: ["@/*"],
              message:
                "src/domain/ is byte-identical with arena-player-admin. Import siblings relatively (./slots) so the copy resolves the same in both repos regardless of either tsconfig, and never reach upward — domain is the bottom of the import graph.",
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
