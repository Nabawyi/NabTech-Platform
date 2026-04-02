"use client";

import { Bell, Menu, Search } from "lucide-react";

export type DashboardSession = {
  role: string;
  name?: string;
  id?: number;
  grade?: string;
};

export default function Topbar({ session }: { session?: DashboardSession | null }) {
  const userName = session?.name || "أحمد محمد";
  const userInitial = userName.charAt(0);

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 flex items-center justify-center">
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden sm:flex relative">
          <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="ابحث عن درس..." 
            className="pl-4 pr-10 py-2.5 bg-gray-50 rounded-xl border-transparent focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all w-64 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-50 transition-colors">
          <Bell className="w-6 h-6 text-gray-500" />
          <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            {session?.role === "student" && session.id != null && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-[10px] font-black tabular-nums">ID: {session.id}</span>
            )}
            <span className="text-sm font-black text-foreground">{session?.name}</span>
          </div>
          <span className="text-[10px] font-bold text-gray-400">
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
