import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      // Must stay identical to tsconfig.json's paths entry. If the two drift,
      // a test resolves a different file from the one the app ships and passes
      // against code nobody runs.
      "@": fileURLToPath(new URL("./src", import.meta.url)),

      // `server-only` THROWS BY DESIGN when it is imported outside a React
      // Server Component, and that is the whole value of the package: a
      // client component reaching into src/server/ fails at build time rather
      // than shipping a database URL to a browser. Vitest is neither, so the
      // guard fires on modules that are perfectly legitimate to unit test —
      // src/server/rates.ts is a pure function over TIME_SLOTS.
      //
      // Aliasing it to an empty module here is the documented workaround and
      // it costs nothing: the guard that matters runs in `next build`, which
      // `pnpm check:ship` executes for real.
      "server-only": fileURLToPath(new URL("./src/test/server-only-stub.ts", import.meta.url)),
    },
  },
  test: {
    // check:lib passes `src` on the command line. Restricting the include glob
    // to colocated tests keeps scripts/check-setup.test.ts (Phase 4, needs live
    // Neon + R2 credentials) out of this run by construction rather than by
    // remembering to exclude it.
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",

    // NOT decoration. This machine runs on Asia/Jakarta, which is the timezone
    // src/domain/dates.ts exists to compute in — so every date test would pass
    // even with the { in: tz("Asia/Jakarta") } context missing entirely, and
    // the suite would be proving the developer's clock rather than the code.
    // Measured on the installed date-fns 4.4.0 / @date-fns/tz 1.5.0, instant
    // 2026-08-09T18:30:00Z under TZ=UTC:
    //     with    { in: … }  ->  2026-08-10   correct
    //     without            ->  2026-08-09   a full day wrong
    // Pinning UTC is what makes that difference visible in CI and here alike.
    env: {
      TZ: "UTC",
      // Node's fetch cannot resolve a relative URL — there is no document to
      // resolve against. src/modules/home/home.service.ts reads this as
      // BASE_URL, which is empty in the browser (same-origin, unchanged) and
      // absolute here so the service is testable at all.
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    },
  },
});
