import type { TimeSlot } from "@/domain/slots";
import { formatFullDate } from "@/utils/slot-display";

/**
 * The field admin's WhatsApp number, supplied by the client on 2026-08-11.
 *
 * STORED IN `wa.me` FORM — `628…`, no `+`, no spaces, no punctuation. That is
 * the shape both `wa.me` and the WhatsApp Business API expect, and it is the
 * same normalisation `src/domain/phone.ts` applies to a visitor's number at the
 * form boundary.
 */
/**
 * THE CLIENT'S OWN NUMBER, RESTORED 2026-08-16. A development number
 * (`62895410347567`) sat here earlier the same day so bookings made while
 * building reached the developer instead of the field; that swap has been
 * reverted here and in `whatsapp.test.ts`.
 *
 * WHY THIS IS THE MOST DANGEROUS LINE IN THE FILE, and why the next swap must
 * be undone the same way. Nothing fails if a wrong number ships. The `wa.me`
 * link opens, WhatsApp launches, the message is prefilled perfectly — and every
 * booking a visitor makes goes to a phone that is not the field's. There is no
 * error, no log line, and no test that can tell two valid numbers apart on
 * correctness alone. The assertion in the test file is pinned to this exact
 * string on purpose, so a future revert that misses one place fails loudly.
 */
export const WHATSAPP_NUMBER = "6289682620666";

/**
 * The `wa.me` deep link for a chosen single slot on the landing page.
 */
export function slotWhatsappLink(
  numberInWaForm: string = WHATSAPP_NUMBER,
  date: string,
  slot: TimeSlot,
): string {
  const text = `Halo, saya mau booking lapangan Arena Player tanggal ${formatFullDate(date)} jam ${slot}`;
  return `https://wa.me/${numberInWaForm}?text=${encodeURIComponent(text)}`;
}

export interface BookingSubmissionWhatsappParams {
  date: string;
  slots: readonly TimeSlot[];
  teamName: string;
  notes?: string;
  numberInWaForm?: string;
}

/**
 * WhatsApp message builder for submitted bookings on `/booking`.
 * Pre-fills the admin message with customer/team name, formatted date,
 * multiselected time slots, and optional notes.
 */
export function bookingSubmissionWhatsappLink(params: BookingSubmissionWhatsappParams): string {
  const { date, slots, teamName, notes, numberInWaForm = WHATSAPP_NUMBER } = params;
  const formattedDate = formatFullDate(date);
  const slotsText = slots.join(", ");

  let text = `Halo admin, saya sudah mengisi form booking di website:\n\n• Nama: ${teamName.trim()}\n• Tanggal: ${formattedDate}\n• Jam: ${slotsText}`;
  if (notes && notes.trim().length > 0) {
    text += `\n• Catatan: ${notes.trim()}`;
  }
  text += `\n\nMohon konfirmasinya. Terima kasih!`;

  return `https://wa.me/${numberInWaForm}?text=${encodeURIComponent(text)}`;
}
