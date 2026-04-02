import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingSection() {
  return (
    <section className="py-24 bg-gray-50/50" id="pricing">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-red-500 font-bold tracking-wider uppercase text-sm mb-2 block">الأسعار</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">
            خطط أسعار تناسب طموحك
          </h2>
          <p className="text-gray-500 font-medium">
            اختر الباقة التي تتناسب مع حجم عملك وابدأ بلا تعقيدات.
          </p>
        </div>

        <div className="max-w-lg mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-5 blur-[50px] -mr-10 -mt-10"></div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-2">الباقة الاحترافية</h3>
          <p className="text-gray-500 font-medium mb-6">لكل المعلمين الذين يسعون للتميز والسيطرة الكاملة.</p>
          
          <div className="mb-8">
            <span className="text-5xl font-black text-slate-900">تواصل معنا</span>
          </div>

          <ul className="space-y-4 mb-8">
            {[
              "عدد غير محدود من الطلاب",
              "إدارة كاملة للدروس والمحاضرات",
              "نظام كويزات آلي",
              "سجلات الحضور والغياب",
              "دعم فني متواصل"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 font-bold" />
                </div>
                <span className="font-bold text-slate-700 font-sm">{item}</span>
              </li>
            ))}
          </ul>
          
          <Link
            href="/register-teacher"
            className="block w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-black text-center transition-all hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/25 active:scale-95"
          >
            ابدأ الآن
          </Link>
        </div>
      </div>
    </section>
  );
}
