"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, CheckSquare, UserCheck, LogOut, MapPin, CreditCard, Settings } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { logoutUser } from "@/app/actions/students";

export default function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { name: "لوحة التحكم", href: "/teacher", icon: LayoutDashboard },
    { name: "إدارة الطلاب", href: "/teacher/students", icon: Users },
    { name: "الاشتراكات", href: "/teacher/subscriptions", icon: CreditCard },
    { name: "تسجيل الحضور", href: "/teacher/attendance", icon: UserCheck },
    { name: "السناتر والمجموعات", href: "/teacher/groups", icon: MapPin },
    { name: "الدروس", href: "/teacher/lessons", icon: BookOpen },
    { name: "الاختبارات", href: "/teacher/quizzes", icon: CheckSquare },
    { name: "الإعدادات", href: "/teacher/settings", icon: Settings },
  ];


  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col h-full sticky top-0">
      <div className="p-6">
        <div className="brightness-0 invert opacity-90 transition-opacity hover:opacity-100">
          <Link href="/teacher">
            <Logo className="origin-right scale-75 xl:scale-90" />
          </Link>
        </div>
      </div>

      <div className="flex-1 px-4 py-8 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/teacher');
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all font-semibold text-slate-300"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
