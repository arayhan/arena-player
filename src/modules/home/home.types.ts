import type { SlotStatus } from "@/domain/status";
import type { TimeSlot } from "@/domain/slots";

/** One entry of GET /api/availability. Always nine, always canonical order. */
export interface SlotAvailability {
  slot: TimeSlot;
  status: SlotStatus;
}

/** The 400 body: `{ "error": "invalid_date" }`. */
export interface AvailabilityError {
  error: string;
}

/** One slot's rate from GET /api/rates. */
export interface SlotRate {
  slot: TimeSlot;
  price: number;
}
