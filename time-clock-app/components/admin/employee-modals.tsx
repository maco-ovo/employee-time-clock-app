"use client";
// Owner: A
// Modals for the Team page: add employee, manage employee (deactivate / reactivate / reset password),
// and the one-time password dialog.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, KeyRound, UserRound, X } from "lucide-react";
import { JOB_TITLES, LOCATIONS } from "@/lib/employee-options";

export type EmployeeItem = {
	id: string;
	name: string;
	email: string;
	jobTitle: string | null;
	location: string | null;
	isActive: boolean;
	clockedIn: boolean;
};

const labelClass =
	"mb-[17px] flex flex-col gap-[7px] text-xs font-bold text-[#294543]";
const inputClass =
	"w-full rounded-[9px] border border-[#d6dfdb] bg-white px-[13px] py-3 text-sm font-normal text-(--ink) outline-none focus:border-[#43877d] focus:ring-3 focus:ring-[#dcefe9]";
const primaryButton =
	"inline-flex items-center justify-center gap-2 rounded-[10px] bg-(--forest) px-[17px] py-2.5 text-sm font-bold text-white shadow-[0_5px_14px_rgba(16,63,61,0.17)] hover:bg-[#0a4b47] disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButton =
	"rounded-lg border border-(--line) bg-white px-[17px] py-2.5 text-sm font-semibold text-[#60716e] hover:bg-[#f5f7f6] disabled:opacity-60";
const dangerButton =
	"rounded-lg border border-[#efd5d0] bg-white px-[17px] py-2.5 text-sm font-semibold text-[#a44f45] hover:bg-[#fbf3f1] disabled:opacity-60";

const JSON_HEADERS = { "Content-Type": "application/json" };

function ModalShell({
	icon,
	title,
	subtitle,
	onClose,
	dismissible = true,
	children,
}: {
	icon: React.ReactNode;
	title: string;
	subtitle: string;
	onClose: () => void;
	dismissible?: boolean;
	children: React.ReactNode;
}) {
	useEffect(() => {
		if (!dismissible) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [dismissible, onClose]);

	return (
		<div
			className="fixed inset-0 z-50 grid place-items-center bg-[rgba(11,35,34,0.5)] p-5 backdrop-blur-[3px]"
			onMouseDown={dismissible ? onClose : undefined}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={title}
				className="max-h-[90vh] w-full max-w-[500px] overflow-auto rounded-[15px] bg-white p-[26px] shadow-[0_25px_70px_rgba(7,24,23,0.4)]"
				onMouseDown={(event) => event.stopPropagation()}
			>
				<div className="mb-5 flex items-center gap-3">
					<span className="grid size-10 place-items-center rounded-[10px] bg-(--mint-light) text-(--forest-2)">
						{icon}
					</span>
					<div className="flex-1">
						<h2 className="font-display text-lg font-extrabold">{title}</h2>
						<p className="text-[11px] text-[#748380]">{subtitle}</p>
					</div>
					{dismissible && (
						<button
							type="button"
							onClick={onClose}
							aria-label="Close"
							className="text-[#758481] hover:text-(--ink)"
						>
							<X size={18} />
						</button>
					)}
				</div>
				{children}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------- Add employee

export function AddEmployeeModal({
	onClose,
	onCreated,
}: {
	onClose: () => void;
	onCreated: (name: string, temporaryPassword: string) => void;
}) {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setLoading(true);

		const form = new FormData(event.currentTarget);
		const name =
			`${String(form.get("firstName") ?? "").trim()} ${String(form.get("lastName") ?? "").trim()}`.trim();

		try {
			const res = await fetch("/api/admin/employees", {
				method: "POST",
				headers: JSON_HEADERS,
				body: JSON.stringify({
					name,
					email: form.get("email"),
					jobTitle: form.get("jobTitle"),
					location: form.get("location"),
				}),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.error ?? "Could not add the employee");
				setLoading(false);
				return;
			}
			onCreated(data.employee.name, data.temporaryPassword);
		} catch {
			setError("Could not reach the server. Please try again.");
			setLoading(false);
		}
	}

	return (
		<ModalShell
			icon={<UserRound size={20} />}
			title="Add an employee"
			subtitle="Create a new team member profile."
			onClose={onClose}
		>
			<form onSubmit={onSubmit}>
				<div className="grid gap-3 sm:grid-cols-2">
					<label className={labelClass}>
						First name
						<input
							name="firstName"
							required
							maxLength={50}
							placeholder="First name"
							className={inputClass}
						/>
					</label>
					<label className={labelClass}>
						Last name
						<input
							name="lastName"
							required
							maxLength={50}
							placeholder="Last name"
							className={inputClass}
						/>
					</label>
				</div>
				<label className={labelClass}>
					Work email
					<input
						name="email"
						type="email"
						required
						placeholder="name@northstar.com"
						className={inputClass}
					/>
				</label>
				<div className="grid gap-3 sm:grid-cols-2">
					<label className={labelClass}>
						Job title
						<select
							name="jobTitle"
							defaultValue=""
							required
							className={inputClass}
						>
							<option value="" disabled>
								Select job title
							</option>
							{JOB_TITLES.map((title) => (
								<option key={title}>{title}</option>
							))}
						</select>
					</label>
					<label className={labelClass}>
						Location
						<select
							name="location"
							defaultValue={LOCATIONS[0]}
							required
							className={inputClass}
						>
							{LOCATIONS.map((location) => (
								<option key={location}>{location}</option>
							))}
						</select>
					</label>
				</div>
				<p className="mb-4 text-[11px] text-[#68807c]">
					A password is generated automatically and shown once after you add the
					employee.
				</p>
				{error && (
					<div role="alert" className="mb-3 text-xs text-[#b74a3f]">
						{error}
					</div>
				)}
				<div className="flex justify-end gap-[9px] border-t border-(--line) pt-[18px]">
					<button type="button" onClick={onClose} className={secondaryButton}>
						Cancel
					</button>
					<button type="submit" disabled={loading} className={primaryButton}>
						{loading ? "Adding..." : "Add employee"}
					</button>
				</div>
			</form>
		</ModalShell>
	);
}

// ---------------------------------------------------------------- Manage employee

type Confirm = "deactivate" | "reset_password" | null;

export function ManageEmployeeModal({
	employee,
	onClose,
	onChanged,
	onPasswordReset,
}: {
	employee: EmployeeItem;
	onClose: () => void;
	onChanged: () => void;
	onPasswordReset: (name: string, temporaryPassword: string) => void;
}) {
	const [confirm, setConfirm] = useState<Confirm>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function run(action: "deactivate" | "reactivate" | "reset_password") {
		setBusy(true);
		setError(null);
		try {
			const res = await fetch(`/api/admin/employees/${employee.id}`, {
				method: "PATCH",
				headers: JSON_HEADERS,
				body: JSON.stringify({ action }),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.error ?? "Something went wrong");
				setBusy(false);
				return;
			}
			if (action === "reset_password")
				onPasswordReset(employee.name, data.temporaryPassword);
			else onChanged();
		} catch {
			setError("Could not reach the server. Please try again.");
			setBusy(false);
		}
	}

	return (
		<ModalShell
			icon={<UserRound size={20} />}
			title={employee.name}
			subtitle={
				[employee.jobTitle, employee.location].filter(Boolean).join(" · ") ||
				employee.email
			}
			onClose={onClose}
		>
			<dl className="mb-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
				<dt className="font-bold text-[#778683]">EMAIL</dt>
				<dd>{employee.email}</dd>
				<dt className="font-bold text-[#778683]">STATUS</dt>
				<dd>
					{!employee.isActive
						? "Deactivated"
						: employee.clockedIn
							? "Clocked in"
							: "Off shift"}
				</dd>
			</dl>

			{confirm === "deactivate" && (
				<div className="mb-4 rounded-[10px] bg-[#fbf3f1] p-3.5 text-xs text-[#8a443b]">
					<strong className="block">Deactivate {employee.name}?</strong>
					They will no longer be able to sign in. Their shift history is kept.
					{employee.clockedIn &&
						" They are clocked in right now; their open shift stays open until you close it."}
					<div className="mt-3 flex gap-2">
						<button
							type="button"
							disabled={busy}
							onClick={() => run("deactivate")}
							className={dangerButton}
						>
							{busy ? "Working..." : "Yes, deactivate"}
						</button>
						<button
							type="button"
							disabled={busy}
							onClick={() => setConfirm(null)}
							className={secondaryButton}
						>
							Keep active
						</button>
					</div>
				</div>
			)}

			{confirm === "reset_password" && (
				<div className="mb-4 rounded-[10px] bg-(--mint-light) p-3.5 text-xs text-[#294543]">
					<strong className="block">
						Reset the password for {employee.name}?
					</strong>
					Their current password stops working. A new one is shown once.
					<div className="mt-3 flex gap-2">
						<button
							type="button"
							disabled={busy}
							onClick={() => run("reset_password")}
							className={primaryButton}
						>
							{busy ? "Working..." : "Reset password"}
						</button>
						<button
							type="button"
							disabled={busy}
							onClick={() => setConfirm(null)}
							className={secondaryButton}
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			{error && (
				<div role="alert" className="mb-3 text-xs text-[#b74a3f]">
					{error}
				</div>
			)}

			<div className="flex flex-wrap items-center justify-between gap-2 border-t border-(--line) pt-[18px]">
				<div className="flex flex-wrap gap-2">
					{employee.isActive ? (
						<button
							type="button"
							disabled={busy}
							onClick={() => setConfirm("deactivate")}
							className={dangerButton}
						>
							Deactivate employee
						</button>
					) : (
						<button
							type="button"
							disabled={busy}
							onClick={() => run("reactivate")}
							className={primaryButton}
						>
							Reactivate employee
						</button>
					)}
					<button
						type="button"
						disabled={busy}
						onClick={() => setConfirm("reset_password")}
						className={secondaryButton}
					>
						Reset password
					</button>
				</div>
				<Link
					href={`/admin/employees/${employee.id}`}
					className="text-xs font-bold text-(--forest-2) hover:underline"
				>
					View shifts →
				</Link>
			</div>
		</ModalShell>
	);
}

// ---------------------------------------------------------------- One-time password

export function PasswordModal({
	name,
	password,
	reason,
	onClose,
}: {
	name: string;
	password: string;
	reason: "created" | "reset";
	onClose: () => void;
}) {
	const [copied, setCopied] = useState(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(password);
			setCopied(true);
		} catch {
			setCopied(false);
		}
	}

	return (
		<ModalShell
			icon={<KeyRound size={20} />}
			title={reason === "created" ? "Employee added" : "Password reset"}
			subtitle={`Temporary password for ${name}`}
			onClose={onClose}
			dismissible={false}
		>
			<div className="mb-3 flex items-center gap-2 rounded-[10px] border border-(--line) bg-(--mint-light) p-3.5">
				<code className="flex-1 font-mono text-lg font-bold tracking-wider break-all select-all">
					{password}
				</code>
				<button
					type="button"
					onClick={copy}
					className={secondaryButton}
					aria-label="Copy password"
				>
					{copied ? <Check size={16} /> : <Copy size={16} />}
				</button>
			</div>
			<p className="mb-5 text-xs text-[#8a443b]">
				This password is shown only once. Copy it and give it to {name} now. If
				it is lost, use “Reset password”.
			</p>
			<div className="flex justify-end border-t border-(--line) pt-[18px]">
				<button type="button" onClick={onClose} className={primaryButton}>
					I have saved it
				</button>
			</div>
		</ModalShell>
	);
}
