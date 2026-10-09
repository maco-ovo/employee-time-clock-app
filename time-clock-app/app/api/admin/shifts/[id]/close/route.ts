// Owner: C (built by A)
// POST /api/admin/shifts/:id/close  { clockOut: "2026-10-08T17:00", reason: "Forgot to clock out" }
// Close an open shift on behalf of an employee. clockOut is company time. Records who, when and why.
import { requireApiAdmin } from "@/lib/auth/guards";
import { closeShift, describeChangeError } from "@/lib/db/queries/shift-admin";
import { parseCloseShift } from "@/lib/shift-validators";
import { isUuid } from "@/lib/validators";

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(
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

	const parsed = parseCloseShift(body);
	if (!parsed.ok)
		return Response.json({ error: parsed.error }, { status: 400 });

	const result = await closeShift({
		shiftId: id,
		editorId: auth.id,
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
