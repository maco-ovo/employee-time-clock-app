// Owner: C (built by A)
// Display helpers for the admin pages. Server-side only: times are shown in the company timezone.
// TODO: switch to the helpers in lib/time.ts when Owner B finishes it.

function companyTimeZone(): string {
	const tz = process.env.COMPANY_TIMEZONE;
	if (!tz) throw new Error("COMPANY_TIMEZONE is not set");
	return tz;
}

// "9:02 AM"
export function formatTime(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
		timeZone: companyTimeZone(),
	}).format(date);
}

// "Wed, Oct 8"
export function formatDay(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		timeZone: companyTimeZone(),
	}).format(date);
}

// "Oct 8, 9:02 AM"
export function formatDateTime(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
		timeZone: companyTimeZone(),
	}).format(date);
}

// 450 -> "7h 30m", 45 -> "45m", 0 -> "0m"
export function formatDuration(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	if (hours === 0) return `${rest}m`;
	return `${hours}h ${String(rest).padStart(2, "0")}m`;
}

// ---- Calendar days written as "YYYY-MM-DD" (no timezone involved) ----

function dayToUtc(day: string): Date {
	return new Date(`${day}T12:00:00Z`);
}

// "Oct 5"
export function formatDayString(day: string): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	}).format(dayToUtc(day));
}

export function addDays(day: string, amount: number): string {
	const date = dayToUtc(day);
	date.setUTCDate(date.getUTCDate() + amount);
	return date.toISOString().slice(0, 10);
}

// Number of days from "from" to "to", both included.
export function countDays(from: string, to: string): number {
	return (
		Math.round(
			(dayToUtc(to).getTime() - dayToUtc(from).getTime()) / 86_400_000,
		) + 1
	);
}
