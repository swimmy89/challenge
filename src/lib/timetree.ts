import ical from "node-ical";
import { dateKeyJST, dateKeyToInstant } from "@/lib/date";

export type ScheduleEvent = {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
};

function isAllDay(date: Date): boolean {
  return Boolean((date as Date & { dateOnly?: boolean }).dateOnly);
}

/**
 * Fetches the TimeTree ICS feed and returns events overlapping "today" in
 * Asia/Tokyo time, expanding recurring events (RRULE) as needed.
 */
export async function fetchTodaySchedule(
  icsUrl: string
): Promise<ScheduleEvent[]> {
  const dayKey = dateKeyJST();
  const dayStart = dateKeyToInstant(dayKey);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const parsed = await ical.async.fromURL(icsUrl);
  const events: ScheduleEvent[] = [];

  for (const component of Object.values(parsed)) {
    if (!component || component.type !== "VEVENT") continue;

    const summary = component.summary?.toString() ?? "(無題の予定)";
    const durationMs =
      component.end && component.start
        ? component.end.getTime() - component.start.getTime()
        : 0;

    if (component.rrule) {
      const occurrences = component.rrule.between(dayStart, dayEnd, true);
      for (const occurrenceStart of occurrences) {
        const dateKey = occurrenceStart.toISOString().slice(0, 10);
        if (component.exdate?.[dateKey]) continue;

        events.push({
          uid: `${component.uid}-${occurrenceStart.getTime()}`,
          title: summary,
          start: occurrenceStart,
          end: new Date(occurrenceStart.getTime() + durationMs),
          allDay: isAllDay(component.start),
        });
      }
      continue;
    }

    if (!component.start) continue;
    const start = component.start;
    const end = component.end ?? component.start;
    const overlapsToday = start < dayEnd && end > dayStart;
    if (!overlapsToday) continue;

    events.push({
      uid: component.uid ?? `${summary}-${start.getTime()}`,
      title: summary,
      start,
      end,
      allDay: isAllDay(start),
    });
  }

  events.sort((a, b) => a.start.getTime() - b.start.getTime());
  return events;
}
