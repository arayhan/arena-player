import { paymentAccounts } from "@/server/payment-accounts";

/**
 * `GET /api/payment-accounts` — the transfer destinations.
 *
 * READ FROM `bank_accounts` SINCE 2026-08-17 — `arena-player-admin`'s own
 * settings UI owns adding, removing or reordering an account now, and this
 * route reflects a change immediately rather than needing a code change and a
 * redeploy here. **No fabricated account may exist anywhere in this
 * codebase**: a made-up number is the one placeholder that moves somebody's
 * money, and an empty result stays the honest "no account configured right
 * now" — the form still says so in words. See `src/server/payment-accounts.ts`.
 *
 * CACHED FOR A DAY at the edge, same reasoning as the rates: this is content,
 * not state, and it carries none of the lazy-expiry contradiction that makes
 * caching the availability GET a question rather than a default.
 */
export async function GET(): Promise<Response> {
  return Response.json(await paymentAccounts(), {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
