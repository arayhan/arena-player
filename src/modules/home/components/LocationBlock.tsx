"use client";

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { useMotion } from "@/lib/motion";

import { WHATSAPP_NUMBER } from "../home.constants";

/**
 * The client's own Google Maps embed URL, supplied verbatim on 2026-08-15.
 *
 * KEPT WHOLE AND UNPARSED. The `pb=` payload is Google's own packed
 * camera/place encoding — zoom, bearing, tilt, viewport size and the place id
 * `0x2dcc53005adc6011:0x48fd9a87865f0a08` ("Arena Player Soccer"). Rebuilding
 * it from parts, or "tidying" it, changes what the visitor sees; it is data,
 * not a template.
 *
 * It belongs in `home.constants.ts` beside the WhatsApp number — same kind of
 * value, same reason to live in one place. It is here only because this pass
 * was scoped to a single file, and that move is recorded as owed rather than
 * done silently.
 */
const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3943.324280937278!2d116.4750677!3d-8.755528299999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dcc53005adc6011%3A0x48fd9a87865f0a08!2sArena%20Player%20Soccer!5e0!3m2!1sen!2sid!4v1786803816454!5m2!1sen!2sid";

/**
 * Latitude, longitude — READ OFF THE EMBED ABOVE, never typed from elsewhere.
 * Google packs them as `!3d<lat>` and `!2d<lng>`: `-8.755528299999998` and
 * `116.4750677`, rounded to six decimals (~11cm, past any precision a visitor
 * can use). Displayed as the plate's nameplate, so the one fact the client just
 * supplied is legible without opening the map.
 */
const MAP_COORDINATES = "-8.755528, 116.475068";

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
function MapPlate() {
  // The clip-path sweep's target AND the motion scope. One element, so cleanup
  // ownership and the tween target cannot drift apart.
  const frameRef = useRef<HTMLElement>(null);

  // THE TOUCH GATE, CHOSEN BY THE USER 2026-08-15. Below 980px the embed is
  // inert until a tap; a Google map pans on a one-finger drag, so a visitor
  // scrolling the page with a finger anywhere on a 60svh map panned the map
  // instead of the page. Above 980px there is no gate at all: a cursor has
  // none of this problem, and a click that only arms a map it could already
  // have dragged is a tax on the pointer that never had the bug.
  //
  // This is not the drag-fighting the reveal was written to avoid. That rule is
  // about not parking scroll-driven work over a live embed — `once: true` plus
  // `clearProps` settles it, and neither is involved here. This is the opposite
  // duty: not taking a scroll the visitor never offered.
  //
  // TWO PIECES OF STATE, NOT ONE, AND THE FIRST ONE IS THE NO-JS ANSWER.
  // `gateArmed` is false in the server tree and true only once the client is
  // running, so the overlay exists exclusively where JavaScript does. With JS
  // disabled, with a hydration failure, or with the chunk 404ing across a
  // deploy, no overlay is ever rendered and the map is immediately draggable —
  // the pre-gate behaviour, which is the LESS BAD of the two failure states. A
  // map held permanently inert by a button that can never be clicked is
  // unusable; a map that pans is merely the nuisance this gate exists to fix.
  // The safe state is the one that survives its own machinery being absent.
  //
  // It also means SSR renders no overlay and hydration matches exactly, rather
  // than the server guessing at a viewport it cannot see.
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

        // A `fromTo`, NOT a `from`, AND THAT IS CORRECTNESS RATHER THAN STYLE.
        // A from-tween ends at the element's computed value, which here is
        // `clip-path: none` — and `none` is not interpolatable with `inset()`,
        // so the sweep would snap instead of travelling. Both ends are stated,
        // both are `inset()`, both carry four values in the same unit, which is
        // what lets GSAP's complex-string interpolation walk them.
        gsap.fromTo(
          frame,
          { clipPath: "inset(0% 100% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.9,
            // Behind the page-wide reveal's 700ms rise on the parent, so the
            // composition arrives first and the map opens second. Two entrances
            // firing on the same frame read as one busy event; sequenced, they
            // read as a plate being uncovered.
            delay: 0.15,
            // The same curve family as every other entrance on this page —
            // DESIGN.md names `cubic-bezier(0.22, 1, 0.36, 1)` and `power3.out`
            // reaches it without loading `CustomEase` as a second download.
            ease: "power3.out",
            scrollTrigger: {
              trigger: frame,
              start: "top 88%",
              // ONCE, AND THIS IS THE FIRST OF THREE REASONS THE SWEEP CANNOT
              // FIGHT A DRAG. The trigger kills itself after firing, so from
              // that moment there is no scroll-driven work of any kind sitting
              // over an interactive embed. Nothing is scrubbed, nothing is
              // pinned, nothing parallaxes — a map that pans under the finger
              // and a section that also moves under the finger is a surface
              // nobody can aim at.
              once: true,
            },
            // REASON TWO: THE CLIP IS REMOVED, NOT LEFT AT ITS END VALUE. A
            // resting `clip-path: inset(0 0 0 0)` is still a clip — it makes a
            // containing block, it keeps the element on its own paint path, and
            // it clips hit-testing. Cleared, the finished state is exactly the
            // markup with no inline property at all, so a drag lands on the
            // iframe through nothing.
            onComplete: () => {
              gsap.set(frame, { clearProps: "clipPath" });
            },
          },
        );

        // REASON THREE, and it is the choice of target: the tween writes to the
        // FRAME, never to the `<iframe>`. No inline transform, opacity or clip
        // ever lands on the embed itself, and no overlay or scrim is used to
        // fake the wipe — the usual way a "designed" embed ends up eating the
        // gesture it exists to offer.
      },
      // EMPTY ON PURPOSE, NOT BY OMISSION — the same contract `ScrollReveal`
      // states. Nothing here starts clipped in the markup: the start state is
      // written by GSAP and only by GSAP, so a reduced-motion preference, a
      // chunk 404 or JS switched off all leave a complete, draggable map.
      settle: () => {},
    },
    { scope: frameRef },
  );

  return (
    <figure
      ref={frameRef}
      lang="id"
      className={cn(
        // ORDER-FIRST BELOW 980px. The user's composition puts the map above
        // the text on a phone. DOM order stays name -> address -> hours ->
        // WhatsApp -> map, because that is the order the content actually reads
        // in and the order a screen reader should get; only the visual stacking
        // inverts.
        "order-first flex flex-col min-[980px]:order-none",
        // 48svh STACKED, 80svh BESIDE THE TEXT — trimmed from 60/100 on
        // 2026-08-15 at the user's instruction. A full-viewport map made the
        // section a scroll of its own: on a phone the address and hours below it
        // never shared a screen with the pin, and at 980px+ the plate pushed the
        // metadata list past the fold entirely. 80svh still reads as a plate
        // rather than a thumbnail.
        //
        // `svh` rather than `vh` because in-app browsers lie about `vh` and the
        // primary visitor arrives inside one.
        "h-[48svh] min-[980px]:h-[80svh]",
        // THE BLEED. The map's width is 50vw of the VIEWPORT, but this element
        // sits inside the container's padding, inside the page's max-width
        // gutter, and inside `Section`'s numeral indent. `--map-bleed` (defined
        // on the grid below) is the distance from this column's right edge back
        // out to the viewport's, so a negative right margin of exactly that
        // makes the plate finish at the screen edge — the only anchoring that
        // keeps the text column readable, see the grid's own note.
        "min-[980px]:mr-[calc(-1*var(--map-bleed))]",
        // SQUARE, 2px NAVY, NO RADIUS AND NO SHADOW. The world is square; the
        // 22px `--radius-panel` the old placeholder carried was the last
        // rounded corner on the page and it goes with it. Navy rather than the
        // order plate's blue-600, because blue marks the thing you act on.
        "border-2 border-[var(--color-fg)]",
        // NO RIGHT EDGE WHERE IT BLEEDS. A plate running off the screen must
        // not draw the edge it runs off, or the composition reads as a box that
        // happens to be clipped rather than as a surface continuing past the
        // page. Stacked, it is a bounded object and keeps all four.
        "min-[980px]:border-r-0",
      )}
    >
      {/* THE NAMEPLATE. Same uppercase micro-label as the `Field` labels an inch
          to its left, so the plate is legibly part of this section's object and
          not a widget parked in it. `blue-50` on `navy-900` is DESIGN.md's
          documented band pair at 15.69:1 — the semantic on-band tokens, never a
          raw hue, and no new colour is introduced here.

          IT CARRIES THE COORDINATES, WHICH IS THE PLACEHOLDER'S REPLACEMENT
          RATHER THAN ITS REMOVAL. The old surface's whole job was a visible,
          honest "koordinat menyusul" note; the coordinates have now arrived, so
          the same slot in the composition states them. `tabular-nums` because
          two signed decimal figures beside each other are a readout. */}
      <figcaption
        className={cn(
          "flex shrink-0 items-baseline justify-between gap-4",
          "border-b-2 border-[var(--color-fg)] bg-[var(--color-band)]",
          "px-4 py-2 text-[length:var(--text-xs)] tracking-[0.08em] uppercase",
          "text-[color:var(--color-fg-on-band)] [font-variant-numeric:tabular-nums]",
        )}
      >
        <span>Koordinat</span>
        <span>{MAP_COORDINATES}</span>
      </figcaption>

      {/* WIDTH AND HEIGHT ATTRIBUTES DROPPED, per the sizing decision: the
          supplied 600x450 would fight the CSS at every breakpoint and win the
          intrinsic-ratio argument before layout, which is what makes an embed
          jump. The frame states the size; the iframe fills it.

          `title` IS THE ACCESSIBLE NAME and is not optional — an untitled frame
          is announced as "frame" and a screen-reader user has no way to know
          what they have entered. `loading="lazy"` and the supplied
          `referrerpolicy` are kept exactly as the client sent them. */}
      <div className="relative min-h-0 w-full flex-1">
        <iframe
          title="Peta lokasi Arena Player Soccer di Google Maps"
          src={MAP_EMBED_SRC}
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
          {/* THE CLIENT'S OWN ADDRESS, supplied 2026-08-15 — verbatim, and it
              closes the last placeholder in this section. It read "Alamat
              menyusul — menunggu data dari pihak lapangan" until today, because
              PRODUCT.md lists the address among the facts that must never be
              fabricated: a street name nobody verified sends a visitor to the
              wrong village.

              IT IS SET AS A FACT NOW, in `--color-fg` like the opening hours
              beside it, rather than in the muted ink a placeholder note takes.
              The map embed above is the client's own too, so the pin and the
              words finally agree. */}
          <Field label="Alamat">
            Selebung Ketangga, Kec. Keruak, Kab. Lombok Timur, Nusa Tenggara Barat
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
              the narrowest column this block gets — the same overflow the
              display lines above just stopped causing, one element further down.
              The body face sets it at 131.1px on the `sm` step, which clears
              every column width by a wide margin. */}
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

      <MapPlate />
    </div>
  );
}
