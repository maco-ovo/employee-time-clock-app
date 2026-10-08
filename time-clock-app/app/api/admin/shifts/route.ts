// Owner: C
// GET /api/admin/shifts?from=2026-09-28&to=2026-10-04 -> total minutes per employee (SQL SUM + GROUP BY).
import { requireApiAdmin } from "@/lib/auth/guards";
import { getHoursByEmployee } from "@/lib/db/queries/shifts";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const auth = await requireApiAdmin();
  if (auth instanceof Response) return auth;

  const params = new URL(request.url).searchParams;
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  if (!DAY.test(from) || !DAY.test(to) || from > to) {
    return Response.json({ error: "from and to must be dates like 2026-09-28" }, { status: 400 });
  }

  const employees = await getHoursByEmployee(from, to);
  return Response.json({ from, to, employees });
}
