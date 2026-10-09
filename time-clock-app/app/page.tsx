// Public home page. Anyone can open it; it shows no clock data, names or hours.
// One link only: the button to /login.
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PackageCheck } from "lucide-react";

export const metadata: Metadata = {
	title: "Northstar Logistics",
	description: "Northstar Logistics, a subsidiary of ABC Holding Ltd.",
};

export default function Home() {
	return (
		<main className="grid min-h-screen place-items-center">
			<Link
				href="/login"
				className="rounded-[10px] bg-(--forest) px-8 py-3.5 font-bold text-white hover:bg-[#0a4b47] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--forest)"
			>
				Staff login
			</Link>
		</main>
	);
}
