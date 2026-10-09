import Initials from "./Initials";
import Link from "next/link";
import { REPORT_COLUMNS } from "./HourReport";
import type { HourReportRow } from "../_lib/types";

// Turn minutes into text, e.g. 2370 -> "39h 30m"
function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h ${rest}m`;
}

// Shows one employee and their total hours. It does not load any data itself.
export default function HourReportCard({ row }: { row: HourReportRow }) {
  return (
    <div className={`${REPORT_COLUMNS} bg-white px-4 py-4 transition-colors hover:bg-[#f8fbfa]`}>
      {/* Avatar + name */}
      <div className="flex min-w-0 items-center gap-3">
        <Initials id={row.id} name={row.name} />
        <div className="min-w-0">
          <div className="truncate font-semibold text-gray-900">{row.name}</div>
        </div>
      </div>

      {/* Job title */}
      <div className="truncate text-sm text-gray-700">{row.jobTitle ?? "—"}</div>

      {/* Location */}
      <div className="truncate text-sm text-gray-700">{row.location ?? "—"}</div>

      {/* Total hours */}
      <div className="text-sm font-semibold tabular-nums text-gray-900">{formatMinutes(row.minutes)}</div>

      {/* Link to the employee detail page */}
      <Link
        className="button button-secondary button-small justify-self-end"
        href={`/admin/employees/${row.id}`}
      >
        View details
      </Link>
    </div>
  );
}
