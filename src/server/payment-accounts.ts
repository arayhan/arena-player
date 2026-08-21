import "server-only";

import sql from "@/server/db";

export interface PaymentAccount {
  bank: string;
  accountNumber: string;
  accountHolder: string;
}

export const FALLBACK_PAYMENT_ACCOUNTS: readonly PaymentAccount[] = [
  {
    bank: "BCA",
    accountNumber: "7255 1051 08",
    accountHolder: "MARIANA ULFAH",
  },
  {
    bank: "BRI",
    accountNumber: "4736-01-017915-53-2",
    accountHolder: "MARIANA ULFAH",
  },
];

export const PAYMENT_ACCOUNTS = FALLBACK_PAYMENT_ACCOUNTS;

/**
 * Fetches active payment transfer accounts live from the `bank_accounts` table
 * managed in the admin back-office.
 */
export async function getActivePaymentAccounts(): Promise<PaymentAccount[]> {
  try {
    const rows = await sql<{ bank: string; account_number: string; account_holder: string }[]>`
      select bank, account_number, account_holder
      from bank_accounts
      where coalesce(is_active, true) = true
      order by sort_order asc, created_at asc
    `;

    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        bank: r.bank,
        accountNumber: r.account_number,
        accountHolder: r.account_holder,
      }));
    }

    return [...FALLBACK_PAYMENT_ACCOUNTS];
  } catch (error) {
    console.error("[payment-accounts] Failed to fetch bank_accounts from DB:", error);
    return [...FALLBACK_PAYMENT_ACCOUNTS];
  }
}
