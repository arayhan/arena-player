/**
 * The availability GET. NATIVE FETCH, deliberately — no axios.
 *
 * axios costs 17.5KB gzip and `/` makes exactly one GET with no upload
 * progress to report, so it buys nothing here. ESLint bans the import from
 * this module; the rule and this comment exist so the ban reads as a decision
 * rather than an obstacle.
 *
 * "No bare fetch in a component" is about the COMPONENT, not the transport.
 * Components call home.queries.ts, which calls this.
 */
import { SLOT_STATUSES } from "@/domain/status";
import { TIME_SLOTS } from "@/domain/slots";

import type { SlotAvailability } from "./home.types";

/**
 * Origin the availability request is sent to.
 *
 * Empty in the browser, which keeps the request same-origin and identical to a
 * bare relative path. It exists because a relative URL is unresolvable anywhere
 * without a document: Node's fetch throws "Failed to parse URL" outright, so
 * this function could not be tested at all, and Phase 4 could not prefetch
 * availability on the server either. One constant removes both limits.
 *
 * NEXT_PUBLIC_ is correct here and is not a hard-rule-4 violation: the site's
 * own origin is not a secret. DATABASE_URL and the R2 keys stay server-only.
 */
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export class AvailabilityRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(`availability request failed: ${status} ${code}`);
    this.name = "AvailabilityRequestError";
  }
}

/**
 * Rejects a body that is the wrong shape rather than letting it reach the
 * grid. In Phases 2-3 the only server is MSW, so this looks redundant — it is
 * not: the Phase 4 route handler replaces the mock underneath this function
 * without touching it, and a nine-entry contract that quietly becomes eight is
 * the failure a renderer shows as a missing row and nothing else.
 *
 * WRITTEN BY HAND ON PURPOSE. zod would express this in three lines, and it is
 * banned here for a measured reason: it costs 63.2KB gzip on `/`, which is 26%
 * of the entire performance budget and 61% of the headroom five landing
 * sections have to share. Measured with a real probe build during the Phase 1a
 * engineering review — 137.0KB without it, 200.2KB with it. See the budget
 * section in docs/architecture.md.
 *
 * So these twenty lines are not a shortcut around a validation library. They
 * are what buys a quarter of this page's budget back. If you are about to
 * "clean this up" with zod, read that number first.
 */
function assertContract(body: unknown): asserts body is SlotAvailability[] {
  if (!Array.isArray(body) || body.length !== TIME_SLOTS.length) {
    throw new AvailabilityRequestError(200, "malformed_availability");
  }
  body.forEach((entry, index) => {
    const valid =
      typeof entry === "object" &&
      entry !== null &&
      (entry as SlotAvailability).slot === TIME_SLOTS[index] &&
      (SLOT_STATUSES as readonly string[]).includes((entry as SlotAvailability).status);
    if (!valid) throw new AvailabilityRequestError(200, "malformed_availability");
  });
}

export async function fetchAvailability(
  date: string,
  signal?: AbortSignal,
): Promise<SlotAvailability[]> {
  const response = await fetch(`${BASE_URL}/api/availability?date=${encodeURIComponent(date)}`, {
    signal,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "unknown" }));
    throw new AvailabilityRequestError(response.status, String(body.error ?? "unknown"));
  }

  const body: unknown = await response.json();
  assertContract(body);
  return body;
}
