import type { ReactNode } from "react";

import { Hero } from "./components/Hero";
import { KetentuanRows } from "./components/KetentuanRows";
import { LocationBlock } from "./components/LocationBlock";
import { OrderSection } from "./components/OrderSection";
import { ClosingCTA } from "./components/ClosingCTA";
import { Section } from "./components/Section";
import { ProgressBar } from "./components/ProgressBar";
import { SiteHeader } from "./components/SiteHeader";
import { SlotLegend } from "./components/SlotLegend";

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
 * STILL TO COME, so nobody reads their absence as a decision: the Ketentuan's
 * ten-row band treatment and the Location section's map placeholder, then the
 * navy Closing CTA that replaces the light footer below; then the slot-state
 * legend, the two-column order composition, and the motion pieces (marquee,
 * parallax mark, progress bar) which need the user's choice before any of them
 * is written.
 */
export function HomePage() {
  return (
    <main className="flex-1">
      <ProgressBar />
      <SiteHeader />

      <Hero />

      {/* THE ANCHOR IS #order, NOT #booking. /booking is a route, and an anchor
          sharing its name would shadow it. Both CTAs link here. */}
      <Section
        id="order"
        step="01"
        title={
          <>
            Jadwal <Accent>Hari Ini</Accent>, Bukan Janji
          </>
        }
        lede="Pilih tanggal, lalu pilih jam yang masih kosong."
      >
        {/* TWO COLUMNS ABOVE 980px, `0.9fr 1.1fr` — DESIGN.md's Order section.
            ONE COLUMN BELOW IT, AND THE PANEL COMES FIRST. That order is not a
            stacking accident: the two-scroll rule is about reaching the GRID,
            not the paragraph that introduces it, so on a phone the legend
            follows the thing it explains rather than delaying it.

            `min-[980px]:` rather than a named breakpoint because 980 is not one
            of Tailwind's, and DESIGN.md picks it for a measured reason — it is
            where the panel is still wide enough to hold two slot columns after
            giving a third of the row away. */}
        <div className="grid gap-8 min-[980px]:grid-cols-[1.1fr_0.9fr] min-[980px]:items-start min-[980px]:gap-12">
          <div className="min-[980px]:order-2">
            <SlotLegend />
          </div>
          <div className="min-[980px]:order-1">
            <OrderSection />
          </div>
        </div>
      </Section>

      {/* THE FIRST NAVY BAND. DESIGN.md's Section head table puts Ketentuan on
          navy, and the band is what separates one section from the next now
          that the old hairline keyline is gone — a hairline plus a band would
          be two devices doing one job.

          The bordered panel that stood here is gone with the list inside it:
          a rounded card sitting ON a band is the "large dark card" defect
          wearing its inverse. `KetentuanRows` renders full-bleed rows. */}
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
          than data. */}
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
          Arena Player · Lapangan mini soccer
        </p>
      </footer>
    </main>
  );
}
