"use client";

import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Run theme initialization strictly on the client side after mount
    // This prevents HTML mismatch between server and client hydration
    const theme = localStorage.getItem("theme");
    if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Add transition-ready class after a small delay to avoid initial flash
    setTimeout(() => {
      document.documentElement.classList.add("theme-ready");
    }, 50);
  }, []);

  return <>{children}</>;
}
