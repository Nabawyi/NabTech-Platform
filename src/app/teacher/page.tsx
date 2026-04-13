"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserCheck,
  Layers,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  Clock,
  LayoutGrid,
  ChevronRight,
  UserPlus,
  Loader2,
  RefreshCcw,
  ChevronLeft,
} from "lucide-react";
import { getDashboardStats, type DashboardStats } from "@/app/actions/stats";
import { useSettings } from "@/components/providers/SettingsProvider";
import { formatGradeShort, type SchoolLevel } from "@/lib/constants";
import Link from "next/link";

export default function TeacherDashboard() {
  const { settings } = useSettings();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      // Fresh fetch, passing local context settings to guarantee UI perfectly syncs
      const data = await getDashboardStats(settings.id, settings.enabled_grade_codes);
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [settings.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Root fix: Listening to settings changes via the provider
  useEffect(() => {
    if (!loading) fetchData(true);
  }, [settings.enabled_grade_codes]);

  if (loading || !stats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
      </div>
    );
  }

  const hasAny = stats.totalStudents > 0 || stats.totalGroups > 0;

  if (!hasAny) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
        <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
          <LayoutGrid className="w-6 h-6 text-slate-300" />
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white mb-2">لوحة التحكم فارغة</h1>
        <p className="text-slate-400 max-w-xs text-sm font-medium leading-relaxed">
          ابدأ بإضافة الطلاب والمجموعات لتفعيل لوحة التحكم الذكية.
        </p>
        <div className="mt-8">
           <Link href="/teacher/students" className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">إضافة طالب</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 py-4 animate-in fade-in duration-500">
      
      {/* Metrics Row - Modern Minimal */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الطلاب", value: stats.totalStudents, icon: Users, color: "blue" },
          { label: "طلبات الانتظار", value: stats.pendingStudentsCount, icon: UserPlus, color: "orange" },
          { label: "نشطون حالياً", value: stats.activeStudents, icon: UserCheck, color: "emerald" },
          { label: "المجموعات", value: stats.totalGroups, icon: Layers, color: "indigo" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-${item.color}-500/10 text-${item.color}-500`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Main Section */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Dynamic Grades Grid (The ROOT FIX) */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">الطلاب حسب الصف</h2>
                <p className="text-xs text-slate-400 font-medium">توزيع حقيقي بناءً على إعداداتك وبيانات الطلاب</p>
              </div>
              <button 
                onClick={() => fetchData(true)}
                className={`p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-400 ${refreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>

            {stats.gradeStats.length === 0 ? (
               <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
                  <p className="text-xs font-bold text-slate-400">لم يتم تفعيل أي صفوف أو لا يوجد طلاب مخصصين بعد</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.gradeStats.map((grade) => (
                  <div key={grade.code} className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 group hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{grade.levelName}</span>
                      <span className="text-xs font-black text-primary tabular-nums">{Math.round(grade.percentage)}%</span>
                    </div>
                    <div className="flex justify-between items-end">
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{grade.label}</p>
                       <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{grade.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Minimal Attendance */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-500" />
                حضور اليوم
              </h3>
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800" />
                    <circle 
                      cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="6" 
                      strokeDasharray={226} strokeDashoffset={226 - (226 * stats.attendance.todayRate) / 100}
                      className="text-primary transition-all duration-1000" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[14px] font-black tabular-nums">
                    {Math.round(stats.attendance.todayRate)}%
                  </div>
                </div>
                <div className="space-y-2">
                   <p className="text-[14px] font-bold text-slate-400">حضور: <span className="text-slate-900 dark:text-white ml-1">{stats.attendance.todayTotalRecords}</span></p>
                   <p className="text-[14px] font-bold text-slate-400">غياب: <span className="text-rose-500 ml-1">{stats.attendance.todayAbsent}</span></p>
                </div>
              </div>
            </div>

            {/* Subscriptions Status */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                الاشتراكات
              </h3>
              <div className="grid grid-cols-3 gap-2">
                 {[
                   { label: "نشط", val: stats.subscription.activeSubscriptions, color: "emerald" },
                   { label: "أوشك", val: stats.subscription.needingRenewal, color: "orange" },
                   { label: "منتهي", val: stats.subscription.expiredSubscriptions, color: "rose" },
                 ].map(s => (
                   <div key={s.label} className="text-center">
                      <p className={`text-lg font-black text-${s.color}-500 tabular-nums`}>{s.val}</p>
                      <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Mini Section */}
        <div className="space-y-6">
          {/* Simple Recent List */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">آخر الطلاب</h2>
              <Link href="/teacher/students" className="text-[10px] font-black text-primary hover:underline">عرض الكل</Link>
            </div>
            
            <div className="space-y-3">
               {stats.recentStudents.length === 0 ? (
                  <p className="text-[10px] font-bold text-slate-400 py-6 text-center">لا يوجد طلاب</p>
               ) : (
                 stats.recentStudents.map((s) => (
                   <div key={s.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                            {(s.name || "م").charAt(0)}
                         </div>
                         <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{s.name || "بدون اسم"}</p>
                            <p className="text-[9px] font-bold text-slate-400">{formatGradeShort((s.stage || "secondary") as SchoolLevel, s.grade || 1)}</p>
                         </div>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
