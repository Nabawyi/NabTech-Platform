"use client";

import { LogOut } from "lucide-react";
import { logoutUser } from "@/app/actions/students";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
    >
      <LogOut className="w-4 h-4" />
      تسجيل الخروج
    </button>
  );
}
