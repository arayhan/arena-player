import { Hero } from "./components/hero";
import { OrderSection } from "./components/order-section";
import { Section } from "./components/section";

/**
 * The landing page shell — Phase 2 task 1.
 *
 * LAYOUT ONLY. Every section below is a labelled empty room: the page frame,
 * the numbered-step rhythm, and the responsive behaviour are real; the content
 * is not. The PRD builds them in a deliberate order — order section first,
 * hero third — because the order section carries all of the state and
 * data-fetching risk and building it first gives it the most iteration time
 * instead of the least.
 *
 * SECTION ORDER ON THE PAGE IS NOT BUILD ORDER. A visitor reads hero → order →
 * ketentuan → lokasi → footer. Task 2 fills the order section, task 3 the
 * hero, and so on.
 *
 * The hero carries no ordinal. It opens the page rather than continuing a
 * sequence, and numbering it 00 would be counting for its own sake — the
 * assembly starts at the thing the visitor came to do.
 */
export function HomePage() {
  return (
    <main className="flex-1">
      <Hero />

      {/* THE ANCHOR IS #order, NOT #booking. /booking is a route, and an anchor
          sharing its name would shadow it. Both CTAs link here. */}
      <Section
        id="order"
        step="01"
        title="Pesan Lapangan"
        lede="Pilih tanggal, lalu pilih jam yang masih kosong."
      >
        <OrderSection />
      </Section>

      <Section
        step="02"
        title="Ketentuan"
        lede="Sepuluh aturan main, apa adanya dari pihak lapangan."
      >
        <p className="text-[length:var(--text-sm)] text-[color:var(--color-fg-muted)]">
          Phase 2 task 4. The ten rules are verbatim client content and are copied from the PRD
          without rewording — unlike the hero copy, which we drafted.
        </p>
      </Section>

      <Section step="03" title="Lokasi & Kontak" lede="Mudah dijangkau, parkir luas.">
        {/* TODO(content): address + maps coords. Still outstanding and still
            un-inventable — an address nobody checked sends a customer to the
            wrong field. The WhatsApp number is no longer here: the client
            supplied it on 2026-08-11 and it lives in home.constants.ts. */}
        <p className="text-[length:var(--text-sm)] text-[color:var(--color-fg-muted)]">
          Phase 2 task 4. The address and map coordinates are still outstanding from the client and
          may not be invented. The WhatsApp number has arrived and is already wired into the order
          CTA.
        </p>
      </Section>

      {/* Footer — Phase 2 task 5. Not a Section: it closes the page rather than
          continuing the assembly, so it takes no ordinal and no keyline. */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)] py-12">
        <div className="mx-auto w-full max-w-[1100px] px-4">
          <p className="text-[length:var(--text-sm)] text-[color:var(--color-fg-muted)]">
            Closing CTA back to <code>#order</code> plus the footer — Phase 2 task 5.
          </p>
        </div>
      </footer>
    </main>
  );
}
