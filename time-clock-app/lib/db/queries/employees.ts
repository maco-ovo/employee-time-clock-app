// Owner: A
// Employee list / create / deactivate / reactivate / password reset.
// Only users with role EMPLOYEE are managed here (admins come from the seed script).
// Plain passwords are returned ONLY from createEmployee and resetEmployeePassword, once.
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { generatePassword } from "@/lib/auth/password";

export type EmployeeRow = {
	id: string;
	name: string;
	email: string;
	isActive: boolean;
	createdAt: Date;
	clockedInSince: Date | null;
};

function isUniqueViolation(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		(error as { code?: unknown }).code === "P2002"
	);
}

export async function listEmployees(): Promise<EmployeeRow[]> {
	const users = await prisma.user.findMany({
		where: { role: "EMPLOYEE" },
		orderBy: [{ isActive: "desc" }, { name: "asc" }],
		select: {
			id: true,
			name: true,
			email: true,
			isActive: true,
			createdAt: true,
			shifts: { where: { clockOut: null }, select: { clockIn: true }, take: 1 },
		},
	});

	return users.map((u) => ({
		id: u.id,
		name: u.name,
		email: u.email,
		isActive: u.isActive,
		createdAt: u.createdAt,
		clockedInSince: u.shifts[0]?.clockIn ?? null,
	}));
}

export type CreateEmployeeResult =
	| {
			ok: true;
			employee: { id: string; name: string; email: string; isActive: boolean };
			temporaryPassword: string;
	  }
	| { ok: false; reason: "email_taken" };

export async function createEmployee(input: {
	name: string;
	email: string;
}): Promise<CreateEmployeeResult> {
	const existing = await prisma.user.findUnique({
		where: { email: input.email },
		select: { id: true },
	});
	if (existing) return { ok: false, reason: "email_taken" };

	const temporaryPassword = generatePassword();
	try {
		const user = await prisma.user.create({
			data: {
				name: input.name,
				email: input.email,
				role: "EMPLOYEE",
				passwordHash: await hashPassword(temporaryPassword),
			},
			select: { id: true, name: true, email: true, isActive: true },
		});
		return { ok: true, employee: user, temporaryPassword };
	} catch (error) {
		// Two admins creating the same email at the same moment.
		if (isUniqueViolation(error)) return { ok: false, reason: "email_taken" };
		throw error;
	}
}

export type SetActiveResult =
	| {
			ok: true;
			employee: { id: string; name: string; isActive: boolean };
			hasOpenShift: boolean;
	  }
	| { ok: false; reason: "not_found" };

// History stays: shifts are never touched. A deactivated user cannot log in, and
// guards.ts re-reads is_active on every request, so an existing session stops working at once.
export async function setEmployeeActive(
	id: string,
	isActive: boolean,
): Promise<SetActiveResult> {
	const target = await prisma.user.findFirst({
		where: { id, role: "EMPLOYEE" },
		select: { id: true },
	});
	if (!target) return { ok: false, reason: "not_found" };

	const employee = await prisma.user.update({
		where: { id },
		data: { isActive },
		select: { id: true, name: true, isActive: true },
	});
	const openShifts = await prisma.shift.count({
		where: { userId: id, clockOut: null },
	});
	return { ok: true, employee, hasOpenShift: openShifts > 0 };
}

export type ResetPasswordResult =
	| { ok: true; temporaryPassword: string }
	| { ok: false; reason: "not_found" };

export async function resetEmployeePassword(
	id: string,
): Promise<ResetPasswordResult> {
	const target = await prisma.user.findFirst({
		where: { id, role: "EMPLOYEE" },
		select: { id: true },
	});
	if (!target) return { ok: false, reason: "not_found" };

	const temporaryPassword = generatePassword();
	await prisma.user.update({
		where: { id },
		data: { passwordHash: await hashPassword(temporaryPassword) },
	});
	return { ok: true, temporaryPassword };
}
