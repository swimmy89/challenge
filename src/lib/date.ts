import { formatInTimeZone } from "date-fns-tz";

export const APP_TZ = "Asia/Tokyo";
// Asia/Tokyo has no DST, so the UTC offset is always exactly +9h.
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** "yyyy-MM-dd" for the given instant, read in Asia/Tokyo wall-clock time. */
export function dateKeyJST(date: Date = new Date()): string {
  return formatInTimeZone(date, APP_TZ, "yyyy-MM-dd");
}

/** The instant corresponding to JST midnight of the given "yyyy-MM-dd" key. */
export function dateKeyToInstant(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) - JST_OFFSET_MS);
}

/** Today's JST midnight, as a stored instant. */
export function startOfTodayJST(): Date {
  return dateKeyToInstant(dateKeyJST());
}

export function formatTimeJST(date: Date): string {
  return formatInTimeZone(date, APP_TZ, "HH:mm");
}

export function formatDateLabelJST(date: Date): string {
  const weekday = ["日", "月", "火", "水", "木", "金", "土"];
  const key = dateKeyJST(date);
  const [, m, d] = key.split("-").map(Number);
  const zonedForWeekday = new Date(dateKeyToInstant(key).getTime());
  const dow = weekday[
    new Date(zonedForWeekday.getTime() + 9 * 60 * 60 * 1000).getUTCDay()
  ];
  return `${m}月${d}日(${dow})`;
}
