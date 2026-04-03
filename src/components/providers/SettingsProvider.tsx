"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { type TeacherSettings } from "@/app/actions/settings";
import { EDUCATION_LEVELS, type EducationLevel } from "@/lib/constants";

type SettingsContextType = {
  settings: TeacherSettings;
  setSettings: (settings: TeacherSettings) => void;
  toggleDarkMode: () => void;
  isGradeEnabled: (stage: string, grade: number) => boolean;
  isGradeCodeEnabled: (code: string) => boolean;
  isLevelEnabled: (stage: string) => boolean;
  enabledLevels: EducationLevel[];
  getEnabledGradesForLevel: (levelId: string) => number[];
  getEnabledGradeCodesForLevel: (levelId: string) => string[];
};

const SettingsContext = createContext<SettingsContextType | null>(null);

/**
 * Applies the dark class to <html> and persists to localStorage.
 * Safe to call outside React (used in the provider and the toggle).
 */
function applyTheme(dark: boolean) {
  const html = document.documentElement;
  if (dark) {
    html.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    html.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}

export function SettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings: TeacherSettings;
}) {
  // Resolve the initial dark_mode: check localStorage first (client wins over server JSON)
  const resolvedInitial = useMemo<TeacherSettings>(() => {
    if (typeof window === "undefined") return initialSettings;
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") return { ...initialSettings, dark_mode: true };
      if (stored === "light") return { ...initialSettings, dark_mode: false };
    } catch {}
    return initialSettings;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [settings, setSettingsState] = useState<TeacherSettings>(resolvedInitial);
  const mounted = useRef(false);

  // On first mount: sync localStorage → html class (covers SSR mismatch)
  useEffect(() => {
    mounted.current = true;
    applyTheme(settings.dark_mode);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Whenever dark_mode changes after mount: apply immediately
  useEffect(() => {
    if (!mounted.current) return;
    applyTheme(settings.dark_mode);
  }, [settings.dark_mode]);

  /** Update settings state. Public setter used by consumers. */
  const setSettings = (next: TeacherSettings) => {
    setSettingsState(next);
  };

  /**
   * Toggle dark mode instantly:
   * 1. Flips the HTML class → visual change in <1 frame
   * 2. Persists to localStorage → survives reload, no server round-trip needed
   * 3. Updates React state → UI reactive (toggle button etc.)
   */
  const toggleDarkMode = () => {
    setSettingsState((prev) => {
      const next = { ...prev, dark_mode: !prev.dark_mode };
      applyTheme(next.dark_mode);
      return next;
    });
  };

  const isGradeEnabled = (stage: string, grade: number) =>
    settings.enabled_levels.includes(stage as any) &&
    settings.enabled_grades.includes(grade);

  const isGradeCodeEnabled = (code: string) =>
    settings.enabled_grade_codes.includes(code);


  const isLevelEnabled = (stage: string) =>
    settings.enabled_levels.includes(stage as any);

  const enabledLevels = useMemo(
    () => EDUCATION_LEVELS.filter((l) => settings.enabled_levels.includes(l.id as any)),
    [settings.enabled_levels]
  );

  const getEnabledGradesForLevel = (levelId: string) => {
    const level = EDUCATION_LEVELS.find((l) => l.id === levelId);
    if (!level) return [];
    return level.grades.map((g) => g.number).filter((n) => settings.enabled_grades.includes(n));
  };

  const getEnabledGradeCodesForLevel = (levelId: string) => {
    const level = EDUCATION_LEVELS.find((l) => l.id === levelId);
    if (!level) return [];
    return level.grades.map((g) => g.code).filter((c) => settings.enabled_grade_codes.includes(c));
  };


  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        toggleDarkMode,
        isGradeEnabled,
        isGradeCodeEnabled,
        isLevelEnabled,
        enabledLevels,
        getEnabledGradesForLevel,
        getEnabledGradeCodesForLevel,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
}
