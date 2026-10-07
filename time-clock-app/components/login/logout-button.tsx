"use client";
// Owner: A
// Drop this into the employee / admin headers. Calls POST /api/auth/logout, then goes to /login.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton({ className = "" }: { className?: string }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function onClick() {
		setLoading(true);
		try {
			await fetch("/api/auth/logout", { method: "POST" });
		} finally {
			router.replace("/login");
			router.refresh();
		}
	}

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={loading}
			className={className}
		>
			<LogOut size={16} /> Log out
		</button>
	);
}
