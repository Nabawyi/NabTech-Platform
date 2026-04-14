"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggleButton() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
      className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/15 rounded-xl text-xs font-bold text-white/80 hover:text-white transition-all border border-white/10"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-yellow-300" />
      ) : (
        <Moon className="w-4 h-4 text-blue-200" />
      )}
      <span className="hidden sm:inline">{theme === "dark" ? "نهاري" : "ليلي"}</span>
    </button>
  );
}
