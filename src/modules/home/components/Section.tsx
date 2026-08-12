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
  band = false,
}: {
  /** Anchor target. `#order` is linked from both CTAs and must not change. */
  id?: string;
  /**
   * The ordinal. Omitted for the hero, which opens the page rather than
   * continuing a sequence — a step 00 before the thing being assembled has
   * been introduced would be counting for its own sake.
   */
  step?: string;
  /**
   * `ReactNode`, not `string`, because DESIGN.md's Section head allows ONE word
   * of the heading to take the accent colour. The caller wraps that word; this
   * component does not parse the string looking for it, because "which word"
   * is an editorial decision per heading and a heuristic would get it wrong the
   * first time a heading had two candidates.
   */
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  className?: string;
  /**
   * Renders the section as a FULL-BLEED NAVY BAND.
   *
   * DESIGN.md's On-Band Rule calls this "the redesign's single largest new
   * source of defects", and names the reason: every colour decision on this
   * page has two answers, and a component that renders inside a band while
   * reading only the light-surface tokens ships at 2.46:1 with nothing visibly
   * wrong in a screenshot. That already happened once — the pre-redesign
   * concept put `blue-600` and `navy-400` inside the Ketentuan band, which
   * computed 3.30:1 and 2.46:1 against navy-900.
   *
   * So this flag switches the SEMANTIC LAYER, not a list of colours: surface,
   * foreground, muted foreground and the numeral's stroke all move to their
   * on-band counterparts together. A caller that needs an accent inside a band
   * reaches for `--color-interactive-on-band`, never `--color-interactive`.
   */
  band?: boolean;
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
        // FULL-BLEED, NO RADIUS, NO MARGIN, NO INSET CARD — DESIGN.md's Band
        // Rule, and it is written as a prohibition because the tempting version
        // is the wrong one: a navy section that is a rounded rectangle floating
        // on the page ground is a large dark card, which reads as an ad unit.
        // The band goes edge to edge; the container INSIDE it still respects
        // the maximum, which is what keeps the type measure honest.
        //
        // `scroll-mt-4` is deliberately kept rather than grown to clear the
        // fixed header: the header is transparent at rest and materialises on
        // scroll, so an anchor jump lands with the header opaque over the first
        // ~62px of the band. That is a real overlap and it is handled by the
        // scroll padding on `html` rather than per-section, so every anchor on
        // the page gets the same treatment instead of three of four.
        band && "bg-[var(--color-band)] text-[var(--color-fg-on-band)]",
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
            // ordinal's intrinsic width, so a page of "01", "02", "03" would
            // start each heading at a different x — measured at 1280px under
            // `auto`: x=141, x=179, x=179, a 38px jog in the one column the
            // whole art direction asks the visitor to read down. The spine of
            // the page has to be a straight line.
            //
            // 1.7 SURVIVED THE TYPEFACE CHANGE, RE-DERIVED RATHER THAN
            // ASSUMED. It was set against Orbitron, whose widest digit measures
            // ~0.83em. Saira ExtraExpanded is narrower — widest digit "8" at
            // 0.788em, widest two-digit pair "08" at 1.55em — but the numeral
            // is also SKEWED, and `skewX` widens the box by roughly
            // `tan(8deg) x line-box height`. Measured at 1280px: numeral
            // 134.4px, worst-case pair 208.3px of ink plus ~15px of skew
            // against a 228.5px track. It fits with about 5px to spare, and
            // 1.65 would clip. So the constant stays, on new evidence.
            //
            // Expressed against `--text-numeral` rather than a pixel value so
            // the track scales with the clamp instead of being pinned to one
            // viewport.
            step ? "grid-cols-[calc(var(--text-numeral)*1.7)_minmax(0,1fr)]" : "grid-cols-1",
          )}
        >
          {step ? (
            <span
              aria-hidden="true"
              className={cn(
                "type-display font-black leading-[0.8]",
                "inline-block origin-bottom [transform:skewX(var(--skew))]",
                // `tabular-nums` DOES SOMETHING NOW. Under Orbitron it was a
                // silent no-op — that face ships no `tnum` feature, which this
                // project measured and recorded rather than trusting. Saira
                // ships it: tested at 100px, "111" and "888" measure 136.2px
                // and 236.4px proportionally and both measure 214.8px with
                // `tabular-nums` on. The ordinals are all two digits, so the
                // effect here is small; it matters on the slot times, which is
                // where it is now actually used.
                "[font-variant-numeric:tabular-nums] select-none",
                "text-[length:var(--text-numeral)]",
                // OUTLINE-NEEDS-A-FLOOR RULE (DESIGN.md). `color: transparent`
                // plus `-webkit-text-stroke` fails to INVISIBILITY, not
                // ugliness, so the transparency is gated behind a feature test
                // rather than applied unconditionally.
                //
                // 1. No stroke support: this base rule is the fallback — the
                //    numeral stays a solid `grey-200` fill (DESIGN.md's
                //    Numbered-Step Rule: "grey-200 on light sections", and
                //    `navy-700` on a band, which is the same hairline token
                //    each surface already uses).
                band
                  ? "text-[color:var(--color-border-on-band)]"
                  : "text-[color:var(--color-border)]",
                // 2. Stroke supported: swap to transparent-fill + stroke,
                //    1.5px per DESIGN.md's outline stroke-width table (section
                //    numerals). Gated on the exact query DESIGN.md specifies.
                "supports-[-webkit-text-stroke:1px_currentColor]:text-transparent",
                band
                  ? "supports-[-webkit-text-stroke:1px_currentColor]:[-webkit-text-stroke:1.5px_var(--color-border-on-band)]"
                  : "supports-[-webkit-text-stroke:1px_currentColor]:[-webkit-text-stroke:1.5px_var(--color-border)]",
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
              //
              // The muted foreground has two answers and this is the whole
              // point of the band variant: `navy-400` measures 2.46:1 against
              // navy-900, so reusing the light-surface token here is the
              // documented failure. `navy-200` is 7.91:1 and is on-dark ONLY —
              // it has never been cleared on a light surface, so it must not
              // travel back the other way.
              <p
                className={cn(
                  "mt-4 max-w-[64ch]",
                  band
                    ? "text-[color:var(--color-fg-muted-on-band)]"
                    : "text-[color:var(--color-fg-muted)]",
                )}
              >
                {lede}
              </p>
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
