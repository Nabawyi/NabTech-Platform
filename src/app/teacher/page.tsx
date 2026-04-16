"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserCheck,
  Layers,
  CalendarCheck,
  CreditCard,
  LayoutGrid,
  UserPlus,
  RefreshCcw,
} from "lucide-react";
import { getDashboardStats, type DashboardStats } from "@/app/actions/stats";
import { useSettings } from "@/components/providers/SettingsProvider";
import { formatGradeShort, type SchoolLevel } from "@/lib/constants";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Loading Skeleton Component
function DashboardSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-10 py-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-100 dark:bg-slate-900/50 h-32 rounded-3xl border border-slate-200 dark:border-slate-800"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-slate-100 dark:bg-slate-900/50 h-80 rounded-[2.5rem] border border-slate-200 dark:border-slate-800"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-100 dark:bg-slate-900/50 h-48 rounded-[2.5rem] border border-slate-200 dark:border-slate-800"></div>
            <div className="bg-slate-100 dark:bg-slate-900/50 h-48 rounded-[2.5rem] border border-slate-200 dark:border-slate-800"></div>
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900/50 h-[600px] rounded-[2.5rem] border border-slate-200 dark:border-slate-800"></div>
      </div>
    </div>
  );
}

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
      if (!isRefresh) setLoading(false);
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
    return <DashboardSkeleton />;
  }

  const hasAny = stats.totalStudents > 0 || stats.totalGroups > 0;

  if (!hasAny) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center"
      >
        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center mb-6">
          <LayoutGrid className="w-6 h-6 text-blue-300 dark:text-slate-400" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">لوحة التحكم فارغة</h1>
        <p className="text-slate-400 max-w-sm text-sm font-medium leading-relaxed mb-8">
          بداية جديدة! قم بإضافة طلابك ومجموعاتك لتتمكن من متابعة تفاعلهم وتحليل بياناتهم هنا.
        </p>
        <Link 
          href="/teacher/students" 
          className="group relative flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-blue-600 hover:scale-[1.03] active:scale-95 shadow-xl shadow-blue-500/20 overflow-hidden"
        >
          <span className="absolute inset-0 w-full h-full rounded-xl opacity-0 group-hover:opacity-20 transition-opacity bg-white"></span>
          إضافة طالبك الأول
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1400px] mx-auto space-y-10 py-4"
    >
      
      {/* Metrics Row - Modern Minimal */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الطلاب", value: stats.totalStudents, icon: Users, color: "blue" },
          { label: "طلبات الانتظار", value: stats.pendingStudentsCount, icon: UserPlus, color: "orange" },
          { label: "نشطون حالياً", value: stats.activeStudents, icon: UserCheck, color: "emerald" },
          { label: "المجموعات", value: stats.totalGroups, icon: Layers, color: "indigo" },
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:shadow-${item.color}-500/5`}
          >
            <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center bg-${item.color}-50 dark:bg-${item.color}-500/10 text-${item.color}-500`}>
              <item.icon className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">{item.label}</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">{item.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Main Section */}
        <div className="xl:col-span-2 space-y-6">
          


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Minimal Attendance */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                  <CalendarCheck className="w-5 h-5 text-blue-500" />
                </div>
                حضور اليوم
              </h3>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90 drop-shadow-sm">
                    <circle cx="48" cy="48" r="42" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                    <circle 
                      cx="48" cy="48" r="42" fill="transparent" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={264} strokeDashoffset={264 - (264 * stats.attendance.todayRate) / 100}
                      className="text-blue-500 transition-all duration-1000 ease-out" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-black tabular-nums text-slate-900 dark:text-white">
                    {Math.round(stats.attendance.todayRate)}%
                  </div>
                </div>
                <div className="space-y-3">
                   <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
                     <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                     <p className="text-sm font-bold text-slate-500 dark:text-slate-400">حضور: <span className="text-slate-900 dark:text-white ml-1 tabular-nums">{stats.attendance.todayTotalRecords}</span></p>
                   </div>
                   <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
                     <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                     <p className="text-sm font-bold text-slate-500 dark:text-slate-400">غياب: <span className="text-rose-500 ml-1 tabular-nums">{stats.attendance.todayAbsent}</span></p>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Subscriptions Status */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                </div>
                حالة الاشتراكات
              </h3>
              <div className="grid grid-cols-3 gap-3">
                 {[
                   { label: "نشط", val: stats.subscription.activeSubscriptions, color: "emerald", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                   { label: "أوشك", val: stats.subscription.needingRenewal, color: "orange", bg: "bg-orange-50 dark:bg-orange-500/10" },
                   { label: "منتهي", val: stats.subscription.expiredSubscriptions, color: "rose", bg: "bg-rose-50 dark:bg-rose-500/10" },
                 ].map(s => (
                   <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center transition-transform hover:scale-105`}>
                      <p className={`text-2xl font-black text-${s.color}-500 tabular-nums mb-1`}>{s.val}</p>
                      <p className={`text-xs font-bold text-${s.color}-600/70 dark:text-${s.color}-400/70`}>{s.label}</p>
                   </div>
                 ))}
              </div>
            </motion.div>
          </div>
          {/* Dynamic Grades Grid (The ROOT FIX) */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">الطلاب حسب الصف</h2>
                <p className="text-sm text-slate-400 font-medium mt-1">توزيع حقيقي لطلابك النشطين</p>
              </div>
              <button
                onClick={() => fetchData(true)}
                className={`p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-400 active:scale-95 ${refreshing ? 'animate-spin text-blue-500' : ''}`}
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
            </div>

            {stats.gradeStats.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
                <p className="text-sm font-bold text-slate-400">لم يتم تفعيل أي صفوف أو لا يوجد طلاب مخصصين بعد</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.gradeStats.map((grade) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    key={grade.code}
                    className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 group hover:border-blue-500/30 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">{grade.levelName}</span>
                      <span className="text-sm font-black text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full tabular-nums">{Math.round(grade.percentage)}%</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-base font-bold text-slate-700 dark:text-slate-200">{grade.label}</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{grade.count}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar Mini Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Simple Recent List */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-base font-black text-slate-900 dark:text-white">أحدث الطلاب</h2>
              <Link href="/teacher/students" className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">عرض الكل</Link>
            </div>
            
            <div className="space-y-4">
               {stats.recentStudents.length === 0 ? (
                  <div className="py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-400">لا يوجد طلاب بعد</p>
                  </div>
               ) : (
                 <AnimatePresence>
                   {stats.recentStudents.map((s, idx) => (
                     <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={s.id} 
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:border-slate-700 transition-all group"
                     >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-sm font-black text-blue-500">
                              {(s.name || "م").charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-1 mb-0.5">{s.name || "بدون اسم"}</p>
                              <p className="text-xs font-medium text-slate-400">{formatGradeShort((s.stage || "secondary") as SchoolLevel, s.grade || 1)}</p>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
