// Owner: B
// Employee shell. requireEmployee() runs here: not signed in ->
// /login, signed in as an admin -> /admin. The /employee route
// itself then redirects employees to their own /employee/<id> page.
import Header from "./_component/header"
import { requireEmployee } from "@/lib/auth/guards"

export default async function EmployeeLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const user = await requireEmployee()

	return (
		<>
			<Header user={user} />
			{children}
		</>
	)
}
