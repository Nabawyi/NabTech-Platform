/**
 * Convert "HH:MM" (24-hour) to "h:mm AM/PM" for display.
 * Never use this for parsing user input; it's display-only.
 */
export function formatTimeTo12Hour(time24: string | null | undefined): string {
  if (!time24 || typeof time24 !== "string") return "---";
  const match = time24.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time24;

  const h24 = Number(match[1]);
  const minutes = match[2];
  if (!Number.isFinite(h24) || h24 < 0 || h24 > 23) return time24;

  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${minutes} ${ampm}`;
}

type TimeParts12 = { hour12: number; minute: number; ampm: "AM" | "PM" };

/**
 * Parse a "h:mm AM/PM" string to "HH:MM" (24-hour) for storage.
 */
export function parseTime12HourTo24Hour(time12: string): string | null {
  const match = time12.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  const hour12 = Number(match[1]);
  const minute = Number(match[2]);
  const ampm = match[3].toUpperCase() as "AM" | "PM";

  if (!Number.isFinite(hour12) || hour12 < 1 || hour12 > 12) return null;
  if (!Number.isFinite(minute) || minute < 0 || minute > 59) return null;

  const h24 = ampm === "AM" ? (hour12 === 12 ? 0 : hour12) : hour12 === 12 ? 12 : hour12 + 12;
  return `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function toTimeOptions(stepMinutes = 30): Array<{ value24: string; label12: string }> {
  const options: Array<{ value24: string; label12: string }> = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      const value24 = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      options.push({ value24, label12: formatTimeTo12Hour(value24) });
    }
  }
  return options;
}

export function parseTime24To12Parts(time24: string): TimeParts12 | null {
  const match = time24.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h24 = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(h24) || h24 < 0 || h24 > 23) return null;
  if (!Number.isFinite(minute) || minute < 0 || minute > 59) return null;

  const ampm: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { hour12, minute, ampm };
}

