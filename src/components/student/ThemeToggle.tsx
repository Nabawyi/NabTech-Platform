"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    // Trigger transition ready class if not already there
    document.documentElement.classList.add("theme-ready");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-muted/50 text-muted-fg hover:bg-muted hover:text-foreground transition-all border border-card-border/50"
      aria-label="تبديل الوضع الليلي"
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
