"use client";
// Owner: A
// Team page body: employee directory with search, add, and manage. Data comes from the server page;
// after every change we call router.refresh() so the list is re-read from the database.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Pencil, Search, UserPlus } from "lucide-react";
import {
	AddEmployeeModal,
	ManageEmployeeModal,
	PasswordModal,
	type EmployeeItem,
} from "./employee-modals";

type ModalState =
	| null
	| { type: "add" }
	| { type: "manage"; id: string }
	| {
			type: "password";
			name: string;
			password: string;
			reason: "created" | "reset";
	  };

const AVATAR_COLORS = [
	"bg-[#dceddf] text-[#24614c]",
	"bg-[#e3eef5] text-[#3b7192]",
	"bg-[#eee9f5] text-[#725e92]",
	"bg-[#f8e9de] text-[#a8663f]",
	"bg-[#f5e7e8] text-[#9f5d62]",
	"bg-[#e0f1f0] text-[#397c79]",
];

function avatarColor(id: string): string {
	let sum = 0;
	for (const char of id) sum += char.charCodeAt(0);
	return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function initials(name: string): string {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

function statusOf(employee: EmployeeItem): {
	label: string;
	className: string;
} {
	if (!employee.isActive)
		return { label: "Deactivated", className: "bg-[#f5e7e8] text-[#9f5d62]" };
	if (employee.clockedIn)
		return { label: "Clocked in", className: "bg-[#e6f3eb] text-[#3e7c5d]" };
	return { label: "Off shift", className: "bg-[#eef1ef] text-[#788582]" };
}

export function EmployeeDirectory({
	employees,
}: {
	employees: EmployeeItem[];
}) {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [modal, setModal] = useState<ModalState>(null);

	const activeCount = employees.filter((employee) => employee.isActive).length;
	const query = search.trim().toLowerCase();
	const filtered = employees.filter((employee) =>
		`${employee.name} ${employee.email}`.toLowerCase().includes(query),
	);
	const managed =
		modal?.type === "manage"
			? employees.find((employee) => employee.id === modal.id)
			: undefined;

	function closeModal() {
		setModal(null);
	}

	return (
		<section className="mb-[18px] rounded-xl border border-(--line) bg-white">
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8ecea] px-[21px] py-[18px]">
				<div className="flex items-center gap-[9px]">
					<h2 className="font-display text-[15px] font-extrabold">
						Employee directory
					</h2>
					<span className="rounded-full bg-[#edf2ef] px-2 py-1 text-[10px] font-bold text-[#647673]">
						{activeCount} active · {employees.length} total
					</span>
				</div>
				<div className="flex flex-wrap items-center gap-2.5">
					<div className="relative">
						<Search
							size={16}
							className="absolute top-2.5 left-2.5 text-[#7f8c8a]"
						/>
						<input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search employees"
							aria-label="Search employees"
							className="w-[220px] rounded-[9px] border border-[#d6dfdb] bg-white py-2 pr-2.5 pl-[33px] text-[13px] outline-none focus:border-[#43877d] focus:ring-3 focus:ring-[#dcefe9]"
						/>
					</div>
					<button
						type="button"
						onClick={() => setModal({ type: "add" })}
						className="inline-flex items-center gap-2 rounded-[10px] bg-(--forest) px-4 py-2 text-[13px] font-bold text-white shadow-[0_5px_14px_rgba(16,63,61,0.17)] hover:bg-[#0a4b47]"
					>
						<UserPlus size={16} /> Add employee
					</button>
				</div>
			</div>

			{filtered.length === 0 ? (
				<p className="p-8 text-center text-sm text-(--ink-soft)">
					{employees.length === 0
						? "No employees yet. Add the first one."
						: "No employees match your search."}
				</p>
			) : (
				<div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
					{filtered.map((employee) => {
						const status = statusOf(employee);
						return (
							<article
								key={employee.id}
								className={`flex items-center gap-3 rounded-xl border border-(--line) p-3.5 ${employee.isActive ? "" : "opacity-70"}`}
							>
								<span
									className={`grid size-9 flex-none place-items-center rounded-[10px] text-[11px] font-extrabold ${avatarColor(employee.id)}`}
								>
									{initials(employee.name)}
								</span>
								<div className="flex min-w-0 flex-1 flex-col">
									<strong className="truncate text-[13px]">
										{employee.name}
									</strong>
									<small className="truncate text-[11px] text-[#798885]">
										{employee.jobTitle ?? employee.email}
									</small>
									{employee.location && (
										<span className="mt-0.5 flex items-center gap-1 text-[11px] text-[#6f7f7d]">
											<MapPin size={12} /> {employee.location}
										</span>
									)}
								</div>
								<i
									className={`rounded-full px-2 py-1 text-[10px] font-bold whitespace-nowrap not-italic ${status.className}`}
								>
									{status.label}
								</i>
								<button
									type="button"
									aria-label={`Manage ${employee.name}`}
									onClick={() => setModal({ type: "manage", id: employee.id })}
									className="text-[#83918f] hover:text-(--ink)"
								>
									<Pencil size={15} />
								</button>
							</article>
						);
					})}
				</div>
			)}

			{modal?.type === "add" && (
				<AddEmployeeModal
					onClose={closeModal}
					onCreated={(name, password) => {
						setModal({ type: "password", name, password, reason: "created" });
						router.refresh();
					}}
				/>
			)}
			{managed && (
				<ManageEmployeeModal
					employee={managed}
					onClose={closeModal}
					onChanged={() => {
						closeModal();
						router.refresh();
					}}
					onPasswordReset={(name, password) =>
						setModal({ type: "password", name, password, reason: "reset" })
					}
				/>
			)}
			{modal?.type === "password" && (
				<PasswordModal
					name={modal.name}
					password={modal.password}
					reason={modal.reason}
					onClose={closeModal}
				/>
			)}
		</section>
	);
}
