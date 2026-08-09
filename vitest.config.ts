import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      // Must stay identical to tsconfig.json's paths entry. If the two drift,
      // a test resolves a different file from the one the app ships and passes
      // against code nobody runs.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
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
    env: { TZ: "UTC" },
  },
});
