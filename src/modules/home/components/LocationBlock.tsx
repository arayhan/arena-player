import type { ReactNode } from "react";

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
 * One ruled field of the directory — the metadata list's repeating unit.
 *
 * A FIELD, NOT A ROW WITH SPACE AROUND IT. The list used to be three
 * label/value pairs floating on `space-y-5`, which is the arrangement this
 * direction refuses: "Pelat Enamel" draws structure with rules, so the three
 * facts are divided fields of one object the way `KetentuanRows` divides its
 * ten. Same construction, quarter of the scale.
 *
 * THE LABEL STAYS ABOVE THE VALUE AT EVERY WIDTH, AND THAT IS A MEASUREMENT.
 * A label column beside the value reads better and is what a spec sheet does,
 * but this block's own column is **304.7px at 980px** — narrower than it is on
 * a 375px phone — because the two-column Location composition splits an
 * already-indented row. A viewport-keyed split would therefore be widest
 * exactly where the container is narrowest, and "+62 896-8262-0666" would break
 * mid-number. Stacked cannot overflow at any width, and needs no container
 * query to prove it.
 */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-[var(--color-fg)] py-4">
      <dt className="text-[length:var(--text-xs)] tracking-[0.08em] text-[color:var(--color-fg-muted)] uppercase">
        {label}
      </dt>
      <dd className="mt-2 text-[length:var(--text-sm)]">{children}</dd>
    </div>
  );
}

/**
 * The location section's content — DESIGN.md's "Location section": stacked
 * uppercase display lines with the middle line outlined, a metadata list,
 * and a designed map placeholder, arranged two columns above 980px.
 *
 * `<Section>` (owned elsewhere) supplies the wrapper, the numeral, the small
 * `h2` and the lede. This component owns everything below that.
 *
 * REBUILT 2026-08-13, AND IT WAS THE WORST OVERFLOW ON THE PAGE BY A FACTOR OF
 * FIVE. `#lokasi` scrolled sideways by 45 / 31 / 22 / **158** / 96 / 33px at
 * 320 / 375 / 414 / 768 / 1280 / 1440, worse on a tablet than on a phone, which
 * is the signature of a breakpoint handing a block a layout its content cannot
 * hold rather than of content being too big.
 *
 * IT WAS ONE WORD, AT EVERY ONE OF THOSE WIDTHS. Located by measuring rects
 * rather than by reading the file: every escaping element in the section was
 * the display paragraph or one of its three lines, and the paragraph's grid
 * track measured 6.8182x its own font size at 320, 375, 414 and 768 — the same
 * multiplier each time, which is "LOMBOK" in Panchang and nothing else. The
 * metadata list contributed zero. The map placeholder contributed zero and held
 * 4:3 exactly (1.333) at all seven widths.
 *
 * WHY 768 WAS WORSE THAN 375: below `md` the block gets the full content box
 * (343px at 375px), and at `md` `Section` indents children past the numeral
 * track, so at 768px the column is 496.2px — up 1.45x — while `--text-display`
 * climbs from 57.25px to 100.48px, up 1.75x. The word grew faster than its box.
 * Above 980px it got worse again: the two-column composition halved the already
 * indented row and the column FELL to 304.7px while the type kept climbing to
 * its 152px cap, asking one word for 1036.3px of ink.
 *
 * THE FIX IS A SCALE, PLUS ONE RATIO. `--text-location` is a new role clamped
 * against the narrowest column this block ever gets rather than against the
 * viewport — see its derivation in globals.css — and the two columns are
 * 1.25fr / 0.75fr rather than even, for the reason argued at the grid itself.
 * DESIGN.md's 980px split, the outlined middle line, the metadata triple and the
 * map placeholder's whole specification are all kept as written.
 *
 * `#lokasi`'s own `scrollWidth - clientWidth` is now **0 at 320 / 375 / 414 /
 * 768 / 980 / 1280 / 1440**, with zero unclipped escapees and zero escaping
 * text-ink rects, and the page as a whole reaches 0 at all seven — these two
 * sections were the last offenders on it.
 */
export function LocationBlock() {
  return (
    // 1.25fr / 0.75fr, NOT TWO EQUAL COLUMNS, AND THE CONTENT DECIDED IT. An
    // even split gave the text column 304.7px at 980px — narrower than the
    // 343px a 375px PHONE gets, because `Section`'s numeral track takes 244px
    // off the row before the split happens. The consequence was a hierarchy
    // inversion measurable rather than arguable: `--text-h2` resolves to
    // 49.32px there while the block's own display lines were capped at 41.16px
    // by that column, so the section LABEL outweighed the section's STATEMENT.
    // Half a section is also more than a box reading "coordinates pending" has
    // earned. At 1.25/0.75 the text column is 380.8px at 980px and the two
    // scales meet instead of crossing.
    //
    // `minmax(0,...)`, NOT BARE `fr`. A bare `1.25fr` expands to
    // `minmax(auto, 1.25fr)`, and that auto minimum sits on the TRACK — so the
    // column would refuse to shrink below "LOMBOK"'s intrinsic width no matter
    // what the item carries, which is the exact mechanism that made this
    // section the page's worst overflow. Tailwind's own `grid-cols-2` emits
    // `minmax(0,1fr)` and was therefore safe; an arbitrary value is not, and
    // `Section.tsx` records the same trap costing 41px of page width.
    <div className="grid gap-8 min-[980px]:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] min-[980px]:items-start min-[980px]:gap-12">
      <div>
        {/* THE STACKED DISPLAY LINES. Three short lines, not the `h2`'s single
            inline sentence — a brand-plus-region statement, which is
            information the "Datang & Main" heading directly above this does
            not carry, not a restatement of it. "Lombok" is the market
            PRODUCT.md already confirms ("Market: Lombok, Nusa Tenggara Barat
            — and only Lombok"), never a specific street or coordinate, so
            nothing here is invented the way an address or a map pin position
            would be.

            THE COPY ITSELF HAS NEVER BEEN APPROVED BY THE USER. DESIGN.md
            specifies the TREATMENT ("stacked uppercase display lines with the
            middle line outlined") and not the words, unlike the hero and
            closing headings whose text is fixed in the doc. ARENA / PLAYER /
            LOMBOK was chosen by an agent on 2026-08-12 and flagged for a
            confirm-or-override pass that has not happened. It is carried
            forward here rather than replaced, because swapping one unapproved
            invention for another is not progress — but the scale below is
            bound to "LOMBOK" specifically, so approving different copy means
            re-deriving `--text-location` against the new longest word.

            `--text-location`, NOT `--text-display`. The hero's clamp reaches
            152px for a headline whose longest word is five characters and whose
            box is the whole viewport; this block's longest word is six
            characters at 6.8182em and its box is half an indented row. Reaching
            for the hero's token was the entire overflow — see the file header.

            NOT ON `--skew`. DESIGN.md's axis table names exactly five things
            that lean — section numerals, rule numerals, the hero eyebrow
            rule, the button wipe, the marquee band — and this is not one of
            them. A sixth leaning element would be the "second skew value"
            DESIGN.md calls a defect, not a variation. */}
        <p className="type-display text-[length:var(--text-location)] leading-[0.95] font-black tracking-[-0.03em] text-[color:var(--color-fg)] uppercase">
          <span className="block">Arena</span>
          {/* THE OUTLINED MIDDLE LINE — DESIGN.md's Location section: "the
              middle line outlined at 1.5px in navy-400".

              IT STAYS OUTLINED WHILE THE CLOSING BAND'S EMPHASISED WORD STOPS
              BEING, AND THE TWO ARE NOT INCONSISTENT. Hero.tsx's objection is
              specifically to an outline ON NAVY, where the counters fill with
              the plate's own colour and the word "reads as a hollow punched
              through the sign". Here the counters fill with the page ground:
              the letter reads as drawn ink on paper, which is what a stencil on
              an enamel sign actually is. Outline is a light-ground device; on
              navy it is reserved for non-content structure. See ClosingCTA.tsx,
              which states the rule.

              Same three-branch Outline-Needs-A-Floor pattern as Section.tsx's
              numeral and the hero's `Kirim.`: a solid fallback fill first (never
              `color:transparent` unconditionally, which fails to invisibility
              rather than to ugliness), the stroke gated behind the exact
              `@supports` test DESIGN.md specifies, then `forced-colors` dropping
              the stroke for a solid `CanvasText` fill. `--text-location` floors
              at 36px, so the 24px outline floor is satisfied structurally and
              needs no runtime guard. */}
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

        {/* THE METADATA LIST, NOW A RULED OBJECT. DESIGN.md: "Alamat, Jam
            operasional and WhatsApp." Two of the three still carry a content
            placeholder — only the operating hours are an established fact
            today. A `<dl>` because these are label/value pairs, not a bulleted
            list.

            2px NAVY ON TOP, 1px BETWEEN, NOTHING DOWN THE SIDES. The same
            construction the order plate and the Ketentuan plate use — a hard
            saturated outer edge with quieter interior rules — at the scale this
            block deserves. Edges only, never a four-sided frame: a box here is a
            card, and the direction is built out of rules rather than containers.

            THE RULES ARE `--color-fg`, NOT `--color-border`, AND THAT IS A
            DELIBERATE DEPARTURE. grey-200 on the blue-50 page ground computes
            1.14:1 — fainter than the navy-700 hairlines inside the Ketentuan
            band, which are already the quietest structure in the system, and
            faint enough on a phone to read as a rendering artefact rather than
            as a drawn line. A painted sign has no 1.14:1 rules on it. They carry
            no state, so WCAG 1.4.11's 3:1 boundary bar does not bind them
            either way; this is legibility, not compliance.

            NO OUTER BOTTOM EDGE, so the object ends on the same hairline weight
            it divides with and does not close into a frame. */}
        <dl lang="id" className="mt-10 border-t-2 border-[var(--color-fg)]">
          {/* TODO(content): address + maps coords. Same honest-gap treatment as
              the rest of the page — a visible "menyusul" note, never an
              invented street name. PRODUCT.md lists the address among the
              facts that must not be fabricated. */}
          <Field label="Alamat">
            <span className="text-[color:var(--color-fg-muted)]">
              Alamat menyusul — menunggu data dari pihak lapangan.
            </span>
          </Field>

          {/* WITA, not WIB — the field is in Lombok and the date layer pins
              Asia/Makassar. An established fact, not a placeholder. */}
          {/* THE ONLY ESTABLISHED FACT IN THE LIST, AND IT IS SET AS ONE. The
              other two values are a placeholder note and a link; this is the
              one line a visitor can act on today, so it takes `--color-fg` at
              600 while they stay muted or underlined.

              NOT IN THE DISPLAY FACE, THOUGH THE HOURS ARE THE PRODUCT AND
              `SlotCell` DOES SET THEM THERE. Measured rather than assumed:
              Panchang sets "06.00–24.00 WITA" at **14.593em** against the body
              face's 9.364em, so at the `h3` step it would want 392.5px inside
              the 304.7px column this block gets at 980px — the same overflow the
              display lines above just stopped causing, one element further down.
              The body face sets it at 131.1px on the `sm` step, which clears the
              narrowest column by 173.6px. */}
          <Field label="Jam operasional">
            <span className="font-semibold text-[color:var(--color-fg)]">06.00–24.00 WITA</span>
          </Field>

          <Field label="WhatsApp">
            {/* navy-900 (--color-fg), NOT the interactive blue. DESIGN.md
                never clears --color-interactive text sitting directly on
                the flat blue-50 page ground — every documented blue-600
                contrast figure in the Colors section is "on white". The
                existing WhatsApp link elsewhere on this page makes the same
                choice for the same reason; this follows it rather than
                introducing an untested combination. The underline is what
                carries the affordance instead, and it thickens on hover so
                the signal is not colour alone. */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              className="inline-flex min-h-11 items-center text-[color:var(--color-fg)] underline decoration-[var(--color-fg-muted)] decoration-1 underline-offset-4 transition-[text-decoration-color] hover:decoration-[var(--color-fg)]"
            >
              {formatWhatsAppDisplay(WHATSAPP_NUMBER)}
            </a>
          </Field>
        </dl>
      </div>

      {/* THE MAP PLACEHOLDER — a designed state, not an empty box.
          DESIGN.md: "rounded.panel, 4:3, a --diag gradient from blue-50
          through white to blue-100, a 44px grey-200 grid at 50% opacity, and
          a blue-600 pin. It carries its own note explaining that coordinates
          are pending." Every one of those is kept; it held 4:3 exactly at all
          seven measured widths and contributed nothing to the overflow.

          THE EDGE IS 2px NAVY WHERE IT WAS A 1px GREY HAIRLINE. This is the
          only object in the section, and in "Pelat Enamel" an object's edge is
          drawn, not suggested. Navy rather than the order plate's blue-600:
          blue is what marks the thing you act on, and nothing in this section is
          acted on except the WhatsApp link above. The pin keeps blue for that
          reason — it is the one affordance shape here, even though it does not
          yet point anywhere.

          THE RADIUS STAYS, AND IT IS THE ONE THING IN THIS FILE THAT ARGUES
          WITH THE DIRECTION. `rounded.panel` is DESIGN.md's explicit Location
          spec, and every other plate on the page has had its radius removed as
          part of the redesign. Kept as specified rather than squared on my own
          judgement, and flagged: DESIGN.md is rewritten from the built result at
          the end of this redesign, and this is a line that should be settled
          there rather than diverged from here. */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] border-2 border-[var(--color-fg)]">
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
            this one does not yet point anywhere.

            THE `--shadow-sm` IS GONE. "Pelat Enamel" is flat saturated fields
            with hard edges and no soft shadows, and a drop shadow under a pin
            is the soft-UI convention the direction exists to refuse. It is
            replaced by nothing rather than by a substitute: a flat mark on a
            flat surface is the correct drawing. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pb-[12%]"
        >
          <span className="h-6 w-6 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-[var(--color-interactive)]" />
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
