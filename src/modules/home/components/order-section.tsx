"use client";

import { useMemo, useRef, useState } from "react";

import { bookingWindow, todayAtField } from "@/domain/dates";
import type { TimeSlot } from "@/domain/slots";
import { useMotion } from "@/lib/motion";

import { WHATSAPP_NUMBER } from "../home.constants";
import { useAvailability } from "../home.queries";
import { countAvailable, partitionSlots, whatsappLink } from "../order.utils";
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

  const availableCount = countAvailable(live);

  return (
    // A FLEX COLUMN, NOT A GRID. An implicit grid track is `auto`-sized, so the
    // horizontally-scrolling date row sized the track to its own content and
    // pushed the page 41px wide at 375px — the `overflow-x-auto` never engaged
    // because the container was never constrained. This is the same trap as the
    // `minmax(0,1fr)` fix one level up, and it bit twice in one section.
    // A column flex item stretches to the container width instead.
    <div ref={gridRef} className="flex flex-col gap-6">
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
        // Skeletons at the real 56px height so nothing shifts when data lands.
        <div className="grid gap-3" aria-busy="true" aria-label="Memuat jadwal" lang="id">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-[10px] bg-[var(--color-bg-subtle)]"
            />
          ))}
        </div>
      ) : isError ? (
        // NEVER AN EMPTY GRID ON FAILURE. An empty grid reads as "fully
        // booked", which is the one wrong answer this product can give.
        <div
          lang="id"
          className="rounded-[14px] border-2 border-[var(--color-danger-strong)] bg-[var(--color-danger-surface)] p-4"
        >
          <p className="font-semibold text-[var(--color-danger-strong)]">Gagal memuat jadwal</p>
          <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-danger-strong)]">
            Koneksi bermasalah. Coba lagi.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 h-12 rounded-[10px] border border-[var(--color-accent-strong)] px-6 font-semibold text-[var(--color-accent-strong)] hover:bg-[var(--color-bg-subtle)]"
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
                className="flex w-full items-center gap-2 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-left text-[length:var(--text-sm)] text-[var(--color-fg-muted)]"
              >
                <span aria-hidden="true" className={cnCaret(showElapsed)}>
                  ›
                </span>
                Sudah lewat ({elapsed.length})
              </button>

              <div ref={elapsedRef} className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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

          {/* One column on a phone, a grid above 768px. The constraint is one
              number: "Menunggu Konfirmasi" is 20 characters and needs 146px,
              and a 3-column grid at 375px gives about 110px per cell. Above
              768px the constraint stops binding. */}
          <div
            role="group"
            aria-label="Pilih jam"
            lang="id"
            className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
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
                />
              </div>
            ))}
          </div>

          {/* AN ANCHOR, NOT A BUTTON WITH A HANDLER. On mobile `wa.me`
              deep-links into the WhatsApp app rather than opening a tab, so
              pairing it with any same-tab navigation is the exact combination
              in-app webviews and popup blockers handle inconsistently — and the
              Instagram in-app browser is the primary traffic here. One user
              action, one destination, nothing racing it.

              No `target="_blank"`: on a phone the app takeover IS the
              navigation, and a forced new tab leaves an empty one behind. */}
          {selected ? (
            <a
              href={whatsappLink(WHATSAPP_NUMBER, date, selected)}
              lang="id"
              className="flex h-12 w-full items-center justify-center rounded-[10px] bg-[var(--color-accent-strong)] px-6 font-semibold text-[var(--color-fg-inverse)] hover:bg-[var(--color-accent-strong-hover)]"
            >
              Pesan {selected} lewat WhatsApp
            </a>
          ) : (
            // aria-disabled, never the native attribute: the control keeps its
            // place in the tab order, so a keyboard visitor reaches it and
            // hears why it is not ready instead of finding nothing there.
            <span
              role="button"
              aria-disabled="true"
              tabIndex={0}
              lang="id"
              className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-[10px] bg-[var(--color-disabled-bg)] px-6 font-semibold text-[var(--color-fg-muted)]"
            >
              Pilih jam dulu
            </span>
          )}
        </>
      )}
    </div>
  );
}

/** The disclosure caret. Rotation is CSS, so reduced motion already covers it. */
function cnCaret(open: boolean): string {
  return `inline-block transition-transform duration-150 ${open ? "rotate-90" : ""}`;
}
