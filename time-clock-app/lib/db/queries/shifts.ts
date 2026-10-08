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
