"use client";

import { useSettings } from "@/components/providers/SettingsProvider";
import { updateTeacherSettings } from "@/app/actions/settings";
import { useState } from "react";
import { Moon, Sun, Save, GraduationCap, Check, Loader2, CheckCircle } from "lucide-react";

const STAGES = [
  { id: "primary",     name: "المرحلة الابتدائية", grades: [1, 2, 3, 4, 5, 6] },
  { id: "preparatory", name: "المرحلة الإعدادية",  grades: [1, 2, 3] },
  { id: "secondary",   name: "المرحلة الثانوية",   grades: [1, 2, 3] },
];

export default function SettingsPage() {
  const { settings, setSettings, toggleDarkMode, isGradeEnabled, isLevelEnabled } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(settings.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleGrade = (gradeNum: number) => {
    const current = [...settings.enabled_grades];
    const next = current.includes(gradeNum)
      ? current.filter((g) => g !== gradeNum)
      : [...current, gradeNum];
    setSettings({ ...settings, enabled_grades: next });
  };

  const handleToggleLevel = (stageId: string) => {
    const current = [...settings.enabled_levels];
    const next = current.includes(stageId as any)
      ? current.filter((l) => l !== stageId)
      : [...current, stageId as any];
    setSettings({ ...settings, enabled_levels: next });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save all settings to server
      await updateTeacherSettings({
        name: settings.name,
        dark_mode: settings.dark_mode,
        enabled_levels: settings.enabled_levels,
        enabled_grades: settings.enabled_grades,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12" dir="rtl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground">إعدادات المنصة</h1>
        <p className="text-muted-fg mt-2">تحكم في بياناتك الشخصية وفي شكل المنصة</p>
      </div>

      {/* ── Teacher Profile Card ── */}
      <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-card-border space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
          <GraduationCap className="w-5 h-5 text-primary" />
          بياناتي الشخصية
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-fg">الاسم بالكامل</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-card-border focus:border-primary outline-none text-foreground font-bold transition-all"
              placeholder="مثال: د. محمد نبوي"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-fg">كود الانضمام (للطلاب)</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={settings.inviteCode}
                className="flex-1 px-4 py-3 rounded-xl bg-muted/50 border border-card-border text-primary font-black tracking-widest outline-none cursor-default"
              />
              <button
                onClick={handleCopyCode}
                className="px-6 py-3 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-all flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4 rotate-90" />}
                {copied ? "تم النسخ" : "نسخ"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dark Mode Card ─────────────────────────────────────── */}
      <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-card-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              {settings.dark_mode
                ? <Moon className="w-5 h-5 text-indigo-400" />
                : <Sun  className="w-5 h-5 text-amber-500" />
              }
              {settings.dark_mode ? "الوضع الداكن مفعّل" : "الوضع الفاتح مفعّل"}
            </h2>
            <p className="text-sm text-muted-fg mt-1">
              يُطبَّق فوراً ويُحفَظ تلقائياً — لا حاجة لضغط حفظ
            </p>
          </div>

          {/* ── Instant toggle — no Save needed ── */}
          <button
            id="dark-mode-toggle"
            onClick={toggleDarkMode}
            role="switch"
            aria-checked={settings.dark_mode}
            className={`
              relative w-16 h-9 rounded-full p-1 flex items-center
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              transition-colors duration-300
              ${settings.dark_mode ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"}
            `}
          >
            <span className="sr-only">تبديل الوضع الداكن</span>
            <span
              className={`
                w-7 h-7 rounded-full bg-white shadow-md
                flex items-center justify-center
                transition-transform duration-300
                ${settings.dark_mode ? "translate-x-7" : "translate-x-0"}
              `}
            >
              {settings.dark_mode
                ? <Moon className="w-3.5 h-3.5 text-indigo-600" />
                : <Sun  className="w-3.5 h-3.5 text-amber-500" />
              }
            </span>
          </button>
        </div>
      </div>

      {/* ── Grades Card ────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-card-border">
        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <GraduationCap className="w-5 h-5 text-primary" />
            المراحل والصفوف الدراسية
          </h2>
          <p className="text-sm text-muted-fg mt-1">
            اختر المراحل والصفوف التي تريد إظهارها في لوحة التحكم. اضغط «حفظ» لتطبيق التغييرات.
          </p>
        </div>

        <div className="space-y-4">
          {STAGES.map((stage) => {
            const levelOn = isLevelEnabled(stage.id);
            return (
              <div
                key={stage.id}
                className={`
                  border rounded-xl p-5 transition-all
                  ${levelOn
                    ? "border-primary/30 bg-primary/5 dark:bg-primary/10"
                    : "border-card-border bg-muted opacity-70"}
                `}
              >
                {/* Stage toggle row */}
                <label className="flex items-center gap-3 cursor-pointer group mb-0">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={levelOn}
                      onChange={() => handleToggleLevel(stage.id)}
                    />
                    <div className="w-6 h-6 rounded border-2 border-card-border peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                      <Check className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all" />
                    </div>
                  </div>
                  <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {stage.name}
                  </span>
                </label>

                {/* Grade chips — animate in when stage is enabled */}
                {levelOn && (
                  <div className="flex flex-wrap gap-2 mt-4 pr-9 animate-in slide-in-from-top-2 duration-300">
                    {stage.grades.map((grade) => {
                      const on = isGradeEnabled(stage.id, grade);
                      return (
                        <button
                          key={grade}
                          onClick={() => handleToggleGrade(grade)}
                          className={`
                            flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-bold
                            transition-all hover:-translate-y-0.5 active:scale-95
                            ${on
                              ? "bg-white dark:bg-card border-primary text-primary shadow-sm"
                              : "bg-transparent border-card-border text-muted-fg hover:border-primary/40"}
                          `}
                        >
                          {on && <Check className="w-3.5 h-3.5" />}
                          الصف {grade}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Save Button — for grades/levels only */}
        <div className="mt-8 flex justify-end">
          <button
            id="save-settings-btn"
            onClick={handleSave}
            disabled={isSaving}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-xl font-bold
              transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
              ${saved
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover"}
            `}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{saved ? "تم الحفظ!" : "حفظ الإعدادات"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
