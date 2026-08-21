"use client";

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { useMotion } from "@/lib/motion";

import { FIELD_ADDRESS, MAP_COORDINATES, MAP_EMBED_SRC, WHATSAPP_NUMBER } from "../home.constants";
import { useSiteSettings } from "../home.queries";

/**
 * "Is the client actually running?", asked the way React 19 wants it asked.
 *
 * The map's touch gate must exist ONLY where JavaScript does — see the argument
 * at its state below. The obvious spelling of that is `useState(false)` plus an
 * effect that flips it, and ESLint's `react-hooks/set-state-in-effect` rejects
 * it outright: a setState in an effect body is a second render pass every mount
 * for something React can answer during the first one.
 *
 * `useSyncExternalStore` is the supported answer. React reads
 * `getServerSnapshot` while rendering on the server AND during hydration, then
 * `getSnapshot` from the first client render onwards — so the two trees always
 * agree and the gate appears exactly one commit later, with no effect, no
 * cascading render, and no hydration warning.
 *
 * All three are module constants ON PURPOSE. Inline arrow functions here are
 * new identities on every render, which makes the store look like it changed
 * and re-subscribes in a loop. The subscribe callback returns a no-op
 * unsubscribe because this "store" never changes after mount: JavaScript does
 * not stop being available.
 */
const subscribeToNothing = () => () => {};
const clientIsRunning = () => true;
const clientIsNotRunningYet = () => false;

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
 * but this block's own column is narrowest at 980px — narrower than it is on a
 * 375px phone — because the two-column Location composition splits an already
 * indented row. A viewport-keyed split would therefore be widest exactly where
 * the container is narrowest, and "+62 896-8262-0666" would break mid-number.
 * Stacked cannot overflow at any width, and needs no container query to prove
 * it.
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
 * THE MAP PLATE — the page's first and only third-party embed.
 *
 * DESIGN.md's benchmark table reads "Third-party embeds — none; an undesigned
 * rectangle inside a designed page is a defect", written against a benchmark
 * that shipped a raw YouTube player mid-page and a dead grey map rectangle as
 * its final state. That row now has an exception and the exception is the whole
 * job here: the embed arrives INSIDE the enamel vocabulary rather than beside
 * it — square corners, one 2px navy edge, and a navy nameplate carrying the
 * coordinates in the same uppercase micro-label the metadata fields use. What
 * makes it a plate rather than a rectangle is that its frame is drawn by the
 * same rules as everything else in the section.
 *
 * NOTHING IS OVERLAID ON THE MAP ITSELF, and that is a constraint rather than a
 * preference. Google draws its own logo bottom-left, its terms bottom-right,
 * the "View larger map" affordance top-left and the zoom control bottom-right;
 * a caption or scrim floating over any of them either hides attribution the
 * embed's terms require or swallows a control the visitor needs. The nameplate
 * therefore sits ABOVE the frame's viewport, in the plate's own band, where it
 * costs the map no surface and covers no chrome.
 *
 * NO `filter:` ON THE IFRAME either — the fashionable `grayscale()` /
 * `saturate()` treatment would tie the map into the palette, and it would do it
 * by destroying the only colour coding a map has: green is a field, blue is
 * water, white is a road. This is a wayfinding surface for somebody trying to
 * arrive at a pitch, so its own legibility outranks the page's colour
 * discipline. The frame does the designing instead.
 */
function extractCoordinates(embedUrl: string): string {
  const latMatch = embedUrl.match(/!3d(-?[\d.]+)/);
  const lngMatch = embedUrl.match(/!2d(-?[\d.]+)/);
  if (latMatch && lngMatch) {
    const lat = parseFloat(latMatch[1]).toFixed(6);
    const lng = parseFloat(lngMatch[1]).toFixed(6);
    return `${lat}, ${lng}`;
  }
  return MAP_COORDINATES;
}

function MapPlate({ embedSrc = MAP_EMBED_SRC }: { embedSrc?: string }) {
  // The clip-path sweep's target AND the motion scope. One element, so cleanup
  // ownership and the tween target cannot drift apart.
  const frameRef = useRef<HTMLElement>(null);

  const gateArmed = useSyncExternalStore(
    subscribeToNothing,
    clientIsRunning,
    clientIsNotRunningYet,
  );
  const [activated, setActivated] = useState(false);

  useMotion(
    {
      animate: ({ gsap }) => {
        const frame = frameRef.current;
        if (!frame) return;

        gsap.fromTo(
          frame,
          { clipPath: "inset(0% 100% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.9,
            delay: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: frame,
              start: "top 88%",
              once: true,
            },
            onComplete: () => {
              gsap.set(frame, { clearProps: "clipPath" });
            },
          },
        );
      },
      settle: () => {},
    },
    { scope: frameRef },
  );

  const coordinates = extractCoordinates(embedSrc);

  return (
    <figure
      ref={frameRef}
      lang="id"
      className={cn(
        "order-first flex flex-col min-[980px]:order-none",
        "h-[48svh] min-[980px]:h-[80svh]",
        "min-[980px]:mr-[calc(-1*var(--map-bleed))]",
        "border-2 border-[var(--color-fg)]",
        "min-[980px]:border-r-0",
      )}
    >
      <figcaption
        className={cn(
          "flex shrink-0 items-baseline justify-between gap-4",
          "border-b-2 border-[var(--color-fg)] bg-[var(--color-band)]",
          "px-4 py-2 text-[length:var(--text-xs)] tracking-[0.08em] uppercase",
          "text-[color:var(--color-fg-on-band)] [font-variant-numeric:tabular-nums]",
        )}
      >
        <span>Koordinat</span>
        <span>{coordinates}</span>
      </figcaption>

      <div className="relative min-h-0 w-full flex-1">
        <iframe
          title="Peta lokasi Arena Player Soccer di Google Maps"
          src={embedSrc}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="h-full w-full border-0"
        />

        {/* THE GATE. A real `<button>` covering the map, never a scrim with a
            tooltip: it has to be operable, named, and reachable by every input
            the page supports.

            IT GATES THE POINTER AND ONLY THE POINTER, BY CONSTRUCTION. A button
            stacked over an iframe intercepts touch and mouse, because those hit
            whatever is painted on top — but focus order is DOM order and owes
            nothing to stacking, so the iframe behind stays in the tab sequence
            and a keyboard or screen-reader user reaches the map exactly as they
            did before this existed. Nothing here sets `inert`, `tabindex="-1"`
            or `aria-hidden` on the frame, and that omission is the whole
            accessibility argument: the gate cannot trap what it never touched.
            The button is also operable on its own, by Enter or Space, so the
            activation itself needs no pointer either.

            `min-[980px]:hidden` IS THE BREAKPOINT, IN CSS RATHER THAN IN JS.
            `display: none` takes it out of the tab order and the accessibility
            tree together, and it re-evaluates on resize with no listener, no
            `matchMedia`, and no second source of truth about where 980px is.

            NO ANIMATION ON IT, DELIBERATELY. The gate appears at hydration and
            disappears on tap; a fade on either would be motion the visitor did
            not ask for on the one element whose job is to respond instantly, and
            it would need a reduced-motion branch to say the same thing twice. */}
        {gateArmed && !activated ? (
          <button
            type="button"
            lang="id"
            onClick={() => setActivated(true)}
            className={cn(
              "absolute inset-0 flex items-end justify-center pb-10",
              "min-[980px]:hidden",
              "focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[var(--color-fg)]",
            )}
          >
            {/* THE LABEL IS ITS OWN PLATE, AND THAT IS A CONTRAST DECISION
                RATHER THAN A STYLE ONE. It sits on a Google map, whose ground
                is green, white, grey and blue by turns and is therefore not a
                background any ratio can be computed against. An OPAQUE navy
                field makes the pair knowable: this is the same `--color-band` /
                `--color-fg-on-band` pair as the nameplate directly above it, so
                the plate reads as one object with two strips and the figure is
                the one already documented for a band. Square, flat, no shadow.

                `pb-10` KEEPS GOOGLE'S ATTRIBUTION VISIBLE. The logo, the map
                data credit and the terms link sit along the bottom edge of the
                frame and are a condition of using the embed at all — the label
                clears them rather than covering them, the same rule that keeps
                the coordinates in the nameplate instead of floating over the
                map. The whole overlay is the tap target, so the visible chip
                does not have to be the 44px one; it is anyway. */}
            <span
              className={cn(
                "inline-flex min-h-11 items-center px-4",
                "bg-[var(--color-band)] text-[color:var(--color-fg-on-band)]",
                "text-[length:var(--text-xs)] tracking-[0.08em] uppercase",
              )}
            >
              Ketuk untuk menggeser peta
            </span>
          </button>
        ) : null}
      </div>
    </figure>
  );
}

/**
 * The location section's content — DESIGN.md's "Location section": stacked
 * uppercase display lines with the middle line outlined, a metadata list, and
 * the map beside them above 980px.
 *
 * `<Section>` (owned elsewhere) supplies the wrapper, the numeral, the small
 * `h2` and the lede. This component owns everything below that.
 *
 * A CLIENT COMPONENT AS OF 2026-08-15, AND THAT IS A COST WORTH NAMING. It was
 * a server component that opted into motion with a `data-reveal` attribute; the
 * map's clip-path sweep needs a ref and a hook, and `"use client"` is
 * file-scoped, so the markup below now ships in the bundle. `/` measured
 * 176.2KB against a 240KB ceiling, so it fits — but the architecturally cheaper
 * home for this effect is a second `data-` opt-in inside `ScrollReveal.tsx`,
 * which already owns one page-wide reveal and ships the only JavaScript any
 * other section needs. That file was out of scope for this pass; the move is
 * recorded as owed.
 *
 * THE OVERFLOW HISTORY IS STILL LOAD-BEARING. Rebuilt 2026-08-13 after being
 * the worst overflow on the page by a factor of five: `#lokasi` scrolled
 * sideways by 45 / 31 / 22 / **158** / 96 / 33px at 320 / 375 / 414 / 768 /
 * 1280 / 1440 — worse on a tablet than on a phone, which is the signature of a
 * breakpoint handing a block a layout its content cannot hold rather than of
 * content being too big. It was ONE WORD at every width: "LOMBOK", which
 * Panchang sets at 6.8182em, in a column that SHRANK as the viewport grew
 * because `Section` indents children past the numeral track and the two-column
 * split then halves what is left. `--text-location` exists because of it, and
 * every width decision below is still checked against that one measurement.
 */
export function LocationBlock() {
  const { data: settings } = useSiteSettings();

  const address = settings?.address?.trim() || FIELD_ADDRESS;
  const operatingHours = settings?.operating_hours?.trim() || "06.00–24.00 WITA";
  const whatsappNumber = settings?.whatsapp_number?.trim() || WHATSAPP_NUMBER;
  const mapEmbedSrc = settings?.maps_embed_url?.trim() || MAP_EMBED_SRC;

  return (
    // THE COLUMNS ARE NO LONGER 1.25fr / 0.75fr — the map is a fixed 50vw and
    // the text takes the remainder, per the user's sizing decision.
    //
    // TWO NEGATIVE MARGINS MAKE THAT SURVIVABLE, AND THE ARITHMETIC IS THE
    // ARGUMENT. Dropped naively into the old grid, a 50vw map leaves the text
    // column **119px at 980px** and 198px at 1280px, against the 320.7px
    // "LOMBOK" needs at the clamp's value there — the exact failure this file
    // was rebuilt to end, four times worse than before. It fails that way
    // because the row the split happens in is already reduced twice: by the
    // container's `--space-section-x` padding, and by `Section`'s numeral track
    // (244px at 980px, 309px above 1533px).
    //
    // So the composition takes the whole page width instead of the leftover of
    // a leftover: the map bleeds RIGHT to the viewport edge, and the text
    // reclaims the numeral indent to the LEFT. That is the same judgement
    // `Section`'s own `contentFullWidth` prop records for the order plate — the
    // indent is taste, the width is a measured requirement — and it would be
    // that prop rather than a margin if this pass had owned `HomePage.tsx`.
    //
    // The result is a text column of `0.5vw - padding - 48` up to 1280px and a
    // flat **544px** above it: 402.8px at 980, 496px at 1280, 544px at 1440 and
    // beyond, against a "LOMBOK" that is 320.7px at 980 and caps at 381.8px. The
    // tightest point on the whole curve is 980px, with 82px to spare.
    //
    // `minmax(0, …)`, NOT A BARE `fr`. A bare `1fr` expands to
    // `minmax(auto, 1fr)`, and that auto minimum sits on the TRACK — the column
    // would refuse to shrink below "LOMBOK"'s intrinsic width no matter what the
    // item carries, which is the mechanism that made this section the page's
    // worst overflow. `Section.tsx` records the same trap costing 41px.
    //
    // `--map-bleed` IS THE ONE VALUE BOTH SIDES OF THE BLEED READ. Declared once
    // here and consumed by the track width and by the plate's negative margin,
    // so the two can never disagree: track + bleed is exactly 50vw by
    // construction. It is `100vw`-derived, which overstates the viewport by the
    // width of a classic desktop scrollbar; the padding term cancels exactly
    // (the container computes its own padding from the same `100vw`), leaving a
    // possible half-scrollbar (~8px) only above 1295px on platforms that still
    // draw one. `html { overflow-x: clip }` in globals.css closes it for good
    // and is reported rather than reached for, since that file is not this
    // pass's to edit.
    //
    // `data-reveal` — the page-wide scroll reveal, see ScrollReveal.tsx. Still
    // the WHOLE block, not its parts: the display lines, the metadata and the
    // map are one composition, and the map's own sweep is sequenced 150ms
    // behind this rise rather than competing with it.
    <div
      data-reveal
      className={cn(
        "grid gap-8",
        "[--map-bleed:calc(var(--space-section-x)+max(0px,(100vw-var(--container-max))/2))]",
        "min-[980px]:grid-cols-[minmax(0,1fr)_calc(50vw-var(--map-bleed))]",
        "min-[980px]:items-start min-[980px]:gap-12",
      )}
    >
      {/* THE INDENT, GIVEN BACK. `calc(var(--text-numeral)*2.85 + 1.5rem)` is
          `Section`'s numeral track plus its `md:gap-x-6`, mirrored rather than
          imported because a child cannot read its parent's grid. The row it
          expands into is empty — the numeral sits in row 1 — and the left edge
          lands exactly on the container's content edge, so nothing escapes the
          page. If `Section` ever re-derives that 2.85 multiplier, this line
          moves with it. */}
      <div className="min-[980px]:-ml-[calc(var(--text-numeral)*2.85+1.5rem)]">
        {/* THE STACKED DISPLAY LINES. Three short lines, not the `h2`'s single
            inline sentence — a brand-plus-region statement, which is
            information the "Datang & Main" heading directly above this does
            not carry, not a restatement of it. "Lombok" is the market
            PRODUCT.md already confirms ("Market: Lombok, Nusa Tenggara Barat
            — and only Lombok").

            THE COPY IS CONFIRMED. DESIGN.md specifies the TREATMENT ("stacked
            uppercase display lines with the middle line outlined") and not the
            words, so ARENA / PLAYER / LOMBOK was chosen by an agent on
            2026-08-12 and carried an in-file flag saying no one had approved
            it. The client confirmed both the business name and the region on
            2026-08-13 and the flag is gone; the words stand.

            The scale below is still bound to "LOMBOK" specifically, so any
            future copy change means re-deriving `--text-location` against the
            new longest word — that constraint outlives the approval.

            `--text-location`, NOT `--text-display`. The hero's clamp reaches
            152px for a headline whose longest word is five characters and whose
            box is the whole viewport; this block's longest word is six
            characters at 6.8182em. Reaching for the hero's token was the entire
            overflow — see the file header.

            NOT ON `--skew`. DESIGN.md's axis table names exactly five things
            that lean — section numerals, rule numerals, the hero eyebrow
            rule, the button wipe, the marquee band — and this is not one of
            them. A sixth leaning element would be the "second skew value"
            DESIGN.md calls a defect, not a variation. It is also why the map's
            reveal is a straight sweep and not a skewed one. */}
        <p className="type-display text-[length:var(--text-location)] leading-[0.95] font-extrabold tracking-[-0.03em] text-[color:var(--color-fg)] uppercase">
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

        {/* THE METADATA LIST, A RULED OBJECT. DESIGN.md: "Alamat, Jam
            operasional and WhatsApp." The street address is the one value here
            still outstanding — the coordinates arrived with the embed on
            2026-08-15 and the address did not, so this list keeps its marker
            while the map lost its own. A `<dl>` because these are label/value
            pairs, not a bulleted list.

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
          {/* THE CLIENT'S OWN ADDRESS — the string itself lives in
              `home.constants.ts` beside the embed and the WhatsApp number, so
              the three facts the client supplied are edited in one place. It
              closes the last placeholder in this section. It read "Alamat
              menyusul — menunggu data dari pihak lapangan" until 2026-08-15,
              because
              PRODUCT.md lists the address among the facts that must never be
              fabricated: a street name nobody verified sends a visitor to the
              wrong village.

              IT IS SET AS A FACT NOW, in `--color-fg` like the opening hours
              beside it, rather than in the muted ink a placeholder note takes.
              The map embed above is the client's own too, so the pin and the
              words finally agree. */}
          <Field label="Alamat">{address}</Field>

          <Field label="Jam operasional">
            <span className="font-semibold text-[color:var(--color-fg)]">{operatingHours}</span>
          </Field>

          <Field label="WhatsApp">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              className="inline-flex min-h-11 items-center text-[color:var(--color-fg)] underline decoration-[var(--color-fg-muted)] decoration-1 underline-offset-4 transition-[text-decoration-color] hover:decoration-[var(--color-fg)]"
            >
              {formatWhatsAppDisplay(whatsappNumber)}
            </a>
          </Field>
        </dl>
      </div>

      <MapPlate embedSrc={mapEmbedSrc} />
    </div>
  );
}
