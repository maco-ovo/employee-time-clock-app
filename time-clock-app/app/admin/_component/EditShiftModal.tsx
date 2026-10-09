"use client";
// Owner: C (built by A)
// Correct a shift (PATCH /api/admin/shifts/:id). Only the fields that changed are sent.
// An open shift can only have its clock-in corrected; use ClockoutModal to close it.
import { useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import Modal from "./Modal";

export type EditShiftModalProps = {
  shiftId: string;
  employeeName: string;
  clockInLocal: string; // company time, "YYYY-MM-DDTHH:mm"
  clockOutLocal: string | null; // null = shift is still open
  onClose: () => void;
  onDone: () => void;
};

const REASON_MIN = 3;

export default function EditShiftModal({
  shiftId,
  employeeName,
  clockInLocal,
  clockOutLocal,
  onClose,
  onDone,
}: EditShiftModalProps) {
  const [clockIn, setClockIn] = useState(clockInLocal);
  const [clockOut, setClockOut] = useState(clockOutLocal ?? "");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const inChanged = clockIn !== clockInLocal;
  const outChanged = clockOutLocal !== null && clockOut !== clockOutLocal;
  const canSubmit =
    (inChanged || outChanged) &&
    clockIn !== "" &&
    (clockOutLocal === null || clockOut !== "") &&
    reason.trim().length >= REASON_MIN &&
    !saving;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSaving(true);

    const payload: { clockIn?: string; clockOut?: string; reason: string } = { reason };
    if (inChanged) payload.clockIn = clockIn;
    if (outChanged) payload.clockOut = clockOut;

    try {
      const response = await fetch(`/api/admin/shifts/${shiftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
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
      icon={<Pencil />}
      title="Edit shift"
      subtitle="Correct the times of this shift. Times are in company time."
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="employee-summary">
          <div>
            <strong>{employeeName}</strong>
            <small>{clockOutLocal === null ? "Shift is still open" : "Closed shift"}</small>
          </div>
        </div>

        <div className="form-grid">
          <label>
            Clock-in
            <input
              type="datetime-local"
              required
              value={clockIn}
              onChange={(event) => setClockIn(event.target.value)}
            />
          </label>
          {clockOutLocal !== null && (
            <label>
              Clock-out
              <input
                type="datetime-local"
                required
                min={clockIn}
                value={clockOut}
                onChange={(event) => setClockOut(event.target.value)}
              />
            </label>
          )}
        </div>

        <label>
          Reason
          <input
            type="text"
            required
            maxLength={500}
            placeholder="e.g. Clocked in late by mistake"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>

        <div className="audit-note">
          This change is recorded with your name, the time, the reason, and the old and new values.
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button button-primary" disabled={!canSubmit}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
