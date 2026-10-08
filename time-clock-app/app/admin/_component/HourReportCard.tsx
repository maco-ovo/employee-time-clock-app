import Initials from "./Initials";
import Link from "next/link";
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
    <div className="flex justify-between items-center gap-4 p-4 bg-white border border-gray-200">
      
      <div className="flex items-center gap-4">
      {/* Avatar */}
      <Initials id={row.id} name={row.name} />

      {/* Employee Information */}
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-gray-900">
          {row.name}
        </div>

        <div className="text-sm text-gray-500">
          {row.email}
        </div>
      </div>
      </div>

       {/* Location */}
      <div className="text-center">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Location
        </div>

        <div className="text-sm font-medium text-gray-700">
          {row.location}
        </div>
      </div>

      {/* Total Hours */}
      <div className="text-right">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Hours
        </div>

        <div className="text-sm font-medium text-gray-700">
          {formatMinutes(row.minutes)}
        </div>
      </div>

      {/* <Link className="button button-secondary" href={`/admin/employees/${row.id}`}>
        View Details
      </Link> */}
    </div>
  );
}
