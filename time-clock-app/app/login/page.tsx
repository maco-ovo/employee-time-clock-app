// Owner: A
// Login page (server component). Already-signed-in users go straight to their home page.
import Link from "next/link";
import { Truck } from "lucide-react";
import { Brand } from "@/components/login/brand";
import { getCurrentUser, homePathFor } from "@/lib/auth/guards";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
	const user = await getCurrentUser();
	if (user) redirect(homePathFor(user.role));

	return (
		<div className="grid min-h-screen bg-white lg:grid-cols-[minmax(380px,0.8fr)_1.2fr]">
			<aside className="relative hidden flex-col justify-between overflow-hidden bg-(--forest) px-[55px] py-[45px] text-white lg:flex">
				<div
					aria-hidden
					className="absolute -right-[180px] -bottom-[120px] size-[500px] rounded-full border border-[#34625f]"
				/>
				<div
					aria-hidden
					className="absolute -right-[110px] -bottom-[50px] size-[350px] rounded-full border border-[#34625f]"
				/>
				<Link
					href="/"
					className="absolute top-12 right-[45px] text-xs text-[#9dbbb6] hover:text-white"
				>
					← Back to website
				</Link>
				<Brand light />
				<div className="relative z-10 max-w-[440px]">
					<span className="mb-[35px] grid h-[115px] w-[170px] place-items-center rounded-[30px_8px] border border-[#3e6864] bg-[#194b48] text-[#a9d5ca]">
						<Truck size={84} strokeWidth={1.2} />
					</span>
					<h1 className="font-display mb-5 text-[40px] leading-[1.15] font-extrabold tracking-[-0.04em]">
						Keeping every shift
						<br />
						on the right track.
					</h1>
					<p className="leading-[1.65] text-[#b2cac5]">
						One place for our team to clock in, stay informed, and keep
						Northstar moving.
					</p>
				</div>
				<small className="relative z-10 text-[#799d97]">
					Northstar Logistics · ABC Holding Ltd.
				</small>
			</aside>

			<main className="grid place-items-center px-5 py-8 sm:p-12">
				<div className="w-full max-w-[420px]">
					<div className="mb-11 lg:hidden">
						<Brand />
					</div>
					<span className="text-[11px] font-extrabold tracking-[0.16em] text-(--forest-2)">
						TEAM PORTAL
					</span>
					<h2 className="font-display mt-2.5 mb-[7px] text-[34px] font-extrabold tracking-[-0.04em]">
						Welcome back
					</h2>
					<p className="mb-[30px] text-(--ink-soft)">
						Sign in to continue to your workspace.
					</p>
					<LoginForm />
					<p className="mt-[25px] text-center text-[11px] text-[#6d807e]">
						Need help signing in? Ask your administrator.
					</p>
				</div>
			</main>
		</div>
	);
}
