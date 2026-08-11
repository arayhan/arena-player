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
      {/* Hero — Phase 2 task 3. Capped at 100svh, never 100vh: in-app browsers
          report vh incorrectly and a hero sized in vh overshoots on exactly
          the device this site is designed for. */}
      <section className="flex min-h-[100svh] items-center border-b border-[var(--color-border)]">
        <div className="mx-auto w-full max-w-[1100px] px-4">
          <h1>Pilih Jam. Kirim. Main.</h1>
          <p className="mt-6 max-w-[52ch] text-[color:var(--color-fg-muted)]">
            Jadwal Arena Player tampil langsung. Pilih jam kosong, lanjut lewat WhatsApp.
          </p>
          <p className="mt-8 text-[length:var(--text-sm)] text-[color:var(--color-fg-muted)]">
            Hero layout, CTA, and its one WebGL moment are Phase 2 task 3.
          </p>
        </div>
      </section>

      {/* THE ANCHOR IS #order, NOT #booking. /booking is a route, and an anchor
          sharing its name would shadow it. Both CTAs link here. */}
      <Section
        id="order"
        step="01"
        title="Pesan Lapangan"
        lede="Pilih tanggal, lalu pilih jam yang masih kosong."
      >
        <p className="text-[length:var(--text-sm)] text-[color:var(--color-fg-muted)]">
          Date pills and the slot grid land in Phase 2 task 2, against the MSW mock. This section is
          built before the hero on purpose: it carries the state and the data fetching, so it gets
          the most iteration time rather than the least.
        </p>
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
        {/* TODO(content): address + maps coords, and the WA number for the contact
            link. None of the three has been supplied and none may be invented —
            an address nobody checked sends a customer to the wrong field. */}
        <p className="text-[length:var(--text-sm)] text-[color:var(--color-fg-muted)]">
          Phase 2 task 4. Address, map coordinates and the WhatsApp number are all still outstanding
          from the client, and none of the three may be invented.
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
