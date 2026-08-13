# Accessibility baseline

Read before writing any markup, form field, or interactive control.

**Authority:** this file is the single source for the behavioural baseline. Every contrast ratio, colour value and focus-ring style is [DESIGN.md](../DESIGN.md) — normative, and never restated here. Where this file mentions a threshold it names the rule, not the number.

**This is the part most likely to be skipped, because nothing fails when it is.** Every item below is checkable against code.

---

## Labels

- Every input has a real `<label>` associated by `htmlFor`/`id`. **A placeholder is not a label** — it disappears on focus, exactly when it is needed.
- `inputMode="tel"` on the WhatsApp field. A mis-associated label means the wrong keyboard appears in the Instagram in-app browser, which is most of this site's traffic.

## Errors

- Every error message is tied to its field with `aria-describedby`, and the field carries `aria-invalid`.
- The error text **is** the message. Not a colour change plus a red border — colour alone is never the signal.
- A 400 response carries a `fields` object. Map each entry back onto its own input rather than rendering one generic banner. See [api-conventions.md](api-conventions.md).

## Focus

- Focus is managed on submission. **A 409 must move focus to the message**, or a screen-reader user never learns their slot was taken and simply sees a form that appears to have done nothing.
- 409 and 429 are not interchangeable. Announcing the wrong one tells a rate-limited user their slot is gone when it is not.
- Focus is visible wherever it lands, in a sensible order. Never `outline: none` without a replacement that meets the bar in [DESIGN.md](../DESIGN.md).

## Disabled controls

**Use `aria-disabled="true"`, never the native `disabled` attribute.**

Native `disabled` removes the control from the tab order entirely, so a keyboard user tabbing through the `/booking` form reaches the last field and then nothing — no submit button, no explanation, no way to discover why. `aria-disabled` keeps it focusable and announced; refuse the press in code instead.

```tsx
// WRONG — unreachable, unannounced, and it looks correct
<button disabled>Kirim</button>

// RIGHT — focusable, announced, press refused in the handler
<button aria-disabled={!ready} onClick={(e) => { if (!ready) return e.preventDefault(); submit(); }}>
  Kirim
</button>
```

The pull toward native `disabled` is strong: it is shorter, it is what the platform suggests, and it produces a control that looks right while being unreachable. The slot cell and date pill already follow this; the submit button was the one place that broke it.

## Keyboard

- Everything operable by keyboard, **including the file upload** — a click-only upload control locks out keyboard users at the conversion point.
- Slot cells are real `<button>`s. A `<div>` with an `onClick` is not reachable, not announced, and not activated by Enter or Space.

## Targets

- Touch targets ≥ 44px. The order-section slot grid at 375px tests this hardest — nine cells in a small viewport is where the temptation to shrink them appears.

## Status is information, not decoration

A booking state the visitor cannot read is a booking state they will get wrong. No status is ever expressed as a single hue: each is a surface + border + text triple chosen together so the label passes AA. The values are in [DESIGN.md](../DESIGN.md).

The label carries the meaning too — "Sudah lewat" against "Terisi" is what satisfies WCAG 1.4.1, because colour is never the only means.

---

## Per-section gate, not an end-of-phase sweep

Keyboard navigation, `prefers-reduced-motion`, and Lighthouse mobile ≥ 85 are verified **as each section merges**. Accessibility debt is far cheaper to fix one section at a time than across five.
