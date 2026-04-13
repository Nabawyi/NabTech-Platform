"use client";

import { Bell, Moon, Sun, Menu, ChevronLeft } from "lucide-react";
import { useSettings } from "@/components/providers/SettingsProvider";
import { usePathname } from "next/navigation";

export default function TeacherTopbar() {
  const { settings, toggleDarkMode } = useSettings();
  const pathname = usePathname();
  const isDark = settings.dark_mode;

  const getPageTitle = () => {
    if (pathname === "/teacher") return "لوحة التحكم";
    if (pathname.includes("/students")) return "إدارة الطلاب";
    if (pathname.includes("/subscriptions")) return "الاشتراكات";
    if (pathname.includes("/attendance")) return "الحضور";
    if (pathname.includes("/groups")) return "المجموعات";
    if (pathname.includes("/lessons")) return "الدروس";
    if (pathname.includes("/settings")) return "الإعدادات";
    return "لوحة التحكم";
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
      <div className="px-6 md:px-10 h-16 flex items-center justify-between">
        {/* Left: Indicator & Title */}
        <div className="flex items-center gap-6">
          <button className="p-2 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-slate-500" />
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">NabTech</span>
            <ChevronLeft className="w-3 h-3 text-slate-300 hidden sm:block" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
              {getPageTitle()}
            </h2>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-500"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-500">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Profile Minimal */}
          <div className="flex items-center gap-3 pl-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
              {(settings.name || "م").charAt(0)}
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 hidden md:block">
              {settings.name || "المعلم"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
