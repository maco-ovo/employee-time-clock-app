import Link from "next/link";

// Two links that change the URL: ?period=week or ?period=month.
// The reports page reads the URL and loads the right dates.
export default function PeriodFilter({ period }: { period: string }) {
  return (
    <div className="flex flex-row items-center gap-2">
      <Link
        href="?period=week"
        className={`px-3 py-1 text-sm rounded-md ${
          period === "week" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
        }`}
      >
        This Week
      </Link>
      <Link
        href="?period=month"
        className={`px-3 py-1 text-sm rounded-md ${
          period === "month" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
        }`}
      >
        This Month
      </Link>
    </div>
  );
}
