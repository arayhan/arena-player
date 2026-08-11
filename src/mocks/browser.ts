/**
 * The browser worker. Started only from src/app/providers.tsx, only in
 * development.
 *
 * THE PRODUCTION TRAP THIS FILE EXISTS INSIDE: MSW registers a service worker.
 * A stray mockServiceWorker.js in a production build intercepts real requests
 * and serves invented availability — a site that looks entirely correct,
 * showing fake data, with nothing in the console. The NODE_ENV gate lives at
 * the call site in providers.tsx so it is visible where the decision is made,
 * not buried here.
 *
 * Retiring this in Phase 4 means deleting src/mocks/, deleting the start call,
 * AND confirming public/mockServiceWorker.js is absent from the built output.
 * The third one is the one that gets forgotten.
 */
import { setupWorker } from "msw/browser";

import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

/**
 * Starts the worker ONCE per page, and hands every caller the same promise.
 *
 * WHY THIS IS MEMOISED, because the naive version deadlocked and it was hard
 * to see: React StrictMode double-invokes effects in development. The first
 * run starts the worker, is torn down (setting its `cancelled` flag), and only
 * THEN resolves — so its result is discarded by the very guard that exists to
 * prevent a setState after unmount. The second run calls `worker.start()` on
 * an already-started worker, which does not resolve the same way. Result: MSW
 * logs "Mocking enabled", nothing rejects, no error appears anywhere, and the
 * readiness flag is never set. The app renders nothing, forever.
 *
 * With one shared promise, whichever effect survives teardown awaits the same
 * already-resolving start and sets the flag.
 *
 * Same idiom as `loadMotion()` in src/lib/motion.ts, deliberately — one
 * pattern for lazy async init in this codebase, not two.
 */
type WorkerStart = ReturnType<typeof worker.start>;

let started: WorkerStart | null = null;

export function startWorker(): WorkerStart {
  started ??= worker.start({ onUnhandledRequest: "bypass" });
  return started;
}
