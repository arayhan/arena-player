import { z } from "zod";

import { isValidIndonesianMobile } from "@/domain/phone";

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
    .min(2, "Nama tim minimal 2 karakter")
    .max(60, "Nama tim maksimal 60 karakter"),

  // Accepts 08xx, 62xx or +62xx AS TYPED. The server normalises to
  // 628xxxxxxxxx before insert — the client deliberately does not, so what the
  // visitor sees in the field is what they typed.
  phone: z
    .string()
    .trim()
    .min(1, "Nomor WhatsApp wajib diisi")
    .refine(isValidIndonesianMobile, "Nomor tidak valid. Gunakan format 08xx atau 62xx"),

  notes: z.string().trim().max(500, "Catatan maksimal 500 karakter").optional(),

  // The honeypot. Must be present and EMPTY. A bot that fills it gets a
  // fabricated 201 from the server and nothing is written — a 400 would tell
  // it exactly what tripped it.
  website: z.string().max(0),

  proof: z
    .custom<File | null>()
    .refine((f) => checkProof(f) !== "missing", "Bukti transfer wajib diunggah")
    .refine((f) => checkProof(f) !== "wrong_type", "Format harus JPG, PNG, atau WEBP")
    .refine((f) => checkProof(f) !== "too_large", "Ukuran file maksimal 2MB"),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
