// Owner: C
// TODO: Correct a shift. Record who, when, and why in shift_edits.
// Every handler must verify the session and role on the server (requireUser / requireAdmin).

export async function PATCH() {
  return Response.json({ error: "Not implemented" }, { status: 501 });
}
