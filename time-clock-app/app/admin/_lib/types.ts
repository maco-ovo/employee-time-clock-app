// Types for the admin pages. They match what lib/db/queries/shifts.ts returns.

// The signed-in admin (from requireAdmin() in lib/auth/guards.ts)
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  location?: string;
};

// One person who is clocked in right now (from getLiveShifts())
export type LiveShift = {
  id: string;
  clockIn: Date;
  user: {
    id: string;
    name: string;
    email: string;
    location: string;
  };
};

export type EmployeeDirectoryItem = {
  id: string;
  name: string;
  email: string;
  location: string;
  clockedIn: boolean;
  clockInTime?: Date;
  jobTitle: string;
};


// One row of the hours report (from getHoursByEmployee())
export type HourReportRow = {
  id: string;
  name: string;
  email: string;
  location: string;
  minutes: number;
  jobTitle: string | null;
};
