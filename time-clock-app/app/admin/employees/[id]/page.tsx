// Owner: C
// TODO: Per-employee shifts, close open shift, edit shift with reason + change history.

import LiveBoard from "./_component/LiveBoard";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminDashboard() {
  // Check again here: a layout check alone does not protect the page.
  await requireAdmin();

  return (
    <main className="">

      <LiveBoard/>
    </main>
  );
}
