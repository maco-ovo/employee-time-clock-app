// Owner: A (PATCH)
// PATCH /api/admin/employees/:id  { action: "deactivate" | "reactivate" | "reset_password" }
import { requireApiAdmin } from "@/lib/auth/guards";
import {
	resetEmployeePassword,
	setEmployeeActive,
} from "@/lib/db/queries/employees";
import { isUuid, parseEmployeeAction } from "@/lib/validators";

const NO_STORE = { "Cache-Control": "no-store" };

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = await requireApiAdmin();
	if (auth instanceof Response) return auth;

	const { id } = await params;
	if (!isUuid(id))
		return Response.json({ error: "Employee not found" }, { status: 404 });

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const parsed = parseEmployeeAction(body);
	if (!parsed.ok)
		return Response.json({ error: parsed.error }, { status: 400 });

	if (parsed.value === "reset_password") {
		const result = await resetEmployeePassword(id);
		if (!result.ok)
			return Response.json({ error: "Employee not found" }, { status: 404 });
		return Response.json(
			{ temporaryPassword: result.temporaryPassword },
			{ headers: NO_STORE },
		);
	}

	const result = await setEmployeeActive(id, parsed.value === "reactivate");
	if (!result.ok)
		return Response.json({ error: "Employee not found" }, { status: 404 });
	return Response.json(
		{ employee: result.employee, hasOpenShift: result.hasOpenShift },
		{ headers: NO_STORE },
	);
}
