// import AddEmployeeButton from "./AddEmployeeButton";
import StatCard from "./StatCard";
import { ClipboardCheck, Clock3, UserRoundCheck, Users } from "lucide-react";
import { getAdminStats } from "@/lib/db/queries/shifts";

const timeZone = process.env.COMPANY_TIMEZONE;

function greeting(name: string) {
  // Hour in the company timezone (0-23), not the server's timezone
  const currentHour = Number(
    new Date().toLocaleString("en-US", { timeZone, hour: "numeric", hourCycle: "h23" }),
  );
  let greeting = "";

  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }

  return `${greeting}, ${name}`;
}

export default async function Overview({ name }: { name: string }) {
  const stats = await getAdminStats();

  const currentDate = new Date().toLocaleDateString("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            OPERATIONS OVERVIEW
          </span>

          <h1 className="text-2xl font-bold mb-4">
            {greeting(name)}
          </h1>
          <p>
            {currentDate} at {currentTime}
          </p>
        </div>
        {/* <div>
          <AddEmployeeButton />
        </div> */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<UserRoundCheck />}
          label="CLOCKED IN NOW"
          value={String(stats.clockedInNow)}
          note={`of ${stats.activeEmployees} active employees`}
          tone="green"
        />
        <StatCard
          icon={<Clock3 />}
          label="WEEKLY HOURS"
          value={(stats.weekMinutes / 60).toFixed(1)}
          note="This week (Mon-Sun)"
          tone="blue"
        />
        <StatCard
          icon={<Users />}
          label="ACTIVE EMPLOYEES"
          value={String(stats.activeEmployees)}
          note="Can log in and clock in"
          tone="orange"
        />
        <StatCard
          icon={<ClipboardCheck />}
          label="SHIFTS THIS WEEK"
          value={String(stats.weekShifts)}
          note={`${stats.clockedInNow} still open`}
          tone="violet"
        />{" "}
      </div>
    </div>
  );
}
