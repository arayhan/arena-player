/**
 * Content the client supplied, kept in one place so a change is one edit.
 *
 * Lives in the home module because `/` is the only surface using it today —
 * the order CTA and the contact section. If `/booking` ever needs it, it moves
 * up rather than getting copied: modules never import each other, and a second
 * copy of a phone number is a number that will eventually disagree with itself.
 */

/**
 * The field admin's WhatsApp number, supplied by the client on 2026-08-11.
 *
 * STORED IN `wa.me` FORM — `628…`, no `+`, no spaces, no punctuation. That is
 * the shape both `wa.me` and the WhatsApp Business API expect, and it is the
 * same normalisation `src/domain/phone.ts` applies to a visitor's number at the
 * form boundary. Keeping both sides in one format is what lets the Phase-4 bot
 * match an inbound message to a booking with a direct lookup rather than fuzzy
 * matching.
 *
 * Verified against `normalisePhone` before being written here: `+6289682620666`
 * normalises to this string, so it satisfies the same rule the form enforces.
 */
export { WHATSAPP_NUMBER } from "@/utils/whatsapp";
