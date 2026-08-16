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

/**
 * The client's own Google Maps embed URL, supplied verbatim on 2026-08-15.
 *
 * KEPT WHOLE AND UNPARSED. The `pb=` payload is Google's own packed
 * camera/place encoding — zoom, bearing, tilt, viewport size and the place id
 * `0x2dcc53005adc6011:0x48fd9a87865f0a08` ("Arena Player Soccer"). Rebuilding
 * it from parts, or "tidying" it, changes what the visitor sees; it is data,
 * not a template.
 *
 * It lived inside `LocationBlock.tsx` from the day it arrived until 2026-08-16,
 * with a note saying the move here was owed — the pass that added it was scoped
 * to one file. Same kind of value as the WhatsApp number above, same reason to
 * sit beside it: client-supplied content, one edit when it changes.
 */
export const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3943.324280937278!2d116.4750677!3d-8.755528299999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dcc53005adc6011%3A0x48fd9a87865f0a08!2sArena%20Player%20Soccer!5e0!3m2!1sen!2sid!4v1786803816454!5m2!1sen!2sid";

/**
 * Latitude, longitude — READ OFF THE EMBED ABOVE, never typed from elsewhere.
 * Google packs them as `!3d<lat>` and `!2d<lng>`: `-8.755528299999998` and
 * `116.4750677`, rounded to six decimals (~11cm, past any precision a visitor
 * can use). Displayed as the map plate's nameplate, so the one fact the client
 * supplied is legible without opening the map.
 *
 * DERIVED FROM THE EMBED AND THEREFORE PINNED TO IT. If `MAP_EMBED_SRC` is ever
 * replaced, these two numbers are re-read off the new `!3d`/`!2d` rather than
 * carried over — a coordinate pair that no longer matches the pin above it is
 * the quietest possible way to send somebody to the wrong village.
 */
export const MAP_COORDINATES = "-8.755528, 116.475068";

/**
 * The field's street address, supplied by the client on 2026-08-15.
 *
 * VERBATIM, AND NOT TIDIED. "Kec." and "Kab." are the abbreviations the client
 * wrote and are how an Indonesian address is normally read; expanding them, or
 * reordering the administrative levels, is the class of edit that makes a
 * checked fact stop matching the thing it was checked against.
 */
export const FIELD_ADDRESS =
  "Selebung Ketangga, Kec. Keruak, Kab. Lombok Timur, Nusa Tenggara Barat";
