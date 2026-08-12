import type { ReactNode } from "react";

import { Hero } from "./components/Hero";
import { OrderSection } from "./components/OrderSection";
import { Section } from "./components/Section";
import { SiteHeader } from "./components/SiteHeader";
import { WHATSAPP_NUMBER } from "./home.constants";
import { KETENTUAN, KETENTUAN_TITLE } from "./home.content";

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
        <OrderSection />
      </Section>

      {/* THE FIRST NAVY BAND. DESIGN.md's Section head table puts Ketentuan on
          navy, and the band is what separates one section from the next now
          that the old hairline keyline is gone — a hairline plus a band would
          be two devices doing one job.

          THE TEN-ROW TREATMENT IS NOT BUILT YET. DESIGN.md's Ketentuan rule row
          specifies full-width rows in an `84px 1fr` grid with outlined numerals
          and a hover that slides along the axis; that is the next turn. What
          this turn does is stop the list rendering as a WHITE CARD sitting on
          the band, which would be the "large dark card" defect wearing its
          inverse: the container goes transparent and its hairline moves to the
          on-band token. */}
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
        <div className="rounded-[var(--radius-panel)] border border-[var(--color-border-on-band)] p-4 md:p-6">
          <h3
            lang="id"
            className="text-[length:var(--text-sm)] tracking-[0.08em] text-[color:var(--color-fg-muted-on-band)] uppercase"
          >
            {KETENTUAN_TITLE}
          </h3>
          {/* An ordered list, because the rules ARE numbered and the client
              refers to them by number. A <ul> with rendered digits would look
              identical and read wrong to a screen reader. */}
          <ol
            lang="id"
            className="mt-4 grid list-decimal gap-3 pl-5 marker:font-semibold marker:text-[var(--color-interactive-on-band)] md:grid-cols-2 md:gap-x-8"
          >
            {KETENTUAN.map((rule) => (
              <li key={rule} className="max-w-[52ch] pl-1">
                {rule}
              </li>
            ))}
          </ol>
        </div>
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
