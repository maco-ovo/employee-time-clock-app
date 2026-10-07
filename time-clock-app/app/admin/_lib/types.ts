

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


export type Employee = {
  id: number;
  name: string;
  email: string;
  jobTitle: string;
  location: string;
  isActive: boolean;
};
