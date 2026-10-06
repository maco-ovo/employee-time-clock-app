import Initials from "./Initials";
import ClockoutButton from "./ClockoutButton";

export default function LiveBoardCard() {
  const employee = {
    id: 1,
    name: "John Doe",
    position: "Software Engineer",
    location: "New York",
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Avatar */}
      <Initials id={employee.id} name={employee.name} />

      {/* Employee Information */}
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-gray-900">
          {employee.name}
        </div>

        <div className="text-sm text-gray-500">
          {employee.position}
        </div>

        <div className="text-xs text-gray-400">
          {employee.location}
        </div>
      </div>

      {/* Start Time */}
      <div className="hidden text-right sm:block">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Start Time
        </div>

        <div className="text-sm font-medium text-gray-700">
          9:00 AM
        </div>
      </div>

      {/* Clock Out Button */}
      <ClockoutButton />
    </div>
  );
}