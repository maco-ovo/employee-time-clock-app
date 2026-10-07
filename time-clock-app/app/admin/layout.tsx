// Owner: C
import Header from "./_component/Header";
import "./admin.css";
import Overview from "./_component/Overview";
import Tab from "./_component/Tab";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Not signed in -> /login. Signed in as employee -> /employee.
  const user = await requireAdmin();

  return (
    <div className="">
      <Header user={user} />
      <div className="p-8">
      <Overview name={user.name} />
      <Tab />
      <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
