"use client";
// Owner: C (built by A)
// Close an open shift on behalf of an employee (POST /api/admin/shifts/:id/close).
// Reusable: the Live board can open the same modal from its "Clock out" button.
import { useState, type FormEvent } from "react";
import { LogOut } from "lucide-react";
import Modal from "./Modal";

export type ClockoutModalProps = {
	shiftId: string;
	employeeName: string;
	clockInLocal: string; // company time, "YYYY-MM-DDTHH:mm"
	clockInLabel: string; // for display, e.g. "Wed, Oct 8, 9:02 AM"
	onClose: () => void;
	onDone: () => void; // called after the shift was closed
};

const REASON_MIN = 3;

export default function ClockoutModal({
	shiftId,
	employeeName,
	clockInLocal,
	clockInLabel,
	onClose,
	onDone,
}: ClockoutModalProps) {
	const [clockOut, setClockOut] = useState("");
	const [reason, setReason] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	const canSubmit =
		clockOut !== "" && reason.trim().length >= REASON_MIN && !saving;

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!canSubmit) return;
		setError(null);
		setSaving(true);
		try {
			const response = await fetch(`/api/admin/shifts/${shiftId}/close`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ clockOut, reason }),
			});
			const data = (await response.json().catch(() => ({}))) as {
				error?: string;
			};
			if (!response.ok) {
				setError(data.error ?? "Something went wrong. Please try again.");
				return;
			}
			onDone();
		} catch {
			setError("Network error. Please try again.");
		} finally {
			setSaving(false);
		}
	}

	return (
		<Modal
			icon={<LogOut />}
			title="Clock out employee"
			subtitle="Close this open shift. Times are in company time."
			onClose={onClose}
		>
			<form onSubmit={submit}>
				<div className="employee-summary">
					<div>
						<strong>{employeeName}</strong>
						<small>Clocked in {clockInLabel}</small>
					</div>
				</div>

				<label>
					Clock-out time
					<input
						type="datetime-local"
						required
						min={clockInLocal}
						value={clockOut}
						onChange={(event) => setClockOut(event.target.value)}
					/>
				</label>
				<button
					type="button"
					onClick={() => setClockOut(`${clockInLocal.slice(0, 10)}T17:00`)}
					className="-mt-2 w-fit text-[11px] font-bold text-(--forest) underline"
				>
					Set to 5:00 PM that day
				</button>

				<label>
					Reason
					<input
						type="text"
						required
						maxLength={500}
						placeholder="e.g. Forgot to clock out"
						value={reason}
						onChange={(event) => setReason(event.target.value)}
					/>
				</label>

				<div className="audit-note">
					This change is recorded with your name, the time, and the reason.
				</div>

				{error && <p className="form-error">{error}</p>}

				<div className="modal-actions">
					<button type="button" onClick={onClose}>
						Cancel
					</button>
					<button
						type="submit"
						className="button button-primary"
						disabled={!canSubmit}
					>
						{saving ? "Saving..." : "Clock out"}
					</button>
				</div>
			</form>
		</Modal>
	);
}
