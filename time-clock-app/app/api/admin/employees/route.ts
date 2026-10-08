// Owner: A
// GET  /api/admin/employees  -> list employees (admin only)
// POST /api/admin/employees  { name, email } -> create employee with a generated password.
//   The plain password is in this response only, once. It is never stored or logged.
import { requireApiAdmin } from "@/lib/auth/guards";
import { createEmployee, listEmployees } from "@/lib/db/queries/employees";
import { parseCreateEmployee } from "@/lib/validators";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
	const auth = await requireApiAdmin();
	if (auth instanceof Response) return auth;

	const employees = await listEmployees();
	return Response.json({ employees }, { headers: NO_STORE });
}

export async function POST(request: Request) {
	const auth = await requireApiAdmin();
	if (auth instanceof Response) return auth;

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const parsed = parseCreateEmployee(body);
	if (!parsed.ok)
		return Response.json({ error: parsed.error }, { status: 400 });

	const result = await createEmployee(parsed.value);
	if (!result.ok) {
		return Response.json(
			{ error: "An account with this email already exists" },
			{ status: 409 },
		);
	}

	return Response.json(
		{ employee: result.employee, temporaryPassword: result.temporaryPassword },
		{ status: 201, headers: NO_STORE },
	);
}
