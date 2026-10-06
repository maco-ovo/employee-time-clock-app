// Owner: A
// Role guards. Every page, layout and API route that reads or changes data must call one of these.
//
// Pages / layouts / server components (redirect when not allowed):
//   const user = await requireEmployee();   // or requireAdmin() / requireUser()
//
// Route handlers (return a 401/403 Response when not allowed):
//   const auth = await requireApiEmployee();  // or requireApiAdmin() / requireApiUser()
//   if (auth instanceof Response) return auth;
//   const user = auth;
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { readSessionUserId } from "./session";

export type Role = "ADMIN" | "EMPLOYEE";
export type AuthUser = { id: string; name: string; email: string; role: Role };

export function homePathFor(role: Role): string {
  return role === "ADMIN" ? "/admin" : "/employee";
}

// Reads the user from the database on every call, so a deactivated user loses access immediately.
export async function getCurrentUser(): Promise<AuthUser | null> {
  const userId = await readSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) return null;

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// ---- Pages / layouts ----

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireEmployee(): Promise<AuthUser> {
  const user = await requireUser();
  if (user.role !== "EMPLOYEE") redirect(homePathFor(user.role));
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect(homePathFor(user.role));
  return user;
}

// ---- Route handlers ----

export async function requireApiUser(): Promise<AuthUser | Response> {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });
  return user;
}

export async function requireApiEmployee(): Promise<AuthUser | Response> {
  const auth = await requireApiUser();
  if (auth instanceof Response) return auth;
  if (auth.role !== "EMPLOYEE") return Response.json({ error: "Employees only" }, { status: 403 });
  return auth;
}

export async function requireApiAdmin(): Promise<AuthUser | Response> {
  const auth = await requireApiUser();
  if (auth instanceof Response) return auth;
  if (auth.role !== "ADMIN") return Response.json({ error: "Admins only" }, { status: 403 });
  return auth;
}
