import HourReportCard from "./HourReportCard";
import PeriodFilter from "./PeriodFilter";
import { FileClock } from "lucide-react";
import { getHoursByEmployee } from "@/lib/db/queries/shifts";

type Props = {
  period: string; // "week", "last-week", "month", "last-month" or "custom"
  from: string;   // first day, e.g. "2026-10-05"
  to: string;     // last day, e.g. "2026-10-07"
};

// Show a date nicely, e.g. "2026-10-05" -> "Oct 5, 2026"
function formatDay(day: string) {
  return new Date(day + "T00:00:00Z").toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// The same columns are used by the header and by every row, so they line up.
export const REPORT_COLUMNS =
  "grid grid-cols-[minmax(220px,1fr)_minmax(140px,180px)_minmax(120px,160px)_90px_110px] items-center gap-4";

export default async function HourReport({ period, from, to }: Props) {
  // Load the data once here, then give one row to each card.
  const rows = await getHoursByEmployee(from, to);

  return (
    <section className="board">
      <div className="board-header">
        <div className="flex flex-row items-center gap-2">
          <FileClock />
          <h2>Hours report</h2>
          <span className="count-badge">
            <span className="inner">
              {formatDay(from)} – {formatDay(to)}
            </span>
          </span>
        </div>
        <PeriodFilter period={period} from={from} to={to} />
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">No employees found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50">
          {/* Column names */}
          <div className={`${REPORT_COLUMNS} min-w-[820px] bg-gray-50 px-4 py-3 small-label`}>
            <span>Employee</span>
            <span>Job Title</span>
            <span>Location</span>
            <span>Hours</span>
            <span />
          </div>

          {/* One row per employee, with a line between rows */}
          <div className="min-w-[820px] divide-y divide-gray-200">
            {rows.map((row) => (
              <HourReportCard key={row.id} row={row} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
