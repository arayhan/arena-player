/**
 * The formatter is display-only, and the test that matters is the one asserting
 * it never becomes the value anybody copies: the grouped form exists for eyes,
 * the raw digits for the clipboard. A regression here sends a visitor's transfer
 * to a number with spaces in it, or to a number this code reformatted.
 */
import { describe, expect, it } from "vitest";

import { copyableAccountNumber, formatAccountNumber } from "./booking-form.account";

describe("formatAccountNumber", () => {
  it("groups in fours, whatever the length", () => {
    // BCA is 10 digits, Mandiri 13, BRI 15 — the three lengths most likely to
    // turn up when the client finally supplies an account.
    expect(formatAccountNumber("1234567890")).toBe("1234 5678 90");
    expect(formatAccountNumber("1234567890123")).toBe("1234 5678 9012 3");
    expect(formatAccountNumber("123456789012345")).toBe("1234 5678 9012 345");
  });

  it("leaves a number shorter than one group alone", () => {
    expect(formatAccountNumber("123")).toBe("123");
    expect(formatAccountNumber("1234")).toBe("1234");
  });

  it("returns anything that is not a plain digit run untouched", () => {
    // If the client supplies a value with a dash or a prefix, reformatting it
    // would be this code editing the one string it must never edit.
    expect(formatAccountNumber("123-456-789")).toBe("123-456-789");
    expect(formatAccountNumber("BCA 1234567890")).toBe("BCA 1234567890");
    expect(formatAccountNumber("")).toBe("");
  });

  it("never introduces a trailing space", () => {
    // A trailing space is invisible on screen and survives a copy of the
    // displayed text, which is exactly the class of defect this file is about.
    for (const digits of ["12345678", "123456789012", "1234567890123456"]) {
      expect(formatAccountNumber(digits).endsWith(" ")).toBe(false);
    }
  });
});

describe("copyableAccountNumber — what the clipboard actually receives", () => {
  it("strips the dashes the client writes into the BRI number", () => {
    // The real value, verbatim from the client on 2026-08-15. Fifteen digits is
    // what BRI issues, and what a banking app's account field accepts.
    expect(copyableAccountNumber("4736-01-017915-53-2")).toBe("473601017915532");
    expect(copyableAccountNumber("4736-01-017915-53-2")).toHaveLength(15);
  });

  it("leaves an already-bare number alone", () => {
    expect(copyableAccountNumber("7255105108")).toBe("7255105108");
  });

  it("never returns the spaced display form", () => {
    // The screen shows groups of four; a paste of that string is the defect
    // this function exists to prevent.
    expect(copyableAccountNumber(formatAccountNumber("7255105108"))).toBe("7255105108");
  });
});
