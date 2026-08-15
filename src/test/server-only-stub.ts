/**
 * Stands in for the `server-only` package under Vitest.
 *
 * The real package throws the moment it is imported outside a React Server
 * Component — which is exactly what makes it useful in `src/server/`, and
 * exactly what breaks a unit test of a pure function that happens to live
 * there. `next build` still enforces the real thing; see vitest.config.ts.
 */
export {};
