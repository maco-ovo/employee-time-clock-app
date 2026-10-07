// Owner: A
// Northstar Logistics logo (mark + wordmark). `light` is for dark backgrounds.
import Link from "next/link";
import { PackageCheck } from "lucide-react";

export function Brand({ light = false }: { light?: boolean }) {
	return (
		<Link
			href="/"
			aria-label="Northstar Logistics home"
			className={`flex w-fit items-center gap-2.5 ${light ? "text-white" : "text-(--ink)"}`}
		>
			<span
				className={`grid size-10 place-items-center rounded-[11px] ${
					light ? "bg-white text-(--forest)" : "bg-(--forest) text-white"
				}`}
			>
				<PackageCheck size={22} strokeWidth={2.3} />
			</span>
			<span className="flex flex-col leading-none">
				<strong className="font-display text-[17px] font-extrabold tracking-[-0.03em]">
					Northstar
				</strong>
				<small
					className={`mt-[5px] text-[8px] font-bold tracking-[0.22em] ${
						light ? "text-[#adcbc5]" : "text-[#728483]"
					}`}
				>
					LOGISTICS
				</small>
			</span>
		</Link>
	);
}
