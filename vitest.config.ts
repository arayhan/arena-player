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
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
