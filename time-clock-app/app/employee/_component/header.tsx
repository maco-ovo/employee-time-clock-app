// Owner: B
// Employee header: brand, the signed-in employee, log out.
// Rendered by the employee layout, which already called
// requireEmployee(), so the user here is always an active employee.
import { Brand } from "@/components/login/brand"
import { LogoutButton } from "@/components/login/logout-button"
import type { AuthUser } from "@/lib/auth/guards"

function initials(name: string): string {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("")
}

export default function Header({ user }: { user: AuthUser }) {
	return (
		<header className="sticky top-0 z-10 border-b border-(--line) bg-white/95 backdrop-blur">
			<div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5">
				<Brand />
				<div className="flex items-center gap-3">
					<span
						className="grid size-9 place-items-center rounded-full bg-(--mint) text-[11px] font-bold text-(--forest-2)"
						aria-hidden
					>
						{initials(user.name)}
					</span>
					<span className="hidden text-sm font-semibold text-(--ink) sm:block">
						{user.name}
					</span>
					<LogoutButton className="inline-flex items-center gap-1.5 rounded-[9px] border border-(--line) px-3 py-2 text-xs font-bold text-(--ink-soft) transition hover:border-[#43877d] hover:text-(--forest-2)" />
				</div>
			</div>
		</header>
	)
}
