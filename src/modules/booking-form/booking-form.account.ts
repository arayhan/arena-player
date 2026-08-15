/**
 * Reading and copying an account number are two different needs, and this file
 * exists because they want two different strings.
 *
 * A visitor retypes a 10-16 digit number into a banking app on the same phone,
 * from a screen a thumb is covering half of. Grouped digits are what make that
 * survivable. But the value that goes on the CLIPBOARD must stay bare: a banking
 * app that rejects `1234 5678 90` gets blamed for the spaces this UI added.
 */

/**
 * `1234567890` → `1234 5678 90`.
 *
 * GROUPS OF FOUR, AND NOTHING SMARTER. Indonesian banks number accounts
 * differently — BCA is 10 digits, Mandiri 13, BNI 10, BRI 15 — and each has its
 * own conventional grouping. Guessing per bank means guessing wrong for whichever
 * bank the client actually uses, and a wrong grouping is worse than an even one:
 * it implies a structure the number does not have. Fours are unambiguous.
 *
 * NON-DIGITS SURVIVE UNTOUCHED. If the client ever supplies a value with a dash
 * or a prefix in it, reformatting would be this code editing the one string it
 * must not edit. Anything that is not a plain digit run is returned as given.
 */
export function formatAccountNumber(accountNumber: string): string {
  if (!/^\d+$/.test(accountNumber)) return accountNumber;
  return accountNumber.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/**
 * What the clipboard gets: digits and nothing else.
 *
 * THE CLIENT'S BRI NUMBER IS `4736-01-017915-53-2`. That is how they write it
 * and how a visitor checks it against their statement, so the screen keeps every
 * dash. A banking app's account field takes digits — pasting the punctuated form
 * either fails outright or is silently truncated at the first dash, and the
 * visitor blames the app rather than the punctuation this UI carried over.
 *
 * Stripping never invents: `4736-01-017915-53-2` yields the fifteen digits BRI
 * actually issues, and a number that was already bare comes back unchanged.
 */
export function copyableAccountNumber(accountNumber: string): string {
  return accountNumber.replace(/\D/g, "");
}
