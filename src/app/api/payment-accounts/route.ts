import { getActivePaymentAccounts } from "@/server/payment-accounts";

export const dynamic = "force-dynamic";

/**
 * `GET /api/payment-accounts` — the transfer destinations.
 *
 * Reads active bank transfer destinations live from the `bank_accounts` table
 * managed in the admin dashboard.
 */
export async function GET(): Promise<Response> {
  const accounts = await getActivePaymentAccounts();
  return Response.json(accounts, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
