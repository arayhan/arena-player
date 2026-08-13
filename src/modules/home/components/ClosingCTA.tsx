import { cn } from "@/lib/cn";

import { Button } from "./Button";

/**
 * The page's ending — DESIGN.md's Closing CTA, rebuilt 2026-08-13 for
 * "Pelat Enamel" and for Panchang.
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

            THREE BEATS AT THREE SIZES, WHICH IS THE HERO'S OWN ANSWER TO
            PANCHANG'S WIDTH, RUN BACKWARDS. Hero.tsx sets its three lines at
            three sizes because the face is wide enough that one size makes the
            longest line decide the scale for all of them; it then runs them as
            a crescendo — `Pilih Jam.` smallest, `Main.` largest — because the
            hero is arriving. This is the same construction inverted: LAPANGAN
            largest, `MENUNGGU.` at 0.88, `JAM BERJALAN.` at 0.70, a diminuendo,
            because a page ending settles rather than builds. Bookend, not copy.

            IT IS ALSO THE ONLY THING THAT MAKES THE SENTENCE SCAN. At one size
            this heading was `max-w-[16ch]` plus `text-wrap: balance` and it
            rendered FOUR lines at every width measured — 375px and 1280px both
            broke it LAPANGAN / MENUNGGU. / JAM / BERJALAN., stranding "JAM" on
            a line of its own. The line breaks were never authored; they were
            whatever the balancer produced. These three are declared.

            EVERY WIDTH RE-MEASURED AGAINST PANCHANG, AND THE OLD ONES WERE ALL
            FROM A RETIRED FACE. `Range.getClientRects` on the live nodes, face
            loaded, at the `-0.03em` these spans actually set: LAPANGAN 8.548em,
            MENUNGGU. **9.076em**, JAM BERJALAN. 11.740em. Measure at the `h2`
            element's own `-0.01em` instead and the same three read 8.678 /
            9.076 / 11.953 — a 1.5% error on two of them, which is the kind of
            number that survives review and then clips a word. DESIGN.md records
            "MENUNGGU. measures 300.9px at 375px", which was 6.54em in the
            previous face; it is 417.5px here, 1.39x wider, and that single
            number is the whole reason this file changed.

            The ratios are chosen so the LONGEST string is the SMALLEST, which is
            what keeps `JAM BERJALAN.` on one line at 320px — 252.5px of ink in a
            288px box, 35.5px of slack — instead of wrapping into a fourth beat.
            The tightest beat anywhere is LAPANGAN at 320px, with 25.4px. */}
        {/* `block` SPANS RATHER THAN A FLEX COLUMN. A flex column here would
            shrink-wrap the `h2` to its widest beat, which puts the heading's
            own box at the mercy of the longest string; block spans keep the
            `h2` at the container's width and let each beat centre inside it,
            so the composition cannot re-derive its own geometry from the copy.
            `w-full` because the parent is a flex column with `items-center`,
            which would otherwise size this to fit-content for the same reason. */}
        <h2 lang="id" className="w-full text-[color:var(--color-fg-on-band)]">
          <span className="block text-[length:var(--text-closing)] leading-[0.95] font-extrabold tracking-[-0.03em]">
            Lapangan
          </span>

          {/* THE EMPHASISED WORD TAKES THE ACCENT, NOT AN OUTLINE, AND THIS IS
              A DELIBERATE DEPARTURE FROM DESIGN.md, which specifies `Menunggu.`
              outlined at 2px in blue-50. It resolves a contradiction the page
              has been carrying since the direction landed.

              Hero.tsx states the rule while explaining why `Kirim.` is filled:
              on a navy plate an outlined word "reads as a hollow punched
              through the sign, and this direction is made of filled fields".
              That argument does not stop at the hero. `MENUNGGU.` is the same
              shape of thing — one emphasised word of a three-beat sentence on
              a navy plate — so it gets the same answer, and the page now reads
              as one world instead of two.

              THE RULE THIS SETTLES ON, so the next component does not have to
              re-argue it: outline is a LIGHT-GROUND device (the location
              block's middle line, where the counters fill with page ground and
              the letter still reads as drawn ink); on a navy plate, outline is
              reserved for NON-CONTENT STRUCTURE — Section's ghost ordinal and
              the Ketentuan rule numerals, which are watermarks and ordinals
              rather than words anyone reads. No word a visitor is meant to read
              is outlined on navy. Hero, Section and KetentuanRows all already
              satisfy that rule as written; this file was the only one that did
              not, which is why it is the only one being changed.

              blue-400 on navy-900 computes 6.72:1 — the same on-band accent
              `Kirim.` uses, and the reason `--color-interactive` may never
              appear here: blue-600 on navy is 3.30:1. */}
          <span className="block leading-[0.95] font-extrabold tracking-[-0.03em] text-[color:var(--color-interactive-on-band)] [font-size:calc(var(--text-closing)*0.88)]">
            Menunggu.
          </span>

          <span className="block leading-[0.95] font-extrabold tracking-[-0.03em] [font-size:calc(var(--text-closing)*0.7)]">
            Jam Berjalan.
          </span>
        </h2>

        <p lang="id" className="mt-6 max-w-[46ch] text-[color:var(--color-fg-muted-on-band)]">
          Satu lapangan mini soccer di Lombok, jadwalnya terbuka. Pilih jamnya, sisanya lewat
          WhatsApp.
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
