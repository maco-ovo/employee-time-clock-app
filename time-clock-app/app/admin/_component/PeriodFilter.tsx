"use client";
// Owner: C
// Dropdown for the hours report. The choice goes into the URL, e.g. ?period=last-week,
// and the reports page reads the URL and loads the right dates.
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  period: string; // the period shown now, e.g. "week"
  from: string;   // e.g. "2026-10-05"
  to: string;     // e.g. "2026-10-08"
};

export default function PeriodFilter({ period, from, to }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState(period);

  function changePeriod(value: string) {
    setSelected(value);
    // "Custom range" waits for the dates and the Apply button
    if (value !== "custom") {
      router.push(`?period=${value}`);
    }
  }

  return (
    <div className="flex flex-row flex-wrap items-center gap-2">
      <select
        aria-label="Report period"
        value={selected}
        onChange={(event) => changePeriod(event.target.value)}
        className="filter-input"
      >
        <option value="week">This week</option>
        <option value="last-week">Last week</option>
        <option value="month">This month</option>
        <option value="last-month">Last month</option>
        <option value="custom">Custom range</option>
      </select>

      {/* A normal form: Apply goes to ?period=custom&from=...&to=... */}
      {selected === "custom" && (
        <form method="get" className="flex flex-row items-center gap-2">
          <input type="hidden" name="period" value="custom" />
          <input
            type="date"
            name="from"
            defaultValue={from}
            required
            className="filter-input"
          />
          <span className="text-sm text-gray-500">to</span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            required
            className="filter-input"
          />
          <button type="submit" className="button button-primary button-small">
            Apply
          </button>
        </form>
      )}
    </div>
  );
}
