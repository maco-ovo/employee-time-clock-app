import Initials from "./Initials";
import type { LiveShift } from "../_lib/types";
import { getAdminStats } from "@/lib/db/queries/shifts";

export default function HourReportCard({ shift }: { shift: LiveShift }) {
  return (
    <div className="flex items-center gap-2">
      <Initials id={shift.user.id} name={shift.user.name} />
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-gray-900">
          {shift.user.name}
        </div>

        <div className="text-sm text-gray-500">
          {shift.user.email}
        </div>
      </div>
      <div className="text-sm font-medium text-gray-900">
        {/* {shift.weekMinutes: rows[0].minutes, */}

      </div>
    </div>
  );
}