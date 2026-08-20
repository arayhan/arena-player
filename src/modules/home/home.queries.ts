"use client";

/**
 * The TanStack Query layer for `/`. Components call this; nothing calls fetch.
 *
 * v5, not v4 — the pending flag is `isPending`. `isLoading` still exists in v5
 * but means `isPending && isFetching`, which is not what a first-render
 * skeleton wants; eslint.config.mjs rejects it on a useQuery result.
 */
import { useQuery } from "@tanstack/react-query";

import { isWithinBookingWindow } from "@/domain/dates";

import { fetchAvailability, fetchRates } from "./home.service";

/**
 * Exported so a later invalidation, prefetch, or optimistic update names the
 * same key rather than retyping it. Two spellings of one key is a cache that
 * silently never invalidates.
 */
export const availabilityKey = (date: string) => ["availability", date] as const;

export function useAvailability(date: string) {
  return useQuery({
    queryKey: availabilityKey(date),
    queryFn: ({ signal }) => fetchAvailability(date, signal),

    // A date outside the window is a 400 by contract, and firing the request
    // to be told so wastes a round trip on the slow connection this site is
    // designed for. The domain already knows the answer.
    enabled: isWithinBookingWindow(date),
  });
}

export const ratesKey = (date: string) => ["rates", date] as const;

export function useRates(date: string) {
  return useQuery({
    queryKey: ratesKey(date),
    queryFn: ({ signal }) => fetchRates(date, signal),
    enabled: isWithinBookingWindow(date),
    staleTime: 60 * 60 * 1000,
  });
}
