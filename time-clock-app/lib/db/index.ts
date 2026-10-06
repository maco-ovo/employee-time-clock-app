// Owner: A
// Single Prisma client for the whole app (Neon serverless adapter).
// DATABASE_URL = Neon POOLED connection string (runtime). DIRECT_URL is used by the Prisma CLI only.
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../generated/prisma";

const connectionString = process.env.DIRECT_URL;
if (!connectionString) {
	throw new Error("DIRECT_URL is not set");
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
