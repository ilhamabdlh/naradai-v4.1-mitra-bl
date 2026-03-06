/**
 * Parse and format date strings for chart axes (e.g. "Dec 20", "Jan 01").
 * Infers year when data spans Dec → Jan so X-axis shows e.g. "Dec 20, 2025", "Jan 1, 2026".
 */

const MONTH_NAMES: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

const MONTH_SHORT: Record<number, string> = {
  0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr", 4: "May", 5: "Jun",
  6: "Jul", 7: "Aug", 8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec",
};

/**
 * Get reference year for "Jan" when data spans Dec → Jan (e.g. Dec 20, 2025 – Jan 19, 2026).
 * If we're in Nov/Dec, assume "Jan" in data is next year.
 */
function getRefYearForYearBoundary(dateStrings: string[]): number {
  const now = new Date();
  let refYear = now.getFullYear();
  const hasJan = dateStrings.some((s) => /^Jan\s/i.test(s.trim()));
  const hasDec = dateStrings.some((s) => /^Dec\s/i.test(s.trim()));
  if (hasJan && hasDec && now.getMonth() >= 10) {
    refYear += 1;
  }
  return refYear;
}

/**
 * Parse "Dec 20", "Jan 01", "Jan 1" or ISO date string to Date.
 * When dateStrings are provided and span Dec + Jan: Dec = refYear - 1, Jan = refYear
 * (e.g. data 20 Des 2025 – 19 Jan 2026).
 * Avoids using new Date("Jan 1") which JavaScript parses as year 2001.
 */
export function parseChartDate(dateStr: string, dateStrings?: string[]): Date {
  const trimmed = dateStr.trim();
  const looksLikeMonthDay = /^[A-Za-z]+\s+\d{1,2}$/.test(trimmed);
  if (!looksLikeMonthDay) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    const monthName = parts[0];
    const day = parseInt(parts[1], 10);
    const month = MONTH_NAMES[monthName];
    if (month !== undefined && !isNaN(day)) {
      const refYear = dateStrings?.length
        ? getRefYearForYearBoundary(dateStrings)
        : new Date().getFullYear();
      const hasJan = dateStrings?.some((s) => /^Jan\s/i.test(s.trim()));
      const hasDec = dateStrings?.some((s) => /^Dec\s/i.test(s.trim()));
      const year =
        hasJan && hasDec && month >= 9 ? refYear - 1 : refYear;
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  if (parts.length === 1 && MONTH_NAMES[parts[0]] !== undefined) {
    const month = MONTH_NAMES[parts[0]];
    const refYear = dateStrings?.length
      ? getRefYearForYearBoundary(dateStrings)
      : new Date().getFullYear();
    const hasJan = dateStrings?.some((s) => /^Jan\s/i.test(s.trim()));
    const hasDec = dateStrings?.some((s) => /^Dec\s/i.test(s.trim()));
    const year =
      hasJan && hasDec && month >= 9 ? refYear - 1 : refYear;
    const d = new Date(year, month, 1);
    if (!isNaN(d.getTime())) return d;
  }

  return new Date(NaN);
}

/**
 * Format for display with year: "Dec 20, 2025", "Jan 1, 2026", or "Dec" for month-only.
 */
export function formatChartDateWithYear(dateStr: string, dateStrings?: string[]): string {
  const d = parseChartDate(dateStr, dateStrings);
  if (isNaN(d.getTime())) return dateStr;
  const month = MONTH_SHORT[d.getMonth()] ?? "?";
  const day = d.getDate();
  const year = d.getFullYear();
  if (dateStr.trim().split(/\s+/).length === 1) {
    return `${month} ${year}`;
  }
  return `${month} ${day}, ${year}`;
}

/**
 * Format for chart axis with year: "Dec 20, 2025", "Jan 1, 2026".
 * Accepts "Dec 20", "Jan 01" or ISO "YYYY-MM-DD".
 */
export function formatChartDateMonthDay(dateStr: string, dateStrings?: string[]): string {
  const d = parseChartDate(dateStr, dateStrings);
  if (isNaN(d.getTime())) return dateStr;
  const month = MONTH_SHORT[d.getMonth()] ?? "?";
  const day = d.getDate();
  const year = d.getFullYear();
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 1 && /^[A-Za-z]+$/.test(parts[0])) return `${month} ${year}`;
  return `${month} ${day}, ${year}`;
}

/**
 * Format for chart X-axis only: "Dec 20", "Jan 1" (no year).
 * Use when data spans Dec 2025 → Jan 2026 and year should be hidden on axis.
 */
export function formatChartDateAxisLabel(dateStr: string, dateStrings?: string[]): string {
  const d = parseChartDate(dateStr, dateStrings);
  if (isNaN(d.getTime())) return dateStr;
  const month = MONTH_SHORT[d.getMonth()] ?? "?";
  const day = d.getDate();
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 1 && /^[A-Za-z]+$/.test(parts[0])) return month;
  return `${month} ${day}`;
}

/**
 * Returns the Sunday of the week containing `d`, as a local "YYYY-MM-DD" string.
 * Uses Sunday as week-start so data within Sun–Sat stays in one bucket.
 * Formats using local date components (not UTC) to avoid timezone-shift bugs.
 */
export function getWeekStart(d: Date): string {
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - d.getDay()); // d.getDay() === 0 means it's already Sunday
  const year  = sunday.getFullYear();
  const month = String(sunday.getMonth() + 1).padStart(2, "0");
  const day   = String(sunday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
