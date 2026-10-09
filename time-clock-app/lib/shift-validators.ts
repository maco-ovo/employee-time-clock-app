// Owner: C (built by A)
// Input checks for the admin shift routes. Times from the admin UI are company-local strings
// like "2026-10-08T17:00" (what <input type="datetime-local"> produces). The database converts
// them to real instants using COMPANY_TIMEZONE, so no timezone math happens in JavaScript.

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

const REASON_MIN = 3;
const REASON_MAX = 500;

// "YYYY-MM-DD" and a real calendar day (rejects 2026-02-30).
export function isDay(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = DAY.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

// "YYYY-MM-DDTHH:mm" with a real day and a real time.
export function isLocalDateTime(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = LOCAL_DATE_TIME.exec(value);
  if (!match) return false;
  if (!isDay(`${match[1]}-${match[2]}-${match[3]}`)) return false;
  return Number(match[4]) <= 23 && Number(match[5]) <= 59;
}

function asObject(body: unknown): Record<string, unknown> | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return null;
  return body as Record<string, unknown>;
}

function parseReason(value: unknown): Result<string> {
  if (typeof value !== "string") return { ok: false, error: "A reason is required" };
  const reason = value.trim();
  if (reason.length < REASON_MIN) {
    return { ok: false, error: `Please give a reason (at least ${REASON_MIN} characters)` };
  }
  if (reason.length > REASON_MAX) {
    return { ok: false, error: `Reason must be ${REASON_MAX} characters or fewer` };
  }
  return { ok: true, value: reason };
}

// POST /api/admin/shifts/:id/close   { clockOut, reason }
export function parseCloseShift(body: unknown): Result<{ clockOut: string; reason: string }> {
  const input = asObject(body);
  if (!input) return { ok: false, error: "Invalid request body" };
  if (!isLocalDateTime(input.clockOut)) {
    return { ok: false, error: "Clock-out must be a date and time like 2026-10-08T17:00" };
  }
  const reason = parseReason(input.reason);
  if (!reason.ok) return reason;
  return { ok: true, value: { clockOut: input.clockOut, reason: reason.value } };
}

// PATCH /api/admin/shifts/:id   { clockIn?, clockOut?, reason }
export function parseEditShift(
  body: unknown,
): Result<{ clockIn?: string; clockOut?: string; reason: string }> {
  const input = asObject(body);
  if (!input) return { ok: false, error: "Invalid request body" };

  const value: { clockIn?: string; clockOut?: string; reason: string } = { reason: "" };

  if (input.clockIn !== undefined) {
    if (!isLocalDateTime(input.clockIn)) {
      return { ok: false, error: "Clock-in must be a date and time like 2026-10-08T09:00" };
    }
    value.clockIn = input.clockIn;
  }
  if (input.clockOut !== undefined) {
    if (!isLocalDateTime(input.clockOut)) {
      return { ok: false, error: "Clock-out must be a date and time like 2026-10-08T17:00" };
    }
    value.clockOut = input.clockOut;
  }
  if (value.clockIn === undefined && value.clockOut === undefined) {
    return { ok: false, error: "Change the clock-in or the clock-out time" };
  }

  const reason = parseReason(input.reason);
  if (!reason.ok) return reason;
  value.reason = reason.value;
  return { ok: true, value };
}

// ?from=YYYY-MM-DD&to=YYYY-MM-DD (both included)
export function parseDayRange(params: URLSearchParams): Result<{ from: string; to: string }> | null {
  const from = params.get("from");
  const to = params.get("to");
  if (from === null && to === null) return null; // not given: caller uses the current week
  if (!isDay(from) || !isDay(to) || from > to) {
    return { ok: false, error: "from and to must be dates like 2026-09-28, with from before to" };
  }
  return { ok: true, value: { from, to } };
}
