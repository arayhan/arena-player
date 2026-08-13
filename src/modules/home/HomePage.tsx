import type { ReactNode } from "react";

import { Hero } from "./components/Hero";
import { KetentuanRows } from "./components/KetentuanRows";
import { LocationBlock } from "./components/LocationBlock";
import { OrderSection } from "./components/OrderSection";
import { ClosingCTA } from "./components/ClosingCTA";
import { Section } from "./components/Section";
import { ProgressBar } from "./components/ProgressBar";
import { SiteHeader } from "./components/SiteHeader";

/**
 * ONE WORD OF A HEADING, IN THE ACCENT COLOUR — DESIGN.md's Section head.
 *
 * It takes a `band` prop rather than inheriting, because the accent is the one
 * colour with two answers that a reader cannot infer from context: `blue-600`
 * on light is 5.17:1 and 3.30:1 on navy, while `blue-400` is 6.72:1 on navy and
 * **2.54:1 on white**. Getting it backwards fails silently in both directions,
 * so the surface is stated at every call site instead of being remembered.
 */
function Accent({ children, band = false }: { children: ReactNode; band?: boolean }) {
  return (
    <span
      className={
        band
          ? "text-[color:var(--color-interactive-on-band)]"
          : "text-[color:var(--color-interactive)]"
      }
    >
      {children}
    </span>
  );
}

/**
 * The landing page — the file that COMPOSES `/`, and the last one the velocity
 * redesign reached.
 *
 * `Hero`, `Section`, `OrderSection`, `SlotCell` and `DatePills` were ported
 * first and this was not, which is why the page spent a day looking half
 * redesigned: every element was velocity and the thing arranging them was not.
 *
 * THE PAGE'S RHYTHM IS THE LIGHT/NAVY ALTERNATION, not a hairline between
 * sections. DESIGN.md's Section head table assigns the surfaces: 01 order on
 * light, 02 Ketentuan on a navy band, 03 location back on the ground, and a
 * navy closing band. The hairline keyline that used to separate steps is gone
 * because a hairline plus a band is two devices doing one job.
 *
 * The hero carries no ordinal, and neither will the closing band. The hero
 * opens the page rather than continuing a sequence; the closing is a call to
 * action, and numbering it would imply a fourth thing to read.
 *
 * ALL FIVE SECTIONS ARE BUILT. This block listed the Ketentuan band, the
 * location map placeholder and the closing CTA as "still to come" until
 * 2026-08-13; all three exist, along with the slot legend, the two-column
 * order composition and the marquee. What remains is not a section: DESIGN.md
 * is rewritten from the built result, and the client has not re-approved this
 * direction or the typeface behind it.
 */
export function HomePage() {
  return (
    <main className="flex-1">
      <ProgressBar />
      <SiteHeader />

      <Hero />

      {/* THE ANCHOR IS #order, NOT #booking. /booking is a route, and an anchor
          sharing its name would shadow it. Both CTAs link here.

          THE TWO-COLUMN COMPOSITION IS GONE, AND IT WAS COSTING THE PRODUCT ITS
          WIDTH. DESIGN.md's Order section asks for `1.1fr 0.9fr` above 980px
          with the legend beside the panel, and that was built. Measured, it put
          the panel at 353.1px at 980px and 477px at 1440px — narrower on a
          desktop than the 523.7px it reached at 768px, because above 980px it
          was giving 45% of an already-indented row away. The consequence was not
          cosmetic: the slot grid's own `@min-[640px]` and `@min-[1180px]`
          container queries never fired at ANY viewport from 320 to 1440, so
          every visitor on every device got a single column while the design
          system promised three.

          So the plate takes the whole content width (`contentFullWidth`, which
          also drops the heading indent from `md` up) and the legend moves inside
          it, onto the head panel directly above the fields it explains. The
          phone ordering the old layout was protecting — panel first, legend
          after — is preserved for free, because there is now one object and the
          legend is part of it. */}
      <Section
        id="order"
        step="01"
        contentFullWidth
        title={
          <>
            Jadwal <Accent>Hari Ini</Accent>, Bukan Janji
          </>
        }
        lede="Pilih tanggal, lalu pilih jam yang masih kosong."
      >
        <OrderSection />
      </Section>

      {/* THE FIRST NAVY BAND. DESIGN.md's Section head table puts Ketentuan on
          navy, and the band is what separates one section from the next now
          that the old hairline keyline is gone — a hairline plus a band would
          be two devices doing one job.

          The bordered panel that stood here is gone with the list inside it:
          a rounded card sitting ON a band is the "large dark card" defect
          wearing its inverse. `KetentuanRows` renders one full-bleed plate.

          NO `contentFullWidth` HERE, AND THAT IS A MEASUREMENT RATHER THAN AN
          OMISSION. The order plate needed it because a grid of nine cells was
          being starved into one column; a column of prose has the opposite
          problem — the rules already cap at 72ch, so the extra width would go
          entirely to whitespace while costing the plate its alignment under the
          heading. Measured at 1280px, the indented column is 931.5px, which is
          past the cap already.

          THE 41px OVERFLOW IN THIS SECTION IS THE `<h2>`, NOT THE PLATE, AND IT
          CANNOT BE FIXED FROM EITHER FILE THIS TURN OWNS. Measured at 375px:
          "KETENTUAN" is a single unbreakable word measuring 278.6px in Panchang
          at the h2 clamp's 28.75px, and Section's numeral track leaves the
          heading column 221.6px. The word overhangs the viewport by exactly the
          41px the section reports, and the plate below contributes 0. Panchang
          is why — the same word measured 194px in the retired face, which is
          what the Sub-360 Floor in globals.css was derived against. No value of
          `--text-h2` above 22.9px fits that column, so the honest fix is the one
          DESIGN.md already names: the numeral track, not the type. The ordinal
          ink is 139px inside a 105.4px track here and on `#lokasi` too, so this
          is a page-wide finding about `Section`, not a Ketentuan defect. */}
      <Section
        id="ketentuan"
        step="02"
        band
        title={
          <>
            Ketentuan <Accent band>Arena</Accent>
          </>
        }
        lede="Sepuluh aturan main, apa adanya dari pihak lapangan."
      >
        <KetentuanRows />
      </Section>

      {/* THE LEDE NO LONGER CLAIMS "parkir luas". Nobody supplied that, and it
          is a checkable fact about a place whose street address is still an
          outstanding placeholder below — the same class of invention as a
          made-up street name, only quieter because it sounds like copy rather
          than data.

          NO `contentFullWidth` HERE, AND IT WAS CONSIDERED RATHER THAN SKIPPED.
          This section was the page's worst overflow — 158px at 768px, five
          times the phone figure — and the order plate's fix for the identical
          symptom was to take the full content width back from the numeral
          track. It would have helped here too: at 1280px the block would go from
          891.9px to 1184px, and its two columns from 421.9px to 568px each.
          It is not used because the cause was different. The order plate was
          starved of width it genuinely needed — a nine-cell grid collapsed to
          one column on every device. This block was asking for the HERO's type
          scale in half an indented row, and the honest fix is the scale, not
          more room to be wrong in. Widening it would have hidden the defect at
          desktop widths and left it at 768px, where the indent bites hardest.
          The indent also stays because three of the four sections use it, and
          the plate-under-an-indented-paragraph misalignment `contentFullWidth`
          buys is a cost worth paying exactly once. */}
      <Section
        id="lokasi"
        step="03"
        title={
          <>
            Datang & <Accent>Main</Accent>
          </>
        }
        lede="Satu lapangan, satu nomor WhatsApp."
      >
        <LocationBlock />
      </Section>

      {/* THE PAGE ENDS ON A BAND, and the light footer that used to sit here
          is gone. DESIGN.md's component inventory has no Footer section at
          all: the page's ending is the Closing CTA, and a light strip after a
          navy band was an unspecced sixth section that undid the ending the
          band creates.

          Three stale values went with it, none of which any check would have
          caught: `max-w-[1100px]` from before the container widened to 1280px,
          `rounded-[10px]` from before the control radius became 12px, and an
          `AP` text monogram that should have been retired the day the client's
          real mark landed and instead survived in the one place nobody looked.

          The one line worth keeping from it — who this is — moved inside the
          band. */}
      <ClosingCTA />

      <footer className="bg-[var(--color-band)] pb-[var(--space-section-y)] text-center">
        {/* No prices, no invented address, no social links nobody gave us. A
            footer padded with plausible-looking filler is the same defect as an
            invented address, just quieter. */}
        <p
          lang="id"
          className="mx-auto w-full max-w-[var(--container-max)] px-[var(--space-section-x)] text-[length:var(--text-sm)] text-[color:var(--color-fg-muted-on-band)]"
        >
          {/* THE LAST LINE ON THE PAGE IS WHERE THE REGION BELONGS, because it
              is the one string a visitor reads no matter which section brought
              them in. "Lombok" and nothing narrower: the field's town is not
              among the facts the client has supplied, and inventing one here
              would put a wrong place on every screen. */}
          Arena Player · Lapangan mini soccer di Lombok
        </p>
      </footer>
    </main>
  );
}
