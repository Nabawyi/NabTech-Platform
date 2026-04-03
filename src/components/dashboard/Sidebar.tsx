"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, User, CalendarCheck, LogOut } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { logoutUser } from "@/app/actions/students";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/");
  };

  const links = [
    { name: "الرئيسية", href: "/dashboard", icon: LayoutDashboard },
    { name: "دروسي", href: "/dashboard/lessons", icon: BookOpen },
    { name: "سجل الحضور", href: "/dashboard/attendance", icon: CalendarCheck },
    { name: "الملف الشخصي", href: "/dashboard/profile", icon: User },
  ];

  return (
    <aside className="w-64 bg-white border-l border-gray-100 hidden md:flex flex-col h-full sticky top-0">
      <div className="p-6">
        <Link href="/dashboard">
          <Logo className="origin-right scale-75 xl:scale-90" />
        </Link>
      </div>

      <div className="flex-1 px-4 py-8 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-semibold"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>

    </aside>
  );
}
