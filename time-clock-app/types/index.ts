// Owner: B
// Shared types for the employee clock flow. The /api/clock/* and /api/timesheet
// routes return exactly these shapes; app/employee/[id]/page.tsx consumes them.

// Clock-in instant rendered by the server in the company timezone.
export type CompanyTime = string // "YYYY-MM-DD HH:MM"

// GET /api/clock/status
export type ClockStatus = {
	clockedIn: boolean
	clockIn: CompanyTime | null
}

// One row of the employee timesheet.
export type TimesheetShift = {
	id: string
	clockIn: CompanyTime
	clockOut: CompanyTime | null // null while the shift is still open
	startDay: string // YYYY-MM-DD, company local
	durationMinutes: number | null // null while the shift is still open
}

// Weekly totals, computed by the database (Monday week start, company tz).
export type WeekTotal = {
	weekStart: string // YYYY-MM-DD
	minutes: number
	shifts: number
}

// GET /api/timesheet
export type Timesheet = {
	shifts: TimesheetShift[]
	weeks: WeekTotal[]
}
