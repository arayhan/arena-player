"use client";

import { useMemo, useRef, useState } from "react";

import { bookingWindow, todayAtField } from "@/domain/dates";
import type { TimeSlot } from "@/domain/slots";
import { useMotion } from "@/lib/motion";

import { WHATSAPP_NUMBER } from "../home.constants";
import { useAvailability } from "../home.queries";
import { countAvailable, longestFreeRun, partitionSlots, whatsappLink } from "../order.utils";
import { DatePills } from "./date-pills";
import { SlotCell } from "./slot-cell";

/**
 * The order section — the product.
 *
 * Built before the hero on purpose: it carries all of the state and the data
 * fetching, so building it first gives it the most iteration time instead of
 * the least.
 *
 * `bookingWindow()` and `todayAtField()` are computed once per mount rather
 * than per render. They read the clock, so recomputing them mid-session would
 * let the window slide under a visitor who left the tab open — and a date that
 * silently stops being "today" is the kind of bug that only reproduces at
 * midnight.
 *
 * PORTED TO THE "velocity" REDESIGN (DESIGN.md, 2026-08-12). THE ORDER PANEL
 * is new: a white, `rounded.panel`, `shadow-lg` card holding the date row, the
 * slot grid and the hand-off bar, carrying `@container` so the grid's own
 * 640px/1180px breakpoints measure THIS ELEMENT's rendered width rather than
 * the viewport — DESIGN.md's own wording is "the grid no longer measures the
 * viewport, it measures the panel", which is only true if the query container
 * IS the panel. That also means the breakpoints stay correct automatically
 * once a future two-column composition (copy + legend beside the panel, per
 * DESIGN.md's Order Section spec) narrows the panel on wide screens — nothing
 * here has to change when that lands elsewhere. That composition, and the
 * three-row legend it seats beside the panel, are NOT built here: both belong
 * to the page-level layout (home-page.tsx), which is out of this file's scope
 * this pass.
 */
export function OrderSection() {
  const [window] = useState(() => bookingWindow());
  const [today] = useState(() => todayAtField());
  const [date, setDate] = useState(today);
  const [selected, setSelected] = useState<TimeSlot | null>(null);

  const { data, isPending, isError, refetch } = useAvailability(date);

  const { elapsed, live } = useMemo(
    () => partitionSlots(data ?? [], date),
    // `data` and `date` move together; recomputing on either is correct and
    // cheap. The clock is deliberately NOT a dependency — a slot silently
    // moving to elapsed under the visitor's finger is worse than a stale row.
    [data, date],
  );

  const [showElapsed, setShowElapsed] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const elapsedRef = useRef<HTMLDivElement>(null);
  const handoffRef = useRef<HTMLAnchorElement>(null);

  // EFFECT 1 — the section enters. Slot rows stagger upward one at a time,
  // which is the instruction-book idea made literal: parts arriving in order
  // and seating themselves.
  useMotion(
    {
      animate: ({ gsap }) => {
        gsap.from("[data-motion='slot']", {
          y: 12,
          opacity: 0,
          duration: 0.4,
          ease: "power3.out",
          stagger: 0.04,
          scrollTrigger: { trigger: gridRef.current, start: "top 85%", once: true },
        });
      },
      // Without this the rows would sit at opacity 0 forever if GSAP never
      // arrives. `gsap.from` animates TO the resting state, so the resting
      // state is the fallback and there is nothing to set — but saying so
      // explicitly is the point of the required field.
      settle: () => {},
    },
    { scope: gridRef, deps: [live.length], enabled: live.length > 0 },
  );

  // EFFECT 3 — the elapsed disclosure. GSAP measures the natural height rather
  // than animating to `auto`, which is what keeps this off the CLS budget.
  useMotion(
    {
      animate: ({ gsap }) => {
        const el = elapsedRef.current;
        if (!el) return;
        gsap.set(el, { height: showElapsed ? "auto" : 0, overflow: "hidden" });
        if (showElapsed) {
          gsap.from(el, { height: 0, duration: 0.28, ease: "power3.out" });
          gsap.from(el.querySelectorAll("[data-motion='elapsed-row']"), {
            y: 8,
            opacity: 0,
            duration: 0.24,
            ease: "power3.out",
            stagger: 0.03,
          });
        }
      },
      settle: () => {
        const el = elapsedRef.current;
        if (el) el.style.height = showElapsed ? "auto" : "0px";
      },
    },
    { scope: elapsedRef, deps: [showElapsed, elapsed.length] },
  );

  // EFFECT 4 — the hand-off bar arrives. DESIGN.md: "It rises 12px and fades
  // in over 350ms. The selection fill it follows still lands at 0ms" — the
  // fill (in SlotCell) is the answer to "is this mine now" and is instant; this
  // is the decoration that follows it, same split as the tap ring. Keyed on
  // whether a slot IS selected rather than on `selected` itself, so switching
  // between two already-selected slots does not replay the entrance — the bar
  // is already on screen and only its content changes.
  useMotion(
    {
      animate: ({ gsap }) => {
        const el = handoffRef.current;
        if (!el) return;
        gsap.from(el, { y: 12, opacity: 0, duration: 0.35, ease: "power3.out" });
      },
      // Resting position is the fallback, same pattern as EFFECT 1 — nothing
      // to set explicitly.
      settle: () => {},
    },
    { scope: handoffRef, enabled: selected !== null },
  );

  const availableCount = countAvailable(live);

  // Computed from `live`, never the raw response — elapsed hours must break a
  // run rather than pad it. At most one cell on the page gets a badge, and on
  // a busy day none does.
  const freeRun = useMemo(() => longestFreeRun(live), [live]);

  return (
    // A FLEX COLUMN, NOT A GRID. An implicit grid track is `auto`-sized, so the
    // horizontally-scrolling date row sized the track to its own content and
    // pushed the page 41px wide at 375px — the `overflow-x-auto` never engaged
    // because the container was never constrained. This is the same trap as the
    // `minmax(0,1fr)` fix one level up, and it bit twice in one section.
    // A column flex item stretches to the container width instead.
    <div ref={gridRef} className="flex flex-col gap-6">
      {/* THE ORDER PANEL. White, `rounded.panel`, 1px `grey-200`, `shadow-lg` —
          DESIGN.md's Order Section spec, "the order panel only... a second
          usage is a defect." `@container` (also a flex column, not a grid, for
          the same reason as the wrapper above) so the slot grid's breakpoints
          read this element's own width. */}
      <div className="@container flex flex-col gap-6 rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-[var(--shadow-lg)] sm:p-6">
        <DatePills dates={window} selected={date} onSelect={setDate} />

        {/* Scarcity, and it must never overstate. It counts only genuinely
            available hours — not pending, not booked, not elapsed. */}
        {!isPending && !isError ? (
          <p
            lang="id"
            className="text-[length:var(--text-sm)] font-semibold text-[var(--color-interactive)]"
          >
            {availableCount > 0
              ? `${date === today ? "Hari ini" : "Tanggal ini"} · sisa ${availableCount} slot`
              : "Tidak ada slot kosong di tanggal ini"}
          </p>
        ) : null}

        {isPending ? (
          // Skeletons at the real 64px height so nothing shifts when data lands.
          <div className="grid gap-3" aria-busy="true" aria-label="Memuat jadwal" lang="id">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-[var(--radius-control)] bg-[var(--color-bg-subtle)]"
              />
            ))}
          </div>
        ) : isError ? (
          // NEVER AN EMPTY GRID ON FAILURE. An empty grid reads as "fully
          // booked", which is the one wrong answer this product can give.
          <div
            lang="id"
            className="rounded-[var(--radius-control)] border-2 border-[var(--color-danger-strong)] bg-[var(--color-danger-surface)] p-4"
          >
            <p className="font-semibold text-[var(--color-danger-strong)]">Gagal memuat jadwal</p>
            <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-danger-strong)]">
              Koneksi bermasalah. Coba lagi.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 h-12 rounded-[var(--radius-control)] border border-[var(--color-accent-strong)] px-6 font-semibold text-[var(--color-accent-strong)] hover:bg-[var(--color-bg-subtle)]"
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <>
            {elapsed.length > 0 ? (
              <div>
                <button
                  type="button"
                  lang="id"
                  aria-expanded={showElapsed}
                  onClick={() => setShowElapsed((v) => !v)}
                  className="flex w-full items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-left text-[length:var(--text-sm)] text-[var(--color-fg-muted)]"
                >
                  <span aria-hidden="true" className={cnCaret(showElapsed)}>
                    ›
                  </span>
                  Sudah lewat ({elapsed.length})
                </button>

                {/* Breakpoints moved from viewport (md/lg) to CONTAINER QUERIES
                    on the panel — DESIGN.md: "the grid no longer measures the
                    viewport... it measures the panel." 640px/1180px are the
                    panel's own rendered width, read through `@container` on
                    the panel div above. */}
                <div
                  ref={elapsedRef}
                  className="grid gap-3 @min-[640px]:grid-cols-2 @min-[1180px]:grid-cols-3"
                >
                  {elapsed.map((s) => (
                    <div key={s.slot} data-motion="elapsed-row" className="pt-3">
                      <SlotCell
                        slot={s.slot}
                        status={s.status}
                        selected={false}
                        onSelect={() => {}}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* One column below 640px OF THE PANEL, full width at every size
                the panel can be below that — the single-column rule was never
                about taste, and completing the redesign's stacked SlotCell
                layout is what keeps it satisfied down to 320px: see the width
                note in slot-cell.tsx. */}
            <div
              role="group"
              aria-label="Pilih jam"
              lang="id"
              className="grid gap-3 @min-[640px]:grid-cols-2 @min-[1180px]:grid-cols-3"
            >
              {live.map((s) => (
                <div key={s.slot} data-motion="slot">
                  <SlotCell
                    slot={s.slot}
                    status={s.status}
                    selected={selected === s.slot}
                    // Reversible: tapping the selected slot clears it rather
                    // than forcing the visitor to pick a different one to escape.
                    onSelect={() => setSelected((cur) => (cur === s.slot ? null : s.slot))}
                    runHours={freeRun?.startSlot === s.slot ? freeRun.hours : undefined}
                  />
                </div>
              ))}
            </div>

            {/* THE HAND-OFF BAR. `aria-live="polite"` on the toggle point, not
                on the anchor alone, so a screen-reader visitor learns the
                hand-off exists the moment it appears rather than having to
                find it. The placeholder below is a DIFFERENT control, not a
                hidden copy of this one: DESIGN.md's "not focusable when not
                shown" is satisfied structurally here — with nothing selected
                there is no link to hide, only the separate, genuinely-focusable
                placeholder that explains why.

                AN ANCHOR, NOT A BUTTON WITH A HANDLER. On mobile `wa.me`
                deep-links into the WhatsApp app rather than opening a tab, so
                pairing it with any same-tab navigation is the exact combination
                in-app webviews and popup blockers handle inconsistently — and
                the Instagram in-app browser is the primary traffic here. One
                user action, one destination, nothing racing it.

                No `target="_blank"`: on a phone the app takeover IS the
                navigation, and a forced new tab leaves an empty one behind. */}
            <div aria-live="polite">
              {selected ? (
                <a
                  ref={handoffRef}
                  href={whatsappLink(WHATSAPP_NUMBER, date, selected)}
                  lang="id"
                  className="flex h-14 w-full items-center justify-between gap-3 rounded-[var(--radius-control)] bg-[var(--color-accent-strong)] px-6 font-semibold text-[var(--color-fg-inverse)] hover:bg-[var(--color-accent-strong-hover)]"
                >
                  <span>{selected}</span>
                  <span>Lanjut ke WhatsApp →</span>
                </a>
              ) : (
                // aria-disabled, never the native attribute: the control keeps
                // its place in the tab order, so a keyboard visitor reaches it
                // and hears why it is not ready instead of finding nothing there.
                <span
                  role="button"
                  aria-disabled="true"
                  tabIndex={0}
                  lang="id"
                  className="flex h-14 w-full cursor-not-allowed items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-disabled-bg)] px-6 font-semibold text-[var(--color-fg-muted)]"
                >
                  Pilih jam dulu
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** The disclosure caret. Rotation is CSS, so reduced motion already covers it. */
function cnCaret(open: boolean): string {
  return `inline-block transition-transform duration-150 ${open ? "rotate-90" : ""}`;
}
