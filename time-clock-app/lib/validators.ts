// Owner: shared

import {
	JOB_TITLES,
	LOCATIONS,
	type JobTitle,
	type Location,
} from "@/lib/employee-options";
// the employee part by A

export type ParseResult<T> =
	| { ok: true; value: T }
	| { ok: false; error: string };

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isUuid(value: unknown): value is string {
	return typeof value === "string" && UUID_RE.test(value);
}

export type CreateEmployeeInput = {
	name: string;
	email: string;
	jobTitle: JobTitle;
	location: Location;
};

export function parseCreateEmployee(
	body: unknown,
): ParseResult<CreateEmployeeInput> {
	const { name, email, jobTitle, location } = (body ?? {}) as {
		name?: unknown;
		email?: unknown;
		jobTitle?: unknown;
		location?: unknown;
	};

	if (typeof name !== "string" || name.trim().length === 0) {
		return { ok: false, error: "Name is required" };
	}
	if (name.trim().length > 100) {
		return { ok: false, error: "Name must be 100 characters or fewer" };
	}
	if (typeof email !== "string" || email.trim().length === 0) {
		return { ok: false, error: "Email is required" };
	}
	const normalizedEmail = email.trim().toLowerCase();
	if (normalizedEmail.length > 254 || !EMAIL_RE.test(normalizedEmail)) {
		return { ok: false, error: "Email is not valid" };
	}
	if (
		typeof jobTitle !== "string" ||
		!(JOB_TITLES as readonly string[]).includes(jobTitle)
	) {
		return { ok: false, error: "Job title is not valid" };
	}
	if (
		typeof location !== "string" ||
		!(LOCATIONS as readonly string[]).includes(location)
	) {
		return { ok: false, error: "Location is not valid" };
	}
	return {
		ok: true,
		value: {
			name: name.trim(),
			email: normalizedEmail,
			jobTitle: jobTitle as JobTitle,
			location: location as Location,
		},
	};
}

export type EmployeeAction = "deactivate" | "reactivate" | "reset_password";

export function parseEmployeeAction(
	body: unknown,
): ParseResult<EmployeeAction> {
	const { action } = (body ?? {}) as { action?: unknown };
	if (
		action === "deactivate" ||
		action === "reactivate" ||
		action === "reset_password"
	) {
		return { ok: true, value: action };
	}
	return {
		ok: false,
		error: "action must be deactivate, reactivate or reset_password",
	};
}
