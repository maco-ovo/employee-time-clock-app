import LiveBoardCard from "./LiveBoardCard";
import { Activity, TruckElectric } from "lucide-react";
import { getLiveShifts } from "@/lib/db/queries/shifts";

export default async function LiveBoard() {
  const shifts = await getLiveShifts();

  return (
    <section className="board">
      <div className="board-header">
        <div className="flex flex-row items-center gap-2">
          <TruckElectric />
          <h2>Working right now</h2>
          <span className="count-badge">
            <span className="inner">{shifts.length}</span>
          </span>
        </div>
        <small className="flex flex-row items-center gap-1 text-xs text-gray-500">
          <Activity size={14} /> Live · Updated when the page loads
        </small>
      </div>

      {shifts.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">Nobody is clocked in right now.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {shifts.map((shift) => (
            <LiveBoardCard key={shift.id} shift={shift} />
          ))}
        </div>
      )}
    </section>
  );
}
