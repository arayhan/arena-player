import { cn } from "@/lib/cn";

import { WHATSAPP_NUMBER } from "../home.constants";

/**
 * Format the wa.me-form WhatsApp number for READING rather than dialling —
 * "6289682620666" -> "+62 896-8262-0666". Derived from the constant so a
 * future number change re-formats correctly instead of needing a second,
 * hand-typed edit that can drift from it.
 */
function formatWhatsAppDisplay(waNumber: string): string {
  const national = waNumber.slice(2); // drop the "62" country code
  return `+62 ${national.slice(0, 3)}-${national.slice(3, 7)}-${national.slice(7)}`;
}

/**
 * The location section's content — DESIGN.md's "Location section": stacked
 * uppercase display lines with the middle line outlined, a metadata list,
 * and a designed map placeholder, arranged two columns above 980px.
 *
 * `<Section>` (owned elsewhere) supplies the wrapper, the numeral, the small
 * `h2` and the lede. This component owns everything below that — the three
 * parts DESIGN.md's Location section names, and the two-column arrangement
 * between them.
 */
export function LocationBlock() {
  return (
    <div className="grid gap-8 min-[980px]:grid-cols-2 min-[980px]:items-start min-[980px]:gap-12">
      <div>
        {/* THE STACKED DISPLAY LINES. Three short lines, not the `h2`'s single
            inline sentence — a brand-plus-region statement, which is
            information the "Datang & Main" heading directly above this does
            not carry, not a restatement of it. "Lombok" is the market
            PRODUCT.md already confirms ("Market: Lombok, Nusa Tenggara Barat
            — and only Lombok"), never a specific street or coordinate, so
            nothing here is invented the way an address or a map pin position
            would be.

            NOT ON `--skew`. DESIGN.md's axis table names exactly five things
            that lean — section numerals, rule numerals, the hero eyebrow
            rule, the button wipe, the marquee band — and this is not one of
            them. A sixth leaning element would be the "second skew value"
            DESIGN.md calls a defect, not a variation. */}
        <p className="type-display text-[length:var(--text-display)] leading-[0.95] font-black tracking-[-0.03em] text-[color:var(--color-fg)] uppercase">
          <span className="block">Arena</span>
          {/* THE OUTLINED MIDDLE LINE — DESIGN.md's Location section: "the
              middle line outlined at 1.5px in navy-400". Same three-branch
              Outline-Needs-A-Floor pattern as Section.tsx's numeral and the
              hero's `Kirim.`: a solid fallback fill first (never
              `color:transparent` unconditionally, which fails to
              invisibility rather than to ugliness), the stroke gated behind
              the exact `@supports` test DESIGN.md specifies, then
              `forced-colors` dropping the stroke for a solid `CanvasText`
              fill. Display size (48px floor) clears the 24px outline floor
              with room to spare, so no runtime guard is needed. */}
          <span
            className={cn(
              "block text-[color:var(--color-fg-muted)]",
              "supports-[-webkit-text-stroke:1px_currentColor]:text-[color:transparent]",
              "supports-[-webkit-text-stroke:1px_currentColor]:[-webkit-text-stroke:1.5px_var(--color-fg-muted)]",
              "forced-colors:!text-[color:CanvasText] forced-colors:[-webkit-text-stroke:0px]",
            )}
          >
            Player
          </span>
          <span className="block">Lombok</span>
        </p>

        {/* THE METADATA LIST. DESIGN.md: "Alamat, Jam operasional and
            WhatsApp." Two of the three still carry a content placeholder
            below — only the operating hours are an established fact today. A
            `<dl>` because these are label/value pairs, not a bulleted list. */}
        <dl lang="id" className="mt-8 space-y-5">
          <div>
            <dt className="text-[length:var(--text-xs)] tracking-[0.08em] text-[color:var(--color-fg-muted)] uppercase">
              Alamat
            </dt>
            {/* TODO(content): address + maps coords. Same honest-gap
                treatment as the rest of the page — a visible "menyusul" note,
                never an invented street name. */}
            <dd className="mt-1 text-[length:var(--text-sm)] text-[color:var(--color-fg-muted)]">
              Alamat menyusul — menunggu data dari pihak lapangan.
            </dd>
          </div>

          <div>
            <dt className="text-[length:var(--text-xs)] tracking-[0.08em] text-[color:var(--color-fg-muted)] uppercase">
              Jam operasional
            </dt>
            {/* WITA, not WIB — the pre-migration zone DESIGN.md corrects
                everywhere else on the page. An established fact, not a
                placeholder. */}
            <dd className="mt-1 text-[length:var(--text-sm)] text-[color:var(--color-fg)]">
              06.00–24.00 WITA
            </dd>
          </div>

          <div>
            <dt className="text-[length:var(--text-xs)] tracking-[0.08em] text-[color:var(--color-fg-muted)] uppercase">
              WhatsApp
            </dt>
            <dd className="mt-1 text-[length:var(--text-sm)]">
              {/* navy-900 (--color-fg), NOT the interactive blue. DESIGN.md
                  never clears --color-interactive text sitting directly on
                  the flat blue-50 page ground — every documented blue-600
                  contrast figure in the Colors section is "on white". The
                  existing WhatsApp link elsewhere on this page makes the same
                  choice for the same reason; this follows it rather than
                  introducing an untested combination. */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                className="inline-flex min-h-11 items-center text-[color:var(--color-fg)] underline decoration-[var(--color-border)] underline-offset-4 transition-colors hover:decoration-current"
              >
                {formatWhatsAppDisplay(WHATSAPP_NUMBER)}
              </a>
            </dd>
          </div>
        </dl>
      </div>

      {/* THE MAP PLACEHOLDER — a designed state, not an empty box.
          DESIGN.md: "rounded.panel, 4:3, a --diag gradient from blue-50
          through white to blue-100, a 44px grey-200 grid at 50% opacity, and
          a blue-600 pin. It carries its own note explaining that coordinates
          are pending." */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-border)]">
        {/* The gradient: the SAME three stops as the hero shader's fallback
            (`--diag`, blue-50 -> white -> blue-100) — DESIGN.md names
            `--diag` as shared between exactly these two uses, not a new
            gradient invented for this surface. `--color-gradient-end` is the
            semantic name for the same blue-100 stop the hero reaches for. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(var(--diag),var(--color-blue-50)_0%,var(--color-white)_45%,var(--color-gradient-end)_100%)]"
        />

        {/* THE GRID OVERLAY. This is the one place on the page a hairline
            grid background is legitimate: the `.impeccable` design detector's
            `codex-grid-background` rule exempts "actual canvas, map,
            blueprint, or measurement surfaces", and this IS the map surface —
            not a decorative pattern reused elsewhere on the page. Kept to
            this placeholder only. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] opacity-50 [background-size:44px_44px]"
        />

        {/* THE PIN. A pure-CSS teardrop — a rotated square with three rounded
            corners, the standard technique — so the placeholder needs no SVG
            and no icon-library import, per the hard constraint. blue-600, the
            interactive colour, because a pin is an affordance even though
            this one does not yet point anywhere. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pb-[12%]"
        >
          <span className="h-6 w-6 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-[var(--color-interactive)] shadow-[var(--shadow-sm)]" />
        </div>

        {/* THE NOTE — the load-bearing part of the placeholder. DESIGN.md is
            explicit that the whole point of this surface is to look finished
            while the content is missing, which only works if a visitor can
            actually read why the map is empty. */}
        {/* TODO(content): address + maps coords */}
        <p
          lang="id"
          className="absolute inset-x-4 bottom-4 text-[length:var(--text-xs)] text-[color:var(--color-fg-muted)]"
        >
          Titik lokasi di peta ini menyusul, menunggu koordinat dari pihak lapangan.
        </p>
      </div>
    </div>
  );
}
