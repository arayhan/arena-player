/**
 * The form contract, pinned where it can drift silently.
 *
 * TWO OF THESE FIELDS ARE HIDDEN FROM THE UI (`SHOW_PHONE_FIELD` and
 * `SHOW_PROOF_FIELD` in BookingForm.tsx), and a hidden field's rule is exactly
 * the kind that rots unnoticed: nothing on screen exercises it, so a rule that
 * quietly hardened back to "required" would make the form unsubmittable with
 * its error attached to an input nobody can see. These tests are what notices.
 */
import { describe, expect, it } from "vitest";

import { TIME_SLOTS } from "@/domain/slots";

import { bookingFormSchema } from "./booking-form.schema";

const valid = {
  slots: [TIME_SLOTS[4]],
  teamName: "Rajawali FC",
  phone: "",
  notes: "",
  website: "",
  proof: null,
};

describe("slots — one booking, several hours", () => {
  it("accepts several hours at once, consecutive or not", () => {
    expect(
      bookingFormSchema.safeParse({ ...valid, slots: [TIME_SLOTS[0], TIME_SLOTS[1]] }).success,
    ).toBe(true);
    expect(
      bookingFormSchema.safeParse({ ...valid, slots: [TIME_SLOTS[0], TIME_SLOTS[7]] }).success,
    ).toBe(true);
  });

  it("refuses an empty selection", () => {
    const result = bookingFormSchema.safeParse({ ...valid, slots: [] });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Pilih minimal satu jam");
  });

  it("refuses a near-miss slot format rather than repairing it", () => {
    // `uniq_active_slot` compares time_slot as TEXT, so "18.00-20.00" is a
    // different slot to the database than "18.00 - 20.00" — the anti-double
    // booking guard silently stops covering the hour.
    expect(bookingFormSchema.safeParse({ ...valid, slots: ["18.00-20.00"] }).success).toBe(false);
  });
});

describe("phone — validated if present, required never", () => {
  it("accepts an empty string, which is what the hidden field submits", () => {
    expect(bookingFormSchema.safeParse({ ...valid, phone: "" }).success).toBe(true);
  });

  it("still refuses a malformed number when one IS supplied", () => {
    expect(bookingFormSchema.safeParse({ ...valid, phone: "12345" }).success).toBe(false);
  });

  it("accepts the three Indonesian formats the field takes as typed", () => {
    for (const phone of ["081234567890", "6281234567890", "+6281234567890"]) {
      expect(bookingFormSchema.safeParse({ ...valid, phone }).success).toBe(true);
    }
  });
});

describe("proof — optional while the dropzone is hidden, checked when it arrives", () => {
  it("accepts null", () => {
    expect(bookingFormSchema.safeParse({ ...valid, proof: null }).success).toBe(true);
  });

  it("still refuses the wrong type", () => {
    const pdf = new File(["x"], "bukti.pdf", { type: "application/pdf" });
    const result = bookingFormSchema.safeParse({ ...valid, proof: pdf });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Format harus JPG, PNG, atau WEBP");
  });
});

describe("the honeypot stays present and empty", () => {
  it("refuses a filled one", () => {
    expect(bookingFormSchema.safeParse({ ...valid, website: "https://spam.example" }).success).toBe(
      false,
    );
  });
});
