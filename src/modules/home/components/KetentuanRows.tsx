import { cn } from "@/lib/cn";

import { KETENTUAN, KETENTUAN_TITLE } from "../home.content";

/**
 * DESIGN.md's "Ketentuan rule row": ten full-width rows on the navy band,
 * each an `84px 1fr` grid — a leaning outlined numeral beside the rule text —
 * divided by 1px `navy-700` hairlines above and below every row.
 *
 * NOT A CARD. HomePage.tsx used to wrap this list in a rounded, bordered
 * panel sitting ON the band — the "white card on navy" defect the redesign
 * exists to remove. This component renders full-bleed rows instead; the
 * hairlines come from `divide-y` plus a `border-y` on the `<ol>`, which gives
 * every row exactly one shared divider above and below it rather than two
 * borders touching. `<Section>`'s own container is the only width
 * constraint — no card, no radius, no inset.
 *
 * ON-BAND TOKENS ONLY, EVERY COLOUR. `--color-fg-on-band`,
 * `--color-fg-muted-on-band`, `--color-interactive-on-band`,
 * `--color-border-on-band` — never their light-surface counterparts.
 * DESIGN.md's On-Band Rule names this exact section as the place the
 * pre-redesign concept got it wrong, and the failure is invisible in a
 * screenshot: `--color-blue-400` and `--color-navy-200` are on-dark ONLY and
 * must never travel to a light surface.
 *
 * `role="list"` ON THE `<ol>`. Some WebKit builds drop the implicit
 * list/listitem semantics from a list the moment `list-style: none` is
 * applied, and this project's primary device is an iOS in-app browser — the
 * one place that bug would actually reach a visitor. `role="list"` restores
 * it regardless of the CSS. The `<ol>` itself (not a `<ul>` with rendered
 * digits) is what makes a screen reader announce "rule 7" as "7 of 10"; the
 * visible `01`-`10` numerals are a compositional device on top of that and
 * are `aria-hidden` so nobody hears the number twice.
 */
export function KetentuanRows() {
  return (
    <div>
      <h3
        lang="id"
        className="text-[length:var(--text-sm)] tracking-[0.08em] text-[color:var(--color-fg-muted-on-band)] uppercase"
      >
        {KETENTUAN_TITLE}
      </h3>

      {/* KETENTUAN IS VERBATIM CLIENT CONTENT. Mapped over, never quoted —
          `check:docs`'s `ketentuan-verbatim` check compares home.content.ts
          against docs/PRD.md character for character, and a hard-coded string
          here would be exactly the rewrite that check exists to catch. */}
      <ol
        role="list"
        lang="id"
        className="mt-4 list-none divide-y divide-[var(--color-border-on-band)] border-y border-[var(--color-border-on-band)]"
      >
        {KETENTUAN.map((rule, index) => (
          <li
            key={rule}
            className={cn(
              "grid grid-cols-[84px_1fr] items-baseline gap-x-4 py-[22px]",
              "[transition:background-color_250ms,transform_250ms]",
              // POINTER-FINE ONLY — SlotCell.tsx's precedent for the same
              // constraint. A touch tap has no hover to leave, so an
              // unguarded hover here would strand a touch device mid-tint
              // with no way to clear it.
              "pointer-fine:hover:bg-[var(--color-border-on-band)] pointer-fine:hover:[transform:translateX(14px)]",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "type-display font-black leading-none select-none",
                "inline-block origin-bottom [transform:skewX(var(--skew))]",
                // 24px IS THE FLOOR THE OUTLINE RULE SETS — DESIGN.md: "this
                // is the one place the system sits exactly on it." No smaller
                // outlined text exists anywhere in the system.
                "text-[length:var(--text-rule-numeral)]",
                // THE OUTLINE-NEEDS-A-FLOOR RULE'S THREE-BRANCH PATTERN,
                // Section.tsx's precedent, with this row's own token
                // (`--color-interactive-on-band`, blue-400 on-band) and its
                // own 1px stroke width.
                //
                // 1. No stroke support: solid fill, the fallback DESIGN.md
                //    requires rather than a transparent word that vanishes.
                "text-[color:var(--color-interactive-on-band)]",
                // 2. Stroke supported: swap to transparent-fill + stroke,
                //    gated on the exact feature query DESIGN.md specifies.
                "supports-[-webkit-text-stroke:1px_currentColor]:text-transparent",
                "supports-[-webkit-text-stroke:1px_currentColor]:[-webkit-text-stroke:1px_var(--color-interactive-on-band)]",
                // 3. Forced colours (Windows High Contrast): stroke is not
                //    honoured there, so drop it and fill with the system's
                //    own text colour. `!` wins over the @supports rule above
                //    regardless of generated source order.
                "forced-colors:text-[CanvasText]! forced-colors:[-webkit-text-stroke:0]!",
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <p className="max-w-[72ch] text-[color:var(--color-fg-on-band)]">{rule}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
