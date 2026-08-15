"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { makeQueryClient } from "@/lib/query-client";

/**
 * THE MOCK GATE IS GONE, AND SO IS MSW — 2026-08-15.
 *
 * This file used to hold a service-worker gate: a `NODE_ENV` check the bundler
 * folded to `false` in production, a dynamic `import("@/mocks/browser")`, and a
 * `return null` that held the tree back until the worker was listening. All of
 * it existed because the only backend was a browser fixture.
 *
 * The client asked for a link they could open, and MSW cannot serve one — it is
 * compiled out of production builds by hard rule, so a deployed URL had no API
 * at all. Real route handlers now live in `src/app/api/`, `src/mocks/` is
 * deleted, `public/mockServiceWorker.js` is removed, and the msw dependency is
 * out of package.json. The PRD listed retiring MSW as Phase 4 work; doing it
 * early also permanently removes the failure that section is about — one stray
 * `mockServiceWorker.js` in a production build intercepting real requests and
 * serving invented availability, with nothing in the console and nothing in the
 * network tab that looks wrong.
 *
 * WHAT THE ROUTES SERVE IS STILL DEMO DATA. Availability is generated and no
 * booking is stored; each route says so at its top. The rates and the payment
 * accounts are the client's own content.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Per-browser, not module-level: a module-level client on the server would
  // hand one visitor's cached availability to the next request.
  const [queryClient] = useState(makeQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
