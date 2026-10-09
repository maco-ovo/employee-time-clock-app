// Owner: B
// The /employee route redirects to /employee/<id> so the login flow's
// `redirectTo + '/' + id` target works uniformly. Both pages share the same
// client component logic (page.tsx under [id]) which reads its id from params.
import { getCurrentUser, homePathFor } from "@/lib/auth/guards";
import { redirect } from "next/navigation";

export default async function EmployeeHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "EMPLOYEE") redirect(homePathFor(user.role));
  redirect(`/employee/${user.id}`);
}
