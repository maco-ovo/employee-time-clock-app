// Owner: C (built by A)
// One week of shifts for one employee, with the week total (summed by the database).
import { formatDateTime, formatDay, formatDayString, addDays, formatDuration, formatTime } from "../_lib/format";
import ShiftRowActions from "./ShiftRowActions";
import type { ShiftRow } from "@/lib/db/queries/shift-admin";

type Props = {
  employeeName: string;
  weekStart: string; // Monday, "YYYY-MM-DD"
  weekMinutes: number;
  shifts: ShiftRow[];
};

// Same day as the clock-in: just the time. A shift that crosses midnight: day and time.
function clockOutLabel(shift: ShiftRow): string | null {
  if (!shift.clockOut) return null;
  return formatDay(shift.clockOut) === formatDay(shift.clockIn)
    ? formatTime(shift.clockOut)
    : formatDateTime(shift.clockOut);
}

export default function ShiftWeekCard({ employeeName, weekStart, weekMinutes, shifts }: Props) {
  const th = "px-5 py-2.5 text-left text-[10px] font-extrabold tracking-[0.08em] text-[#758481] uppercase";

  return (
    <section className="mb-[18px] rounded-xl border border-(--line) bg-white">
      <div className="flex items-center justify-between border-b border-[#e8ecea] px-5 py-3.5">
        <h2 className="font-display text-[14px] font-extrabold">
          Week of {formatDayString(weekStart)} – {formatDayString(addDays(weekStart, 6))}
        </h2>
        <span className="rounded-full bg-[#edf2ef] px-2.5 py-1 text-[11px] font-bold text-[#647673]">
          {formatDuration(weekMinutes)} total
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[#eef1ef]">
              <th className={th}>Date</th>
              <th className={th}>Clock in</th>
              <th className={th}>Clock out</th>
              <th className={th}>Duration</th>
              <th className={`${th} text-right`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => {
              const out = clockOutLabel(shift);
              return (
                <tr key={shift.id} className="border-b border-[#eef1ef] last:border-b-0">
                  <td className="px-5 py-3 font-semibold">{formatDay(shift.clockIn)}</td>
                  <td className="px-5 py-3">{formatTime(shift.clockIn)}</td>
                  <td className="px-5 py-3">
                    {out ?? (
                      <span className="rounded-full bg-[#f9ebe0] px-2 py-1 text-[11px] font-bold text-[#b66a3d]">
                        Still clocked in
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {shift.minutes === null ? (
                      <span className="text-[#9aa7a4]">—</span>
                    ) : (
                      formatDuration(shift.minutes)
                    )}
                    {shift.editCount > 0 && (
                      <span
                        title={`Changed ${shift.editCount} time${shift.editCount === 1 ? "" : "s"}. See the change history below.`}
                        className="ml-2 rounded-full bg-[#eee9f6] px-2 py-0.5 text-[10px] font-bold text-[#715d97]"
                      >
                        Edited
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <ShiftRowActions
                      shiftId={shift.id}
                      employeeName={employeeName}
                      clockInLocal={shift.clockInLocal}
                      clockOutLocal={shift.clockOutLocal}
                      clockInLabel={formatDateTime(shift.clockIn)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
