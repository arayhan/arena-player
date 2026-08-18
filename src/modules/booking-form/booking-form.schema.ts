import { z } from "zod";

import { isValidIndonesianMobile } from "@/domain/phone";
import { isTimeSlot, type TimeSlot } from "@/domain/slots";

/**
 * Client-side validation for `/booking`.
 *
 * ZOD LIVES HERE AND NOWHERE NEAR `/`. It measured 63.2KB — 26% of the whole
 * 240KB ceiling — which is why the landing page validates its one GET with a
 * hand-written `assertContract` instead. ESLint enforces the split; this module
 * and `src/services/api-client.ts` are the only places allowed to import it.
 */
export const bookingFormSchema = z.object({
  teamName: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(60, "Nama maksimal 60 karakter"),

  slots: z
    .array(z.string().refine(isTimeSlot))
    .min(1, "Pilih minimal satu jam")
    .transform((v) => v as TimeSlot[]),

  phone: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || isValidIndonesianMobile(v),
      "Nomor tidak valid. Gunakan format 08xx atau 62xx",
    ),

  notes: z.string().trim().max(500, "Catatan maksimal 500 karakter").optional(),

  // The honeypot. Must be present and EMPTY.
  website: z.string().max(0),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
