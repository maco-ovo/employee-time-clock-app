"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      onClick={logout}
      aria-label="Log out"
      className=" text-red-500 font-bold py-2 px-4 rounded"
    >
      <LogOut className="w-5 h-5" />
    </button>
  );
}
