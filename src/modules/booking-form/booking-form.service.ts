import type { TimeSlot } from "@/domain/slots";
import { apiClient } from "@/services/api-client";

import { assertAvailability, assertPaymentAccounts, assertRates } from "./booking-form.contract";
import type { AvailabilityRow } from "@/utils/slot-display";

import type { BookingFormValues } from "./booking-form.schema";

/**
 * The availability GET, again — and the duplication is the rule working, not a
 * miss. `/` fetches the same endpoint from `home.service.ts` with native fetch
 * and a hand-written contract check, because zod costs 63.2KB gzip and the
 * landing page cannot spend it. Feature modules never import each other, so
 * this route reads the same endpoint through its own transport.
 *
 * VALIDATED BY HAND, LIKE `/`. zod validated these three responses until
 * 2026-08-15, when the first real measurement of this route put it 24.2KB over
 * the budget — see booking-form.contract.ts. The nine-entry contract is still
 * checked rather than assumed: a response that quietly becomes eight renders as
 * a missing row and nothing else.
 */
export async function fetchAvailability(
  date: string,
  signal?: AbortSignal,
): Promise<AvailabilityRow[]> {
  const response = await apiClient.get("/availability", { params: { date }, signal });

  // 400 is the documented answer for a date outside the window. It arrives as
  // an ordinary response because the instance never throws below 500, so it has
  // to be turned into one here or a malformed body would reach `parse`.
  if (response.status !== 200) {
    throw new Error(`availability request failed: ${response.status}`);
  }

  assertAvailability(response.data);
  return response.data;
}

/**
 * One transfer destination from `GET /api/payment-accounts`.
 *
 * THE LIST MAY BE EMPTY AND THAT IS NOT AN ERROR. The client has supplied no
 * account yet, so an empty array is the honest answer the form renders in words.
 * A schema that demanded `.min(1)` would turn "not supplied" into a red failure
 * state, which is a different and wrong thing to tell a visitor.
 */
export interface PaymentAccount {
  bank: string;
  accountNumber: string;
  accountHolder: string;
}

export async function fetchPaymentAccounts(signal?: AbortSignal): Promise<PaymentAccount[]> {
  const response = await apiClient.get("/payment-accounts", { signal });

  // The axios instance never throws below 500, so a 4xx would otherwise reach
  // `parse` as a body of the wrong shape and fail with a schema message instead
  // of the transport one.
  if (response.status !== 200) {
    throw new Error(`payment accounts request failed: ${response.status}`);
  }

  assertPaymentAccounts(response.data);
  return response.data;
}

/**
 * The rate card from `GET /api/rates`.
 *
 * ITS OWN REQUEST, NOT A FIELD ON AVAILABILITY, and that is hard rule 2 made
 * structural: `/` fetches availability and renders no number of any kind, so a
 * price must never be in a body the landing page receives. Prices arrive as
 * INTEGERS — formatting lives in `booking-form.money.ts`, so a currency decision
 * is never made in two places.
 *
 * KEYED BY `date` SINCE 2026-08-17 — weekday, weekend, and public-holiday
 * hours price differently, so the rate card is no longer one flat list.
 */
export type SlotRate = { slot: TimeSlot; price: number };

export async function fetchRates(date: string, signal?: AbortSignal): Promise<SlotRate[]> {
  const response = await apiClient.get("/rates", { params: { date }, signal });

  if (response.status !== 200) {
    throw new Error(`rates request failed: ${response.status}`);
  }

  assertRates(response.data);
  return response.data;
}

/** The 201 body. */
export interface BookingCreated {
  id: string;
  status: "pending";
}

/**
 * Everything the UI must tell apart. **409 and 429 are not interchangeable** —
 * showing the 409 copy to a rate-limited visitor tells them their slot was
 * taken when it was not.
 */
export type BookingOutcome =
  | { kind: "created"; booking: BookingCreated }
  | { kind: "slot_taken" }
  | { kind: "rate_limited" }
  | { kind: "validation_failed"; fields: Record<string, string> }
  | { kind: "server_error" };

/**
 * POST the booking.
 *
 * NO STATUS IS AN EXCEPTION HERE. The axios instance sets
 * `validateStatus: s => s < 500`, so 409, 429 and 400 all arrive as ordinary
 * responses and are mapped below. That is deliberate: turning them into throws
 * loses the response body, and the 400 body carries the `fields` map the form
 * needs to mark the right input.
 *
 * The field names are the contract from architecture.md. `slots`, not `time` —
 * `time` is the QUERY PARAM a human admin types into WhatsApp; `slots` is the
 * wire name matching TIME_SLOTS and the `time_slot` column.
 *
 * ONE FIELD PER SLOT, REPEATED, rather than a comma-joined string. `FormData`
 * carries repeated keys natively and the server reads them with `getAll`, so
 * nothing has to agree on a separator — and a separator is exactly where a slot
 * label containing " - " would have gone wrong.
 */
export async function createBooking(
  date: string,
  values: BookingFormValues,
): Promise<BookingOutcome> {
  const body = new FormData();
  body.append("date", date);
  for (const slot of values.slots) body.append("slots", slot);
  body.append("teamName", values.teamName);
  body.append("phone", values.phone);
  body.append("notes", values.notes ?? "");
  // Present and empty. The server distinguishes "absent" from "empty".
  body.append("website", values.website);

  const response = await apiClient.post<{ fields?: Record<string, string> } & BookingCreated>(
    "/bookings",
    body,
  );

  switch (response.status) {
    case 201:
      return { kind: "created", booking: response.data };
    case 409:
      // The slot went between page load and submit. Nothing was wrong with
      // what they filled in — offer another slot, do not blame the form.
      return { kind: "slot_taken" };
    case 429:
      return { kind: "rate_limited" };
    case 400:
      return {
        kind: "validation_failed",
        fields: response.data?.fields ?? {},
      };
    default:
      return { kind: "server_error" };
  }
}

export interface SiteSettings {
  whatsapp_number: string;
  address: string;
  operating_hours: string;
  maps_embed_url: string;
  dp_percent: string;
}

export async function fetchSiteSettings(signal?: AbortSignal): Promise<SiteSettings> {
  const response = await apiClient.get<SiteSettings>("/site-settings", { signal });
  if (response.status !== 200) {
    return {
      whatsapp_number: "6289682620666",
      address: "Selebung Ketangga, Kec. Keruak, Kab. Lombok Timur, Nusa Tenggara Barat",
      operating_hours: "06.00–24.00 WITA",
      maps_embed_url: "",
      dp_percent: "50",
    };
  }
  return response.data;
}
