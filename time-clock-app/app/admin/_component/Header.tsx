import Navigation from "./Navigation";
import LogoutButton from "./LogoutButton";
import AdminUser from "./AdminUser";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="">
      <div className="header">
        <Logo />
        <Navigation />
        <div className="flex flex-row items-center gap-4">
          <AdminUser id={1} name="Mary Jane" title="Administrator" />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
