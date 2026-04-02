import Link from "next/link";
import { GraduationCap, Briefcase, CheckCircle2 } from "lucide-react";

export default function AudienceSection() {
  const teacherFeatures = [
    "إدارة الطلاب والمجموعات",
    "متابعة الاشتراكات آلياً",
    "تنظيم الدروس ورفع الفيديوهات",
    "كود دعوة خاص بك للطلاب"
  ];

  const studentFeatures = [
    "مشاهدة الدروس وتنزيل المذكرات",
    "حل الكويزات التفاعلية",
    "متابعة التقدم والدرجات",
    "التسجيل المباشر بكود المدرس"
  ];

  return (
    <section className="py-24 bg-gray-50/50" id="audience">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
            اختر المسار المناسب لك
          </h2>
          <p className="text-gray-500 font-medium">
            صُممت المنصة لتلبي احتياجات المعلم والطالب بأحدث التقنيات وأسهل واجهة استخدام.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Teacher Card */}
          <div className="relative group bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-5 group-hover:opacity-10 blur-[40px] rounded-full -mr-10 -mt-10 transition-opacity"></div>
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-3xl font-black text-slate-900">للـمدرسين</h3>
            </div>

            <ul className="space-y-4 mb-10 relative z-10">
              {teacherFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="font-bold text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/join?role=teacher"
              className="block w-full text-center py-4 px-6 bg-red-500 text-white rounded-2xl font-black transition-all hover:bg-red-600 hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-500/25 relative z-10"
            >
              ابدأ كمدرس
            </Link>
          </div>

          {/* Student Card */}
          <div className="relative group bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 opacity-10 group-hover:opacity-20 blur-[40px] rounded-full -ml-10 -mt-10 transition-opacity"></div>
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-14 h-14 bg-slate-800 text-white rounded-2xl flex items-center justify-center flex-shrink-0 border border-slate-700">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-3xl font-black text-white">للطلاب</h3>
            </div>

            <ul className="space-y-4 mb-10 relative z-10">
              {studentFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <span className="font-bold text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/join?role=student"
              className="block w-full text-center py-4 px-6 bg-white text-slate-900 rounded-2xl font-black transition-all hover:bg-gray-100 hover:scale-[1.02] active:scale-95 shadow-lg relative z-10 border border-gray-200"
            >
              انضم الآن
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
