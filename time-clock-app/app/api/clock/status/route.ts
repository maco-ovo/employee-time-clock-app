// Owner: B
// GET /api/clock/status -> the signed-in employee's clock state.
// The clock-in instant is rendered in the company timezone.
import { requireApiEmployee } from "@/lib/auth/guards"
import { getClockStatus } from "@/lib/clock/service"
import { companyTimeZone, formatInZone } from "@/lib/time"

export async function GET() {
	const auth = await requireApiEmployee()
	if (auth instanceof Response) return auth

	const status = await getClockStatus(auth.id)
	return Response.json({
		clockedIn: status.clockedIn,
		clockIn: status.clockIn
			? formatInZone(status.clockIn, companyTimeZone())
			: null,
	})
}
