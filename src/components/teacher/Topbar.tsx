"use client";

import { Bell, Moon, Sun } from "lucide-react";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function TeacherTopbar() {
  const { settings, toggleDarkMode } = useSettings();
  const isDark = settings.dark_mode;

  return (
    <header
      className="
        h-20 bg-card border-b border-card-border
        flex items-center justify-between px-6
        sticky top-0 z-30
      "
    >
      {/* Left — title */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex border-l border-card-border pl-4">
          <h2 className="text-xl font-black text-foreground">لوحة تحكم المعلم</h2>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">

        {/* ── Dark Mode Toggle ──────────────────────────────── */}
        <button
          onClick={toggleDarkMode}
          className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          style={{ backgroundColor: isDark ? "#3b82f6" : "#e2e8f0" }}
          role="switch"
          aria-checked={isDark}
        >
          <span className="sr-only">{isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}</span>
          <span
            className={`pointer-events-none relative inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isDark ? "-translate-x-3" : "translate-x-3"
            }`}
          >
            <span
              className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in ${
                isDark ? "opacity-0" : "opacity-100"
              }`}
              aria-hidden="true"
            >
              <Sun className="h-3.5 w-3.5 text-amber-500" />
            </span>
            <span
              className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in ${
                isDark ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden="true"
            >
              <Moon className="h-3.5 w-3.5 text-indigo-600" />
            </span>
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-card-border" />

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-fg" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-fg border-2 border-card rounded-full" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-card-border" />

        {/* User avatar — synced with settings.name */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-foreground leading-tight">{settings.name || "المعلم"}</p>
            <p className="text-xs text-muted-fg">المدير العام</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm select-none">
            {(settings.name || "م").charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
