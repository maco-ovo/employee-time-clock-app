// Owner: B
// clockIn / clockOut / toggle. Shared by the employee buttons and the
// personal QR flow (a scan just opens the page; the server decides
// which action applies from the current status). Every rule lives in
// lib/clock/rules.ts; the database enforces them again.

import { prisma } from "@/lib/db"
import { companyTimeZone } from "@/lib/time"
import {
	clockInWindowError,
	clockOutOrderError,
	doubleClockInError,
} from "./rules"

type ShiftRow = {
	id: string
	userId: string
	clockIn: Date
	clockOut: Date | null
}

export type ClockResult =
	| { ok: true; shift: ShiftRow }
	| { ok: false; error: string }

export type ClockStatus = {
	clockedIn: boolean
	clockIn: Date | null
}

function isUniqueViolation(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		(error as { code?: unknown }).code === "P2002"
	)
}

// The employee's open shift, if any. Newest first, so a stray second
// open shift (only possible until the partial unique index is applied)
// never clocks out the wrong one.
export async function getOpenShift(
	userId: string,
): Promise<ShiftRow | null> {
	return prisma.shift.findFirst({
		where: { userId, clockOut: null },
		orderBy: { clockIn: "desc" },
	})
}

// Current clock state for the signed-in employee.
export async function getClockStatus(userId: string): Promise<ClockStatus> {
	const open = await getOpenShift(userId)
	return { clockedIn: open !== null, clockIn: open?.clockIn ?? null }
}

// Clock in now. Fails outside the 08:00-17:00 work window or when
// an open shift already exists.
export async function clockIn(userId: string): Promise<ClockResult> {
	const now = new Date()

	const windowError = clockInWindowError(now, companyTimeZone())
	if (windowError) return { ok: false, error: windowError }

	const open = await getOpenShift(userId)
	const doubleError = doubleClockInError(open !== null)
	if (doubleError) return { ok: false, error: doubleError }

	try {
		const shift = await prisma.shift.create({
			data: { userId, clockIn: now },
		})
		return { ok: true, shift }
	} catch (error) {
		// The database rejects a second open shift once the partial
		// unique index from prisma/extra-constraints.sql is applied.
		if (isUniqueViolation(error)) {
			return { ok: false, error: "You are already clocked in" }
		}
		throw error
	}
}

// Clock out now, closing the open shift.
export async function clockOut(userId: string): Promise<ClockResult> {
	const open = await getOpenShift(userId)
	if (!open) return { ok: false, error: "You are not clocked in" }

	const now = new Date()
	const orderError = clockOutOrderError(now, open.clockIn)
	if (orderError) return { ok: false, error: orderError }

	const shift = await prisma.shift.update({
		where: { id: open.id },
		data: { clockOut: now },
	})
	return { ok: true, shift }
}

// One call that does whichever action applies — used by the QR flow,
// where scanning should "clock in or out, whichever applies".
export async function toggle(userId: string): Promise<ClockResult> {
	const open = await getOpenShift(userId)
	return open ? clockOut(userId) : clockIn(userId)
}
