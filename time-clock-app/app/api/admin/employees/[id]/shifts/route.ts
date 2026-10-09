// Owner: C (built by A)
// GET /api/admin/employees/:id/shifts?from=2026-10-05&to=2026-10-11
// One employee's shifts (with weekly totals from SQL). Without from/to: the current week.
import { requireApiAdmin } from "@/lib/auth/guards";
import {
	getCurrentWeekRange,
	getEmployeeDetail,
	getEmployeeShifts,
} from "@/lib/db/queries/shift-admin";
import { parseDayRange } from "@/lib/shift-validators";
import { isUuid } from "@/lib/validators";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = await requireApiAdmin();
	if (auth instanceof Response) return auth;

	const { id } = await params;
	if (!isUuid(id))
		return Response.json({ error: "Employee not found" }, { status: 404 });

	const range = parseDayRange(new URL(request.url).searchParams);
	if (range && !range.ok)
		return Response.json({ error: range.error }, { status: 400 });

	const employee = await getEmployeeDetail(id);
	if (!employee)
		return Response.json({ error: "Employee not found" }, { status: 404 });

	const { from, to } = range ? range.value : await getCurrentWeekRange();
	const shifts = await getEmployeeShifts(id, from, to);

	return Response.json({ employee, from, to, shifts }, { headers: NO_STORE });
}
