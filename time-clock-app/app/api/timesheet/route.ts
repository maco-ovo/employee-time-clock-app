// Owner: B
// GET /api/timesheet -> the signed-in employee's shifts grouped
// by day plus weekly totals. Dates and totals are computed by
// the database in the company timezone.
import { requireApiEmployee } from "@/lib/auth/guards"
import { getEmployeeTimesheet } from "@/lib/db/queries/shifts"

export async function GET() {
	const auth = await requireApiEmployee()
	if (auth instanceof Response) return auth

	const timesheet = await getEmployeeTimesheet(auth.id)
	return Response.json(timesheet)
}
