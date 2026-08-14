import Link from "next/link";

import type { TimeSlot } from "@/domain/slots";
import { cn } from "@/lib/cn";

import { BookingForm } from "./BookingForm";
import { readBookingParams } from "./booking-form.params";

export interface BookingEntryProps {
  /**
   * Raw query params, exactly as `src/app/booking/page.tsx` hands them over —
   * `undefined` when absent, whatever text was on the URL otherwise.
   * `readBookingParams` does the actual validating; this component only
   * routes on the result.
   */
  date?: string;
  time?: string;
}

// Shared by both non-happy-path notices so the two buttons are pixel-for-pixel
// the same control, styled off the same CTA used in the footer's closing CTA
// (HomePage.tsx) — one destination, one visual language for "go pick a slot".
// SQUARE AND 56px, MATCHING THE PLATE — carbonized 2026-08-14 with the layout
// round the user accepted for the happy path. These two notices are the SAME
// ROUTE in its other states, and leaving them at the old 10px radius and 48px
// height would have given one URL two visual languages depending on whether the
// slot was still valid. The label takes the display face at the `label` role,
// like every other button in the system.
const CTA_CLASS =
  "type-display mt-8 inline-flex h-14 items-center justify-center bg-[var(--color-accent-strong)] px-6 text-[length:var(--text-label)] font-medium tracking-[0.06em] text-[var(--color-fg-inverse)] uppercase transition-colors hover:bg-[var(--color-accent-strong-hover)]";

// A PLATE, not a rounded card. Same 3px Signal Blue edge the happy path and the
// landing page's order panel both carry, so all three read as one product.
const PANEL_CLASS =
  "border-[3px] border-[var(--color-interactive)] bg-[var(--color-bg)] p-6 md:p-8";

// Hand-written Indonesian month abbreviations, the same technique
// src/modules/home/order.utils.ts uses for the wa.me message template.
// Duplicated rather than imported: feature modules never import each other
// (dev-rules.md), and a three-word date formatter is presentation, not shared
// vocabulary — it does not belong in src/domain/ next to slots and dates.
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

/** `2026-08-16` -> `16 Agu 2026`. Parsed as plain numbers, never `new Date(string)` —
 * that parses as UTC midnight and can render a day early west of Greenwich. */
function formatDisplayDate(date: string): string {
  const [year, month, dayOfMonth] = date.split("-").map(Number);
  return `${dayOfMonth} ${MONTH_NAMES[month - 1]} ${year}`;
}

/**
 * `/booking`'s entry router — Phase 3 task 1.
 *
 * NOTHING ON `/` LINKS HERE. Entry is always a link pasted into WhatsApp by
 * the admin (or sent by the bot later), so a malformed or stale link is the
 * NORMAL case this component exists to handle, not an edge case bolted on
 * afterwards. A blank form or a crash is the one response it may never give —
 * see `booking-form.params.ts` for the three-way split this switches on.
 */
export function BookingEntry({ date, time }: BookingEntryProps) {
  const params = readBookingParams(date, time);

  return (
    <main className="flex-1">
      {/* THE CONTAINER FINALLY MATCHES THE LANDING PAGE. `max-w-[1100px]`
          was the PRE-REDESIGN value: the container went to 1280px on
          2026-08-12 and this route never followed, so the two surfaces
          measured differently on the same screen. The padding takes the
          section tokens for the same reason — one rhythm, not two. */}
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--space-section-x)] py-[clamp(44px,7vw,96px)]">
        {params.kind === "valid" ? (
          <BookingForm date={params.date} slot={params.slot} />
        ) : params.kind === "expired" ? (
          <ExpiredNotice date={params.date} slot={params.slot} />
        ) : (
          <UnusableNotice />
        )}
      </div>
    </main>
  );
}

/**
 * Missing, unparseable, or not a real slot — a link that never worked.
 * Deliberately vaguer than `ExpiredNotice`: there is no date or slot worth
 * naming because `readBookingParams` could not read one out of the URL.
 */
function UnusableNotice() {
  return (
    <div className={PANEL_CLASS}>
      {/* Sized off --text-h2, not the global h1 (--text-display). See the
          matching comment on BookingForm's own <h1> in BookingForm.tsx for
          the full reasoning — duplicated rather than shared per this file's
          own convention of not importing small presentational decisions
          across these two files. Short version: this route's h1 is a single
          page-level heading with no sibling display content, DESIGN.md's
          display scale is measured against the hero's one-word-per-line
          headline and overflows 375px on multi-word Indonesian titles, and
          h2's 28px->56px "section heading" role is the closest defined scale.
          Only font-size is borrowed; weight/leading/tracking/case stay h1's. */}
      <h1 lang="id" className="max-w-[20ch] text-[length:var(--text-h2)]">
        Tautan Booking Tidak Valid
      </h1>
      <p lang="id" className="mt-4 max-w-[60ch] text-[color:var(--color-fg-muted)]">
        Tautan ini tidak lengkap atau tidak bisa dibaca. Coba cek jadwal kosong dan pilih jam yang
        masih tersedia lewat WhatsApp.
      </p>
      <Link href="/#order" lang="id" className={cn(CTA_CLASS)}>
        Lihat Jadwal Kosong
      </Link>
    </div>
  );
}

/**
 * Well-formed but past — a link that USED to work. Names the date and slot it
 * was for on purpose: a visitor whose link expired already knows there was a
 * slot behind it, and telling them nothing reads as the same broken link as
 * `UnusableNotice`, which it is not.
 */
function ExpiredNotice({ date, slot }: { date: string; slot: TimeSlot }) {
  return (
    <div className={PANEL_CLASS}>
      {/* Sized off --text-h2 — see the comment on UnusableNotice's <h1>
          above for the reasoning. */}
      <h1 lang="id" className="max-w-[24ch] text-[length:var(--text-h2)]">
        Tautan Booking Ini Sudah Kedaluwarsa
      </h1>
      <p lang="id" className="mt-4 max-w-[60ch] text-[color:var(--color-fg-muted)]">
        Tautan ini sebelumnya untuk tanggal {formatDisplayDate(date)} jam {slot}, tapi jadwalnya
        sudah lewat. Pilih jam lain yang masih kosong lewat WhatsApp.
      </p>
      <Link href="/#order" lang="id" className={cn(CTA_CLASS)}>
        Lihat Jadwal Kosong
      </Link>
    </div>
  );
}
