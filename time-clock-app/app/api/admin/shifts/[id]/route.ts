// Owner: C (built by A)
// PATCH /api/admin/shifts/:id  { clockIn?: "2026-10-08T09:00", clockOut?: "2026-10-08T17:00", reason }
// Correct a shift. Times are company time. Records who, when, why and the old / new values in shift_edits.
import { requireApiAdmin } from "@/lib/auth/guards";
import {
	correctShift,
	describeChangeError,
} from "@/lib/db/queries/shift-admin";
import { parseEditShift } from "@/lib/shift-validators";
import { isUuid } from "@/lib/validators";

const NO_STORE = { "Cache-Control": "no-store" };

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = await requireApiAdmin();
	if (auth instanceof Response) return auth;

	const { id } = await params;
	if (!isUuid(id))
		return Response.json({ error: "Shift not found" }, { status: 404 });

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const parsed = parseEditShift(body);
	if (!parsed.ok)
		return Response.json({ error: parsed.error }, { status: 400 });

	const result = await correctShift({
		shiftId: id,
		editorId: auth.id,
		clockIn: parsed.value.clockIn,
		clockOut: parsed.value.clockOut,
		reason: parsed.value.reason,
	});
	if (!result.ok) {
		const failure = describeChangeError(result.reason);
		return Response.json(
			{ error: failure.message },
			{ status: failure.status },
		);
	}

	return Response.json({ shift: result.shift }, { headers: NO_STORE });
}
