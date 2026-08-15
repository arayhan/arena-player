import type { Metadata } from "next";

import { BookingEntry } from "@/modules/booking-form/BookingEntry";

// src/app/ is the composition layer and nothing else — same boundary
// src/app/page.tsx already follows. All three ways this route can be entered
// (valid, unusable, expired) are decided in the module, not here.
export const metadata: Metadata = {
  // A PASTED LINK IN A GROUP CHAT IS A STATED TRAFFIC PATH for this route, and
  // it survived the 2026-08-15 change that gave `/` a direct link here: most
  // visitors now arrive from the landing page, but a link forwarded into a
  // chat is still read by people who have never seen it. The region therefore
  // has to survive in the metadata rather than only in the page.
  title: "Formulir Booking — Arena Player Lombok",
  description:
    "Lengkapi data tim dan unggah bukti transfer DP untuk booking lapangan mini soccer Arena Player di Lombok.",
};

// searchParams is typed explicitly rather than through the generated
// `PageProps` helper. That global lives in .next/dev/types/, which only
// exists after `next dev` or `next build` has run, so using it makes
// `pnpm typecheck` — and therefore `pnpm check` — fail on a fresh clone with
// "Cannot find name 'PageProps'". Same reasoning src/app/layout.tsx already
// records for `LayoutProps`.
export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; time?: string }>;
}) {
  const { date, time } = await searchParams;
  return <BookingEntry date={date} time={time} />;
}
