// Owner: C
import { requireAdmin } from "@/lib/auth/guards";
import { isDay } from "@/lib/shift-validators";
import HourReport from "../_component/HourReport";

// Today's date in the company timezone, e.g. "2026-10-08"
function getToday() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: process.env.COMPANY_TIMEZONE,
  });
}

// Move a date forward or back, e.g. addDays("2026-10-08", -7) -> "2026-10-01"
function addDays(day: string, days: number) {
  const date = new Date(day + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// The Monday of the week that `day` is in
function getMonday(day: string) {
  const date = new Date(day + "T00:00:00Z");
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  return addDays(day, -daysSinceMonday);
}

// Turn the period from the URL into a first day and a last day.
function getDateRange(period: string, from?: string, to?: string) {
  const today = getToday();
  const monday = getMonday(today);
  const firstOfMonth = today.slice(0, 8) + "01";

  if (period === "last-week") {
    // Monday to Sunday of last week
    return { from: addDays(monday, -7), to: addDays(monday, -1) };
  }

  if (period === "month") {
    // The 1st of this month until today
    return { from: firstOfMonth, to: today };
  }

  if (period === "last-month") {
    // The day before the 1st of this month is the last day of last month
    const lastOfLastMonth = addDays(firstOfMonth, -1);
    return { from: lastOfLastMonth.slice(0, 8) + "01", to: lastOfLastMonth };
  }

  if (period === "custom" && isDay(from) && isDay(to) && from <= to) {
    return { from, to };
  }

  // "week" (and anything we don't know): Monday of this week until today
  return { from: monday, to: today };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  await requireAdmin();

  // Read ?period=, ?from= and ?to= from the URL
  const params = await searchParams;
  let period = params.period ?? "week";

  // A custom range needs two real dates, and "from" must not be after "to".
  // If they are wrong, show this week instead.
  if (period === "custom" && !(isDay(params.from) && isDay(params.to) && params.from <= params.to)) {
    period = "week";
  }

  const { from, to } = getDateRange(period, params.from, params.to);

  return (
    <main className="">
      <HourReport period={period} from={from} to={to} />
    </main>
  );
}
