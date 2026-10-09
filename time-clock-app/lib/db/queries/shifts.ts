// Owner: B + C
// TODO: SQL for timesheet, weekly totals, report, live list. No totals computed in JS.
import { prisma } from "@/lib/db";

// Company timezone, e.g. "America/Toronto".
// TODO: use the helper from lib/time.ts when Owner B finishes it.
function companyTimeZone(): string {
  const tz = process.env.COMPANY_TIMEZONE;
  if (!tz) throw new Error("COMPANY_TIMEZONE is not set");
  return tz;
}

// ---------------------------------------------------------------------------
// Owner B: employee timesheet
// ---------------------------------------------------------------------------

// The signed-in employee's shifts with weekly totals. Everything is
// formatted and summed by the database in the company timezone; no
// totals are computed in JavaScript. Shifts are limited to the last
// 52 weeks, newest first.
export async function getEmployeeTimesheet(
	userId: string,
): Promise<{
	shifts: {
		id: string
		clockIn: string
		clockOut: string | null
		startDay: string
		durationMinutes: number | null
	}[]
	weeks: { weekStart: string; minutes: number; shifts: number }[]
}> {
	const tz = companyTimeZone()

	type ShiftRow = {
		id: string
		clock_in: string
		clock_out: string | null
		start_day: string
		duration_minutes: number | null
	}
	type WeekRow = { week_start: string; minutes: number; shifts: number }

	const [shifts, weeks] = await Promise.all([
		prisma.$queryRaw<ShiftRow[]>`
			SELECT
				s.id,
				to_char(s.clock_in AT TIME ZONE ${tz}, 'YYYY-MM-DD HH24:MI') AS clock_in,
				to_char(s.clock_out AT TIME ZONE ${tz}, 'YYYY-MM-DD HH24:MI') AS clock_out,
				to_char(s.clock_in AT TIME ZONE ${tz}, 'YYYY-MM-DD') AS start_day,
				(EXTRACT(EPOCH FROM (s.clock_out - s.clock_in)) / 60)::int AS duration_minutes
			FROM shifts s
			WHERE s.user_id = ${userId}
				AND s.clock_in >= now() - interval '52 weeks'
			ORDER BY s.clock_in DESC
		`,
		prisma.$queryRaw<WeekRow[]>`
			SELECT
				to_char(date_trunc('week', s.clock_in AT TIME ZONE ${tz}), 'YYYY-MM-DD') AS week_start,
				COALESCE(SUM(EXTRACT(EPOCH FROM (s.clock_out - s.clock_in)) / 60), 0)::int AS minutes,
				COUNT(*)::int AS shifts
			FROM shifts s
			WHERE s.user_id = ${userId}
				AND s.clock_in >= now() - interval '52 weeks'
			GROUP BY 1
			ORDER BY 1 DESC
		`,
	])

	return {
		shifts: shifts.map((s) => ({
			id: s.id,
			clockIn: s.clock_in,
			clockOut: s.clock_out,
			startDay: s.start_day,
			durationMinutes: s.duration_minutes,
		})),
		weeks: weeks.map((w) => ({
			weekStart: w.week_start,
			minutes: w.minutes,
			shifts: w.shifts,
		})),
	}
}

// ---------------------------------------------------------------------------
// Owner C: admin queries
// ---------------------------------------------------------------------------

// Who is clocked in right now (clock_out is empty), oldest first.
export async function getLiveShifts() {
  return prisma.shift.findMany({
    where: { clockOut: null },
    orderBy: { clockIn: "asc" },
    select: {
      id: true,
      clockIn: true,
      user: { select: { id: true, name: true, email: true, location: true } },
    },
  });
}

// Numbers for the 4 cards at the top of the admin page.
// The week starts on Monday in the company timezone. Totals are added up by the database.
export async function getAdminStats() {
  const tz = companyTimeZone();

  const rows = await prisma.$queryRaw<{ shifts: number; minutes: number }[]>`
    SELECT
      COUNT(*)::int AS shifts,
      COALESCE(SUM(EXTRACT(EPOCH FROM (clock_out - clock_in)) / 60), 0)::int AS minutes
    FROM shifts
    WHERE (clock_in AT TIME ZONE ${tz}) >= date_trunc('week', now() AT TIME ZONE ${tz})
  `;

  const clockedInNow = await prisma.shift.count({ where: { clockOut: null } });
  const activeEmployees = await prisma.user.count({
    where: { role: "EMPLOYEE", isActive: true },
  });

  return {
    clockedInNow,
    activeEmployees,
    weekShifts: rows[0].shifts,
    weekMinutes: rows[0].minutes,
  };
}

// Total minutes per employee between two days ("YYYY-MM-DD", both included).
// Used by the weekly hours table and the reports page.
export async function getHoursByEmployee(from: string, to: string) {
  const tz = companyTimeZone();

  return prisma.$queryRaw<{ id: string; name: string; email: string; location: string; minutes: number }[]>`
    SELECT
      u.id,
      u.name,
      u.email,
      u.location,
      COALESCE(SUM(EXTRACT(EPOCH FROM (s.clock_out - s.clock_in)) / 60), 0)::int AS minutes
    FROM users u
    LEFT JOIN shifts s
      ON s.user_id = u.id
      AND (s.clock_in AT TIME ZONE ${tz})::date BETWEEN ${from}::date AND ${to}::date
    WHERE u.role = 'EMPLOYEE'
    GROUP BY u.id, u.name, u.email, u.location
    ORDER BY minutes DESC
  `;
}
