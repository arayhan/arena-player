import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

// SELF-HOSTED THROUGH next/font, NEVER A CDN <link>. architecture.md records
// next/font as load-bearing for the no-CLS and LCP guarantees, which makes it
// non-swappable rather than a preference: it inlines the font-face, preloads
// the file from our own origin, and sizes the fallback so nothing shifts when
// the real face lands. A CDN <link> gives up all three.
//
// THE DISPLAY FACE IS PANCHANG, SELF-HOSTED FROM FILES IN THIS REPO.
// Chosen by the user 2026-08-13, from Fontshare, whose licence reads verbatim:
// "All Fontshare fonts are 100% free for personal and commercial use." That was
// checked before a byte was downloaded, because the previous font request was a
// demo licensed for PERSONAL USE ONLY and shipping it would have put the CLIENT
// in breach rather than the studio.
//
// `next/font/local`, not the Fontshare CDN. Panchang is not on Google Fonts, so
// the three weights live in `src/app/fonts/` and Next hashes and serves them
// from our own origin. architecture.md records `next/font` as load-bearing for
// the no-CLS and LCP guarantees, and that survives a redesign: a CDN <link>
// would give up the preload, the inlined face, and the sized fallback at once.
//
// WHY THREE STATIC WEIGHTS RATHER THAN A VARIABLE FILE: Fontshare ships Panchang
// as separate cuts, and the system needs exactly three — 800 for display, 700
// for headings, 500 for numerals and slot times. Declaring only what is used
// keeps the browser from synthesising a weight, which is what the previous face
// was silently doing for two of its weights.
//
// PANCHANG IS WIDE, AND THAT IS A LAYOUT FACT RATHER THAN A DEFECT. `PILIH JAM.`
// measures 427.5px at 57.25px against the old 343px content box — the number
// that proved the previous hero could not survive this face. The layout was
// rebuilt around it rather than the face being shrunk to fit the layout.
const display = localFont({
  src: [
    { path: "./fonts/Panchang-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Panchang-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Panchang-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
  // The fallback the browser paints before Panchang lands. Named explicitly so
  // `next/font` can size-adjust against it; left to chance, the swap is where
  // CLS comes back.
  fallback: ["system-ui", "sans-serif"],
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// TODO(content): hero copy — chosen by the user in Phase 1b task 2 and
// recorded in docs/DESIGN.md. Still a placeholder in the sense that matters:
// it is drafted in-house, so if the client supplies their own wording it
// swaps here, in the hero, and in DESIGN.md together. Unlike the Ketentuan,
// which is verbatim client content and must never be rewritten.
// LOMBOK, NOT INDONESIA. PRODUCT.md narrowed the market to Lombok NTB and is
// explicit that nothing should read as a national platform: this is one
// physical field, and the copy is written for someone searching "lapangan mini
// soccer Lombok / Mataram". A description that says "Indonesia" competes for a
// query nobody here can win and misses the one that matters.
const TITLE = "Arena Player — Booking Lapangan Mini Soccer Lombok";
const DESCRIPTION =
  "Cek jadwal lapangan mini soccer Arena Player di Lombok. Jam kosong hari ini tampil langsung, pesan lewat WhatsApp.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // The favicon and apple-touch icon are NOT declared here. `src/app/icon.png`
  // and `src/app/apple-icon.png` are Next file conventions — the framework
  // emits the tags, hashes the filenames, and declaring them again by hand
  // would be a second source that drifts the first time one is replaced.
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "id_ID",
    siteName: "Arena Player",
    // The full lockup rather than the mark. A share preview is seen at a
    // glance in a chat list, where a bare monogram identifies nothing.
    images: [{ url: "/logo.png", width: 1042, height: 671, alt: "Arena Player" }],
  },
  twitter: {
    // summary_large_image, not summary. PRODUCT.md flags the link being pasted
    // into group chats as a real traffic path, and the large card is what makes
    // a pasted link legible in a thread rather than a favicon-sized crumb.
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
};

// lang is "id": every string a visitor reads on this site is Indonesian.
// Leaving it "en" makes a screen reader pronounce Indonesian copy with English
// phonemes, which is the same defect the DESIGN.html critique already flagged.
//
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
    <html lang="id" className={`${display.variable} ${body.variable} h-full antialiased`}>
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
