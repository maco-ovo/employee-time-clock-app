// Owner: A
// Allowed values for the employee form.
// The DB columns are plain text, so changing these lists
export const JOB_TITLES = [
	"Warehouse Associate",
	"Inventory Coordinator",
	"Forklift Operator",
] as const;
export const LOCATIONS = ["Bangkok", "Chiang Mai"] as const;

export type JobTitle = (typeof JOB_TITLES)[number];
export type Location = (typeof LOCATIONS)[number];
