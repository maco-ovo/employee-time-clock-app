// Owner: A
// POST /api/auth/login  { email, password } -> sets the session cookie.
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { homePathFor } from "@/lib/auth/guards";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  const passwordOk = await verifyPassword(password, user?.passwordHash ?? null);

  if (!user || !passwordOk) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }
  if (!user.isActive) {
    return Response.json({ error: "Account deactivated" }, { status: 403 });
  }

  await createSession(user.id);
  return Response.json({ role: user.role, redirectTo: homePathFor(user.role) });
}
