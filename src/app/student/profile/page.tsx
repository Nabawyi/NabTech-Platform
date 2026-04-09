import { getUserSession } from "@/app/actions/students";
import { getStudentSubscription } from "@/app/actions/subscriptions";
import { getGradeLabel, SchoolLevel } from "@/lib/constants";
import { User, Phone, MapPin, GraduationCap, ShieldCheck, Clock, Calendar } from "lucide-react";
import { redirect } from "next/navigation";

export default async function StudentProfilePage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const sub = await getStudentSubscription(session.id);

  const studentLevel = (session.stage ?? session.level) as SchoolLevel;
  const gradeNum =
    typeof session.gradeNumber === "number" ? session.gradeNumber : 1;
  const gradeLabel = getGradeLabel(studentLevel, gradeNum);
  
  const subStatus = sub?.calculatedStatus || "inactive";

  const sessionAny = session as any;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-4">
      
      {/* Profile Header */}
      <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-card-border flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-4xl font-black">
          {session.name.charAt(0)}
        </div>
        <div className="text-center md:text-right flex-1">
          <h1 className="text-3xl font-black text-foreground mb-2">{session.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="px-4 py-1.5 bg-muted text-muted-fg rounded-full text-xs font-black flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5" />
              {gradeLabel}
            </span>
            {sessionAny.code && (
              <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black flex items-center gap-2">
                كود: {sessionAny.code}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Details */}
        <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-card-border space-y-6">
          <div className="flex items-center gap-3 border-b border-card-border pb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-black text-foreground">البيانات الشخصية</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-fg font-bold text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" /> رقم الهاتف
              </span>
              <span className="font-black text-foreground tabular-nums">{session.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-fg font-bold text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" /> رقم ولي الأمر
              </span>
              <span className="font-black text-foreground tabular-nums">{session.parentPhone}</span>
            </div>
          </div>
        </div>

        {/* School Details */}
        <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-card-border space-y-6">
          <div className="flex items-center gap-3 border-b border-card-border pb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-black text-foreground">المقر الدراسي</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-fg font-bold text-sm">السنتر / المكان</span>
              <span className="font-black text-foreground">{sessionAny.locationName || "غير محدد"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-fg font-bold text-sm">المجموعة</span>
              <span className="font-black text-foreground">{sessionAny.groupName || "غير محدد"}</span>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="md:col-span-2 bg-card p-8 rounded-[2.5rem] shadow-sm border border-card-border space-y-8 relative overflow-hidden">
           <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl -translate-y-1/2 translate-x-1/2 ${
             subStatus === 'active' ? 'bg-success/10' : 'bg-danger/10'
           }`} />

           <div className="flex items-center justify-between border-b border-card-border pb-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-black text-foreground">حالة العضوية</h2>
                <p className="text-xs font-bold text-muted-fg mt-0.5">تفاصيل الاشتراك الحالي</p>
              </div>
            </div>
            <div className={`px-6 py-2 rounded-2xl font-black text-sm shadow-sm ${
              subStatus === 'active' ? 'bg-success/10 text-success-fg' : 
              subStatus === 'expiring_soon' ? 'bg-warning/10 text-warning-fg' : 'bg-danger/10 text-danger-fg'
            }`}>
              {subStatus === 'active' ? 'نشط' : subStatus === 'expiring_soon' ? 'قرب الانتهاء' : 'غير مفعل'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-right">
            <div className="space-y-1">
              <p className="text-muted-fg text-xs font-black uppercase tracking-wider flex items-center gap-2 justify-center sm:justify-start">
                <Calendar className="w-3.5 h-3.5" /> تاريخ البداية
              </p>
              <p className="text-xl font-black text-foreground tabular-nums">
                {sub?.subscription?.startDate ? new Date(sub.subscription.startDate).toLocaleDateString('ar-EG') : '---'}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-fg text-xs font-black uppercase tracking-wider flex items-center gap-2 justify-center sm:justify-start">
                <Calendar className="w-3.5 h-3.5" /> تاريخ الانتهاء
              </p>
              <p className="text-xl font-black text-foreground tabular-nums">
                {sub?.subscription?.endDate ? new Date(sub.subscription.endDate).toLocaleDateString('ar-EG') : '---'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-fg text-xs font-black uppercase tracking-wider flex items-center gap-2 justify-center sm:justify-start">
                <Clock className="w-3.5 h-3.5" /> الأيام المتبقية
              </p>
              <p className={`text-4xl font-black tabular-nums ${subStatus === 'active' ? 'text-success-fg' : 'text-danger-fg'}`}>
                {sub?.daysRemaining || 0}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
