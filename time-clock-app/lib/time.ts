// Owner: B
// Company timezone helpers. All wall-clock math in this app happens in
// COMPANY_TIMEZONE (an IANA name such as "America/Toronto"); the database
// stores instants (timestamptz) and renders them with `AT TIME ZONE`.

// Company timezone, e.g. "America/Toronto".
export function companyTimeZone(): string {
	const tz = process.env.COMPANY_TIMEZONE
	if (!tz) throw new Error("COMPANY_TIMEZONE is not set")
	return tz
}

// Zero-padded part map from Intl.DateTimeFormat, keyed by part type.
function zoneParts(date: Date, tz: string) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: tz,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).formatToParts(date)
	const get = (type: string) =>
		parts.find((p) => p.type === type)?.value ?? "0"
	return {
		year: get("year"),
		month: get("month"),
		day: get("day"),
		hour: get("hour"),
		minute: get("minute"),
	}
}

// "YYYY-MM-DD" of the given instant in the company timezone.
export function startDayInZone(date: Date, tz: string): string {
	const { year, month, day } = zoneParts(date, tz)
	return `${year}-${month}-${day}`
}

// "YYYY-MM-DD HH:MM" wall-clock time in the given timezone.
// The employee UI shows the "HH:MM" tail and parses the whole string,
// so the space separator and 24-hour clock are part of the contract.
export function formatInZone(date: Date, tz: string): string {
	const { year, month, day, hour, minute } = zoneParts(date, tz)
	return `${year}-${month}-${day} ${hour}:${minute}`
}

// Minutes since midnight (0-1439) of the given instant in the given timezone.
export function minutesSinceMidnightInZone(date: Date, tz: string): number {
	const { hour, minute } = zoneParts(date, tz)
	return Number(hour) * 60 + Number(minute)
}
