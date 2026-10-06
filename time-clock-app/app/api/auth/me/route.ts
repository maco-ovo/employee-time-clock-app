// Owner: A
// GET /api/auth/me -> the current user and role.
import { requireApiUser } from "@/lib/auth/guards";

export async function GET() {
  const auth = await requireApiUser();
  if (auth instanceof Response) return auth;
  return Response.json({ user: auth });
}
