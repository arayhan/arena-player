import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * The landing page's section wrapper, and the art direction's load-bearing
 * device.
 *
 * DESIGN.md's Numbered-Step Rule (the "velocity" redesign, 2026-08-12) sets
 * the section-transition language as numbered assembly steps: an outlined,
 * leaning Orbitron ordinal sitting ON THE BASELINE beside the heading. It
 * exists to fix one specific failure — the benchmark runs six
 * identically-treated centred headings in a column, so a visitor has no sense
 * of progress or place, and the first draft of DESIGN.html was graded with
 * the same flaw.
 *
 * Why an ordinal rather than something richer: it costs ZERO KILOBYTES, needs
 * NO MOTION, and works at 375px. Every alternative considered spent budget on
 * a problem that composition solves for free.
 *
 * THE NUMERAL IS NOT AN EYEBROW. DESIGN.md bans the kicker-above-heading
 * pattern, and a small uppercase ordinal stacked over a title is that pattern
 * wearing a number. This one is oversized, outlined, `aria-hidden`, and sits
 * BESIDE the heading, on the baseline — never above it.
 *
 * THE OLD TREATMENT IS GONE. The pre-redesign numeral was a plain filled
 * `grey-200` digit bleeding off the left edge, separated from the next
 * section by a navy keyline (`border-t`). DESIGN.md's Numbered-Step Rule
 * retires both: the numeral no longer bleeds past the page edge, and the
 * keyline is replaced by the light/navy band alternation living elsewhere —
 * a hairline plus a band would be two devices doing one job. `--color-keyline`
 * was removed from the token layer for exactly this reason.
 */
export function Section({
  id,
  step,
  title,
  lede,
  children,
  className,
}: {
  /** Anchor target. `#order` is linked from both CTAs and must not change. */
  id?: string;
  /**
   * The ordinal. Omitted for the hero, which opens the page rather than
   * continuing a sequence — a step 00 before the thing being assembled has
   * been introduced would be counting for its own sake.
   */
  step?: string;
  title: string;
  lede?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        // Section rhythm is now ONE fluid value shared by every section on the
        // page, light or navy — DESIGN.md's Fluid-Rhythm Rule. A stepped
        // rhythm under a fluid type scale changes the whitespace-to-type
        // ratio at every width, and at 152px display type that shows. The
        // old fixed 48/64/96/128 py-12/md:py-24 pair, and the border-t
        // keyline that used to separate steps, are both retired — see the
        // file header.
        "scroll-mt-4 py-[var(--space-section-y)]",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--space-section-x)]">
        {/* A GRID, NOT A FLEX ROW, SO THE CONTENT ALIGNS WITH THE HEADING.
            The first draft put the numeral and title in a flex row and hung
            children underneath at full width. The heading was then indented by
            the numeral and the body copy was not, which at 375px read as a
            mistake rather than as a device. Two columns fix it: the numeral
            owns column 1, and everything the section says lives in column 2. */}
        <div
          className={cn(
            "grid items-baseline gap-x-4 md:gap-x-6",
            // minmax(0,1fr), NOT 1fr. `1fr` expands to `minmax(auto, 1fr)`, and
            // that auto minimum sits on the TRACK — so the column refuses to
            // shrink below its content's intrinsic width no matter what
            // min-width the item carries. Measured at 375px: the date row and
            // the 20-character state labels pushed the page 41px wide and
            // clipped every line on the right, and adding `min-w-0` to the item
            // changed nothing, because the item was never the constraint.
            // A FIXED NUMERAL TRACK, NOT `auto`. `auto` sizes the column to the
            // ordinal's intrinsic width, and Orbitron ships no `tnum` feature —
            // so `tabular-nums` below is a silent no-op and "1" measures far
            // narrower than "0", "2" or "3". Measured at 1280px: the heading of
            // step 01 started at x=141 and steps 02 and 03 at x=179, a 38px jog
            // in the one column the whole art direction asks the visitor to
            // read down. The spine of the page has to be a straight line.
            //
            // 1.7em of the numeral's OWN font-size covers two digits at
            // Orbitron's widest (a "0" measures ~0.83em), and it is expressed
            // against `--text-numeral` (renamed from `--text-step` in the
            // redesign's token pass) so the track scales with the clamp
            // instead of being pinned to one viewport.
            //
            // AT EVERY WIDTH, INCLUDING 375px, AND THE PHONE IS THE CHEAP CASE
            // RATHER THAN THE EXPENSIVE ONE. Measured at 375px before the fix:
            // headings sat at x=91, 112, 112 — so TWO OF THREE were already
            // where the fixed track puts all three (x=114), and only step 01
            // moves, by 23px. All three still set on one line and the page
            // still does not scroll sideways.
            step ? "grid-cols-[calc(var(--text-numeral)*1.7)_minmax(0,1fr)]" : "grid-cols-1",
          )}
        >
          {step ? (
            <span
              aria-hidden="true"
              className={cn(
                "font-[family-name:var(--font-display)] font-black leading-[0.8]",
                "inline-block origin-bottom [transform:skewX(var(--skew))]",
                "[font-variant-numeric:tabular-nums] select-none",
                "text-[length:var(--text-numeral)]",
                // OUTLINE-NEEDS-A-FLOOR RULE (DESIGN.md). `color: transparent`
                // plus `-webkit-text-stroke` fails to INVISIBILITY, not
                // ugliness, so the transparency is gated behind a feature test
                // rather than applied unconditionally.
                //
                // 1. No stroke support: this base rule is the fallback — the
                //    numeral stays a solid `grey-200` fill (DESIGN.md's
                //    Numbered-Step Rule: "grey-200 on light sections", the
                //    only section background this component currently
                //    renders on).
                "text-[color:var(--color-border)]",
                // 2. Stroke supported: swap to transparent-fill + stroke,
                //    1.5px per DESIGN.md's outline stroke-width table (section
                //    numerals). Gated on the exact query DESIGN.md specifies.
                "supports-[-webkit-text-stroke:1px_currentColor]:text-transparent",
                "supports-[-webkit-text-stroke:1px_currentColor]:[-webkit-text-stroke:1.5px_var(--color-border)]",
                // 3. Forced colours (Windows High Contrast): stroke is not
                //    honoured there, so drop it and fill solid with the
                //    system's own text colour. `!` wins over the @supports
                //    rule above regardless of generated source order.
                "forced-colors:text-[CanvasText]! forced-colors:[-webkit-text-stroke:0]!",
                // No outlined text below 24px (DESIGN.md): `--text-numeral`
                // clamps 56px -> 144px, so this floor is satisfied structurally
                // and needs no runtime guard.
              )}
            >
              {step}
            </span>
          ) : null}

          <div className="min-w-0">
            <h2>{title}</h2>
            {lede ? (
              // Body copy caps at 60–68ch. Past that the eye loses the line
              // return, which matters most on the widest screens.
              <p className="mt-4 max-w-[64ch] text-[color:var(--color-fg-muted)]">{lede}</p>
            ) : null}
          </div>

          {children ? (
            // FULL WIDTH ON A PHONE, INDENTED FROM md UP — and this one is a
            // product requirement beating an aesthetic preference, not a
            // compromise.
            //
            // Indenting the content to align with the heading looks better, and
            // it is what this component did first. But the numeral is 59px plus
            // a 16px gap, so at 375px it left the content column 268px — and
            // DESIGN.md's slot-cell measurement is explicit that the row needs
            // 343px, because "Menunggu Konfirmasi" is 20 characters and cannot
            // truncate. Measured: the cell needed 323px and had 268, and the
            // page scrolled sideways by 41px.
            //
            // The 343px is a measured constraint on the product; the indent is
            // taste. When the two disagree, clarity wins — the same rule that
            // put Signal Blue where the source world wanted brick red.
            <div
              className={cn(
                "mt-[var(--space-head-gap)] min-w-0",
                step ? "col-span-2 md:col-span-1 md:col-start-2" : undefined,
              )}
            >
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
