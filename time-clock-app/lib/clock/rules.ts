// Owner: B
// Pure rule checks for the time clock. No I/O, no env reads — the caller
// passes the timezone and the instants. Every rule is enforced again by the
// database (see prisma/extra-constraints.sql), these give friendly errors.

import { minutesSinceMidnightInZone } from "@/lib/time"

// The work day runs 08:00-17:00 in the company timezone.
export const WORK_DAY_START_MINUTES = 8 * 60 // 08:00
export const WORK_DAY_END_MINUTES = 17 * 60 // 17:00

// Clock-in must land inside the work day, inclusive.
export function isWithinWorkHours(date: Date, tz: string): boolean {
	const minutes = minutesSinceMidnightInZone(date, tz)
	return (
		minutes >= WORK_DAY_START_MINUTES && minutes <= WORK_DAY_END_MINUTES
	)
}

// Human-readable clock-in window violation, or null when allowed.
export function clockInWindowError(date: Date, tz: string): string | null {
	if (isWithinWorkHours(date, tz)) return null
	const start = WORK_DAY_START_MINUTES
	const end = WORK_DAY_END_MINUTES
	const fmt = (m: number) =>
		`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
	return `Clock in is only allowed between ${fmt(start)} and ${fmt(end)} (company time)`
}

// A user may hold at most one open shift. The service translates
// "an open shift already exists" into this error.
export function doubleClockInError(hasOpenShift: boolean): string | null {
	return hasOpenShift ? "You are already clocked in" : null
}

// Clock-out must come after clock-in (also a database CHECK constraint).
export function clockOutOrderError(
	clockOut: Date,
	clockIn: Date,
): string | null {
	return clockOut > clockIn ? null : "Clock out must be after clock in"
}
