// Owner: C
import { requireAdmin } from "@/lib/auth/guards";
import HourReport from "../_component/HourReport";

// Today's date in the company timezone, e.g. "2026-10-07"
function getToday() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: process.env.COMPANY_TIMEZONE,
  });
}

// Turn "week" or "month" into a first day and a last day.
function getDateRange(period: string) {
  const today = getToday();

  if (period === "month") {
    // From the 1st of this month until today
    const firstOfMonth = today.slice(0, 8) + "01";
    return { from: firstOfMonth, to: today };
  }

  // Week: go back to Monday, then until today
  const date = new Date(today + "T00:00:00Z");
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  const monday = date.toISOString().slice(0, 10);
  return { from: monday, to: today };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requireAdmin();

  // Read ?period= from the URL. Anything other than "month" means "week".
  const params = await searchParams;
  const period = params.period === "month" ? "month" : "week";
  const { from, to } = getDateRange(period);

  return (
    <main className="">
      <HourReport period={period} from={from} to={to} />
    </main>
  );
}
