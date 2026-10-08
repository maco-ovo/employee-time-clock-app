// Types for the admin pages. They match what lib/db/queries/shifts.ts returns.

// The signed-in admin (from requireAdmin() in lib/auth/guards.ts)
export type AdminUser = {
  id: string;
  name: string;
  email: string;
};

// Numbers for the 4 cards (from getAdminStats())
export type DashboardStats = {
  clockedInNow: number;
  activeEmployees: number;
  weekShifts: number;
  weekMinutes: number;
};

// One person who is clocked in right now (from getLiveShifts())
export type LiveShift = {
  id: string;
  clockIn: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
};



export type EmployeeDirectory = {
  id: string;
  name: string;
  email: string;
  minutes: number;
};