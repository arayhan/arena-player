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
