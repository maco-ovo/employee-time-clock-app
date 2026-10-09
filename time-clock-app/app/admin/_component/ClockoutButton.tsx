"use client";
// Owner: C
// "Clock out" button on the Live board. Opens ClockoutModal for one open shift.
import { useState } from "react";
import { useRouter } from "next/navigation";
import ClockoutModal from "./ClockoutModal";

type Props = {
  shiftId: string;
  employeeName: string;
  clockInLocal: string; // e.g. "2026-10-08T09:02" (company time)
  clockInLabel: string; // e.g. "9:02 AM"
};

export default function ClockoutButton({
  shiftId,
  employeeName,
  clockInLocal,
  clockInLabel,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // After the shift is closed: hide the modal and reload the data from the database
  function done() {
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button className="button button-secondary button-small" onClick={() => setOpen(true)}>
        Clock Out
      </button>

      {open && (
        <ClockoutModal
          shiftId={shiftId}
          employeeName={employeeName}
          clockInLocal={clockInLocal}
          clockInLabel={clockInLabel}
          onClose={() => setOpen(false)}
          onDone={done}
        />
      )}
    </>
  );
}
