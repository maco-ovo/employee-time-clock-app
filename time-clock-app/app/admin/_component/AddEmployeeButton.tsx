"use client";

import { FormEvent, useState } from "react";
import { Plus, UserRound } from "lucide-react";
import Modal from "./Modal";

export default function AddEmployeeButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    // setSaving(false);
    // if (!result.ok) {
    //   setError(result.error);
    //   return;
    // }
    // setOpen(false);
    // router.push("/admin/employees");
    // router.refresh();
  }

  return (
    <>
      <button
        className="button button-primary"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Plus size={17} /> Add employee
      </button>
      {open && (
        <Modal
          icon={<UserRound />}
          title="Add an employee"
          subtitle="Create a new team member profile."
          onClose={() => setOpen(false)}
        >
          <form onSubmit={submit}>
            <label>
              Full name
              <input name="name" placeholder="e.g. Maya Patel" required />
            </label>
            <label>
              Work email
              <input
                name="email"
                type="email"
                placeholder="name@northstar.com"
                required
              />
            </label>
            <label>
              Temporary password
              <input
                name="password"
                type="password"
                placeholder="At least 8 characters"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>
              <label>
                Role
                <select name="jobTitle" defaultValue="" required>
                  <option value="" disabled>
                    Select role
                  </option>
                </select>
              </label>
           
            {error && <div className="form-error">{error}</div>}
            <div className="modal-actions">
              <button type="button" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button
                className="button button-primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Adding…" : "Add employee"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
