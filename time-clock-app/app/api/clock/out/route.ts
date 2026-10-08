// Owner: B
// POST /api/clock/out -> clock out the signed-in employee.
// Fails with 400 when there is no open shift.
import { requireApiEmployee } from "@/lib/auth/guards"
import { clockOut } from "@/lib/clock/service"

export async function POST() {
	const auth = await requireApiEmployee()
	if (auth instanceof Response) return auth

	const result = await clockOut(auth.id)
	if (!result.ok) {
		return Response.json({ error: result.error }, { status: 400 })
	}

	return Response.json({ clockedIn: false, clockIn: null })
}
