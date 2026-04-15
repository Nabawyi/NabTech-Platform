"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, FileText, CalendarCheck, User } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { name: "الرئيسية", href: "/student", icon: LayoutDashboard },
    { name: "دروسي", href: "/student/lessons", icon: BookOpen },
    { name: "نتائجي", href: "/student/quiz", icon: FileText },
    { name: "الحضور", href: "/student/attendance", icon: CalendarCheck },
    { name: "حسابي", href: "/student/profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-card-border px-4 py-2 flex items-center justify-between z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-300 ${
              isActive ? "text-primary translate-y-[-4px]" : "text-muted-fg"
            }`}
          >
            <div className={`p-2 rounded-xl transition-all ${isActive ? "bg-primary/10" : ""}`}>
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[3px]" : "stroke-[2px]"}`} />
            </div>
            <span className={`text-[10px] font-black tracking-tight ${isActive ? "opacity-100" : "opacity-60"}`}>
              {link.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
