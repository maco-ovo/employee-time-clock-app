import Header from "./_component/Header";
import "./admin.css";
import Overview from "./_component/Overview";
import Tab from "./_component/Tab";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <Header />
      <div className="p-8">
      <Overview />
      <Tab />
      <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
