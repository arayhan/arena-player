/**
 * The order section's own helpers: the date row's two formatters, the calendar
 * the 92-day window is redrawn as, and the wa.me message builder.
 *
 * `whatsappLink` HAS NO CALLER IN `src/modules/home/` AS OF 2026-08-15 and is
 * still tested here, because the reason it exists did not change — WhatsApp
 * moved to the far side of the database write, it did not leave the journey.
 * A builder whose tests were deleted the day its call site moved is a builder
 * that comes back wrong.
 */
import { describe, expect, it } from "vitest";

import { BOOKING_WINDOW_DAYS, bookingWindow } from "@/domain/dates";
import { TIME_SLOTS } from "@/domain/slots";

import { calendarMonths, formatPill, whatsappLink } from "./order.utils";

describe("whatsappLink — one destination, now after the write", () => {
  const NUMBER = "6289682620666";

  it("builds the wa.me deep link with the number in wa.me form", () => {
    const url = whatsappLink(NUMBER, "2026-08-11", "20.00 - 21.00");
    expect(url.startsWith(`https://wa.me/${NUMBER}?text=`)).toBe(true);
    // No plus, no spaces, no punctuation — the shape wa.me and the WhatsApp
    // Business API both expect, and the shape domain/phone.ts normalises to.
    expect(url).not.toContain("+");
  });

  it("prefills the message the PRD specifies, with the Indonesian date", () => {
    const url = whatsappLink(NUMBER, "2026-08-11", "20.00 - 21.00");
    expect(decodeURIComponent(url.split("?text=")[1])).toBe(
      "Halo, saya mau booking lapangan Arena Player tanggal 11 Agu 2026 jam 20.00 - 21.00",
    );
  });

  it("percent-encodes the message", () => {
    // The slot contains spaces and the message contains commas; an unencoded
    // href would truncate at the first space in some clients.
    const url = whatsappLink(NUMBER, "2026-08-11", "20.00 - 21.00");
    expect(url).not.toMatch(/\s/);
    expect(url).toContain("%20");
  });

  it("carries the exact slot string, not a reformatted one", () => {
    // uniq_active_slot compares time_slot as TEXT. A slot that arrives at the
    // admin reading "20.00-22.00" is a different slot to the database than
    // "20.00 - 21.00", so the separator survives the round trip verbatim.
    for (const slot of TIME_SLOTS) {
      const decoded = decodeURIComponent(
        whatsappLink(NUMBER, "2026-08-11", slot).split("?text=")[1],
      );
      expect(decoded.endsWith(`jam ${slot}`)).toBe(true);
    }
  });
});

describe("formatPill — Indonesian, and zone-proof", () => {
  it("names the weekday correctly", () => {
    // 2026-08-11 is a Tuesday.
    expect(formatPill("2026-08-11")).toEqual({ day: "Sel", label: "11 Agu" });
  });

  it("uses Indonesian month abbreviations, including the ones that differ", () => {
    // Mei, Agu, Okt and Des are where a copied English list goes wrong.
    expect(formatPill("2026-05-01").label).toBe("1 Mei");
    expect(formatPill("2026-08-01").label).toBe("1 Agu");
    expect(formatPill("2026-10-01").label).toBe("1 Okt");
    expect(formatPill("2026-12-01").label).toBe("1 Des");
  });

  it("does not shift the date across a timezone boundary", () => {
    // The suite pins TZ=UTC, but this is the defect the parse-by-split exists
    // to prevent: new Date("2026-01-01") is UTC midnight, and rendering that
    // anywhere west of Greenwich yields 31 Dec. The label must be the calendar
    // date it was handed, always.
    expect(formatPill("2026-01-01").label).toBe("1 Jan");
    expect(formatPill("2026-12-31").label).toBe("31 Des");
  });

  it("covers every weekday across one week", () => {
    // 2026-08-09 is a Sunday.
    const days = ["2026-08-09", "2026-08-10", "2026-08-11", "2026-08-12"].map(
      (d) => formatPill(d).day,
    );
    expect(days).toEqual(["Min", "Sen", "Sel", "Rab"]);
  });

  it("omits the year by default and prints it on request", () => {
    // The default is the common case — inside one year, four characters a
    // visitor does not need in a row where horizontal space is the constraint.
    expect(formatPill("2027-01-01").label).toBe("1 Jan");
    expect(formatPill("2027-01-01", { withYear: true }).label).toBe("1 Jan 2027");
  });

  it("tells two same-day-of-year dates apart once the window crosses a year", () => {
    // THE DEFECT THIS EXISTS FOR. A 92-day window opened in December reaches
    // into the next year, and without the year these two labels are identical
    // while being different bookable dates.
    expect(formatPill("2026-01-01").label).toBe(formatPill("2027-01-01").label);
    expect(formatPill("2026-01-01", { withYear: true }).label).not.toBe(
      formatPill("2027-01-01", { withYear: true }).label,
    );
  });
});

describe("calendarMonths — the 92-day window as a calendar", () => {
  it("covers every date in the window exactly once, and nothing else", () => {
    const window = bookingWindow(new Date("2026-08-15T04:00:00Z"));
    const bookable = calendarMonths(window)
      .flatMap((m) => m.days)
      .map((d) => d.date)
      .filter((d): d is string => d !== null);

    expect(bookable).toEqual(window);
    expect(bookable).toHaveLength(BOOKING_WINDOW_DAYS);
  });

  it("keeps out-of-window days as cells so the month stays a real grid", () => {
    const [august] = calendarMonths(["2026-08-30", "2026-08-31", "2026-09-01"]);

    // August has 31 days and only two of them are in this window, but all 31
    // squares are present — a calendar with holes punched in it stops being a
    // calendar, and the column a date sits in is the whole reason to draw one.
    expect(august.days).toHaveLength(31);
    expect(august.days.filter((d) => d.date !== null).map((d) => d.date)).toEqual([
      "2026-08-30",
      "2026-08-31",
    ]);
    expect(august.days[0]).toEqual({ date: null, dayOfMonth: 1 });
  });

  it("offsets each month by the weekday its first day falls on, Sunday-first", () => {
    // 1 August 2026 is a Saturday — index 6 in DAY_NAMES — so six blanks
    // precede it. 1 September 2026 is a Tuesday, index 2.
    const [august, september] = calendarMonths(["2026-08-31", "2026-09-01"]);
    expect(august.leading).toBe(6);
    expect(september.leading).toBe(2);
  });

  it("gets February right in a leap year without a table", () => {
    // Date.UTC(year, month, 0) is day zero of the following month. 2028 is a
    // leap year; 2026 is not.
    expect(calendarMonths(["2028-02-01"])[0].days).toHaveLength(29);
    expect(calendarMonths(["2026-02-01"])[0].days).toHaveLength(28);
  });

  it("labels months in Indonesian, unabbreviated, always with the year", () => {
    const labels = calendarMonths(["2026-08-01", "2026-10-01", "2026-12-01", "2027-01-01"]).map(
      (m) => m.label,
    );
    expect(labels).toEqual(["Agustus 2026", "Oktober 2026", "Desember 2026", "Januari 2027"]);
  });

  it("crosses a year boundary in order, with no month merged into another", () => {
    const window = bookingWindow(new Date("2026-12-01T04:00:00Z"));
    const months = calendarMonths(window);

    expect(months.map((m) => m.key)).toEqual(["2026-12", "2027-01", "2027-02", "2027-03"]);
    // The two Januaries a 92-day window could confuse are one month here, and
    // its label carries the year that separates it from any other January.
    expect(new Set(months.map((m) => m.key)).size).toBe(months.length);
  });

  it("does not shift a month across a timezone boundary", () => {
    // The suite pins TZ=UTC, but every Date here is constructed and read in
    // UTC precisely so it would not matter if it did not.
    const [january] = calendarMonths(["2027-01-31"]);
    expect(january.key).toBe("2027-01");
    expect(january.days).toHaveLength(31);
    expect(january.days.at(-1)).toEqual({ date: "2027-01-31", dayOfMonth: 31 });
  });
});
