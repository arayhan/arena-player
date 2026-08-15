import type { TimeSlot } from "@/domain/slots";

import { formatFullDate } from "@/utils/slot-display";

/**
 * The `wa.me` deep link for a chosen slot.
 *
 * ONE DESTINATION, NOT TWO. On mobile `wa.me` deep-links into the WhatsApp app
 * rather than opening a tab, so pairing it with a same-tab navigation is
 * exactly the combination in-app webviews and popup blockers handle
 * inconsistently — and the Instagram in-app browser is the primary traffic.
 * One user action, one destination, no race between them. That is why this
 * returns a plain href for an anchor rather than something a click handler
 * calls alongside a route change.
 *
 * The message is prefilled so the admin receives the date and slot without the
 * visitor retyping them, and so the eventual bot can parse one known shape.
 */
export function whatsappLink(numberInWaForm: string, date: string, slot: TimeSlot): string {
  const text = `Halo, saya mau booking lapangan Arena Player tanggal ${formatFullDate(date)} jam ${slot}`;
  return `https://wa.me/${numberInWaForm}?text=${encodeURIComponent(text)}`;
}
