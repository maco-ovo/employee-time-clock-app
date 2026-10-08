// Owner: C
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
