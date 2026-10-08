// Owner: A
<<<<<<< HEAD
// TODO: Employee list, add employee, deactivate / activate.

import EmployeeDirectory from "./../_component/EmployeeDirectory"

export default function AdminEmployeesPage() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">AdminEmployeesPage</h1>
      <EmployeeDirectory/>
    </main>
  );
=======
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
>>>>>>> db/auth
}
