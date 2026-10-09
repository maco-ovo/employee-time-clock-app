// Owner: C (built by A)
// Top card of the employee detail page: who the employee is and their status right now.
import Link from "next/link";
import { ArrowLeft, Mail, MapPin } from "lucide-react";
import { formatTime } from "../_lib/format";
import type { EmployeeDetail } from "@/lib/db/queries/shift-admin";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function statusOf(employee: EmployeeDetail): { label: string; className: string } {
  if (!employee.isActive) {
    return { label: "Deactivated", className: "bg-[#f5e7e8] text-[#9f5d62]" };
  }
  if (employee.clockedInSince) {
    return {
      label: `Clocked in since ${formatTime(employee.clockedInSince)}`,
      className: "bg-[#e6f3eb] text-[#3e7c5d]",
    };
  }
  return { label: "Off shift", className: "bg-[#eef1ef] text-[#788582]" };
}

export default function EmployeeDetailHeader({ employee }: { employee: EmployeeDetail }) {
  const status = statusOf(employee);

  return (
    <section className="mb-[18px]">
      <Link
        href="/admin/employees"
        className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#6a7c7a] hover:text-(--forest)"
      >
        <ArrowLeft size={14} /> Back to employees
      </Link>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-(--line) bg-white p-5">
        <span className="grid size-12 flex-none place-items-center rounded-xl bg-[#dceddf] text-[14px] font-extrabold text-[#24614c]">
          {initials(employee.name)}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="font-display truncate text-[20px] font-extrabold">{employee.name}</h1>
          <p className="text-[12px] text-[#798885]">{employee.jobTitle ?? "Employee"}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#6f7f7d]">
            <span className="inline-flex items-center gap-1">
              <Mail size={13} /> {employee.email}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} /> {employee.location}
            </span>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-[11px] font-bold whitespace-nowrap ${status.className}`}
        >
          {status.label}
        </span>
      </div>
    </section>
  );
}
