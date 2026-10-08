import EmployeeDirectoryCard from "./EmployeeDirectoryCard";
import { Activity, TruckElectric } from "lucide-react";
// import { EmployeeDirectory } from "../_lib/types";
import { getLiveShifts } from "@/lib/db/queries/shifts";

export default async function EmployeeDirectory() {
  const shifts = await getLiveShifts();

  return (
    <section className="board">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-2 mb-2">
          <TruckElectric />
          <h2>Employee Directory</h2>
          {/* <span className="count-badge">{activeCount}active team members</span> */}
        </div>
        <small className="flex flex-row items-center gap-1 text-xs text-gray-500">
          <Activity size={14} /> Live · Updated when the page loads
        </small>
      </div>

      <div>
        {shifts.map((shift) => (
          <EmployeeDirectoryCard key={shift.id} shift={shift} />
        ))}
      </div>
    </section>
  );
}
