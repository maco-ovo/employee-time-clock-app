"use client";
// Owner: C (built by A)
// Buttons at the end of a shift row: "Clock out" (open shifts only) and "Edit".
// After a change the page is re-read from the database with router.refresh().
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Pencil } from "lucide-react";
import ClockoutModal from "./ClockoutModal";
import EditShiftModal from "./EditShiftModal";

type Props = {
  shiftId: string;
  employeeName: string;
  clockInLocal: string;
  clockOutLocal: string | null;
  clockInLabel: string;
};

export default function ShiftRowActions({
  shiftId,
  employeeName,
  clockInLocal,
  clockOutLocal,
  clockInLabel,
}: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<null | "close" | "edit">(null);
  const isOpen = clockOutLocal === null;

  function done() {
    setModal(null);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {isOpen && (
        <button
          type="button"
          onClick={() => setModal("close")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-(--forest) px-3 py-1.5 text-[12px] font-bold text-white hover:bg-[#0a4b47]"
        >
          <LogOut size={14} /> Clock out
        </button>
      )}
      <button
        type="button"
        aria-label="Edit shift"
        onClick={() => setModal("edit")}
        className="inline-flex items-center gap-1.5 rounded-lg border border-(--line) px-2.5 py-1.5 text-[12px] font-semibold text-[#60716e] hover:border-(--forest) hover:text-(--forest)"
      >
        <Pencil size={14} /> Edit
      </button>

      {modal === "close" && (
        <ClockoutModal
          shiftId={shiftId}
          employeeName={employeeName}
          clockInLocal={clockInLocal}
          clockInLabel={clockInLabel}
          onClose={() => setModal(null)}
          onDone={done}
        />
      )}
      {modal === "edit" && (
        <EditShiftModal
          shiftId={shiftId}
          employeeName={employeeName}
          clockInLocal={clockInLocal}
          clockOutLocal={clockOutLocal}
          onClose={() => setModal(null)}
          onDone={done}
        />
      )}
    </div>
  );
}
