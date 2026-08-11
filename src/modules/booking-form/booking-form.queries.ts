"use client";

/**
 * The TanStack Query layer for `/booking`. Components call this; nothing
 * calls `createBooking` directly.
 *
 * v5, not v4 — object-form args and `isPending`, the same conventions
 * `home.queries.ts` uses for the GET side.
 *
 * THE MUTATION NEVER THROWS FOR AN EXPECTED OUTCOME. `createBooking` already
 * maps 201/409/429/400 onto `BookingOutcome`, so `mutation.data` carries the
 * result even when the booking was refused — a 409 is a successful round
 * trip that says no. Only a genuine transport failure surfaces through
 * `mutation.isError`: a network drop, or a 5xx, since `api-client.ts`'s
 * `validateStatus: s => s < 500` makes axios reject those instead of
 * resolving them. The component treats `isError` the same as a
 * `{ kind: "server_error" }` outcome.
 */
import { useMutation } from "@tanstack/react-query";

import type { TimeSlot } from "@/domain/slots";

import type { BookingFormValues } from "./booking-form.schema";
import { createBooking, type BookingOutcome } from "./booking-form.service";

export function useCreateBooking(date: string, slot: TimeSlot) {
  return useMutation<BookingOutcome, Error, BookingFormValues>({
    mutationFn: (values) => createBooking(date, slot, values),
  });
}
