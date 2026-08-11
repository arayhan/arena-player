import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

// TODO(content): hero copy — the Indonesian title and meta description are
// decided in Phase 1b task 2 alongside the type scale, because a three-word
// headline and a twelve-word one need different sizes. Do not invent them.
export const metadata: Metadata = {
  title: "Arena Player",
  description: "Booking lapangan mini soccer Arena Player.",
};

// lang is "id": every string a visitor reads on this site is Indonesian.
// Leaving it "en" makes a screen reader pronounce Indonesian copy with English
// phonemes, which is the same defect the DESIGN.html critique already flagged.
//
// No web font is loaded yet, deliberately. DESIGN.md names Orbitron and Inter,
// but the art direction that confirms them is Phase 1b task 1 — wiring faces
// here would mean choosing twice.
// Props typed explicitly rather than with Next's generated `LayoutProps<"/">`.
// That global lives in .next/dev/types/, which only exists after `next dev` or
// `next build` has run — so using it made `pnpm typecheck`, and therefore
// `pnpm check`, FAIL on a fresh clone with "Cannot find name 'LayoutProps'".
// That is CI's exact order: install, then check. Verified on a real clone.
//
// LayoutProps buys typed route params; the root route has none, so this costs
// nothing and removes a build artifact from the dependency graph of the one
// command every doc tells you to run first.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      {/*
        This layout stays a SERVER component. Providers is the client boundary
        and holds nothing but the QueryClient and the dev mock gate, so the
        boundary sits as far down as it can while still wrapping every route.
      */}
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
