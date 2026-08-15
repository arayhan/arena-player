import { z } from "zod";

import { isValidIndonesianMobile } from "@/domain/phone";
import { isTimeSlot, type TimeSlot } from "@/domain/slots";

import { checkProof } from "./booking-form.proof";

/**
 * Client-side validation for `/booking`.
 *
 * ZOD LIVES HERE AND NOWHERE NEAR `/`. It measured 63.2KB — 26% of the whole
 * 240KB ceiling — which is why the landing page validates its one GET with a
 * hand-written `assertContract` instead. ESLint enforces the split; this module
 * and `src/services/api-client.ts` are the only places allowed to import it.
 *
 * THE NUMBERS ARE IMPORTED, NOT RETYPED. `notes` is 500 because
 * `notes_length` in database.md is 500; the proof limits come from
 * booking-form.proof.ts. A second opinion about either is how a form that
 * accepts something meets a database that rejects it.
 */
export const bookingFormSchema = z.object({
  teamName: z
    .string()
    .trim()
    // The messages say "Nama", not "Nama tim": the label reads "Nama Tim /
    // Pemesan" since 2026-08-15, and an error naming only half the field tells
    // a solo booker the wrong thing about what they got wrong. The KEY stays
    // `teamName` — it is the API contract and the `team_name` column.
    .min(2, "Nama minimal 2 karakter")
    .max(60, "Nama maksimal 60 karakter"),

  // THE SLOTS. One booking may cover several hours — 20.00-22.00 and
  // 22.00-24.00 in one go — which is why this is an array and not the single
  // `slot` it was until 2026-08-15.
  //
  // NOT CONSTRAINED TO A CONSECUTIVE RUN. Two separate hours on one day is a
  // real booking (a morning game and an evening one) and refusing it would be
  // the client's convenience, not the visitor's.
  //
  // VALIDATED AGAINST TIME_SLOTS, NEVER A REGEX, and `uniq_active_slot` is the
  // reason: it compares `time_slot` as TEXT, so "18.00-20.00" is a DIFFERENT
  // slot to the database than "18.00 - 20.00". A near-miss format that passed a
  // pattern check would book the same hour twice with nothing erroring.
  slots: z
    .array(z.string().refine(isTimeSlot))
    .min(1, "Pilih minimal satu jam")
    .transform((v) => v as TimeSlot[]),

  // Accepts 08xx, 62xx or +62xx AS TYPED. The server normalises to
  // 628xxxxxxxxx before insert — the client deliberately does not, so what the
  // visitor sees in the field is what they typed.
  //
  // VALIDATED IF PRESENT, REQUIRED NEVER — changed 2026-08-15 when the input was
  // hidden (see SHOW_PHONE_FIELD in BookingForm.tsx). The visitor arrives
  // through WhatsApp, so the admin already has the number from the chat. Keeping
  // `.min(1)` here would have left the form permanently unsubmittable with its
  // error attached to an input nobody can see — the failure mode of hiding a
  // required field. The KEY, the payload field and the column are all untouched,
  // so restoring the input is a one-line flip and this rule tightens with it.
  //
  // `phone not null` IN db/migrations STILL CONTRADICTS THIS. Recorded in
  // database.md as Phase 4 debt rather than patched here: the backend that would
  // hit it does not exist yet, and the migration is the client's DB truth.
  phone: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || isValidIndonesianMobile(v),
      "Nomor tidak valid. Gunakan format 08xx atau 62xx",
    ),

  notes: z.string().trim().max(500, "Catatan maksimal 500 karakter").optional(),

  // The honeypot. Must be present and EMPTY. A bot that fills it gets a
  // fabricated 201 from the server and nothing is written — a 400 would tell
  // it exactly what tripped it.
  website: z.string().max(0),

  // OPTIONAL WHILE THE DROPZONE IS HIDDEN (SHOW_PROOF_FIELD in BookingForm.tsx),
  // and the two type rules below stay armed for the file that does arrive. So a
  // hidden field submits, an un-hidden one still refuses a 12MB HEIC, and
  // restoring "wajib" is putting `missing` back in the first refine.
  //
  // Same Phase 4 debt as `phone`: `proof_key not null` in db/migrations has no
  // value to store while this is empty. Written down in database.md.
  proof: z
    .custom<File | null>()
    .refine((f) => f === null || checkProof(f) !== "wrong_type", "Format harus JPG, PNG, atau WEBP")
    .refine((f) => f === null || checkProof(f) !== "too_large", "Ukuran file maksimal 2MB"),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
