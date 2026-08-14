"use client";

import { useMemo, useRef, useState } from "react";

import { bookingWindow, todayAtField } from "@/domain/dates";
import type { TimeSlot } from "@/domain/slots";
import { useMotion } from "@/lib/motion";

import { WHATSAPP_NUMBER } from "../home.constants";
import { useAvailability } from "../home.queries";
import { countAvailable, longestFreeRun, partitionSlots, whatsappLink } from "../order.utils";
import { DatePills } from "./DatePills";
import { SlotCell } from "./SlotCell";
import { SlotLegend } from "./SlotLegend";

/**
 * THE ORDER SECTION — the product, rebuilt 2026-08-13 as "Pelat Enamel".
 *
 * THESIS: this is the enamel schedule plate bolted to the field gate. One flat
 * white field with a hard blue edge, divided into nine panels by 2px navy
 * rules, the hours set large enough to read from the road. What it refuses is
 * the arrangement this category always ships, and which this file used to be:
 * a 22px-radius card floating on a soft navy shadow, holding smaller rounded
 * cards in gutters.
 *
 * THE ARRANGEMENT IS THE ARGUMENT. Restyling nine cards would have left them
 * nine cards. Removing the gutters is what turns them into one object, and it
 * is also the only version of this that keeps working at every column count:
 * the rules are drawn by the CELLS (see the negative-margin note on the grid
 * below), so one column, two or three all divide correctly and an orphan cell
 * in the last row leaves plate rather than a hole.
 *
 * THREE MEASURED FACTS DROVE THE GEOMETRY, none of which survived the typeface
 * change intact:
 *
 * 1. THE OLD BREAKPOINTS COULD NEVER FIRE. The panel's container queries were
 *    `@min-[640px]` and `@min-[1180px]`, and the panel measured 288px at 320px,
 *    343px at 375px, 523.7px at 768px, 353.1px at 980px, 485.9px at 1280px and
 *    477px at 1440px. Its maximum across every viewport was 523.7px, so the
 *    slot grid rendered as ONE COLUMN everywhere, always, while DESIGN.md
 *    promised two from 640px and three from 1180px. The cause was composition
 *    rather than the query: the panel was 0.55 of a two-column row inside a
 *    heading indent. The plate now takes the full content width
 *    (`contentFullWidth` on Section) and the legend moves inside it, which is
 *    what makes a column count reachable at all.
 * 2. PANCHANG SHIPS NO `tnum`, so the nine slot strings are genuinely unequal —
 *    159.94px to 180.86px at 16px. See SlotCell.tsx for the probe.
 * 3. THE HOUR IS THE BINDING STRING NOW, not the state label. "Menunggu
 *    Konfirmasi" is 143.33px and has not moved (Plus Jakarta Sans did not
 *    change), but the hour went to `--text-h3` at plate scale, where the widest
 *    of the nine measures 226.06px at 20px and 248.67px at 22px. The
 *    breakpoints below are derived from THAT, and then verified in a browser.
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
  const rootRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const elapsedRef = useRef<HTMLDivElement>(null);
  const handoffRef = useRef<HTMLAnchorElement>(null);

  // PARALLAX — ADDED 2026-08-13, AND ON A FLAT SIGN IT HAS TO BE ARGUED FOR
  // RATHER THAN SPRINKLED ON. A painted plate has no depth of its own, so the
  // depth here is the same device the hero uses: LAYERS OF SIGN. An oversized
  // outlined "WITA" — the clock this plate runs on, the same fact the hero's
  // eyebrow states — sits in the band above the plate and sinks behind its top
  // edge as the page scrolls, the way a second board behind a fence slides out
  // of view before the fence does. Nothing tilts, scales or blurs; those would
  // be the 3D illusion this world does not have.
  //
  // IT IS A WORD, NOT A NUMBER, and that is a hard-rule decision rather than a
  // typographic one. The obvious ghost for this section is the count of free
  // hours or the 06–24 envelope, and no number may appear here that a visitor
  // could read as a price.
  //
  // Routed through `motion.ts` because a direct `gsap.to()` is banned in this
  // repo: GSAP ships no reduced-motion handling of its own, and a continuous
  // scroll-linked transform is exactly what has to stop dead for a visitor who
  // asked for less motion.
  useMotion(
    {
      animate: ({ gsap, ScrollTrigger }) => {
        const ghost = ghostRef.current;
        const plate = plateRef.current;
        if (!ghost || !plate) return;

        gsap.to(ghost, {
          // A share of the plate's own height, resolved as a function so it is
          // recomputed on refresh rather than baked at build time. A fixed
          // pixel drift is invisible on a 1440px screen and absurd on a phone.
          // 0.12 against the hero's 0.18: the band this ghost travels through
          // is a fraction of the hero plate's, so the same ratio would bury it
          // in the first few hundred pixels of scroll.
          y: () => plate.offsetHeight * 0.12,
          ease: "none",
          scrollTrigger: {
            trigger: plate,
            start: "top bottom",
            end: "bottom top",
            // `scrub`, not a duration: the ghost's position is a function of
            // scroll offset and has to track the finger exactly. A timed tween
            // desynchronises the moment someone flicks instead of dragging.
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        ScrollTrigger.refresh();
      },
      // The resting state IS the finished state — the ghost is painted in its
      // natural position in the markup, so a failed GSAP fetch or a
      // reduced-motion preference leaves a complete, correct plate.
      settle: () => {},
    },
    { scope: rootRef },
  );

  // THE REVEAL. Rows arrive top to bottom, 40ms apart, which is the plate
  // filling in — and it matches the direction a visitor reads a board. `once`
  // is what keeps it from replaying on every scroll past; it does rebuild when
  // the row COUNT changes, which is a new date's schedule arriving and is
  // correctly a new entrance rather than a repeat of the old one.
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

  // THE ELAPSED DISCLOSURE. GSAP measures the natural height rather than
  // animating to `auto`, which is what keeps this off the CLS budget.
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

  // THE HAND-OFF BAND ARRIVES. DESIGN.md: "It rises 12px and fades in over
  // 350ms. The selection fill it follows still lands at 0ms" — the fill (in
  // SlotCell) is the answer to "is this mine now" and is instant; this is the
  // decoration that follows it, the same split as the tap ring. Keyed on
  // whether a slot IS selected rather than on `selected` itself, so switching
  // between two already-selected slots does not replay the entrance — the band
  // is already on screen and only its content changes.
  useMotion(
    {
      animate: ({ gsap }) => {
        const el = handoffRef.current;
        if (!el) return;
        gsap.from(el, { y: 12, opacity: 0, duration: 0.35, ease: "power3.out" });
      },
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
    // THE GHOST'S BAND, and the reason this wrapper exists at all. `pt-*`
    // reserves the strip the outlined WITA is painted in, and `overflow-hidden`
    // is what guarantees a 399px-wide word inside a 343px plate can never widen
    // the page — measured, "WITA" is 4.16x its own font size in Panchang, so at
    // the clamp's 96px floor it is 399.3px at a 375px viewport. The hero solves
    // the identical problem the identical way.
    <div ref={rootRef} className="relative overflow-hidden pt-[clamp(44px,7vw,96px)]">
      {/* THE GHOST — `aria-hidden` decoration, never content. Outlined rather
          than filled, per DESIGN.md's Outline-as-a-second-weight device, and
          gated behind the same feature test the section numerals use: `color:
          transparent` plus `-webkit-text-stroke` fails to INVISIBILITY rather
          than to ugliness, so the transparency is only applied where the stroke
          is known to render. Well above the 24px outline floor at every width. */}
      <span
        ref={ghostRef}
        aria-hidden="true"
        className={[
          "type-display pointer-events-none absolute top-0 -right-[2vw] z-0 select-none",
          "leading-[0.78] font-extrabold tracking-[0.02em] [font-size:clamp(96px,20vw,240px)]",
          // 1. No stroke support: a solid grey-200 fill, the same hairline
          //    token Section.tsx falls back to on a light surface.
          "text-[color:var(--color-border)]",
          // 2. Stroke supported: transparent fill, 2px stroke. 2px rather than
          //    the numerals' 1.5px because this glyph is up to 240px tall and a
          //    1.5px line at that scale reads as a smudge, not a drawn edge.
          "supports-[-webkit-text-stroke:1px_currentColor]:text-transparent",
          "supports-[-webkit-text-stroke:1px_currentColor]:[-webkit-text-stroke:2px_var(--color-border)]",
          // 3. Forced colours (Windows High Contrast): stroke is not honoured
          //    there, so drop it and fill solid with the system's own text
          //    colour. `!` wins over the @supports rule regardless of source
          //    order.
          "forced-colors:text-[CanvasText]! forced-colors:[-webkit-text-stroke:0]!",
        ].join(" ")}
      >
        WITA
      </span>

      {/* THE PLATE. Square, a 3px `blue-600` edge, and NO SHADOW — the three
          properties that make it a sign rather than a card.

          The blue edge is the hero's own bottom rule (`border-b-[3px]
          border-[var(--color-interactive)]`) closed into a rectangle, so the
          two objects read as cut from the same stock. `--shadow-lg` is gone
          entirely: it is a wide soft navy bloom, and "no gradients, no soft
          shadows" is the direction's own sentence. That also retires the token's
          one-usage-only rule by removing its only usage.

          `@container` so the grid's breakpoints measure THIS ELEMENT rather than
          the viewport, and `overflow-hidden` so the grid's overhanging rules
          (below) are clipped exactly at the plate's inner edge. */}
      <div
        ref={plateRef}
        className="@container relative z-10 overflow-hidden border-[3px] border-[var(--color-interactive)] bg-[var(--color-bg)]"
      >
        {/* HEAD, PANEL ONE: the date row. Divided from what follows by the same
            2px navy rule the fields use, so the plate reads as one ruled object
            from its top edge down rather than as a card with a toolbar. */}
        <div className="border-b-2 border-[var(--color-band)] p-4">
          <DatePills dates={window} selected={date} onSelect={setDate} />
        </div>

        {/* HEAD, PANEL TWO: what is left, and what the colours mean. The
            scarcity line and the legend share a rule because they answer the
            same question at two levels of detail — how many, and of what kind. */}
        {!isPending && !isError ? (
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b-2 border-[var(--color-band)] px-4 py-3">
            {/* Scarcity, and it must never overstate. It counts only genuinely
                available hours — not pending, not booked, not elapsed.
                `blue-600` on the plate's WHITE field is 5.17:1; the same token
                on the `blue-50` page ground is an untested ~4.75:1, which is
                why this line lives inside the plate and not above it. */}
            <p
              lang="id"
              className="text-[length:var(--text-sm)] font-semibold text-[var(--color-interactive)]"
            >
              {availableCount > 0
                ? `${date === today ? "Hari ini" : "Tanggal ini"} · sisa ${availableCount} slot`
                : "Tidak ada slot kosong di tanggal ini"}
            </p>
            <SlotLegend />
          </div>
        ) : null}

        {isPending ? (
          // Skeletons at the real 88px field height, in the real grid, so
          // nothing shifts when data lands.
          <div
            className="grid -mr-0.5 -mb-0.5 @min-[640px]:grid-cols-2 @min-[1120px]:grid-cols-3"
            aria-busy="true"
            aria-label="Memuat jadwal"
            lang="id"
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-[88px] animate-pulse border-r-2 border-b-2 border-[var(--color-band)] bg-[var(--color-bg-subtle)]"
              />
            ))}
          </div>
        ) : isError ? (
          // NEVER AN EMPTY GRID ON FAILURE. An empty grid reads as "fully
          // booked", which is the one wrong answer this product can give.
          <div lang="id" className="bg-[var(--color-danger-surface)] p-4">
            <p className="font-semibold text-[var(--color-danger-strong)]">Gagal memuat jadwal</p>
            <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-danger-strong)]">
              Koneksi bermasalah. Coba lagi.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="type-display mt-4 h-12 border-2 border-[var(--color-danger-strong)] px-6 text-[length:var(--text-label)] font-extrabold tracking-[0.06em] text-[var(--color-danger-strong)] uppercase transition-colors duration-200 hover:bg-[var(--color-danger-strong)] hover:text-[var(--color-fg-inverse)]"
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <>
            {elapsed.length > 0 ? (
              <div className="border-b-2 border-[var(--color-band)]">
                <button
                  type="button"
                  lang="id"
                  aria-expanded={showElapsed}
                  onClick={() => setShowElapsed((v) => !v)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-[length:var(--text-sm)] text-[var(--color-fg-muted)] transition-colors duration-200 hover:bg-[var(--color-bg-subtle)]"
                >
                  <span aria-hidden="true" className={cnCaret(showElapsed)}>
                    ›
                  </span>
                  Sudah lewat ({elapsed.length})
                </button>

                <div ref={elapsedRef}>
                  {/* `-mb-0.5` MATCHES THE LIVE GRID, AND ITS ABSENCE WAS A
                      DOUBLED SEAM. This grid pulled itself 2px past its
                      container horizontally but not vertically, so its last row
                      KEPT its bottom rule while the enclosing block below still
                      drew one of its own — measured `marginBottom: 0px` here
                      against the live grid's `-2px`, which is 2px + 2px at the
                      boundary. It is only visible while "Sudah lewat" is
                      expanded, which is why it survived every review of a
                      collapsed panel. */}
                  <div className="grid -mr-0.5 -mb-0.5 border-t-2 border-[var(--color-band)] @min-[640px]:grid-cols-2 @min-[1120px]:grid-cols-3">
                    {elapsed.map((s) => (
                      <div key={s.slot} data-motion="elapsed-row">
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
              </div>
            ) : null}

            {/* THE GRID, AND THE ONE TRICK THAT MAKES THE RULES WORK.
                Every cell draws its own right and bottom rule; the grid then
                pulls itself 2px past its container on both axes (`-mr-0.5
                -mb-0.5` = -2px each), so the last column's and last row's rules
                land outside the plate and are clipped by its `overflow-hidden`.
                Result: every interior rule drawn exactly once, no doubled
                2px+2px seams, no outer rule fighting the plate's own edge, and
                none of it special-cased per column count. An orphan cell in the
                last row leaves white plate beside it rather than a navy hole,
                which the alternative — a navy grid background showing through
                `gap` — cannot do.

                BREAKPOINTS RE-DERIVED, NOT INHERITED. Both numbers below are
                measured against the HOUR at `--text-h3`, which is the binding
                string now: the widest of the nine ("06.00 - 08.00") is 226.06px
                at 20px and 248.67px at 22px in Panchang, against
                "Menunggu Konfirmasi" at 143.33px which no longer binds anything.
                A field needs that plus 32px of padding and its 2px rule, so
                two columns need roughly 566px of plate and three need roughly
                849px. 640px and 1120px are those figures with the slack the
                fluid type consumes as the viewport grows — the plate widens in
                steps the type does not match, so the queries are set where
                BOTH sides have been measured rather than where the arithmetic
                first allows.

                640 IS THE SAME NUMBER THE OLD CODE USED AND IT IS A COINCIDENCE,
                not a value carried forward: that one was derived from a 145.5px
                label measurement in a typeface this project no longer ships,
                and it was attached to a panel that never reached 640px in any
                viewport. */}
            <div
              ref={gridRef}
              role="group"
              aria-label="Pilih jam"
              lang="id"
              className="grid -mr-0.5 -mb-0.5 @min-[640px]:grid-cols-2 @min-[1120px]:grid-cols-3"
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

            {/* THE HAND-OFF BAND — the plate's bottom panel, edge to edge, no
                radius and no margin. DESIGN.md calls it "the moment the page's
                whole purpose becomes a single button", and on a sign that is a
                painted strip along the bottom rather than a button floating
                inside a card.

                `aria-live="polite"` on the toggle point, not on the anchor
                alone, so a screen-reader visitor learns the hand-off exists the
                moment it appears rather than having to find it. The placeholder
                below is a DIFFERENT control, not a hidden copy of this one:
                DESIGN.md's "not focusable when not shown" is satisfied
                structurally — with nothing selected there is no link to hide,
                only the separate, genuinely-focusable placeholder that explains
                why.

                AN ANCHOR, NOT A BUTTON WITH A HANDLER. On mobile `wa.me`
                deep-links into the WhatsApp app rather than opening a tab, so
                pairing it with any same-tab navigation is the exact combination
                in-app webviews and popup blockers handle inconsistently — and
                the Instagram in-app browser is the primary traffic here. One
                user action, one destination, nothing racing it. No
                `target="_blank"`: on a phone the app takeover IS the
                navigation, and a forced new tab leaves an empty one behind.

                IT STACKS ON A PHONE AND RUNS AS ONE LINE FROM 560px, and that
                is measured rather than defensive. "Lanjut ke WhatsApp →" is
                161.92px and the slot beside it another ~157px in the display
                face, which with a gap is ~331px against 250px of band content
                width at a 320px viewport. Two lines fit; one line does not. */}
            <div aria-live="polite" className="border-t-2 border-[var(--color-band)]">
              {selected ? (
                <a
                  ref={handoffRef}
                  href={whatsappLink(WHATSAPP_NUMBER, date, selected)}
                  lang="id"
                  className="flex min-h-16 w-full flex-col items-start justify-center gap-1 bg-[var(--color-accent-strong)] px-4 py-3 text-[var(--color-fg-inverse)] transition-colors duration-200 @min-[560px]:flex-row @min-[560px]:items-center @min-[560px]:justify-between @min-[560px]:gap-3 hover:bg-[var(--color-interactive)]"
                >
                  <span className="type-display text-[length:var(--text-sm)] font-bold tracking-[0.06em] uppercase">
                    {selected}
                  </span>
                  <span className="text-[length:var(--text-label)] font-semibold">
                    Lanjut ke WhatsApp →
                  </span>
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
                  className="flex min-h-16 w-full cursor-not-allowed items-center justify-center bg-[var(--color-disabled-bg)] px-4 text-[length:var(--text-label)] font-semibold text-[var(--color-fg-muted)]"
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
