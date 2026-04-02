"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, BookOpen, Search, Loader2 } from "lucide-react";
import { getLessons, type Lesson } from "@/app/actions/lessons";
import LessonCard from "@/components/teacher/LessonCard";
import { EDUCATION_LEVELS, SchoolLevel, getGradeLabel } from "@/lib/constants";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function TeacherLessonsPage() {
  const { settings, enabledLevels, getEnabledGradesForLevel } = useSettings();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Default to first enabled level instead of hardcoded "secondary"
  const firstEnabledLevel = (enabledLevels[0]?.id as SchoolLevel) ?? "secondary";
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel>(firstEnabledLevel);
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // When enabled levels change, ensure selectedLevel is valid
  useEffect(() => {
    if (enabledLevels.length > 0 && !enabledLevels.find(l => l.id === selectedLevel)) {
      setSelectedLevel(enabledLevels[0].id as SchoolLevel);
      setSelectedGrade(1);
    }
  }, [enabledLevels, selectedLevel]);

  const fetchLessons = async () => {
    if (enabledLevels.length === 0) {
      setLessons([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getLessons(settings.id);
      // Data-level filter by teacher settings
      const settingsFiltered = data.filter((l) => {
        const stage = l.level;
        const grade = l.gradeNumber;
        return settings.enabled_levels.includes(stage) && settings.enabled_grades.includes(grade);
      });
      setLessons(settingsFiltered);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [settings.enabled_levels, settings.enabled_grades]);

  const filteredLessons = lessons.filter(
    (l) => l.level === selectedLevel && 
    l.gradeNumber === selectedGrade && 
    (l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Only show enabled grades for the selected level
  const enabledGradesForLevel = getEnabledGradesForLevel(selectedLevel);
  const currentLevelObj = EDUCATION_LEVELS.find(l => l.id === selectedLevel);
  const currentLevelGrades = currentLevelObj?.grades.filter(g => enabledGradesForLevel.includes(g.number)) || [];
  const currentGradeLabel = getGradeLabel(selectedLevel, selectedGrade);

  if (enabledLevels.length === 0 && !loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-6 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-primary/5 dark:bg-primary/10 text-primary rounded-3xl flex items-center justify-center">
          <BookOpen className="w-10 h-10" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800 dark:text-gray-100 mb-2">لم يتم تفعيل أي صفوف بعد</h2>
          <p className="text-gray-400 dark:text-gray-500 font-medium">يرجى تفعيل المراحل والصفوف من صفحة الإعدادات لتتمكن من إدارة دروسك</p>
        </div>
        <Link href="/teacher/settings" className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
          الذهاب للإعدادات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-black text-foreground mb-2">إدارة الدروس</h1>
          <p className="text-gray-400 dark:text-gray-500 font-medium text-sm">
             تصفح وإدارة المحتوى الأكاديمي حسب المرحلة والصف الدراسي
          </p>
        </div>
        <Link
          href={`/teacher/lessons/new?level=${selectedLevel}&gradeNumber=${selectedGrade}`}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          إضافة درس لـ {currentGradeLabel.split(" ")[1]}
        </Link>
      </div>

      {/* Level & Grade Selector */}
      <div className="space-y-6">
        {/* Level Tabs — only enabled levels */}
        <div className="flex bg-white dark:bg-gray-800 p-2 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm w-fit">
          {enabledLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => {
                setSelectedLevel(level.id as SchoolLevel);
                const firstGrade = getEnabledGradesForLevel(level.id);
                setSelectedGrade(firstGrade[0] ?? 1);
              }}
              className={`px-8 py-3 rounded-2xl font-black text-xs transition-all ${
                selectedLevel === level.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {level.nameAr}
            </button>
          ))}
        </div>

        {/* Grade Selector & Search Bar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Grade Tabs — only enabled grades */}
          <div className="bg-white dark:bg-gray-800 p-2 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm flex-shrink-0 lg:w-[500px]">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
              {currentLevelGrades.map((grade) => (
                <button
                  key={grade.number}
                  onClick={() => setSelectedGrade(grade.number)}
                  className={`flex-1 py-4 px-4 rounded-2xl font-black text-[10px] transition-all whitespace-nowrap border ${
                    selectedGrade === grade.number
                      ? "bg-primary/5 dark:bg-primary/10 text-primary border-primary shadow-sm"
                      : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent"
                  }`}
                >
                  {grade.label}
                  <span className={`block text-[8px] mt-0.5 opacity-60`}>
                    {lessons.filter(l => l.level === selectedLevel && l.gradeNumber === grade.number).length} دروس
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 bg-white dark:bg-gray-800 p-2 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm flex items-center pr-6">
            <Search className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
            <input
              type="text"
              placeholder="ابحث عن درس بالاسم أو الوصف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 outline-none font-bold text-slate-700 dark:text-gray-100 bg-transparent dark:placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Lessons List Area */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-gray-400 font-bold">جاري تحميل الدروس...</p>
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-20 rounded-[3rem] border border-gray-100 dark:border-gray-700 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-primary/5 dark:bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-gray-100 mb-2">
            {searchQuery 
              ? `لا توجد نتائج لـ "${searchQuery}"`
              : `لا يوجد دروس لـ ${currentGradeLabel} حتى الآن`}
          </h2>
          <p className="text-gray-400 dark:text-gray-500 font-medium mb-8">
            {searchQuery 
              ? "جرّب البحث بكلمات مختلفة أو اختر صفاً آخر"
              : "ابدأ بإضافة أول درس لهذا الصف لبناء منهجك التعليمي"}
          </p>
          {!searchQuery && (
            <Link
              href={`/teacher/lessons/new?level=${selectedLevel}&gradeNumber=${selectedGrade}`}
              className="inline-flex items-center gap-2 text-primary font-black px-6 py-3 bg-primary/5 dark:bg-primary/10 rounded-xl hover:bg-primary hover:text-white transition-all"
            >
              <Plus className="w-4 h-4" />
              إضافة درس جديد الآن
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between px-4 mb-2">
            <p className="text-sm font-black text-gray-400">
              يتم عرض <span className="text-primary">{filteredLessons.length}</span> درس لـ {currentGradeLabel}
            </p>
          </div>
          {filteredLessons.map((lesson) => (
            <LessonCard 
              key={lesson.id} 
              lesson={lesson} 
              onDelete={fetchLessons} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
