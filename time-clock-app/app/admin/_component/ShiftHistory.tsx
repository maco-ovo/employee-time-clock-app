// Owner: C (built by A)
// Change history of one employee's shifts: who changed what, when, and why.
import { History } from "lucide-react";
import { formatDateTime, formatDay } from "../_lib/format";
import type { ShiftEditItem } from "@/lib/db/queries/shift-admin";

function value(date: Date | null): string {
  return date ? formatDateTime(date) : "open";
}

function changed(a: Date | null, b: Date | null): boolean {
  return (a?.getTime() ?? null) !== (b?.getTime() ?? null);
}

export default function ShiftHistory({ edits }: { edits: ShiftEditItem[] }) {
  return (
    <section className="rounded-xl border border-(--line) bg-white">
      <div className="flex items-center gap-2 border-b border-[#e8ecea] px-5 py-3.5">
        <History size={16} className="text-[#6f7f7d]" />
        <h2 className="font-display text-[14px] font-extrabold">Change history</h2>
      </div>

      {edits.length === 0 ? (
        <p className="p-6 text-center text-[13px] text-(--ink-soft)">
          No shift of this employee has been changed by an admin.
        </p>
      ) : (
        <ul>
          {edits.map((edit) => (
            <li key={edit.id} className="border-b border-[#eef1ef] px-5 py-3.5 last:border-b-0">
              <p className="text-[12px] text-[#6f7f7d]">
                {formatDateTime(edit.editedAt)} · <strong>{edit.editedByName}</strong> changed the
                shift of {formatDay(edit.shiftStartedAt)}
              </p>
              <ul className="mt-1 text-[13px]">
                {changed(edit.oldClockIn, edit.newClockIn) && (
                  <li>
                    Clock-in: {value(edit.oldClockIn)} → <strong>{value(edit.newClockIn)}</strong>
                  </li>
                )}
                {changed(edit.oldClockOut, edit.newClockOut) && (
                  <li>
                    Clock-out: {value(edit.oldClockOut)} → <strong>{value(edit.newClockOut)}</strong>
                  </li>
                )}
              </ul>
              <p className="mt-1 text-[12px] text-[#53706b]">Reason: {edit.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
