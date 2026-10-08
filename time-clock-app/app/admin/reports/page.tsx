// Owner: C
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminDashboard() {
  await requireAdmin();

  return (
    <main className="">

    </main>
  );
}
