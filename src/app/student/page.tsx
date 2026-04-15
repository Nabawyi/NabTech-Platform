import Link from "next/link";
import { redirect } from "next/navigation";
import {
  PlayCircle,
  ShieldCheck,
  Clock,
  FileText,
  CalendarCheck,
  HelpCircle,
  AlertCircle,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { getUserSession } from "@/app/actions/students";
import { getStudentAttendance } from "@/app/actions/attendance";
import { getLessons } from "@/app/actions/lessons";
import { getStudentSubscription } from "@/app/actions/subscriptions";
import { getStudentResultsAction } from "@/app/actions/exams";
import { getGradeLabel } from "@/lib/constants";
import { formatTimeRange } from "@/lib/utils/time";
import type { AttendanceRecord, StudentResultRow } from "@/types/domain";

export default async function StudentDashboard() {
  const session = await getUserSession();
  if (!session) redirect("/login");
  if (session.role !== "student") {
    if (session.role === "admin") redirect("/teacher");
    if (session.role === "owner") redirect("/owner");
    redirect("/login");
  }

  const firstName = session.name
    ? (session.name as string).split(" ")[0]
    : "طالب";
  const studentLevel =
    (session as any).stage ?? (session as any).level ?? "secondary";
  const studentGradeNum = (session as any).gradeNumber ?? 1;
  const gradeLabel = getGradeLabel(studentLevel as any, studentGradeNum as any);

  // ✅ Fetch all data in parallel — no blocking, safe fallbacks
  const [attendanceHistory, allLessons, sub, resultsRes] = await Promise.all([
    getStudentAttendance(session.id).catch(() => [] as AttendanceRecord[]),
    getLessons().catch(() => []),
    getStudentSubscription(session.id).catch(() => null),
    getStudentResultsAction().catch(() => ({
      success: false as const,
      error: "fetch failed",
    })),
  ]);

  // ── Attendance stats ───────────────────────────────────────────────────────
  const totalAtt = attendanceHistory.length;
  const present = attendanceHistory.filter((r) => r.status === "present").length;
  const attendanceRate = totalAtt > 0 ? Math.round((present / totalAtt) * 100) : 0;

  const latestLessons = allLessons.slice(0, 3);

  // ── Subscription stats ─────────────────────────────────────────────────────
  const daysLeft = sub?.daysRemaining ?? 0;
  const isExpiring = sub?.calculatedStatus === "expiring_soon";
  const isExpired = sub?.calculatedStatus === "expired";
  const isInactive = sub?.calculatedStatus === "inactive" || !sub;

  // ── Next lesson time (12-hour format via shared utility) ───────────────────
  const sessionAny = session as any;
  const nextLessonTime =
    sessionAny.startTime && sessionAny.startTime !== "غير محدد"
      ? formatTimeRange(sessionAny.startTime, sessionAny.endTime)
      : "لم يحدد بعد";

  // ── Average score calculation ──────────────────────────────────────────────
  const examResults: StudentResultRow[] =
    resultsRes.success && resultsRes.results ? resultsRes.results : [];
  const scoredResults = examResults.filter(
    (r) => r.score !== null && r.total_score > 0
  );
  const totalObtained = scoredResults.reduce((s, r) => s + (r.score ?? 0), 0);
  const totalMax = scoredResults.reduce((s, r) => s + r.total_score, 0);
  const avgPct =
    totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : null;

  // SVG ring for average score
  const RING_R = 32;
  const RING_C = 2 * Math.PI * RING_R;
  const ringOffset =
    avgPct !== null ? RING_C - (avgPct / 100) * RING_C : RING_C;
  const ringColor =
    avgPct === null
      ? "#64748b"
      : avgPct >= 85
        ? "#10b981"
        : avgPct >= 65
          ? "#6366f1"
          : avgPct >= 50
            ? "#f59e0b"
            : "#f43f5e";

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-4">

      {/* ── Welcome ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary scale-90 sm:scale-100">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              أهلاً يا {firstName}
            </h1>
          </div>
          <p className="text-muted-fg font-bold flex items-center gap-2 mr-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            أنت مسجل مع الأستاذ:{" "}
            <span className="text-foreground">{sessionAny.teacherName}</span> —{" "}
            <span className="bg-muted px-3 py-0.5 rounded-full text-xs">
              {gradeLabel}
            </span>
          </p>
        </div>
      </div>

      {/* ── Hero Stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

        {/* Next Lesson */}
        <div className="lg:col-span-1 bg-primary rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 font-bold text-xs uppercase tracking-widest mb-1">
                الحصة القادمة
              </p>
              <h3 className="text-xl font-black">
                {sessionAny.groupName || "غير محدد"}
              </h3>
              <p className="text-white/90 font-bold mt-1 tabular-nums text-sm">
                {nextLessonTime}
              </p>
            </div>
          </div>
        </div>

        {/* Lessons Count */}
        <div className="bg-card rounded-[2.5rem] p-8 border border-card-border shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-muted-fg font-bold text-xs uppercase tracking-widest mb-1">
            الدروس المتاحة
          </p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-black text-foreground tabular-nums">
              {allLessons.length}
            </h3>
            <span className="text-xs font-bold text-blue-500 mb-1.5 underline decoration-blue-500/30 underline-offset-4">
              درس مفعل
            </span>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-card rounded-[2.5rem] p-8 border border-card-border shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
            <CalendarCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-muted-fg font-bold text-xs uppercase tracking-widest mb-1">
            نسبة الحضور
          </p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-black text-foreground tabular-nums">
              {attendanceRate}%
            </h3>
            <span className="text-xs font-bold text-emerald-500 mb-1.5 underline decoration-emerald-500/30 underline-offset-4">
              انتظام جيد
            </span>
          </div>
        </div>

        {/* ✅ Average Exam Score Card */}
        <div className="bg-card rounded-[2.5rem] p-6 border border-card-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
            </div>
            {scoredResults.length > 0 && (
              <span className="text-[10px] font-black text-muted-fg bg-muted px-2 py-1 rounded-full">
                {scoredResults.length} اختبار
              </span>
            )}
          </div>
          <p className="text-muted-fg font-bold text-xs uppercase tracking-widest mb-3">
            متوسط درجاتي
          </p>

          {avgPct === null ? (
            <div>
              <p className="text-2xl font-black text-muted-fg">—</p>
              <p className="text-xs text-muted-fg font-bold mt-1">
                لا يوجد بيانات بعد
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* SVG radial ring */}
              <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0 -rotate-90">
                <circle
                  cx="40" cy="40" r={RING_R}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                <circle
                  cx="40" cy="40" r={RING_R}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={RING_C}
                  strokeDashoffset={ringOffset}
                  style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
              </svg>
              <div>
                <p
                  className="text-3xl font-black tabular-nums"
                  style={{ color: ringColor }}
                >
                  {avgPct}%
                </p>
                <p className="text-xs text-muted-fg font-bold mt-0.5 tabular-nums">
                  {totalObtained}/{totalMax} درجة
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Days Remaining */}
        <div
          className={`rounded-[2.5rem] p-8 border shadow-sm transition-all duration-300 ${isExpiring
              ? "bg-warning/10 border-warning/20"
              : isExpired || isInactive
                ? "bg-danger/10 border-danger/20"
                : "bg-card border-card-border"
            }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isExpiring
                ? "bg-warning/20"
                : isExpired || isInactive
                  ? "bg-danger/20"
                  : "bg-purple-500/10"
              }`}
          >
            <ShieldCheck
              className={`w-6 h-6 ${isExpiring
                  ? "text-warning-fg"
                  : isExpired || isInactive
                    ? "text-danger-fg"
                    : "text-purple-500"
                }`}
            />
          </div>
          <p className="text-muted-fg font-bold text-xs uppercase tracking-widest mb-1">
            متبقي بالاشتراك
          </p>
          <h3
            className={`text-3xl font-black tabular-nums ${isExpiring
                ? "text-warning-fg"
                : isExpired || isInactive
                  ? "text-danger-fg"
                  : "text-foreground"
              }`}
          >
            {daysLeft} يوم
          </h3>
        </div>
      </div>

      {/* ── Main Content Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Latest Lessons — 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
              أحدث الدروس
              <span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            </h2>
            <Link
              href="/student/lessons"
              className="text-sm font-black text-primary hover:underline underline-offset-8"
            >
              المزيد ←
            </Link>
          </div>

          <div className="space-y-4">
            {latestLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="group bg-card rounded-[2rem] p-5 border border-card-border hover:border-primary/30 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col sm:flex-row items-center gap-6"
              >
                <div className="w-full sm:w-40 aspect-video bg-muted rounded-2xl overflow-hidden relative shrink-0">
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlayCircle className="w-10 h-10 text-primary" />
                  </div>
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-muted-fg/30" />
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-right w-full">
                  <h3 className="text-lg font-black text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                    {lesson.questions.length > 0 && (
                      <span className="text-xs font-bold text-muted-fg flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full">
                        <HelpCircle className="w-3.5 h-3.5" />{" "}
                        {lesson.questions.length} سؤال
                      </span>
                    )}
                    {lesson.pdfUrl && (
                      <span className="text-xs font-bold text-muted-fg flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full">
                        <FileText className="w-3.5 h-3.5 text-danger-fg" />{" "}
                        مرفق PDF
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/student/lessons/${lesson.id}`}
                  className="w-full sm:w-auto px-8 py-3.5 bg-muted text-foreground hover:bg-primary hover:text-white rounded-2xl font-black text-sm transition-all shadow-sm"
                >
                  ابدأ التعلم
                </Link>
              </div>
            ))}

            {latestLessons.length === 0 && (
              <div className="bg-card rounded-[2.5rem] border border-card-border border-dashed p-20 text-center space-y-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-10 h-10 text-muted-fg/30" />
                </div>
                <p className="text-muted-fg font-black">
                  لا توجد دروس متاحة حالياً لمرحلتك.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — 1/3 width */}
        <div className="space-y-8">
          {/* Subscription alert */}
          {(isExpired || isInactive) && (
            <div className="bg-danger rounded-[2.5rem] p-8 border border-danger-fg/10 space-y-4 shadow-xl shadow-danger/10">
              <AlertCircle className="w-10 h-10 text-danger-fg" />
              <h3 className="text-xl font-black text-danger-fg">تنبيه هام</h3>
              <p className="text-sm font-bold text-danger-fg leading-relaxed">
                اشتراكك منتهي حالياً. يرجى مراجعة الأستاذ لتجديد الاشتراك
                والتمكن من مشاهدة الدروس الجديدة.
              </p>
            </div>
          )}


        </div>

      </div>
    </div>
  );
}
