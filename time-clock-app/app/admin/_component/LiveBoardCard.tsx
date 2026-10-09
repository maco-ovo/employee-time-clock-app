import Initials from "./Initials";
import ClockoutButton from "./ClockoutButton";
import type { LiveShift } from "../_lib/types";

const timeZone = process.env.COMPANY_TIMEZONE;

export default function LiveBoardCard({ shift }: { shift: LiveShift }) {
  // Show the start time in the company timezone, e.g. "9:02 AM"
  const startTime = shift.clockIn.toLocaleTimeString("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  });

  // The same time for the modal's date input, e.g. "2026-10-08T09:02"
  const day = shift.clockIn.toLocaleDateString("en-CA", { timeZone }); // "2026-10-08"
  const time = shift.clockIn.toLocaleTimeString("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }); // "09:02"
  const clockInLocal = `${day}T${time}`;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
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
        <div className="small-label">Start time</div>

        <div className="text-sm font-medium text-gray-700">
          {startTime}
        </div>
      </div>

      {/* Clock Out Button */}
      <ClockoutButton
        shiftId={shift.id}
        employeeName={shift.user.name}
        clockInLocal={clockInLocal}
        clockInLabel={startTime}
      />
    </div>
  );
}
