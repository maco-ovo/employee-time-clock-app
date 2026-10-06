// Owner: C
// TODO: Who is clocked in right now, and since when.
// Every handler must verify the session and role on the server (requireUser / requireAdmin).

export async function GET() {
  return Response.json({ error: "Not implemented" }, { status: 501 });
}
