// Owner: C
// GET /api/admin/shifts/live -> who is clocked in right now, and since when.
import { requireApiAdmin } from "@/lib/auth/guards";
import { getLiveShifts } from "@/lib/db/queries/shifts";

export async function GET() {
  const auth = await requireApiAdmin();
  if (auth instanceof Response) return auth;

  const shifts = await getLiveShifts();
  return Response.json({ shifts });
}
