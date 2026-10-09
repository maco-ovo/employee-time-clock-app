// Owner: C (built by A)
// Period picker for the employee detail page. Plain links and a GET form, so it needs no client JS:
// the range lives in the URL (?from=YYYY-MM-DD&to=YYYY-MM-DD) and the page re-renders on the server.
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, countDays, formatDayString } from "../_lib/format";

type Props = {
  basePath: string; // e.g. /admin/employees/<id>
  from: string;
  to: string;
  isCurrentWeek: boolean;
};

export default function ShiftRangeFilter({ basePath, from, to, isCurrentWeek }: Props) {
  // Move by the length of the range, so a one-week range moves by a week.
  const length = countDays(from, to);
  const prev = `${basePath}?from=${addDays(from, -length)}&to=${addDays(to, -length)}`;
  const next = `${basePath}?from=${addDays(from, length)}&to=${addDays(to, length)}`;

  const arrow =
    "grid size-8 place-items-center rounded-lg border border-(--line) bg-white text-[#60716e] hover:border-(--forest) hover:text-(--forest)";
  const dateInput =
    "rounded-lg border border-[#d6dfdb] bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-[#43877d] focus:ring-3 focus:ring-[#dcefe9]";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Link href={prev} aria-label="Previous period" className={arrow}>
          <ChevronLeft size={16} />
        </Link>
        <Link href={next} aria-label="Next period" className={arrow}>
          <ChevronRight size={16} />
        </Link>
        <span className="font-display text-[14px] font-extrabold">
          {formatDayString(from)} – {formatDayString(to)}
        </span>
        {!isCurrentWeek && (
          <Link href={basePath} className="text-[12px] font-bold text-(--forest) underline">
            This week
          </Link>
        )}
      </div>

      <form method="get" action={basePath} className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#60716e]">
          From
          <input type="date" name="from" defaultValue={from} required className={dateInput} />
        </label>
        <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#60716e]">
          To
          <input type="date" name="to" defaultValue={to} required className={dateInput} />
        </label>
        <button
          type="submit"
          className="rounded-lg border border-(--forest) px-3 py-1.5 text-[12px] font-bold text-(--forest) hover:bg-(--mint-light)"
        >
          Apply
        </button>
      </form>
    </div>
  );
}
