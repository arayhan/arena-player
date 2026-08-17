import { PAYMENT_ACCOUNTS } from "@/server/payment-accounts";

/**
 * `GET /api/payment-accounts` — the transfer destinations.
 *
 * IT RETURNED AN EMPTY ARRAY UNTIL 2026-08-15, and that was the honest answer
 * while the client had supplied nothing: **no fabricated account may exist
 * anywhere in this codebase**, because a made-up number is the one placeholder
 * that moves somebody's money. The two accounts in `src/server/payment-accounts.ts`
 * are the client's own, and the empty-list branch stays alive in the form for
 * the day an account is withdrawn.
 *
 * CACHED FOR A DAY at the edge, same reasoning as the rates: this is content,
 * not state, and it carries none of the lazy-expiry contradiction that makes
 * caching the availability GET a question rather than a default.
 *
 * Phase 4 replaces the constant with a database read — a `payment_accounts`
 * table the admin app edits, or environment configuration. That decision is open
 * and recorded in database.md; **this route's shape does not change either way**.
 */
export async function GET(): Promise<Response> {
  return Response.json(PAYMENT_ACCOUNTS, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
