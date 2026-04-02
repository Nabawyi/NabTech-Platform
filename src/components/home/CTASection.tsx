import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 top-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container relative mx-auto px-4 sm:px-6 z-10">
        <div className="bg-slate-900 rounded-[3rem] p-10 sm:p-20 text-center relative overflow-hidden">
          {/* Accent Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full opacity-20 blur-[80px] -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-[80px] -ml-20 -mb-20"></div>

          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
              ابدأ دلوقتي وخلّي شغلك أسهل
            </h2>
            <p className="text-slate-300 text-lg sm:text-xl font-medium mb-10 max-w-2xl mx-auto">
              انضم لمجموعة المعلمين الذين حولوا إداراتهم المعقدة إلى منصة رقمية متكاملة وسلسة.
            </p>
            <Link
              href="/register-teacher"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-10 py-5 text-xl font-black text-white transition-all hover:bg-red-600 hover:scale-[1.02] active:scale-95 shadow-xl shadow-red-500/25"
            >
              إنشاء حساب
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
