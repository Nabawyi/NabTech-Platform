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
      className="flex items-center gap-2 px-5 py-2.5 text-sm font-black text-red-500 bg-red-50/50 dark:bg-red-500/10 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white rounded-[1.2rem] border border-red-100 dark:border-red-500/20 transition-all active:scale-95 group shadow-sm hover:shadow-red-500/20"
    >
      <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      <span>تسجيل الخروج</span>
    </button>
  );
}
