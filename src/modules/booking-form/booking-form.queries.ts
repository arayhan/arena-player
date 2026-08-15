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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { isWithinBookingWindow } from "@/domain/dates";

import type { BookingFormValues } from "./booking-form.schema";
import { createBooking, fetchAvailability, type BookingOutcome } from "./booking-form.service";

export function useCreateBooking(date: string) {
  return useMutation<BookingOutcome, Error, BookingFormValues>({
    mutationFn: (values) => createBooking(date, values),
  });
}

/**
 * The picker's availability read.
 *
 * THE KEY IS SPELLED THE SAME AS `/`'s, deliberately: `["availability", date]`
 * in home.queries.ts and here. One QueryClient serves both routes, so a visitor
 * who browsed the landing grid and then opened the form for the same date gets
 * the cached rows instead of a second round trip on a mobile connection. Two
 * spellings would be two caches that never see each other's data.
 *
 * `enabled` mirrors the landing page's rule for the same reason it exists there:
 * a date outside the 14-day window is a documented 400, and firing the request
 * to be told so spends a round trip the domain could have saved.
 */
export const availabilityKey = (date: string) => ["availability", date] as const;

export function useBookingAvailability(date: string) {
  return useQuery({
    queryKey: availabilityKey(date),
    queryFn: ({ signal }) => fetchAvailability(date, signal),
    enabled: isWithinBookingWindow(date),
  });
}

/**
 * Force the picker's rows to be re-read.
 *
 * WRITTEN FOR THE 409. A slot taken between page load and submit means the
 * cached rows are demonstrably stale — the server just said so — and offering
 * the visitor a fresh choice from a stale grid would let them pick the same
 * gone hour twice. Invalidating by KEY rather than passing a `refetch` up from
 * the picker keeps the query owned by one component; the form only says "this
 * date's rows are wrong now".
 */
export function useRefreshAvailability(date: string) {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: availabilityKey(date) }),
    [queryClient, date],
  );
}
