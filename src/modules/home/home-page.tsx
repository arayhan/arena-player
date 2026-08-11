import { Hero } from "./components/hero";
import { OrderSection } from "./components/order-section";
import { Section } from "./components/section";
import { WHATSAPP_NUMBER } from "./home.constants";
import { KETENTUAN, KETENTUAN_TITLE } from "./home.content";

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
        <div className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 md:p-6">
          <h3 lang="id" className="text-[length:var(--text-sm)] tracking-[0.08em] uppercase">
            {KETENTUAN_TITLE}
          </h3>
          {/* An ordered list, because the rules ARE numbered and the client
              refers to them by number. A <ul> with rendered digits would look
              identical and read wrong to a screen reader. */}
          <ol
            lang="id"
            className="mt-4 grid list-decimal gap-3 pl-5 marker:font-semibold marker:text-[var(--color-interactive)] md:grid-cols-2 md:gap-x-8"
          >
            {KETENTUAN.map((rule) => (
              <li key={rule} className="max-w-[52ch] pl-1">
                {rule}
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section step="03" title="Lokasi & Kontak" lede="Mudah dijangkau, parkir luas.">
        <div className="grid gap-4 md:grid-cols-2">
          {/* TODO(content): address + maps coords. Deliberately rendered as a
              VISIBLE GAP rather than as filler text or a grey map tile.
              Product Principle 7: a placeholder must look like a placeholder,
              because the honest failure mode is an obvious hole the client
              fills — never plausible-looking invented detail that ships
              unnoticed. An address nobody checked sends a customer to the
              wrong field, and a map pin is worse: it is followed without
              being read. */}
          <div className="rounded-[14px] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
            <h3 lang="id" className="text-[length:var(--text-sm)] tracking-[0.08em] uppercase">
              Alamat
            </h3>
            <p
              lang="id"
              className="mt-3 text-[length:var(--text-sm)] text-[color:var(--color-fg-muted)]"
            >
              Alamat dan titik Google Maps menyusul — menunggu data dari pihak lapangan.
            </p>
          </div>

          <div className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <h3 lang="id" className="text-[length:var(--text-sm)] tracking-[0.08em] uppercase">
              Kontak
            </h3>
            <p
              lang="id"
              className="mt-3 text-[length:var(--text-sm)] text-[color:var(--color-fg-muted)]"
            >
              Pertanyaan di luar pemesanan bisa langsung lewat WhatsApp.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              lang="id"
              className="mt-4 inline-flex h-12 items-center justify-center rounded-[10px] border border-[var(--color-accent-strong)] px-6 font-semibold text-[var(--color-accent-strong)] hover:bg-[var(--color-bg-subtle)]"
            >
              Tanya Admin
            </a>
          </div>
        </div>
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
