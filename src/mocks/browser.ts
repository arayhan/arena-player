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
