import { CheckCircle2 } from "lucide-react";

export default function BenefitsSection() {
  const benefits = [
    "وفر وقتك من المهام المتكررة",
    "نظم شغلك ودروسك بطريقة احترافية",
    "زود دخلك بمتابعة الاشتراكات آلياً",
    "كل حاجة في مكان واحد (دروس، امتحانات، حضور)"
  ];

  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-red-500 opacity-20 blur-[100px] -translate-y-1/2 rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-red-500 opacity-10 blur-[100px] -translate-y-1/2 rounded-full pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
              لماذا يستخدم المدرسون <span className="text-red-500">NabTech</span>؟
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              تم تصميم النظام خصيصاً ليحل المشاكل التقنية والتنظيمية التي يواجهها المعلم الحديث، ليلتفت بالكامل لعملية الشرح والإبداع.
            </p>
            <ul className="space-y-4">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <span className="font-bold text-slate-200">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl relative mt-8 lg:mt-0">
             <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">1</div>
                  <div>
                    <h4 className="font-black text-slate-200">المركزية والسرعة</h4>
                    <p className="text-sm text-slate-400 mt-1">الوصول لبيانات 1000 طالب في جزء من الثانية.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-700 ml-8">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-black">2</div>
                  <div>
                    <h4 className="font-black text-slate-200">أمان وحماية</h4>
                    <p className="text-sm text-slate-400 mt-1">بيانات طلابك مشفرة ومتاحة لك أنت فقط.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">3</div>
                  <div>
                    <h4 className="font-black text-slate-200">تحديثات مستمرة</h4>
                    <p className="text-sm text-slate-400 mt-1">إضافة ميزات أسبوعية بناءً على طلبات المعلمين.</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
