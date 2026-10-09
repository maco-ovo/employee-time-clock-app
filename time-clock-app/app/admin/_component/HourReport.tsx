import HourReportCard from "./HourReportCard";
import PeriodFilter from "./PeriodFilter";
import { FileClock } from "lucide-react";
import { getHoursByEmployee } from "@/lib/db/queries/shifts";

type Props = {
  period: string; // "week" or "month"
  from: string;   // first day, e.g. "2026-10-05"
  to: string;     // last day, e.g. "2026-10-07"
};

export default async function HourReport({ period, from, to }: Props) {
  // Load the data once here, then give one row to each card.
  const rows = await getHoursByEmployee(from, to);

  return (
    <section className="board">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-2 mb-2">
          <FileClock />
          <h2>Hours report</h2>
          <span className="count-badge">
            <span className="inner">{from} </span>
             to 
             <span className="inner">{to}</span>
          </span>
        </div>
        <PeriodFilter period={period} />
      </div>

      {rows.length === 0 ? (
        <p className="p-4 text-sm text-gray-500">No employees found.</p>
      ) : (
        <div className="flex flex-col">
          {rows.map((row) => (
            <HourReportCard key={row.id} row={row} />
          ))}
        </div>
      )}
    </section>
  );
}
