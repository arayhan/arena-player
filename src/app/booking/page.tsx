import type { Metadata } from "next";

import { BookingEntry } from "@/modules/booking-form/booking-entry";

// src/app/ is the composition layer and nothing else — same boundary
// src/app/page.tsx already follows. All three ways this route can be entered
// (valid, unusable, expired) are decided in the module, not here.
export const metadata: Metadata = {
  title: "Formulir Booking — Arena Player",
  description:
    "Lengkapi data tim dan unggah bukti transfer DP untuk booking lapangan Arena Player.",
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
