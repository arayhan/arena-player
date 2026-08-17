import "server-only";

/**
 * THE CLIENT'S TWO ACCOUNTS — supplied 2026-08-15, verbatim.
 *
 * This closes the placeholder category that mattered most of the seven in
 * CLAUDE.md hard rule 3. Until today this
 * list was empty by design and the form said so in words, because **an invented
 * account number is the one placeholder a visitor would act on**: every other
 * missing item is inert if it leaks, while a made-up number takes somebody's
 * money to a stranger. These are the real ones, and nothing here may be
 * "tidied" — not the spacing, not the dashes, not the capitalisation of the
 * holder's name.
 *
 * THE BRI NUMBER KEEPS ITS DASHES because that is how the client writes it and
 * how a visitor will check it against their banking app. The COPY button strips
 * them (see `booking-form.account.ts`): `473601017915532` is what a banking app
 * accepts, and a paste that fails would be blamed on the app rather than on the
 * punctuation this UI added.
 *
 * STILL SERVED FROM A ROUTE rather than imported into the form. Phase 4 swaps
 * the body of this file for a database read — a `payment_accounts` table the
 * admin app edits, or environment configuration; that decision is open and
 * recorded in database.md — and nothing on the client side changes when it does.
 */
export interface PaymentAccount {
  bank: string;
  accountNumber: string;
  accountHolder: string;
}

export const PAYMENT_ACCOUNTS: readonly PaymentAccount[] = [
  {
    bank: "BCA",
    accountNumber: "7255105108",
    accountHolder: "MARIANA ULFAH",
  },
  {
    bank: "BRI",
    accountNumber: "4736-01-017915-53-2",
    accountHolder: "MARIANA ULFAH",
  },
];
