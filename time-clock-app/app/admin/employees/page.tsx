// Owner: A
// Admin > Team: employee directory (server component). Detail / shifts live in [id]/page.tsx (C).
import { requireAdmin } from "@/lib/auth/guards";
import { listEmployees } from "@/lib/db/queries/employees";
import { EmployeeDirectory } from "@/components/admin/employee-directory";

export default async function EmployeesPage() {
	await requireAdmin();
	const rows = await listEmployees();

	return (
		<EmployeeDirectory
			employees={rows.map((row) => ({
				id: row.id,
				name: row.name,
				email: row.email,
				jobTitle: row.jobTitle,
				location: row.location,
				isActive: row.isActive,
				clockedIn: row.clockedInSince !== null,
			}))}
		/>
	);
}
