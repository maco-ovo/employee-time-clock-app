

// Admin User
export type AdminUser = {
  id: number;
  name: string;
  title: string;
};



// Dashboard Stat
export type DashboardStats = {
  clockedInNow: number;
  activeEmployees: number;
  periodMinutes: number;
  shiftsInPeriod: number;
  openShiftsPastCutoff: number;
};

