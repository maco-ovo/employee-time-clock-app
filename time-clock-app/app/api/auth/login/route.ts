// Owner: A
// TODO: Verify credentials, reject deactivated users, set session cookie.
// Every handler must verify the session and role on the server (requireUser / requireAdmin).

export async function POST() {
  return Response.json({ error: "Not implemented" }, { status: 501 });
}
