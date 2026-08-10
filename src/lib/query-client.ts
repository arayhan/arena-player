/**
 * The QueryClient and its defaults.
 *
 * A factory, not a module-level singleton: on the server a shared client would
 * leak one visitor's cached availability into another's request. The browser
 * gets exactly one, memoised in providers.tsx.
 */
import { QueryClient } from "@tanstack/react-query";

/**
 * 30 seconds, matching the `cache ≤ 30s` line in the API contract.
 *
 * THIS NUMBER IS A CORRECTNESS DECISION, NOT A PERFORMANCE ONE. Availability
 * that goes stale slowly shows a slot as free after someone else has taken it,
 * and the visitor only finds out at the 409 — after they have filled the form
 * and uploaded a transfer receipt. Too short is merely wasteful; too long
 * wastes a person's time and their trust.
 */
const AVAILABILITY_STALE_TIME = 30_000;

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: AVAILABILITY_STALE_TIME,

        // Someone comes back to the tab after choosing a time with friends.
        // That is exactly the moment the grid must not be showing what it
        // showed five minutes ago.
        refetchOnWindowFocus: true,

        // One retry, not the default three. A slow phone on stadium wifi
        // spends four round trips discovering it is offline, and the empty
        // grid it stares at meanwhile is worse than an error it can act on.
        retry: 1,
      },
      mutations: {
        // Never retry a booking. A retried POST is a second insert attempt,
        // and the only thing standing between that and a double booking is a
        // unique index doing its job twice.
        retry: 0,
      },
    },
  });
}
