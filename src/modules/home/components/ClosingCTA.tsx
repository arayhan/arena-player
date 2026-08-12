import { cn } from "@/lib/cn";

import { Button } from "./Button";

/**
 * The page's ending — DESIGN.md's Closing CTA.
 *
 * THE ONLY CENTRED COMPOSITION ON THE PAGE, and that is the whole device:
 * every section above reads left-aligned against a numeral, so centring here
 * is what makes this read as an ending rather than as a sixth section. It
 * carries no ordinal for the same reason — it is a call to action, not a step,
 * and numbering it would imply a fourth thing to read.
 *
 * IT REPLACES A LIGHT FOOTER THAT PREDATED THE REDESIGN, and three stale
 * values went with it: a hard-coded `max-w-[1100px]` from before the container
 * widened to 1280px, a `rounded-[10px]` from before the control radius became
 * 12px, and an `AP` text monogram that should have been retired the day the
 * client's real mark landed.
 */
export function ClosingCTA() {
  return (
    <section
      className={cn(
        // A BAND, SO FULL-BLEED — DESIGN.md's Band Rule, written as a
        // prohibition because the tempting version is the wrong one: a navy
        // section that is a rounded rectangle floating on the page ground is a
        // large dark card, which reads as an ad unit. Edge to edge, no radius,
        // no margin. The container inside still respects the maximum.
        "bg-[var(--color-band)] py-[var(--space-section-y)] text-[var(--color-fg-on-band)]",
      )}
    >
      <div className="mx-auto flex w-full max-w-[var(--container-max)] flex-col items-center px-[var(--space-section-x)] text-center">
        {/* AN `h2` FOR SEMANTICS, ITS OWN SCALE FOR SIZE, AND THE TWO ARE NOT
            THE SAME QUESTION. The page already has its `h1` in the hero and a
            second one here would be two top-level headings on one document, so
            the element is the honest level and only the size is borrowed — the
            same split `/booking`'s heading needed, in the opposite direction.

            NOT `--text-display`, AND THAT IS A SPEC CONFLICT RESOLVED RATHER
            THAN OBEYED. DESIGN.md says this heading is "display-scale", which
            collides with the binding constraint the same document states forty
            lines earlier: the hero's longest word is five characters BECAUSE
            display type at 375px has only 343px to work with. This heading's
            longest word is "MENUNGGU." at nine. Measured at `--text-display`:
            334.9px at a 320px viewport against a 288px content box, and the
            page scrolled sideways by 7px.

            `--text-closing` is a smaller clamp, and it is not invented here:
            DESIGN.html's own `.closing__h` has carried it since the redesign,
            which is exactly why the design detector kept reporting 2.5rem as
            off the ramp. It was a real scale nobody had written down. */}
        <h2
          lang="id"
          className="max-w-[16ch] text-[length:var(--text-closing)] font-black tracking-[-0.03em] [line-height:0.95]"
        >
          Lapangan{" "}
          {/* THE OUTLINED WORD, AND ITS FAILURE MODE IS INVISIBILITY RATHER
              THAN UGLINESS. `color: transparent` plus `-webkit-text-stroke`
              renders nothing at all where the stroke is unsupported, so the
              transparency is gated behind a feature test rather than applied
              and hoped for. Three branches, the same shape `Section.tsx` uses
              for the numeral:

                1. No stroke support — this base rule is the answer: the word
                   stays filled, in the on-band foreground.
                2. Stroke supported — swap to transparent fill plus a 2px
                   stroke, which is DESIGN.md's width for a display-scale
                   outline (1.5px is for the section numerals, 1px for the
                   rule numerals).
                3. Forced colours — Windows High Contrast does not honour a
                   text stroke at all, so drop it and fill with the system's
                   own `CanvasText`. `!` so it beats the @supports branch
                   regardless of generated source order.

              The 24px floor from the Outline-Needs-A-Floor Rule is satisfied
              structurally here: --text-closing bottoms out at 40px. */}
          <span
            className={cn(
              "text-[color:var(--color-fg-on-band)]",
              "supports-[-webkit-text-stroke:1px_currentColor]:text-[color:transparent]",
              "supports-[-webkit-text-stroke:1px_currentColor]:[-webkit-text-stroke:2px_var(--color-fg-on-band)]",
              "forced-colors:text-[CanvasText]! forced-colors:[-webkit-text-stroke:0]!",
            )}
          >
            Menunggu.
          </span>{" "}
          Jam Berjalan.
        </h2>

        <p lang="id" className="mt-6 max-w-[46ch] text-[color:var(--color-fg-muted-on-band)]">
          Cek jadwalnya sekarang, pilih jamnya, sisanya lewat WhatsApp.
        </p>

        {/* BACK TO #order, NOT TO /booking. The site has one destination and
            the visitor has not chosen a slot yet — sending them to a form they
            cannot fill would be the second destination this whole flow exists
            to avoid.

            `on-band`, not `primary`, and DESIGN.md gives the reason plainly:
            a `navy-900` button on a `navy-900` band is invisible. That variant
            fills `blue-600` and its wipe inverts to white with navy text.

            This rendered a local copy of the button while the shared component
            was being written in the same turn — importing a moving target would
            have been worse than duplicating it briefly. The copy is gone; a
            second button implementation left behind is the defect that note
            existed to prevent. */}
        <div className="mt-10">
          <Button
            href="#order"
            variant="on-band"
            lang="id"
            icon={<span aria-hidden="true">→</span>}
          >
            Lihat Jadwal
          </Button>
        </div>
      </div>
    </section>
  );
}
