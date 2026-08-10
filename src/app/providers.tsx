"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { makeQueryClient } from "@/lib/query-client";

/**
 * In production this is the literal `false` the bundler folds away, so the
 * dynamic import below is never emitted and msw is not in any page's module
 * graph. `process.env.NODE_ENV` is inlined at build time; a runtime flag would
 * ship the mock and then trust a value.
 */
const MOCKS_ENABLED = process.env.NODE_ENV === "development";

/**
 * THE MOCK GATE. Read this before changing it.
 *
 * MSW registers a SERVICE WORKER. One stray mockServiceWorker.js in a
 * production build intercepts real requests and serves invented availability:
 * a site that looks entirely correct, showing fake data, with nothing in the
 * console and nothing in the network tab that looks wrong. It is the quietest
 * way this project can fail.
 *
 * `onUnhandledRequest: "bypass"` matters too — anything the handlers do not
 * match goes to the network untouched, so an un-mocked call fails like a real
 * one instead of being swallowed.
 *
 * Phase 4 deletes src/mocks/, deletes this hook, and confirms
 * public/mockServiceWorker.js is absent from the built output. The third one
 * is the one that gets forgotten.
 */
function useMockServiceWorker(): boolean {
  const [ready, setReady] = useState(!MOCKS_ENABLED);

  useEffect(() => {
    if (!MOCKS_ENABLED) return;
    let cancelled = false;

    void import("@/mocks/browser")
      .then(({ worker }) => worker.start({ onUnhandledRequest: "bypass" }))
      .then(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Per-browser, not module-level: a module-level client on the server would
  // hand one visitor's cached availability to the next request.
  const [queryClient] = useState(makeQueryClient);

  // Rendering before the worker is listening lets the first availability
  // request escape to the network and 404, so the grid shows an error for a
  // moment on every dev page load. In production `ready` starts true and
  // nothing ever waits — this branch does not exist in that build.
  const mocksReady = useMockServiceWorker();
  if (!mocksReady) return null;

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
