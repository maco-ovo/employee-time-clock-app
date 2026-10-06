import AddButton from "./AddButton";
import StatCard from "./StatCard";
import { ClipboardCheck, Clock3, UserRoundCheck, Users } from "lucide-react";

function greeting (name: string) {
  const currentHour = new Date().getHours();
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





export default function Overview() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
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
            {greeting("Mary Jane")}
          </h1>
          <p>
            {currentDate} at {currentTime}
          </p>
        </div>
        <div>
          <AddButton />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<UserRoundCheck />}
          label="CLOCKED IN NOW"
          value={'0'}
          note={
            '0 of 0 active employees'
          }
          tone="green"
        />
        <StatCard
          icon={<Clock3 />}
          label="WEEKLY HOURS"
          value={'0.0'}
          note={`Week of 0`}
          tone="blue"
        />
        <StatCard
          icon={<Users />}
          label="ACTIVE EMPLOYEES"
          value={'0'}
          note="Across 2 locations"
          tone="orange"
        />
        <StatCard
          icon={<ClipboardCheck />}
          label="SHIFTS THIS WEEK"
          value={'0'}
          note={`0 still open`}
          tone="violet"
        />{" "}
      </div>
    </div>
  );
}
