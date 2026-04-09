"use client";

import { Bell, Menu, Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export type DashboardSession = {
  role: string;
  name?: string;
  id?: string | number;
  code?: string;
  grade?: string;
};

export default function Topbar({ session }: { session?: DashboardSession | null }) {
  const userName = session?.name || "أحمد محمد";
  const userInitial = userName.charAt(0);

  return (
    <header className="h-20 bg-card border-b border-card-border flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-lg bg-muted text-muted-fg hover:bg-muted/80 flex items-center justify-center">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="w-6 h-6 text-muted-fg" />
          <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-card rounded-full"></span>
        </button>
        <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            {session?.role === "student" && session.code && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-[10px] font-black tabular-nums">{session.code}</span>
            )}
            <span className="text-sm font-black text-foreground">{session?.name}</span>
          </div>
          <span className="text-[10px] font-bold text-muted-fg leading-none">
            {session?.role === "teacher" ? "معلم المادة" : session?.grade ?? ""}
          </span>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-lg shadow-primary/20">
          {userInitial}
        </div>
      </div>
      </div>
    </header>
  );
}
