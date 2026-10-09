// Owner: B
// POST /api/clock/in -> clock in the signed-in employee.
// Rules (work window, no double clock-in) are enforced by the
// service and the database; violations come back as 400.
import { requireApiEmployee } from "@/lib/auth/guards"
import { clockIn } from "@/lib/clock/service"
import { companyTimeZone, formatInZone } from "@/lib/time"

export async function POST() {
	const auth = await requireApiEmployee()
	if (auth instanceof Response) return auth

	const result = await clockIn(auth.id)
	if (!result.ok) {
		return Response.json({ error: result.error }, { status: 400 })
	}

	return Response.json({
		clockedIn: true,
		clockIn: formatInZone(result.shift.clockIn, companyTimeZone()),
	})
}
