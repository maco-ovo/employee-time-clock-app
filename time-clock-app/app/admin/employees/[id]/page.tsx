// Owner: C
// TODO: Per-employee shifts, close open shift, edit shift with reason + change history.

import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminEmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Check again here: a layout check alone does not protect the page.
  await requireAdmin();
  const { id } = await params;

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Employee details</h1>
      <p className="text-sm text-gray-500">Employee ID: {id}</p>
    </main>
  );
}
