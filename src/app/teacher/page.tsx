import {
  Users,
  UserCheck,
  UserX,
  Layers,
  CalendarCheck,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { getDashboardStats } from "@/app/actions/dashboard";
import { getTeacherSettings } from "@/app/actions/settings";

export default async function TeacherDashboard() {
  const settings = await getTeacherSettings();
  const stats = await getDashboardStats(settings.id);

  const enabledStages = settings.enabled_levels;

  const hasAny =
    stats.totalStudents > 0 ||
    stats.totalGroups > 0 ||
    stats.attendance.todayTotalRecords > 0 ||
    stats.alerts.expiredStudents.length > 0 ||
    stats.alerts.inactiveStudents.length > 0;

  if (!hasAny) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <h1 className="text-2xl font-black text-foreground">نظرة عامة</h1>
        <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-500 font-bold">لا توجد بيانات كافية لعرض مؤشرات حتى الآن.</p>
        </div>
      </div>
    );
  }

  const attendanceRate = Math.round(stats.attendance.todayRate);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-foreground mb-2">لوحة تحكم المعلم</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          مؤشرات عملية تساعدك على اتخاذ قرار أسرع: حضور اليوم والاشتراكات والتنبيهات.
        </p>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">إجمالي الطلاب</p>
            <p className="text-2xl font-black text-foreground">{stats.totalStudents}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">نشطون (اشتراكات)</p>
            <p className="text-2xl font-black text-foreground">{stats.activeStudents}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
            <UserX className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">غير مفعلين</p>
            <p className="text-2xl font-black text-foreground">{stats.inactiveStudents}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">إجمالي المجموعات</p>
            <p className="text-2xl font-black text-foreground">{stats.totalGroups}</p>
          </div>
        </div>
      </div>

      {/* Students per Stage — filtered by enabled stages */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-black text-slate-800 dark:text-gray-100">الطلاب حسب المرحلة</h2>
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500">يتم استبعاد السجلات غير الكاملة (مرحلة/صف)</span>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-${enabledStages.length > 0 ? enabledStages.length : 3} gap-4`}>
          {(["primary", "preparatory", "secondary"] as const)
            .filter((stage) => enabledStages.includes(stage))
            .map((stage) => {
            const label =
              stage === "primary" ? "ابتدائي" : stage === "preparatory" ? "إعدادي" : "ثانوي";
            const value = stats.studentsPerStage[stage] ?? 0;
            return (
              <div key={stage} className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-sm font-black text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                <p className="text-3xl font-black text-foreground tabular-nums">{value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-5">
            <CalendarCheck className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-black text-slate-800 dark:text-gray-100">تحليل حضور اليوم</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 text-center">
              <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase">الحضور اليوم</p>
              <p className="text-3xl font-black text-foreground tabular-nums">{stats.attendance.todayTotalRecords}</p>
            </div>
            <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-center">
              <p className="text-xs font-black text-red-600 dark:text-red-400 uppercase">غياب اليوم</p>
              <p className="text-3xl font-black text-red-600 dark:text-red-400 tabular-nums">{stats.attendance.todayAbsent}</p>
            </div>
            <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-center">
              <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase">معدل الحضور</p>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{attendanceRate}%</p>
            </div>
          </div>
          {stats.attendance.todayTotalRecords === 0 && (
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 mt-4">لا توجد سجلات حضور لليوم بعد.</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-5">
            <CreditCard className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-black text-slate-800 dark:text-gray-100">تحليل الاشتراكات</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-center">
              <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase">نشط</p>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{stats.subscription.activeSubscriptions}</p>
            </div>
            <div className="p-6 rounded-3xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-center">
              <p className="text-xs font-black text-orange-700 dark:text-orange-400 uppercase">قريب الانتهاء</p>
              <p className="text-3xl font-black text-orange-700 dark:text-orange-400 tabular-nums">{stats.subscription.needingRenewal}</p>
            </div>
            <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-center">
              <p className="text-xs font-black text-red-700 dark:text-red-400 uppercase">منتهي</p>
              <p className="text-3xl font-black text-red-700 dark:text-red-400 tabular-nums">{stats.subscription.expiredSubscriptions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-5">
          <AlertTriangle className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-black text-slate-800 dark:text-gray-100">التنبيهات</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 p-6">
            <p className="text-sm font-black text-slate-800 dark:text-gray-100 mb-2">اشتراكات منتهية</p>
            {stats.alerts.expiredStudents.length === 0 ? (
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500">لا يوجد.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-black text-red-600 dark:text-red-400">
                  {stats.alerts.expiredStudents.length} طالب (أول 10)
                </p>
                {stats.alerts.expiredStudents.map((s) => (
                  <p key={s.id} className="text-xs font-bold text-slate-600 dark:text-gray-400">
                    {s.id} • {s.name}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 p-6">
            <p className="text-sm font-black text-slate-800 dark:text-gray-100 mb-2">طلاب غير مفعلين</p>
            {stats.alerts.inactiveStudents.length === 0 ? (
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500">لا يوجد.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                  {stats.alerts.inactiveStudents.length} طالب (أول 10)
                </p>
                {stats.alerts.inactiveStudents.map((s) => (
                  <p key={s.id} className="text-xs font-bold text-slate-600 dark:text-gray-400">
                    {s.id} • {s.name}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 p-6">
            <p className="text-sm font-black text-slate-800 dark:text-gray-100 mb-2">مجموعات فارغة</p>
            {stats.emptyGroups === 0 ? (
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500">لا يوجد.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-600 dark:text-gray-400">
                  {stats.emptyGroups} مجموعة بدون طلاب
                </p>
                {stats.alerts.emptyGroupIds.slice(0, 6).map((gid) => (
                  <span
                    key={gid}
                    className="inline-flex px-2 py-0.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-[10px] font-black text-slate-600 dark:text-gray-400 ml-2 mt-2"
                  >
                    {gid}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
