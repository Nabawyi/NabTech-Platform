import Link from "next/link";
import { PlayCircle, ShieldCheck, Clock, FileText, CalendarCheck, HelpCircle, AlertCircle } from "lucide-react";
import { getUserSession } from "@/app/actions/students";
import { getStudentAttendance } from "@/app/actions/attendance";
import { getLessonsByLevelAndGrade } from "@/app/actions/lessons";
import { getStudentSubscription } from "@/app/actions/subscriptions";
import { getGradeLabel } from "@/lib/constants";
import type { AttendanceRecord } from "@/types/domain";

export default async function DashboardPage() {
  const session = await getUserSession();
  const firstName = session?.name ? session.name.split(" ")[0] : "طالب";
  const studentLevel = session?.stage ?? session?.level ?? "secondary";
  const studentGradeNum = session?.gradeNumber ?? 1;
  const gradeLabel = getGradeLabel(studentLevel, studentGradeNum);
  
  const attendanceHistory = session ? await getStudentAttendance(session.id) : [];
  const totalAtt = attendanceHistory.length;
  const present = attendanceHistory.filter((r: AttendanceRecord) => r.status === "present").length;
  const attendanceRate = totalAtt > 0 ? Math.round((present / totalAtt) * 100) : 0;

  const lessons = await getLessonsByLevelAndGrade(studentLevel, studentGradeNum);
  const latestLessons = lessons.slice(0, 3);

  const sub = session ? await getStudentSubscription(session.id) : null;
  const daysLeft = sub?.daysRemaining ?? 0;
  const isExpiring = sub?.calculatedStatus === "expiring_soon";
  const isExpired = sub?.calculatedStatus === "expired";
  const isInactive = sub?.calculatedStatus === "inactive" || !sub;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-foreground">مرحباً يا {firstName} 👋</h1>
          <p className="text-sm font-bold text-gray-400">{gradeLabel}</p>
        </div>
        <p className="text-sm font-medium text-gray-500 hidden sm:block">آخر ظهور: اليوم، 10:00 صباحاً</p>
      </div>

      {isExpiring && (
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center gap-4 animate-bounce">
          <div className="bg-orange-500 text-white p-2 rounded-xl">
             <Clock className="w-5 h-5" />
          </div>
          <p className="text-orange-700 font-black">اشتراكك ينتهي خلال {daysLeft} أيام! يرجى التجديد لضمان استمرار الخدمة.</p>
        </div>
      )}

      {isExpired && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4">
          <div className="bg-red-500 text-white p-2 rounded-xl">
             <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-red-700 font-black">اشتراكك منتهي. تم إيقاف الوصول للدروس مؤقتاً.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="space-y-8 lg:col-span-1">
          {/* Subscription Status Card */}
          <div className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 border-r-4 relative overflow-hidden ${
            isInactive || isExpired ? 'border-r-red-500' : isExpiring ? 'border-r-orange-500' : 'border-r-emerald-500'
          }`}>
            <div className={`absolute top-0 left-0 w-32 h-32 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 ${
              isInactive || isExpired ? 'bg-red-500/5' : isExpiring ? 'bg-orange-500/5' : 'bg-emerald-500/5'
            }`} />
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">حالة الاشتراك</h2>
              <div className={`p-2 rounded-xl ${
                isInactive || isExpired ? 'bg-red-50 text-red-500' : isExpiring ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'
              }`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            
            <div className="mb-6">
              <p className={`text-3xl font-black mb-1 ${
                isInactive || isExpired ? 'text-red-600' : isExpiring ? 'text-orange-600' : 'text-emerald-600'
              }`}>
                {isInactive ? 'غير مفعل' : isExpired ? 'منتهي' : 'نشط'}
              </p>
              <p className="text-sm font-semibold text-gray-500">الباقة الشاملة</p>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-gray-500 flex items-center gap-1.5"><Clock className="w-4 h-4" /> متبقي</span>
                <span className="text-foreground">{daysLeft} يوم</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isInactive || isExpired ? 'bg-red-500' : isExpiring ? 'bg-orange-500' : 'bg-emerald-500'
                  }`} 
                  style={{ width: `${isInactive || isExpired ? 0 : Math.min(100, (daysLeft / 30) * 100)}%` }} 
                />
              </div>
            </div>
          </div>


          {/* Attendance Rate Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 border-r-4 border-r-primary relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">نسبة الحضور</h2>
              <div className="bg-primary/10 text-primary p-2 rounded-xl">
                <CalendarCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-black text-primary">{attendanceRate}%</p>
              <p className="text-xs font-bold text-gray-400 mb-1.5 underline decoration-primary/30 underline-offset-4">انتظام ممتاز</p>
            </div>
          </div>
        </div>

        {/* Lessons List Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">الدروس الحالية</h2>
              <p className="text-sm font-medium text-gray-500">أكمل من حيث توقفت في {gradeLabel}</p>
            </div>
            <Link href="/dashboard/lessons" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors bg-primary/5 px-4 py-2 rounded-full">
              عرض الكل
            </Link>
          </div>
          
          <div className="space-y-4">
            {latestLessons.map((lesson) => (
              <div 
                key={lesson.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-500 mt-1">
                      {lesson.questions.length > 0 && (
                        <span className="flex items-center gap-1 text-orange-500 font-bold"><HelpCircle className="w-3.5 h-3.5" /> {lesson.questions.length} سؤال</span>
                      )}
                      {lesson.pdfUrl && (
                        <span className="flex items-center gap-1 text-red-500 font-bold"><FileText className="w-3.5 h-3.5" /> مرفق PDF</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Link 
                  href={`/dashboard/lessons/${lesson.id}`} 
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gray-50 hover:bg-primary hover:text-white text-foreground font-bold transition-all text-sm text-center"
                >
                  بدء الدرس
                </Link>
              </div>
            ))}
            {latestLessons.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-gray-400 font-bold">لا يوجد دروس متاحة حالياً لمرحلتك الدراسية.</p>
              </div>
            )}
          </div>

        </div>
      </div>
      
    </div>
  );
}
