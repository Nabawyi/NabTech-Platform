/**
 * Converts a 24-hour time string (HH:MM) to 12-hour format with AM/PM.
 * Used consistently across all student-facing time displays.
 *
 * @example
 * formatTime("18:00") → "6:00 PM"
 * formatTime("09:30") → "9:30 AM"
 * formatTime("غير محدد") → "لم يحدد بعد"
 */
export function formatTime(time: string | null | undefined): string {
  if (!time || time === "غير محدد" || !time.includes(":")) {
    return "لم يحدد بعد";
  }
  const [hourStr, minuteStr] = time.split(":");
  const hour24 = parseInt(hourStr, 10);
  if (isNaN(hour24)) return time;

  const ampm = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minuteStr} ${ampm}`;
}

/**
 * Formats a start–end time range from two 24-hour strings.
 *
 * @example
 * formatTimeRange("09:00", "11:00") → "9:00 AM – 11:00 AM"
 */
export function formatTimeRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  if (!start && !end) return "لم يحدد بعد";
  if (!end || end === "غير محدد") return formatTime(start);
  if (!start || start === "غير محدد") return formatTime(end);
  return `${formatTime(start)} – ${formatTime(end)}`;
}
