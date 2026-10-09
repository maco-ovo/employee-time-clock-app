// Owner: C (built by A)
// Admin queries for the employee detail page: one employee's shifts (weekly totals are summed
// by the database), the change history, and the two writes that change a shift
// (close an open shift, correct an existing one). Every write records who, when and why in shift_edits.
//
// The admin rules differ from the employee clock rules on purpose: an admin may set times outside
// 8:00-17:00 (that is the whole point of fixing a forgotten clock-out). What still applies:
// clock-out after clock-in, no times in the future, and no overlap with the employee's other shifts.
import { prisma } from "@/lib/db";

// TODO: use the helper from lib/time.ts when Owner B finishes it (same as lib/db/queries/shifts.ts).
function companyTimeZone(): string {
	const tz = process.env.COMPANY_TIMEZONE;
	if (!tz) throw new Error("COMPANY_TIMEZONE is not set");
	return tz;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export type EmployeeDetail = {
	id: string;
	name: string;
	email: string;
	jobTitle: string | null;
	location: string | null;
	isActive: boolean;
	createdAt: Date;
	clockedInSince: Date | null;
};

// Deactivated employees are included: their history stays visible.
export async function getEmployeeDetail(
	id: string,
): Promise<EmployeeDetail | null> {
	const user = await prisma.user.findFirst({
		where: { id, role: "EMPLOYEE" },
		select: {
			id: true,
			name: true,
			email: true,
			jobTitle: true,
			location: true,
			isActive: true,
			createdAt: true,
			shifts: { where: { clockOut: null }, select: { clockIn: true }, take: 1 },
		},
	});
	if (!user) return null;

	return {
		id: user.id,
		name: user.name,
		email: user.email,
		jobTitle: user.jobTitle,
		location: user.location,
		isActive: user.isActive,
		createdAt: user.createdAt,
		clockedInSince: user.shifts[0]?.clockIn ?? null,
	};
}

// Monday to Sunday of the current week in the company timezone, as "YYYY-MM-DD".
export async function getCurrentWeekRange(): Promise<{
	from: string;
	to: string;
}> {
	const tz = companyTimeZone();
	const rows = await prisma.$queryRaw<{ from_day: string; to_day: string }[]>`
    SELECT
      to_char(date_trunc('week', now() AT TIME ZONE ${tz}), 'YYYY-MM-DD') AS from_day,
      to_char(date_trunc('week', now() AT TIME ZONE ${tz}) + interval '6 days', 'YYYY-MM-DD') AS to_day
  `;
	return { from: rows[0].from_day, to: rows[0].to_day };
}

export type ShiftRow = {
	id: string;
	clockIn: Date;
	clockOut: Date | null; // null = still clocked in
	clockInLocal: string; // "YYYY-MM-DDTHH:mm" in company time, ready for <input type="datetime-local">
	clockOutLocal: string | null;
	weekStart: string; // Monday of the week the shift started in, "YYYY-MM-DD"
	minutes: number | null; // null while the shift is open
	weekMinutes: number; // total of the closed shifts in this row's week (within the range)
	rangeMinutes: number; // total of the closed shifts in the whole range
	editCount: number;
};

// Shifts that STARTED on a day between from and to (both included, company timezone),
// newest first. A shift that crosses midnight belongs to the day it started.
// Open shifts are listed but not counted in the totals (they have no end yet).
export async function getEmployeeShifts(
	userId: string,
	from: string,
	to: string,
): Promise<ShiftRow[]> {
	const tz = companyTimeZone();

	return prisma.$queryRaw<ShiftRow[]>`
    SELECT
      s.id,
      s.clock_in AS "clockIn",
      s.clock_out AS "clockOut",
      to_char(s.clock_in AT TIME ZONE ${tz}, 'YYYY-MM-DD"T"HH24:MI') AS "clockInLocal",
      to_char(s.clock_out AT TIME ZONE ${tz}, 'YYYY-MM-DD"T"HH24:MI') AS "clockOutLocal",
      to_char(date_trunc('week', s.clock_in AT TIME ZONE ${tz}), 'YYYY-MM-DD') AS "weekStart",
      (EXTRACT(EPOCH FROM (s.clock_out - s.clock_in)) / 60)::int AS minutes,
      COALESCE(
        SUM(EXTRACT(EPOCH FROM (s.clock_out - s.clock_in)) / 60)
          OVER (PARTITION BY date_trunc('week', s.clock_in AT TIME ZONE ${tz})),
        0
      )::int AS "weekMinutes",
      COALESCE(SUM(EXTRACT(EPOCH FROM (s.clock_out - s.clock_in)) / 60) OVER (), 0)::int AS "rangeMinutes",
      (SELECT COUNT(*) FROM shift_edits e WHERE e.shift_id = s.id)::int AS "editCount"
    FROM shifts s
    WHERE s.user_id = ${userId}::uuid
      AND (s.clock_in AT TIME ZONE ${tz})::date BETWEEN ${from}::date AND ${to}::date
    ORDER BY s.clock_in DESC
  `;
}

export type ShiftEditItem = {
	id: string;
	editedAt: Date;
	editedByName: string;
	reason: string;
	shiftStartedAt: Date; // the shift's current clock-in, to tell which shift was changed
	oldClockIn: Date | null;
	oldClockOut: Date | null;
	newClockIn: Date | null;
	newClockOut: Date | null;
};

// Change history for all of one employee's shifts, newest first.
export async function getEmployeeShiftEdits(
	userId: string,
	limit = 50,
): Promise<ShiftEditItem[]> {
	const edits = await prisma.shiftEdit.findMany({
		where: { shift: { userId } },
		orderBy: { editedAt: "desc" },
		take: limit,
		select: {
			id: true,
			editedAt: true,
			reason: true,
			oldClockIn: true,
			oldClockOut: true,
			newClockIn: true,
			newClockOut: true,
			editedBy: { select: { name: true } },
			shift: { select: { clockIn: true } },
		},
	});

	return edits.map((edit) => ({
		id: edit.id,
		editedAt: edit.editedAt,
		editedByName: edit.editedBy.name,
		reason: edit.reason,
		shiftStartedAt: edit.shift.clockIn,
		oldClockIn: edit.oldClockIn,
		oldClockOut: edit.oldClockOut,
		newClockIn: edit.newClockIn,
		newClockOut: edit.newClockOut,
	}));
}

// ---------------------------------------------------------------------------
// Writes: close or correct a shift
// ---------------------------------------------------------------------------

export type ChangeShiftError =
	| "not_found"
	| "already_closed"
	| "no_change"
	| "out_before_in"
	| "in_future"
	| "overlap";

export type ChangeShiftResult =
	| {
			ok: true;
			shift: {
				id: string;
				userId: string;
				clockIn: Date;
				clockOut: Date | null;
			};
	  }
	| { ok: false; reason: ChangeShiftError };

const CHANGE_ERRORS: Record<
	ChangeShiftError,
	{ status: number; message: string }
> = {
	not_found: { status: 404, message: "Shift not found" },
	already_closed: {
		status: 409,
		message: "This shift is already closed. Edit it instead.",
	},
	no_change: { status: 400, message: "Nothing changed" },
	out_before_in: { status: 400, message: "Clock-out must be after clock-in" },
	in_future: { status: 400, message: "Times cannot be in the future" },
	overlap: {
		status: 409,
		message: "This overlaps another shift of the same employee",
	},
};

// HTTP status and message for a failed change, so the routes stay short.
export function describeChangeError(reason: ChangeShiftError): {
	status: number;
	message: string;
} {
	return CHANGE_ERRORS[reason];
}

type ChangeInput = {
	shiftId: string;
	editorId: string; // the admin making the change
	reason: string;
	clockIn?: string; // company-local "YYYY-MM-DDTHH:mm"; omit to keep the current value
	clockOut?: string; // same
	requireOpen?: boolean; // true for "close": the shift must still be open
};

const sameMinute = (a: Date, b: Date) =>
	Math.floor(a.getTime() / 60000) === Math.floor(b.getTime() / 60000);

async function changeShift(input: ChangeInput): Promise<ChangeShiftResult> {
	const tz = companyTimeZone();

	return prisma.$transaction(async (tx): Promise<ChangeShiftResult> => {
		// Lock the row so two admins (or an admin and an employee) cannot change it at the same moment.
		const locked = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM shifts WHERE id = ${input.shiftId}::uuid FOR UPDATE
    `;
		if (locked.length === 0) return { ok: false, reason: "not_found" };

		const current = await tx.shift.findUnique({
			where: { id: input.shiftId },
			select: { userId: true, clockIn: true, clockOut: true },
		});
		if (!current) return { ok: false, reason: "not_found" };

		if (input.requireOpen && current.clockOut !== null) {
			return { ok: false, reason: "already_closed" };
		}

		// The database turns a company-local time into a real instant.
		const toInstant = async (local: string): Promise<Date> => {
			const rows = await tx.$queryRaw<{ t: Date }[]>`
        SELECT (${local}::timestamp AT TIME ZONE ${tz}) AS t
      `;
			return rows[0].t;
		};

		// A value that is the same minute as the stored one counts as "not changed",
		// so stored seconds are never rewritten by accident.
		let newIn = current.clockIn;
		if (input.clockIn) {
			const instant = await toInstant(input.clockIn);
			if (!sameMinute(instant, current.clockIn)) newIn = instant;
		}
		let newOut = current.clockOut;
		if (input.clockOut) {
			const instant = await toInstant(input.clockOut);
			if (!current.clockOut || !sameMinute(instant, current.clockOut))
				newOut = instant;
		}

		if (newIn === current.clockIn && newOut === current.clockOut) {
			return { ok: false, reason: "no_change" };
		}

		const now = new Date();
		if (newIn > now || (newOut !== null && newOut > now))
			return { ok: false, reason: "in_future" };
		if (newOut !== null && newOut <= newIn)
			return { ok: false, reason: "out_before_in" };

		// Another shift of the same employee must not overlap the new times.
		const overlapping = await tx.shift.findFirst({
			where: {
				userId: current.userId,
				id: { not: input.shiftId },
				...(newOut ? { clockIn: { lt: newOut } } : {}),
				OR: [{ clockOut: null }, { clockOut: { gt: newIn } }],
			},
			select: { id: true },
		});
		if (overlapping) return { ok: false, reason: "overlap" };

		const updated = await tx.shift.update({
			where: { id: input.shiftId },
			data: { clockIn: newIn, clockOut: newOut },
			select: { id: true, userId: true, clockIn: true, clockOut: true },
		});

		// Who, when (editedAt defaults to now()), why, and the before / after values.
		await tx.shiftEdit.create({
			data: {
				shiftId: input.shiftId,
				editedById: input.editorId,
				reason: input.reason,
				oldClockIn: current.clockIn,
				oldClockOut: current.clockOut,
				newClockIn: newIn,
				newClockOut: newOut,
			},
		});

		return { ok: true, shift: updated };
	});
}

// Close an open shift on behalf of the employee.
export function closeShift(input: {
	shiftId: string;
	editorId: string;
	clockOut: string;
	reason: string;
}) {
	return changeShift({ ...input, requireOpen: true });
}

// Correct the clock-in and/or clock-out of an existing shift (open or closed).
// A clock-out cannot be removed here: an open shift stays open or is closed.
export function correctShift(input: {
	shiftId: string;
	editorId: string;
	clockIn?: string;
	clockOut?: string;
	reason: string;
}) {
	return changeShift(input);
}
