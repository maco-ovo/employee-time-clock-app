import Initials from "./Initials";
import ClockoutButton from "./ClockoutButton";
import type { LiveShift } from "../_lib/types";

export default function EmployeeDirectoryCard({ shift }: { shift: LiveShift }) {


  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-200">
      {/* Avatar */}
      <Initials id={shift.user.id} name={shift.user.name} />

      {/* Employee Information */}
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-gray-900">
          {shift.user.name}
        </div>

        <div className="text-sm text-gray-500">
          {shift.user.email}
        </div>
      </div>

      {/* Start Time */}
      <div className="hidden text-right sm:block">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Start Time
        </div>

        <div className="text-sm font-medium text-gray-700">
          {startTime}
        </div>
      </div>

      {/* Clock Out Button */}
      <ClockoutButton />
    </div>
  );
}
