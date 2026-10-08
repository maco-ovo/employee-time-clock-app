// Owner: A
// Seed: 1 admin + 5 employees + two weeks of closed shifts. Safe to run again.
//   npm run seed
import "./load-env";
import { prisma } from "../lib/db";
import { hashPassword } from "../lib/auth/password";

// ---- Test accounts (also listed in the README; these are not real credentials) ----
const ADMIN_PASSWORD = "Admin123!";
const EMPLOYEE_PASSWORD = "Employee123!";

const SEED_USERS: {
	name: string;
	email: string;
	role: "ADMIN" | "EMPLOYEE";
	password: string;
	jobTitle?: string;
	location?: string;
}[] = [
	{
		name: "Admin User",
		email: "admin@abc.test",
		role: "ADMIN",
		password: ADMIN_PASSWORD,
	},
	{
		name: "Alex Kim",
		email: "alex@abc.test",
		role: "EMPLOYEE",
		password: EMPLOYEE_PASSWORD,
		jobTitle: "Warehouse Associate",
		location: "East Hub",
	},
	{
		name: "Sam Lee",
		email: "sam@abc.test",
		role: "EMPLOYEE",
		password: EMPLOYEE_PASSWORD,
		jobTitle: "Forklift Operator",
		location: "East Hub",
	},
	{
		name: "Jo Park",
		email: "jo@abc.test",
		role: "EMPLOYEE",
		password: EMPLOYEE_PASSWORD,
		jobTitle: "Inventory Coordinator",
		location: "West Hub",
	},
	{
		name: "Mia Chen",
		email: "mia@abc.test",
		role: "EMPLOYEE",
		password: EMPLOYEE_PASSWORD,
		jobTitle: "Warehouse Associate",
		location: "West Hub",
	},
	{
		name: "Ken Sato",
		email: "ken@abc.test",
		role: "EMPLOYEE",
		password: EMPLOYEE_PASSWORD,
		jobTitle: "Forklift Operator",
		location: "West Hub",
	},
];

const timeZone = process.env.COMPANY_TIMEZONE;
if (!timeZone) {
	throw new Error(
		"COMPANY_TIMEZONE is not set (an IANA name such as America/New_York)",
	);
}

// Offset (ms) of the time zone from UTC at the given instant.
function zoneOffsetMs(date: Date, tz: string): number {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: tz,
		hourCycle: "h23",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	}).formatToParts(date);
	const get = (type: string) =>
		Number(parts.find((p) => p.type === type)?.value);
	const asUtc = Date.UTC(
		get("year"),
		get("month") - 1,
		get("day"),
		get("hour"),
		get("minute"),
		get("second"),
	);
	return asUtc - date.getTime();
}

// The instant at which the wall clock in `tz` shows the given date and time.
function zonedTime(
	y: number,
	m: number,
	d: number,
	hour: number,
	minute: number,
	tz: string,
): Date {
	const guess = Date.UTC(y, m - 1, d, hour, minute);
	return new Date(guess - zoneOffsetMs(new Date(guess), tz));
}

function todayInZone(tz: string): { y: number; m: number; d: number } {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: tz,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(new Date());
	const get = (type: string) =>
		Number(parts.find((p) => p.type === type)?.value);
	return { y: get("year"), m: get("month"), d: get("day") };
}

function buildShifts(userId: string, employeeIndex: number, tz: string) {
	const today = todayInZone(tz);
	const shifts: { userId: string; clockIn: Date; clockOut: Date }[] = [];

	for (let daysAgo = 1; daysAgo <= 14; daysAgo++) {
		const day = new Date(Date.UTC(today.y, today.m - 1, today.d - daysAgo));
		const weekday = day.getUTCDay();
		if (weekday === 0 || weekday === 6) continue; // no weekend shifts

		const y = day.getUTCFullYear();
		const m = day.getUTCMonth() + 1;
		const d = day.getUTCDate();
		const jitter = (employeeIndex * 7 + daysAgo * 3) % 20; // small deterministic variation

		// Morning shift, then a lunch break, then an afternoon shift (all inside 8:00-17:00).
		shifts.push({
			userId,
			clockIn: zonedTime(y, m, d, 8, jitter, tz),
			clockOut: zonedTime(y, m, d, 12, jitter % 10, tz),
		});
		shifts.push({
			userId,
			clockIn: zonedTime(y, m, d, 12, 45 + (jitter % 5), tz),
			clockOut: zonedTime(y, m, d, 16, 50 - (jitter % 10), tz),
		});
	}
	return shifts;
}

async function main() {
	let employeeIndex = 0;

  for (const seedUser of SEED_USERS) {
    const user = await prisma.user.upsert({
      where: { email: seedUser.email },
      update: {},
      create: {
        name: seedUser.name,
        email: seedUser.email,
        role: seedUser.role,
        passwordHash: await hashPassword(seedUser.password),
      },
    });

		if (seedUser.role === "EMPLOYEE") {
			employeeIndex++;
			const existing = await prisma.shift.count({ where: { userId: user.id } });
			if (existing === 0) {
				await prisma.shift.createMany({
					data: buildShifts(user.id, employeeIndex, timeZone as string),
				});
			}
		}
	}

	console.log("Seed done.");
	console.log("Admin:    admin@abc.test / " + ADMIN_PASSWORD);
	console.log("Employee: alex@abc.test / " + EMPLOYEE_PASSWORD);
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
