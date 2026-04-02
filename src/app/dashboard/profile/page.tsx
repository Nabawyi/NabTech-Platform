import { getUserSession } from "@/app/actions/students";
import { getStudentSubscription } from "@/app/actions/subscriptions";
import { getLocations } from "@/app/actions/locations";
import { getGradeLabel, SchoolLevel } from "@/lib/constants";
import type { GroupRecord } from "@/types/domain";
import { User, Phone, MapPin, GraduationCap, ShieldCheck, Clock, Calendar } from "lucide-react";

export default async function StudentProfilePage() {
  const session = await getUserSession();
  if (!session) return null;

  const [sub, locations] = await Promise.all([
    getStudentSubscription(session.id),
    getLocations()
  ]);

  const studentLevel = (session.stage ?? session.level) as SchoolLevel;
  const gradeNum =
    typeof session.gradeNumber === "number" ? session.gradeNumber : 1;
  const gradeLabel = getGradeLabel(studentLevel, gradeNum);
  
  const location = locations.find((l: { id: string }) => l.id === session.locationId);
  const group = location?.groups.find((g: GroupRecord) => g.id === session.groupId);

  const subStatus = sub?.calculatedStatus || "inactive";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Profile Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-4xl font-black">
          {session.name.charAt(0)}
        </div>
        <div className="text-center md:text-right flex-1">
          <h1 className="text-3xl font-black text-slate-800 mb-2">{session.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-black flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5" />
              {gradeLabel}
            </span>
            <span className="px-4 py-1.5 bg-primary/5 text-primary rounded-full text-xs font-black flex items-center gap-2">
              ID: {session.id}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Details */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-black text-slate-700">البيانات الشخصية</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-bold text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" /> رقم الهاتف
              </span>
              <span className="font-black text-slate-700 tabular-nums">{session.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-bold text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" /> رقم ولي الأمر
              </span>
              <span className="font-black text-slate-700 tabular-nums">{session.parentPhone}</span>
            </div>
          </div>
        </div>

        {/* School Details */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-black text-slate-700">المقر الدراسي</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-bold text-sm">السنتر / المكان</span>
              <span className="font-black text-slate-700">{location?.name || "غير محدد"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-bold text-sm">المجموعة</span>
              <span className="font-black text-slate-700">{group?.name || "غير محدد"}</span>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8 relative overflow-hidden">
           <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl -translate-y-1/2 translate-x-1/2 ${
             subStatus === 'active' ? 'bg-emerald-500/10' : 'bg-red-500/10'
           }`} />

           <div className="flex items-center justify-between border-b border-gray-50 pb-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-black text-slate-700">حالة العضوية</h2>
                <p className="text-xs font-bold text-gray-400 mt-0.5">تفاصيل الاشتراك الحالي</p>
              </div>
            </div>
            <div className={`px-6 py-2 rounded-2xl font-black text-sm ${
              subStatus === 'active' ? 'bg-emerald-50 text-emerald-600' : 
              subStatus === 'expiring_soon' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
            }`}>
              {subStatus === 'active' ? 'نشط' : subStatus === 'expiring_soon' ? 'قرب الانتهاء' : 'غير مفعل'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-right">
            <div className="space-y-1">
              <p className="text-gray-400 text-xs font-black uppercase tracking-wider flex items-center gap-2 justify-center sm:justify-start">
                <Calendar className="w-3.5 h-3.5" /> تاريخ البداية
              </p>
              <p className="text-xl font-black text-slate-800 tabular-nums">
                {sub?.subscription?.startDate ? new Date(sub.subscription.startDate).toLocaleDateString('ar-EG') : '---'}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-gray-400 text-xs font-black uppercase tracking-wider flex items-center gap-2 justify-center sm:justify-start">
                <Calendar className="w-3.5 h-3.5" /> تاريخ الانتهاء
              </p>
              <p className="text-xl font-black text-slate-800 tabular-nums">
                {sub?.subscription?.endDate ? new Date(sub.subscription.endDate).toLocaleDateString('ar-EG') : '---'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-gray-400 text-xs font-black uppercase tracking-wider flex items-center gap-2 justify-center sm:justify-start">
                <Clock className="w-3.5 h-3.5" /> الأيام المتبقية
              </p>
              <p className={`text-4xl font-black ${subStatus === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>
                {sub?.daysRemaining || 0}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
