import { CalendarCheck, CheckCircle2, XCircle, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getUserSession } from "@/app/actions/students";
import { getStudentAttendance } from "@/app/actions/attendance";
import type { AttendanceRecord } from "@/types/domain";

export default async function StudentAttendancePage() {
  const session = await getUserSession();
  
  if (!session) return null;
  
  const history = await getStudentAttendance(session.id);
  
  const total = history.length;
  const presentCount = history.filter((r) => r.status === "present").length;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <h1 className="text-2xl font-black text-foreground">سجل حضوري</h1>
             <span className="px-3 py-1 bg-primary/10 text-primary rounded-xl text-xs font-black tabular-nums">ID: {session.id}</span>
          </div>
          <p className="text-gray-500 font-medium text-sm">متابعة نسبة حضورك في الحصص التعليمية</p>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all text-sm">
          العودة للرئيسية <ArrowRight className="w-4 h-4 rotate-180" />
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">نسبة الحضور</p>
            <p className="text-2xl font-black text-foreground">{rate}%</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">أيام الحضور</p>
            <p className="text-2xl font-black text-foreground">{presentCount} يوم</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <XCircle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">أيام الغياب</p>
            <p className="text-2xl font-black text-foreground">{total - presentCount} يوم</p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-foreground">تفاصيل السجل</h2>
          <div className="bg-gray-50 px-4 py-2 rounded-xl text-xs font-bold text-gray-500 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> إجمالي الأيام: {total}
          </div>
        </div>

        {total === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <CalendarCheck className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="text-lg font-bold">لا يوجد سجلات حضور حتى الآن</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-50">
                  <th className="pb-4 pr-4">التاريخ</th>
                  <th className="pb-4">اليوم</th>
                  <th className="pb-4 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history
                  .slice()
                  .sort(
                    (a: AttendanceRecord, b: AttendanceRecord) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((record: AttendanceRecord) => (
                  <tr key={record.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 pr-4 text-base font-bold text-slate-700">{record.date}</td>
                    <td className="py-5 text-sm font-medium text-gray-400">
                      {new Date(record.date).toLocaleDateString('ar-EG', { weekday: 'long' })}
                    </td>
                    <td className="py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-xs ${
                        record.status === 'present' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-red-50 text-red-600'
                      }`}>
                        {record.status === 'present' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {record.status === 'present' ? 'حضور' : 'غياب'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
