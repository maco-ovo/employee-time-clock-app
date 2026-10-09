import Navigation from "./Navigation";
import LogoutButton from "./LogoutButton";
import AdminUser from "./AdminUser";
import Logo from "./Logo";
import type { AdminUser as AdminUserType } from "../_lib/types";

export default function Header({ user }: { user: AdminUserType }) {
	return (
		<header className="">
			<div className="header">
				<Logo />
				<div className="hidden self-stretch md:flex">
					<Navigation />
				</div>
				<div className="flex flex-row items-center gap-4">
					<AdminUser id={user.id} name={user.name} email={user.email} />
					<LogoutButton />
				</div>
			</div>
		</header>
	);
}
