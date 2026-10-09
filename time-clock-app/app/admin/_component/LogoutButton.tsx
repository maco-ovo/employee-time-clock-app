"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton({
	className = "",
}: {
	className?: string;
}) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleLogout() {
		setLoading(true);
		try {
			const res = await fetch("/api/auth/logout", { method: "POST" });
			if (!res.ok) throw new Error("Logout failed");
			router.replace("/login");
			router.refresh();
		} catch {
			setLoading(false);
			alert("Could not log out. Please try again.");
		}
	}

	return (
		<button
			type="button"
			onClick={handleLogout}
			disabled={loading}
			aria-label="Log out"
			title="Log out"
			className={`rounded-lg border-2 border-[#103f3d] bg-[#103f3d] px-4 py-2 font-bold text-white hover:bg-[#0c5953] disabled:opacity-60 ${className}`}
		>
			<LogOut className="h-5 w-5" />
		</button>
	);
}
