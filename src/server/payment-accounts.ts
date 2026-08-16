import "server-only";

import sql from "./db";

/**
 * THE CLIENT'S ACCOUNTS — read from the `bank_accounts` table since
 * 2026-08-17, replacing a hard-coded array of the same two accounts supplied
 * 2026-08-15. The values did not change; the source did. `arena-player-admin`
 * now owns adding, removing or reordering an account through its settings UI,
 * and this route reflects that immediately rather than needing a code change
 * and a redeploy on this repo's side for a bank detail to update.
 *
 * `WHERE is_active` — a row the admin has toggled off is a real account the
 * client is not currently using, not a placeholder; the column exists
 * specifically so this file never has to distinguish "no accounts supplied"
 * from "an account was withdrawn" by deleting the row, which would lose the
 * admin's own record of it.
 *
 * NOTHING HERE MAY EVER FALL BACK TO AN INVENTED VALUE. An empty result is
 * the honest "no account configured right now" and the form says so in
 * words — see `PaymentAccounts.tsx`. A fabricated account is the one
 * placeholder that moves somebody's money to a stranger.
 */
export interface PaymentAccount {
  bank: string;
  accountNumber: string;
  accountHolder: string;
}

export async function paymentAccounts(): Promise<PaymentAccount[]> {
  const rows = await sql<{ bank: string; account_number: string; account_holder: string }[]>`
    select bank, account_number, account_holder
    from bank_accounts
    where is_active
    order by sort_order
  `;

  return rows.map((row) => ({
    bank: row.bank,
    accountNumber: row.account_number,
    accountHolder: row.account_holder,
  }));
}
