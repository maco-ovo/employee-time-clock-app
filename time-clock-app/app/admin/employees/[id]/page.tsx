// Owner: C (built by A)
// Admin > Employees > one employee: shifts grouped by week with totals, close an open shift,
// edit a shift (reason required), and the change history.
// Reached by clicking an employee in the employee directory. The period is in the URL: ?from=&to=
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import {
	getCurrentWeekRange,
	getEmployeeDetail,
	getEmployeeShiftEdits,
	getEmployeeShifts,
	type ShiftRow,
} from "@/lib/db/queries/shift-admin";
import { isDay } from "@/lib/shift-validators";
import { isUuid } from "@/lib/validators";
import { formatDuration } from "../../_lib/format";
import EmployeeDetailHeader from "../../_component/EmployeeDetailHeader";
import ShiftHistory from "../../_component/ShiftHistory";
import ShiftRangeFilter from "../../_component/ShiftRangeFilter";
import ShiftWeekCard from "../../_component/ShiftWeekCard";

type WeekGroup = { weekStart: string; weekMinutes: number; shifts: ShiftRow[] };

export default async function AdminEmployeeDetailPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ from?: string | string[]; to?: string | string[] }>;
}) {
	// Check again here: a layout check alone does not protect the page.
	await requireAdmin();

	const { id } = await params;
	if (!isUuid(id)) notFound();

	const employee = await getEmployeeDetail(id);
	if (!employee) notFound();

	const query = await searchParams;
	const week = await getCurrentWeekRange();
	const hasRange =
		isDay(query.from) && isDay(query.to) && query.from <= query.to;
	const range = hasRange
		? { from: query.from as string, to: query.to as string }
		: week;
	const isCurrentWeek = range.from === week.from && range.to === week.to;

	const [shifts, edits] = await Promise.all([
		getEmployeeShifts(id, range.from, range.to),
		getEmployeeShiftEdits(id),
	]);

	// The rows come newest first, so the shifts of one week are next to each other.
	const weeks: WeekGroup[] = [];
	for (const shift of shifts) {
		const last = weeks[weeks.length - 1];
		if (last && last.weekStart === shift.weekStart) {
			last.shifts.push(shift);
		} else {
			weeks.push({
				weekStart: shift.weekStart,
				weekMinutes: shift.weekMinutes,
				shifts: [shift],
			});
		}
	}
	const rangeMinutes = shifts[0]?.rangeMinutes ?? 0;

	return (
		<div>
			<EmployeeDetailHeader employee={employee} />

			<div className="mb-[18px] flex flex-col gap-4 rounded-xl border border-(--line) bg-white p-5">
				<ShiftRangeFilter
					basePath={`/admin/employees/${id}`}
					from={range.from}
					to={range.to}
					isCurrentWeek={isCurrentWeek}
				/>
				<p className="text-[13px] text-[#53706b]">
					<strong className="font-display text-[18px] text-(--ink)">
						{formatDuration(rangeMinutes)}
					</strong>{" "}
					in {shifts.length} {shifts.length === 1 ? "shift" : "shifts"} in this
					period
				</p>
			</div>

			{weeks.length === 0 ? (
				<p className="mb-[18px] rounded-xl border border-(--line) bg-white p-8 text-center text-[13px] text-(--ink-soft)">
					No shifts in this period.
				</p>
			) : (
				weeks.map((group) => (
					<ShiftWeekCard
						key={group.weekStart}
						employeeName={employee.name}
						weekStart={group.weekStart}
						weekMinutes={group.weekMinutes}
						shifts={group.shifts}
					/>
				))
			)}

			<ShiftHistory edits={edits} />
		</div>
	);
}
