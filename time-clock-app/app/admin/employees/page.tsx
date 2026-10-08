// Owner: A
// TODO: Employee list, add employee, deactivate / activate.

import EmployeeDirectory from "./../_component/EmployeeDirectory"

export default function AdminEmployeesPage() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">AdminEmployeesPage</h1>
      <EmployeeDirectory/>
    </main>
  );
}
