"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileClock } from 'lucide-react';


export default function Navigation() {
  const pathname = usePathname();
  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/employees", label: "Employees", icon: Users },
    { href: "/admin/reports", label: "Reports", icon: FileClock }
  ];

  return (
    <nav className="navigation">
      <div className="admin-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 ${
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(`${item.href}/`))
                ? "active"
                : ""
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
