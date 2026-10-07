type Employee = {
  id: number;
  name: string;
  email: string;
  jobTitle: string;
  location: string;
  isActive: boolean;
};

const employees: Employee[] = [
  { id: 1, name: "Maya Patel", email: "maya@northstar.demo", jobTitle: "Inventory Coordinator", location: "East Hub", isActive: true },
  { id: 2, name: "James Okafor", email: "james@northstar.demo", jobTitle: "Forklift Operator", location: "East Hub", isActive: true },
  { id: 3, name: "Sofia Reyes", email: "sofia@northstar.demo", jobTitle: "Dispatch Lead", location: "West Hub", isActive: true },
  { id: 4, name: "Liam Chen", email: "liam@northstar.demo", jobTitle: "Warehouse Associate", location: "West Hub", isActive: true },
  { id: 5, name: "Amara Williams", email: "amara@northstar.demo", jobTitle: "Receiving Clerk", location: "East Hub", isActive: true },
  { id: 6, name: "Noah Thompson", email: "noah@northstar.demo", jobTitle: "Warehouse Associate", location: "West Hub", isActive: true },
  { id: 7, name: "Priya Shah", email: "priya@northstar.demo", jobTitle: "Receiving Clerk", location: "East Hub", isActive: false },
];