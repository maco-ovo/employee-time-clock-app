"use client";
// Owner: A
// Posts to /api/auth/login. The server decides the redirect target from the user's role.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const labelClass =
	"mb-[17px] flex flex-col gap-[7px] text-xs font-bold text-[#294543]";
const inputClass =
	"w-full rounded-[9px] border border-[#d6dfdb] bg-white px-[13px] py-3 text-sm font-normal text-(--ink) outline-none focus:border-[#43877d] focus:ring-3 focus:ring-[#dcefe9]";

export function LoginForm() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setLoading(true);

		const form = new FormData(event.currentTarget);
		console.log(form);
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: form.get("email"),
					password: form.get("password"),
				}),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.error ?? "Login failed");
				setLoading(false);
				return;
			}
			router.replace(data.redirectTo);
			router.refresh();
		} catch {
			setError("Could not reach the server. Please try again.");
			setLoading(false);
		}
	}

	return (
		<form onSubmit={onSubmit}>
			<label className={labelClass}>
				Email address
				<input
					name="email"
					type="email"
					required
					autoComplete="username"
					placeholder="name@northstar.com"
					className={inputClass}
				/>
			</label>
			<label className={labelClass}>
				Password
				<input
					name="password"
					type="password"
					required
					autoComplete="current-password"
					placeholder="Enter your password"
					className={inputClass}
				/>
			</label>
			{error && (
				<div role="alert" className="-mt-1 mb-[13px] text-xs text-[#b74a3f]">
					{error}
				</div>
			)}
			<button
				type="submit"
				disabled={loading}
				className="mt-[5px] inline-flex w-full items-center justify-center gap-[9px] rounded-[10px] bg-(--forest) px-5 py-[13px] font-bold text-white shadow-[0_5px_14px_rgba(16,63,61,0.17)] transition hover:-translate-y-px hover:bg-[#0a4b47] disabled:cursor-not-allowed disabled:opacity-60"
			>
				{loading ? "Signing in..." : "Sign in"} <ArrowRight size={17} />
			</button>
		</form>
	);
}
