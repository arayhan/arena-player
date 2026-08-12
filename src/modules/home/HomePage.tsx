import { Hero } from "./components/Hero";
import { OrderSection } from "./components/OrderSection";
import { Section } from "./components/Section";
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

      {/* Not a Section: the footer closes the page rather than continuing the
          assembly, so it takes no ordinal. Numbering it would be counting for
          its own sake — the same reason the hero has no ordinal either. */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
        {/* The closing CTA returns to #order, NOT to /booking. The site has one
            destination and the visitor has not chosen a slot yet — sending them
            to a form they cannot fill would be the second destination this
            whole flow was designed to avoid. */}
        <div className="mx-auto w-full max-w-[1100px] px-4 py-16 md:py-24">
          <h2 lang="id" className="max-w-[18ch]">
            Lapangan kosong hari ini?
          </h2>
          <p lang="id" className="mt-4 max-w-[46ch] text-[color:var(--color-fg-muted)]">
            Cek jadwalnya sekarang, pilih jamnya, sisanya lewat WhatsApp.
          </p>
          <a
            href="#order"
            lang="id"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-[10px] bg-[var(--color-accent-strong)] px-6 font-semibold text-[var(--color-fg-inverse)] transition-colors hover:bg-[var(--color-accent-strong-hover)]"
          >
            Lihat Jadwal
          </a>
        </div>

        <div className="border-t border-[var(--color-border)]">
          <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-3 px-4 py-8 md:flex-row md:items-center md:justify-between">
            <span
              aria-label="Arena Player"
              role="img"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--color-accent-strong)] font-[family-name:var(--font-display)] text-sm font-black text-[var(--color-fg-inverse)]"
            >
              AP
            </span>
            {/* No prices, no invented address, no social links nobody gave us.
                A footer padded with plausible-looking filler is the same defect
                as an invented address, just quieter. */}
            <p
              lang="id"
              className="text-[length:var(--text-sm)] text-[color:var(--color-fg-muted)]"
            >
              Arena Player · Lapangan mini soccer
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
