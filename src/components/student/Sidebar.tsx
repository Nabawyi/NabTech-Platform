"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, User, CalendarCheck, LogOut, FileText } from "lucide-react";
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
    { name: "الرئيسية", href: "/student", icon: LayoutDashboard },
    { name: "دروسي", href: "/student/lessons", icon: BookOpen },
    { name: "نتائجي", href: "/student/quiz", icon: FileText },
    { name: "سجل الحضور", href: "/student/attendance", icon: CalendarCheck },
    { name: "الملف الشخصي", href: "/student/profile", icon: User },
  ];

  return (
    <aside className="w-64 bg-card border-l border-card-border hidden md:flex flex-col h-full sticky top-0 z-40 shadow-sm">
      <div className="p-8">
        <Link href="/student" className="block">
          <Logo className="origin-right scale-90 text-foreground" />
        </Link>
      </div>

      <div className="flex-1 px-4 py-8 space-y-1.5 font-cairo">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/25" 
                  : "text-muted-fg hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-muted-fg group-hover:text-primary'}`} />
              <span className="font-bold text-sm tracking-wide">{link.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-6 border-t border-card-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-danger-fg hover:bg-danger/10 transition-all font-bold text-sm group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
