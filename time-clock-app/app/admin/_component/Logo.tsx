import Link from "next/link";
import { PackageCheck } from "lucide-react";

export default function Logo() {
  return (
    <Link href="/admin" className="brand" aria-label="Northstar Logistics admin home">
      <span className="brand-mark">
        <PackageCheck size={22} strokeWidth={2.3} />
      </span>
      <span>
        <strong>Northstar</strong>
        <small>LOGISTICS THAILAND</small>
      </span>
    </Link>
  );
}
